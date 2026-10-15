#!/usr/bin/env python3
"""Audit real Romenagri language/script ports without inventing mappings.

Consumes the canonical Romenagri tree. Emits CSV only. This is an integration
and evidence tool, not a replacement transliterator or compiler front end.
"""
from __future__ import annotations
import argparse
import csv
import re
import sys
from pathlib import Path

FIELDS = [
    "code", "language_name", "iso639", "script", "xlit_script", "source",
    "keyword_file", "keyword_rows", "pending_keyword_rows", "romenagri_ascii7_violations",
    "script_table", "script_mapping_rows", "forward_filter", "reverse_filter",
    "status", "reason",
]


def read_registry(path: Path):
    rows = []
    with path.open(encoding="utf-8-sig", newline="") as f:
        lines = [line for line in f if line.strip() and not line.lstrip().startswith("#")]
    if not lines:
        raise ValueError(f"empty language registry: {path}")
    reader = csv.DictReader(lines)
    required = {"code", "language_name", "iso639", "script", "xlit_script", "source", "speakers"}
    if not required.issubset(reader.fieldnames or []):
        raise ValueError(f"language registry missing columns: {sorted(required - set(reader.fieldnames or []))}")
    seen = set()
    for row in reader:
        code = (row.get("code") or "").strip()
        if not code or code in seen:
            raise ValueError(f"empty or duplicate language code: {code!r}")
        seen.add(code)
        rows.append(row)
    return rows


