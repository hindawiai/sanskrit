"""Artifact checks for the executed Nirgundi run and the 3983-sutra conversion."""
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class ExperimentArtifactTests(unittest.TestCase):
    def test_sutra_conversion_covers_every_record(self):
        rows = [json.loads(line) for line in (ROOT / "data/nirgundi/all-sutras-converted.jsonl").read_text(encoding="utf-8").splitlines()]
        summary = json.loads((ROOT / "data/nirgundi/all-sutras-converted.summary.json").read_text(encoding="utf-8"))
        self.assertEqual(len(rows), 3983)
        self.assertEqual(summary["sutras"], 3983)
        self.assertEqual(rows[-1]["id"], "8.4.68")
        by_id = {row["id"]: row for row in rows}
        self.assertTrue(any(h["term"] == "वृद्धिः" for h in by_id["1.1.3"]["inherited"]))
        self.assertTrue(any(h["term"] == "कारके" and h["executable"] for h in by_id["1.4.24"]["inherited"]))

    def test_residual_agrees_with_statistics(self):
        base = ROOT / "experiments/nirgundi/rv11-words"
        if not (base / "statistics.json").exists():
            self.skipTest("the external Cologne MW lexicon and prior RV experiment artifacts are not bundled; see docs/nirgundi/source-gaps.md")
        stats = json.loads((base / "statistics.json").read_text(encoding="utf-8"))
        residual = (base / "residual.txt").read_text(encoding="utf-8")
        ledger = [json.loads(line) for line in (base / "match-ledger.jsonl").read_text(encoding="utf-8").splitlines() if line]
        self.assertEqual(stats["unmatched_code_points"], len(residual))
        self.assertEqual(stats["matched_occurrences"], len(ledger))
        self.assertGreater(stats["source_records"], 200000)
        self.assertIn("ī", residual)


if __name__ == "__main__":
    unittest.main()
