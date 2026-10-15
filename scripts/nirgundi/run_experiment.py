#!/usr/bin/env python3
"""Run the literal Nirgundi baseline on a declared corpus and inventory.

Does not transliterate. Duplicate surface forms are kept in the provenance
crosswalk. The replacement inventory uses the first source record for each
exact surface form, in source order. That policy is declared, not silent.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from nirgundi.baseline import order_lexemes, run_baseline


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    h.update(path.read_bytes())
    return h.hexdigest()


def load_records(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line]


def unique_inventory(records: list[dict]) -> tuple[list[tuple[str, str]], list[dict]]:
    first: dict[str, dict] = {}
    dupes = []
    for rec in records:
        form = rec["original_form"]
        if form in first:
            dupes.append({
                "form": form,
                "kept_record": first[form]["source_record_id"],
                "also_record": rec["source_record_id"],
            })
            continue
        first[form] = rec
    forms = [(rec["source_id"] + ":" + rec["source_record_id"], rec["original_form"]) for rec in first.values()]
    return forms, dupes


def residual_spans(residual: str) -> list[dict]:
    spans = []
    start = None
    for i, ch in enumerate(residual):
        if ch == "⟦":
            if start is not None:
                spans.append({"start": start, "end": i, "text": residual[start:i]})
            start = None
        elif start is None and ch != "⟧":
            start = i
    if start is not None:
        spans.append({"start": start, "end": len(residual), "text": residual[start:]})
    return [s for s in spans if s["text"]]


def run(corpus_path: Path, records_path: Path, out_dir: Path, corpus_view: str) -> dict:
    corpus_bytes = corpus_path.read_bytes()
    if corpus_view == "file":
        text = corpus_bytes.decode("utf-8")
    elif corpus_view == "words":
        data = json.loads(corpus_bytes.decode("utf-8"))
        text = "\n".join(" ".join(v["words"]) for v in data)
    else:
        raise SystemExit(f"unknown corpus view {corpus_view}")
    records = load_records(records_path)
    forms, dupes = unique_inventory(records)
    result = run_baseline(text, forms)
    out_dir.mkdir(parents=True, exist_ok=True)
    ordered = [
        {"integer_id": lex.integer_id, "source_id": lex.source_id, "form": lex.form, "code_points": len(lex.form)}
        for lex in result.ordered_lexemes
    ]
    (out_dir / "ordered-inventory.jsonl").write_text(
        "\n".join(json.dumps(row, ensure_ascii=False) for row in ordered) + "\n", encoding="utf-8")
    (out_dir / "transformed.txt").write_text(result.transformed, encoding="utf-8")
    (out_dir / "residual.txt").write_text(result.residual, encoding="utf-8")
    ledger = [
        {"integer_id": o.integer_id, "source_id": o.source_id, "form": o.form, "start": o.start, "end": o.end, "order": n}
        for n, o in enumerate(result.occurrences, start=1)
    ]
    (out_dir / "match-ledger.jsonl").write_text(
        "\n".join(json.dumps(row, ensure_ascii=False) for row in ledger) + ("\n" if ledger else ""), encoding="utf-8")
    spans = residual_spans(result.residual)
    matched_points = sum(o.end - o.start for o in result.occurrences)
    stats = {
        "corpus_view": corpus_view,
        "corpus_code_points": len(text),
        "corpus_bytes": len(text.encode("utf-8")),
        "source_records": len(records),
        "unique_forms": len(forms),
        "duplicate_form_records": len(dupes),
        "ordered_inventory": len(ordered),
        "matched_occurrences": len(ledger),
        "distinct_ids_matched": len({row["integer_id"] for row in ledger}),
        "matched_code_points": matched_points,
        "unmatched_code_points": result.unmatched_characters,
        "residual_spans": len(spans),
        "percent_code_points_matched": (100.0 * matched_points / len(text)) if text else 0.0,
        "percent_code_points_unmatched": (100.0 * result.unmatched_characters / len(text)) if text else 0.0,
        "script_note": "Inventory forms are SLP1 k1 headwords. Corpus is IAST. No transliteration was applied.",
    }
    (out_dir / "statistics.json").write_text(json.dumps(stats, indent=2), encoding="utf-8")
    (out_dir / "duplicate-crosswalk.json").write_text(json.dumps(dupes[:5000], ensure_ascii=False, indent=2), encoding="utf-8")
    manifest = {
        "method": "nirgundi-baseline-literal-v1",
        "length": "Unicode code points of the decoded string, no normalization",
        "tie_break": "stable source order, then integer id assigned after sort",
        "duplicate_policy": "all source records retained; replacement uses first exact surface form",
        "corpus_file": str(corpus_path),
        "corpus_sha256": sha256(corpus_path),
        "records_sha256": sha256(records_path),
        "corpus_view": corpus_view,
        "statistics": stats,
    }
    (out_dir / "manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return stats


def main() -> None:
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--corpus", required=True)
    p.add_argument("--records", required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--view", choices=["file", "words"], default="words")
    args = p.parse_args()
    stats = run(Path(args.corpus), Path(args.records), Path(args.out), args.view)
    print(json.dumps(stats, indent=2))


if __name__ == "__main__":
    main()