def read_keyword_file(path: Path):
    if not path.is_file():
        return [], 0, 0
    with path.open(encoding="utf-8-sig", newline="") as f:
        lines = [line for line in f if line.strip() and not line.lstrip().startswith("#")]
    if not lines:
        return [], 0, 0
    reader = csv.DictReader(lines)
    required = {"construct_id", "native_keyword", "romenagri", "note"}
    if not required.issubset(reader.fieldnames or []):
        raise ValueError(f"{path} missing required keyword columns")
    rows = list(reader)
    pending = sum("pending" in (r.get("note") or "").lower() or "pending" in (r.get("romenagri") or "").lower() for r in rows)
    bad = sum(not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", (r.get("romenagri") or "")) for r in rows)
    return rows, pending, bad


def count_table_mappings(path: Path):
    if not path.is_file():
        return 0
    count = 0
    for raw in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        # TSV mapping records require at least two non-empty columns.
        cols = line.split("\t")
        if len(cols) >= 2 and cols[0] and cols[1]:
            count += 1
    return count


def locate_filter(root: Path, name: str):
    matches = sorted(p for p in root.rglob(name) if p.is_file()) if root.is_dir() else []
    return str(matches[0].relative_to(root)) if len(matches) == 1 else ("AMBIGUOUS" if matches else "")


def audit(root: Path, chintamani: Path | None):
    reg_path = root / "langspec" / "data" / "language_registry.csv"
    if not reg_path.is_file():
        raise FileNotFoundError(f"canonical registry missing: {reg_path}")
    registry = read_registry(reg_path)
    forward = locate_filter(chintamani, "fltr_hi_ur") if chintamani else ""
    reverse = locate_filter(chintamani, "fltr_ur_hi") if chintamani else ""
    results = []
    for entry in registry:
        code = entry["code"].strip()
        spec = root / "langspec" / "data" / f"lang_{code}.csv"
        if not spec.is_file():
            # Some historical profiles use aliases; do not silently guess one.
            results.append({"code": code, "language_name": entry["language_name"], "iso639": entry["iso639"],
                "script": entry["script"], "xlit_script": entry["xlit_script"], "source": entry["source"],
                "keyword_file": str(spec.relative_to(root)), "keyword_rows": 0, "pending_keyword_rows": 0,
                "romenagri_ascii7_violations": 0, "script_table": "", "script_mapping_rows": 0,
                "forward_filter": "", "reverse_filter": "", "status": "blocked-missing-keyword-file",
                "reason": "No exact lang_<code>.csv file; alias must be explicit."})
            continue
        try:
            kws, pending, bad = read_keyword_file(spec)
        except ValueError as exc:
            raise ValueError(str(exc)) from exc
        script_key = entry["xlit_script"].strip()
        table = root / "tables" / f"{script_key}_to_deva.tsv"
        table_rows = count_table_mappings(table)
        is_perso = entry["script"].lower().startswith(("perso-arabic", "arabic", "jawi", "ajami"))
        ff = forward if is_perso else ""
        rf = reverse if is_perso else ""
        if not kws:
            status, reason = "blocked-empty-keyword-file", "Keyword CSV has no data rows."
        elif bad:
            status, reason = "blocked-non-ascii-or-invalid-romenagri", f"{bad} Romenagri fields are not legal ASCII C identifiers."
        elif pending:
            status, reason = "prototype-keywords-pending", f"{pending} keyword rows explicitly mark Romenagri pending."
        elif is_perso and (not ff or not rf or ff == "AMBIGUOUS" or rf == "AMBIGUOUS"):
            status, reason = "blocked-missing-language-filter", "Perso-Arabic source profile requires the canonical direction-specific filter pair; no unique pair found."
        elif is_perso:
            status, reason = "filter-chain-present-table-still-required", "Base Hindi/Urdu filters found; a language-specific orthographic overlay and differential tests are still required."
        elif table_rows == 0 and entry["script"].lower() not in ("devanagari",):
            status, reason = "blocked-empty-script-projection", f"{table.relative_to(root)} has no mapping records; a script name alone is not a transliterator."
        else:
            status, reason = "keyword-spec-present-needs-compiler-conformance", "Keyword inventory exists; actual compiler, round-trip, and debug tests are not implied."
        results.append({"code": code, "language_name": entry["language_name"], "iso639": entry["iso639"],
            "script": entry["script"], "xlit_script": script_key, "source": entry["source"],
            "keyword_file": str(spec.relative_to(root)), "keyword_rows": len(kws), "pending_keyword_rows": pending,
            "romenagri_ascii7_violations": bad, "script_table": str(table.relative_to(root)) if table.exists() else "",
            "script_mapping_rows": table_rows, "forward_filter": ff, "reverse_filter": rf,
            "status": status, "reason": reason})
    return results


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--romenagri-root", required=True, type=Path, help="canonical project-ilm/romenagri checkout")
    ap.add_argument("--chintamani-root", type=Path, help="optional Chintamani checkout for original fltr_hi_ur/fltr_ur_hi")
    ap.add_argument("--output", type=Path, help="CSV output path; stdout by default")
    ap.add_argument("--strict", action="store_true", help="exit nonzero if any profile is not ready for compiler conformance")
    args = ap.parse_args()
    try:
        rows = audit(args.romenagri_root.resolve(), args.chintamani_root.resolve() if args.chintamani_root else None)
        stream = args.output.open("w", encoding="utf-8", newline="") if args.output else sys.stdout
        try:
            writer = csv.DictWriter(stream, fieldnames=FIELDS, lineterminator="\n")
            writer.writeheader()
            writer.writerows(rows)
        finally:
            if args.output:
                stream.close()
        print(f"hindawi-language-port-audit: {len(rows)} profiles audited", file=sys.stderr)
        ready = sum(r["status"] == "keyword-spec-present-needs-compiler-conformance" for r in rows)
        blocked = len(rows) - ready
        print(f"keyword-spec-present-needs-compiler-conformance={ready}; other statuses={blocked}", file=sys.stderr)
        return 1 if args.strict and blocked else 0
    except (OSError, UnicodeError, csv.Error, ValueError) as exc:
        print(f"hindawi-language-port-audit: {exc}", file=sys.stderr)
        return 2

if __name__ == "__main__":
    raise SystemExit(main())
