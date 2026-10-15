#!/usr/bin/env python3
"""Compare transliteration schemes on speed and round-trip fidelity.

Phonetic fidelity is not measured. Rahnuma 1.3.0 chapter 17 states that
a Unicode string records the spelling, not the sound, and that the same
Devanagari text is a different sequence of sounds in Lucknow and in
Pune. That is an open research question (Scharf and Hyman, Linguistic
Issues in Encoding Sanskrit; the integrative-linguistic-multiscript
line of work). This harness reports what a test can check: whether the
round trip returns the original string, and how long that takes.

The attested words are the named examples from Rahnuma 1.3.0 pages 56-58.
"""
from __future__ import annotations

import json
import time
from pathlib import Path

from transliteration import encode, round_trip

HERE = Path(__file__).resolve().parent
RAHNUMA = [
    ("प्रकृति", "prak_ri_ti"),
    ("पितृ", "pi_t_ri"),
    ("क्षि", "kxi"),
    ("ज्ञाान", "j_ynaana"),
    ("हृदय", "_h_ri_daya"),
    ("उत्तर", "_u_t_tara"),
    ("क्षेत्रफल", "kxaee_traphala"),
    ("त्रिकोण", "_trikoa_nna"),
    ("ख", "kha"),
    ("कह", "ka_ha"),
    ("क्ह", "k_ha"),
    ("योग", "yoaga"),
    ("सीमा", "seemaa"),
]
SCHEMES = ["romenagri", "iast", "hk", "slp1", "itrans", "velthuis"]
REPEATS = 200


def main():
    report = {"rahnuma": "1.3.0 chapter 17", "attested": [], "round_trip": [], "speed": []}
    for src, expected in RAHNUMA:
        got = encode(src)
        report["attested"].append({
            "input": src, "expected": expected, "got": got.output,
            "match": got.output == expected, "note": got.note,
        })
    for scheme in SCHEMES:
        identical = 0
        for src, _ in RAHNUMA:
            rt = round_trip(src, scheme)
            if rt["identical"]:
                identical += 1
            report["round_trip"].append({"scheme": scheme, **rt})
        start = time.perf_counter()
        for _ in range(REPEATS):
            for src, _ in RAHNUMA:
                encode(src, "devanagari", scheme)
        elapsed = time.perf_counter() - start
        report["speed"].append({
            "scheme": scheme,
            "calls": REPEATS * len(RAHNUMA),
            "seconds": round(elapsed, 4),
            "us_per_call": round(elapsed / (REPEATS * len(RAHNUMA)) * 1e6, 1),
            "round_trip_identical": identical,
            "round_trip_total": len(RAHNUMA),
        })
    out = HERE / "results" / "transliteration.json"
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2))
    print(f"{'scheme':12} {'rt':8} {'us/call':10}")
    for row in report["speed"]:
        print(f"{row['scheme']:12} {row['round_trip_identical']}/{row['round_trip_total']:<6} {row['us_per_call']}")
    matched = sum(1 for a in report["attested"] if a["match"])
    print(f"romenagri attested {matched}/{len(RAHNUMA)}")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
