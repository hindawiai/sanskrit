#!/usr/bin/env python3
"""Repeatable microbenchmark over the same curated inputs used by collision_tests.py.

This measures adapter call latency, not phonetic quality or whole-corpus throughput.
"""
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
from transliteration.collision_tests import CASES, SCHEMES, decode_one, encode_one  # noqa: E402

WARMUP_ROUNDS = 3
MEASURED_ROUNDS = 31


def percentile(values, q):
    values = sorted(values)
    index = round((len(values) - 1) * q)
    return values[index]


def main():
    inputs = [text for case in CASES for text in case["inputs"]]
    rows = []
    for scheme in SCHEMES:
        for _ in range(WARMUP_ROUNDS):
            for text in inputs:
                enc = encode_one(text, scheme)
                if enc["status"] == "ok" and enc["output"] is not None:
                    decode_one(enc["output"], scheme)
        encode_times = []
        roundtrip_times = []
        successful = 0
        rejected = 0
        for _ in range(MEASURED_ROUNDS):
            start = time.perf_counter_ns()
            for text in inputs:
                encode_one(text, scheme)
            encode_times.append((time.perf_counter_ns() - start) / len(inputs) / 1000)

            start = time.perf_counter_ns()
            for text in inputs:
                enc = encode_one(text, scheme)
                if enc["status"] == "ok" and enc["output"] is not None:
                    decode_one(enc["output"], scheme)
            roundtrip_times.append((time.perf_counter_ns() - start) / len(inputs) / 1000)
        for text in inputs:
            enc = encode_one(text, scheme)
            if enc["status"] == "ok" and enc["output"] is not None:
                successful += 1
            else:
                rejected += 1
        rows.append({
            "scheme": scheme,
            "input_calls_per_round": len(inputs),
            "successful_encodes": successful,
            "rejections_or_errors": rejected,
            "warmup_rounds": WARMUP_ROUNDS,
            "measured_rounds": MEASURED_ROUNDS,
            "encode_median_us_per_input": round(statistics.median(encode_times), 3),
            "encode_p95_us_per_input": round(percentile(encode_times, 0.95), 3),
            "roundtrip_median_us_per_input": round(statistics.median(roundtrip_times), 3),
            "roundtrip_p95_us_per_input": round(percentile(roundtrip_times, 0.95), 3),
            "python_version": platform.python_version(),
            "platform": platform.platform(),
            "scope": "curated adversarial vectors; repeated inputs; not representative corpus throughput",
        })
    out = ROOT / "tools" / "transliteration" / "results" / "collision_benchmark.csv"
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)
    print(f"inputs/round={len(inputs)} warmup={WARMUP_ROUNDS} measured={MEASURED_ROUNDS}")
    print(f"{'scheme':10} {'encode med':>12} {'encode p95':>12} {'rt med':>12} {'rt p95':>12} {'ok/rej':>9}")
    for row in rows:
        print(f"{row['scheme']:10} {row['encode_median_us_per_input']:12.3f} {row['encode_p95_us_per_input']:12.3f} {row['roundtrip_median_us_per_input']:12.3f} {row['roundtrip_p95_us_per_input']:12.3f} {row['successful_encodes']}/{row['rejections_or_errors']}")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
