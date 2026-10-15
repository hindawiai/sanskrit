#!/usr/bin/env python3
"""Numeral round-trip and timing across schemes.

Two source forms:
  ascii:    "36"           Indo-Arabic / ASCII digits
  devanagari: "३६"         localized Devanagari digits

Upstream fixuninum (chintamani Romenagri/fixuninum.lex) maps every Indic
digit to ASCII. That is normalisation. The inverse cannot recover the
original script of the digit.
"""
import json
import time
from pathlib import Path

from transliteration import encode, round_trip

CASES = [
    ("ascii", "36"),
    ("ascii", "2026"),
    ("devanagari", "३६"),
    ("devanagari", "२०२६"),
    ("mixed", "अध्याय ३"),
    ("mixed", "adhyaya 3"),
]
SCHEMES = ["romenagri", "iast", "hk", "slp1", "itrans", "velthuis"]
REPEATS = 500


def main():
    report = {"cases": [], "timing": []}
    for kind, text in CASES:
        for scheme in SCHEMES:
            rt = round_trip(text, scheme)
            report["cases"].append({
                "kind": kind, "scheme": scheme, "input": text,
                "forward": rt["forward"], "back": rt["back"],
                "identical": rt["identical"],
            })
    for scheme in SCHEMES:
        start = time.perf_counter()
        for _ in range(REPEATS):
            for _, text in CASES:
                encode(text, "devanagari", scheme)
        elapsed = time.perf_counter() - start
        report["timing"].append({
            "scheme": scheme,
            "calls": REPEATS * len(CASES),
            "us_per_call": round(elapsed / (REPEATS * len(CASES)) * 1e6, 1),
        })
    out = Path(__file__).resolve().parent / "results" / "numerals.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"{'kind':12} {'scheme':12} {'input':12} {'forward':16} {'back':12} {'rt'}")
    for row in report["cases"]:
        print(f"{row['kind']:12} {row['scheme']:12} {row['input']:12} {str(row['forward']):16} {str(row['back']):12} {'OK' if row['identical'] else 'DIFF'}")
    print()
    for row in report["timing"]:
        print(f"{row['scheme']:12} {row['us_per_call']} µs/call")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
