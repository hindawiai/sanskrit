#!/usr/bin/env python3
"""Context-free code-point sweep for transliteration coverage diagnostics.

This is not a valid-word corpus: combining marks and controls are intentionally
probed alone to reveal unsupported, dropped, or context-dependent mappings.
"""
from __future__ import annotations

import csv
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "third_party" / "indic_transliteration"))
from indic_transliteration import sanscript  # noqa: E402
from transliteration import encode as rom_encode, decode as rom_decode  # noqa: E402

SCHEMES = {
    "romenagri": None, "iast": sanscript.IAST, "hk": sanscript.HK,
    "slp1": sanscript.SLP1, "itrans": sanscript.ITRANS,
    "velthuis": sanscript.VELTHUIS, "iso": sanscript.ISO,
    "iso_vedic": sanscript.ISO_VEDIC, "wx": sanscript.WX,
    "titus": sanscript.TITUS, "kolkata": sanscript.KOLKATA,
    "optitrans": sanscript.OPTITRANS,
}


def encode_one(ch: str, name: str):
    try:
        if name == "romenagri":
            result = rom_encode(ch, "devanagari", "romenagri")
            return ("ok" if result.output is not None else "unresolved", result.output, result.note)
        output = sanscript.transliterate(ch, sanscript.DEVANAGARI, SCHEMES[name])
        if output == ch and (0x0900 <= ord(ch) <= 0x097F or 0x1CD0 <= ord(ch) <= 0x1DFF or 0x0300 <= ord(ch) <= 0x036F):
            return ("pass_through", output, "Input code point was returned unchanged; not counted as transliteration coverage.")
        return ("ok", output, "")
    except Exception as exc:
        return ("error", None, f"{type(exc).__name__}: {exc}")


def decode_one(encoded: str, name: str):
    try:
        if name == "romenagri":
            result = rom_decode(encoded, "romenagri", "devanagari")
            return ("ok", result.output, result.note)
        return ("ok", sanscript.transliterate(encoded, SCHEMES[name], sanscript.DEVANAGARI), "")
    except Exception as exc:
        return ("error", None, f"{type(exc).__name__}: {exc}")


def inventory():
    points = set(range(0x0900, 0x0980))
    points.update(range(0x1CD0, 0x1D00))
    points.update(range(0x0300, 0x0370))
    points.update([0x200C, 0x200D, 0x2018, 0x2019, 0x201C, 0x201D, 0x2013, 0x2014, 0x0027, 0x002D, 0x007C])
    points.update(range(0x0030, 0x003A))
    points.update(range(0x0966, 0x0970))
    return sorted(points)


def main():
    rows = []
    by_scheme_output = defaultdict(list)
    for cp in inventory():
        ch = chr(cp)
        char_name = unicodedata.name(ch, "<UNASSIGNED>")
        for scheme in SCHEMES:
            status, encoded, note = encode_one(ch, scheme)
            if status == "ok" and encoded is not None:
                dstatus, decoded, dnote = decode_one(encoded, scheme)
            else:
                dstatus, decoded, dnote = "not_run", None, "encode did not return a string"
            exact = dstatus == "ok" and decoded == ch
            row = {
                "codepoint": f"U+{cp:04X}", "character": ch, "unicode_name": char_name,
                "general_category": unicodedata.category(ch), "scheme": scheme,
                "encode_status": status, "encoded": encoded if encoded is not None else "",
                "decode_status": dstatus, "decoded": decoded if decoded is not None else "",
                "exact_round_trip": str(exact).lower(), "encode_note": note, "decode_note": dnote,
            }
            rows.append(row)
            if status == "ok" and encoded is not None:
                by_scheme_output[(scheme, encoded)].append(row)

    out_dir = ROOT / "tools" / "transliteration" / "results"
    out_dir.mkdir(parents=True, exist_ok=True)
    sweep_path = out_dir / "unicode_inventory_sweep.csv"
    with sweep_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)

    collisions = []
    for (scheme, encoded), group in sorted(by_scheme_output.items(), key=lambda x: (x[0][0], x[0][1])):
        cps = {x["codepoint"] for x in group}
        if len(cps) > 1:
            collisions.append({
                "scheme": scheme, "encoded": encoded,
                "count": len(cps),
                "codepoints": ";".join(sorted(cps)),
                "characters": ";".join(x["character"] for x in group),
                "unicode_names": ";".join(x["unicode_name"] for x in group),
                "note": "Context-free code-point collision; inspect category/context before treating as a valid-text defect.",
            })
    collision_path = out_dir / "unicode_inventory_collisions.csv"
    with collision_path.open("w", newline="", encoding="utf-8") as f:
        fields = ["scheme", "encoded", "count", "codepoints", "characters", "unicode_names", "note"]
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(collisions)

    print(f"codepoints={len(inventory())} schemes={len(SCHEMES)} evaluations={len(rows)}")
    for scheme in SCHEMES:
        part = [r for r in rows if r["scheme"] == scheme]
        ok = sum(r["encode_status"] == "ok" for r in part)
        pass_through = sum(r["encode_status"] == "pass_through" for r in part)
        unresolved = sum(r["encode_status"] == "unresolved" for r in part)
        rt = sum(r["exact_round_trip"] == "true" for r in part)
        cols = sum(c["scheme"] == scheme for c in collisions)
        print(f"{scheme:10} encoded={ok:3}/{len(part)} passthrough={pass_through:3} unresolved={unresolved:3} exact-rt={rt:3} collision-groups={cols:3}")
    print(f"wrote {sweep_path}")
    print(f"wrote {collision_path} ({len(collisions)} collision groups)")


if __name__ == "__main__":
    main()
