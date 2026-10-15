#!/usr/bin/env python3
"""Prototype filter: Hindi Devanagari graphemes -> Hebrew-script sequences.

The mapping is a reviewable CSV table, not a new transliteration framework.
The original input remains authoritative. Unmapped characters are retained and
reported; this filter does not translate Hindi into Hebrew or preserve a
reversible encoding.
"""
from __future__ import annotations
import argparse
import csv
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TABLE_PATH = HERE / "hi_he_map.csv"

def load_table() -> dict[str, str]:
    mapping: dict[str, str] = {}
    with TABLE_PATH.open(encoding="utf-8-sig", newline="") as stream:
        for row in csv.DictReader(stream):
            source = row.get("source_grapheme", "")
            target = row.get("target_sequence", "")
            if not source:
                raise ValueError("hi_he_map.csv contains an empty source_grapheme")
            if source in mapping:
                raise ValueError(f"duplicate source grapheme in hi_he_map.csv: {source!r}")
            mapping[source] = target
    if not mapping:
        raise ValueError("hi_he_map.csv contains no mappings")
    return mapping

def transliterate(text: str, mapping: dict[str, str]):
    out: list[str] = []
    unmapped: list[str] = []
    keys = sorted(mapping, key=len, reverse=True)
    i = 0
    while i < len(text):
        match = next((key for key in keys if text.startswith(key, i)), None)
        if match is not None:
            out.append(mapping[match])
            i += len(match)
            continue
        ch = text[i]
        out.append(ch)
        if ord(ch) >= 128 and not ch.isspace():
            unmapped.append(f"U+{ord(ch):04X} {ch}")
        i += 1
    return "".join(out), unmapped

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("input", nargs="?", help="UTF-8 input file; stdin if omitted")
    args = ap.parse_args()
    try:
        text = Path(args.input).read_text(encoding="utf-8") if args.input else sys.stdin.read()
        mapping = load_table()
        output, unmapped = transliterate(text, mapping)
    except (OSError, UnicodeError, csv.Error, ValueError) as exc:
        print(f"fltr_hi_he: {exc}", file=sys.stderr)
        return 66
    sys.stdout.write(output)
    if unmapped:
        unique = list(dict.fromkeys(unmapped))
        print("fltr_hi_he: unmapped input code points retained unchanged: " + ", ".join(unique), file=sys.stderr)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
