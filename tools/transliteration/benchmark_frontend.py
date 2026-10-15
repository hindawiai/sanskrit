#!/usr/bin/env python3
"""Repeatable transliteration timing benchmark; timings are not phonetic scores."""
from __future__ import annotations

import csv
import platform
import statistics
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "third_party" / "indic_transliteration"))

from transliteration import encode, round_trip
from transliteration.compare import RAHNUMA, SCHEMES
from transliteration.romenagri_document import encode_lossless, decode_lossless

ROUNDS = 21
REPEATS = 200
DOCUMENT_SIZE = 2000
DOCUMENT_CASES = [
    "प्रकृति", "चेत्", "सर्वम्", "पापम्", "उद्धरणम्", "ऽ", "।", "॥",
    "“वाक्यम्”", "‘शब्दः’", "कॉ", "कॅ", "क़", "क्‍षि", "45-52।",
    "।।36।।", "'अ", "Sanskrit 123", "🙂", "literal ~ marker",
]


def elapsed_per_call(fn, calls: int) -> float:
    start = time.perf_counter_ns()
    for _ in range(calls):
        fn()
    return (time.perf_counter_ns() - start) / calls / 1000.0


def stats(values: list[float]) -> tuple[float, float, float, float]:
    ordered = sorted(values)
    p95 = ordered[max(0, min(len(ordered) - 1, int(0.95 * len(ordered) + 0.999999) - 1))]
    return min(values), statistics.median(values), p95, max(values)


def main() -> int:
    output = ROOT / "tools" / "transliteration" / "results"
    output.mkdir(parents=True, exist_ok=True)
    csv_path = output / "frontend-timings.csv"
    rows: list[dict[str, object]] = []

    # Warm-up is excluded from measured rounds.
    for scheme in SCHEMES:
        for source, _ in RAHNUMA:
            round_trip(source, scheme)
        encode("प्रकृति", "devanagari", scheme)

        encode_samples: list[float] = []
        roundtrip_samples: list[float] = []
        exact = sum(1 for source, _ in RAHNUMA if round_trip(source, scheme)["identical"])
        for _ in range(ROUNDS):
            encode_samples.append(elapsed_per_call(
                lambda: [encode(source, "devanagari", scheme) for source, _ in RAHNUMA],
                REPEATS,
            ) / len(RAHNUMA))
            roundtrip_samples.append(elapsed_per_call(
                lambda: [round_trip(source, scheme) for source, _ in RAHNUMA],
                REPEATS,
            ) / len(RAHNUMA))
        for workload, samples, matches in (
            ("encode_13_attested", encode_samples, ""),
            ("roundtrip_13_attested", roundtrip_samples, f"{exact}/{len(RAHNUMA)}"),
        ):
            low, med, p95, high = stats(samples)
            rows.append({
                "workload": workload, "scheme": scheme, "records_per_round": len(RAHNUMA),
                "rounds": ROUNDS, "repeats_per_record": REPEATS,
                "timed_calls_per_round": len(RAHNUMA) * REPEATS,
                "min_us_per_record": f"{low:.3f}", "median_us_per_record": f"{med:.3f}",
                "p95_us_per_record": f"{p95:.3f}", "max_us_per_record": f"{high:.3f}",
                "exact_roundtrips": matches, "python": platform.python_version(),
            })

    # This is a deterministic stress corpus generated from explicitly listed
    # representative cases, not Grok's missing 2,000-word corpus.
    document = [DOCUMENT_CASES[i % len(DOCUMENT_CASES)] for i in range(DOCUMENT_SIZE)]
    for source in document[:20]:
        encoded = encode_lossless(source)
        decoded, note = decode_lossless(encoded.output)
        if decoded != source or note:
            raise AssertionError((source, encoded, decoded, note))

    def document_roundtrip():
        for source in document:
            encoded = encode_lossless(source)
            decoded, note = decode_lossless(encoded.output)
            if decoded != source or note:
                raise AssertionError((source, encoded, decoded, note))

    document_roundtrip()  # warm-up and correctness check
    samples = [elapsed_per_call(document_roundtrip, 1) / DOCUMENT_SIZE for _ in range(ROUNDS)]
    low, med, p95, high = stats(samples)
    rows.append({
        "workload": "lossless_roundtrip_synthetic_2000",
        "scheme": "romenagri_document_extension",
        "records_per_round": DOCUMENT_SIZE, "rounds": ROUNDS,
        "repeats_per_record": 1, "timed_calls_per_round": DOCUMENT_SIZE,
        "min_us_per_record": f"{low:.3f}", "median_us_per_record": f"{med:.3f}",
        "p95_us_per_record": f"{p95:.3f}", "max_us_per_record": f"{high:.3f}",
        "exact_roundtrips": f"{DOCUMENT_SIZE}/{DOCUMENT_SIZE}",
        "python": platform.python_version(),
    })

    fields = [
        "workload", "scheme", "records_per_round", "rounds", "repeats_per_record",
        "timed_calls_per_round", "min_us_per_record", "median_us_per_record",
        "p95_us_per_record", "max_us_per_record", "exact_roundtrips", "python",
    ]
    with csv_path.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)

    print(f"timing report: {csv_path}")
    print(f"parameters: rounds={ROUNDS}, repeat factor={REPEATS}, warm-up=1, Python={platform.python_version()}")
    for row in rows:
        print(f"{row['workload']:34} {row['scheme']:27} "
              f"median={row['median_us_per_record']} us/record "
              f"p95={row['p95_us_per_record']} us/record "
              f"exact={row['exact_roundtrips'] or 'n/a'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
