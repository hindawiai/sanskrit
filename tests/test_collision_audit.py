"""Regression tests for the generated cross-scheme collision audit."""
import csv
import json
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
REPORT = ROOT / "tools" / "transliteration" / "results" / "collisions.json"
SWEEP = ROOT / "tools" / "transliteration" / "results" / "unicode_inventory_sweep.csv"
SWEEP_COLLISIONS = ROOT / "tools" / "transliteration" / "results" / "unicode_inventory_collisions.csv"


class CollisionAuditTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads(REPORT.read_text(encoding="utf-8"))
        cls.cases = {case["id"]: case for case in cls.report["cases"]}

    def test_report_schema_and_inventory(self):
        self.assertEqual(self.report["schema"], "pushkalavati.transliteration-collision-audit/2")
        self.assertEqual(self.report["case_count"], 36)
        self.assertEqual(len(self.cases), 36)
        self.assertEqual(len(self.report["schemes"]), 12)

    def test_failed_encodes_are_not_counted_as_collisions(self):
        row = self.cases["mixed-latin"]["schemes"]["romenagri"]
        self.assertEqual(row["rejections"], 2)
        self.assertFalse(row["collision"])
        self.assertEqual(row["native_collisions"], [])

    def test_known_aspirate_cluster_collisions(self):
        for scheme in ("iast", "hk"):
            row = self.cases["kh-vs-cluster"]["schemes"][scheme]
            self.assertTrue(row["collision"], scheme)
        self.assertFalse(self.cases["kh-vs-cluster"]["schemes"]["romenagri"]["collision"])

    def test_digit_script_collision_is_reported(self):
        self.assertTrue(self.cases["digit-script"]["schemes"]["romenagri"]["collision"])
        self.assertTrue(self.cases["digit-sequence"]["schemes"]["romenagri"]["collision"])

    def test_avagraha_apostrophe_collision_is_scheme_specific(self):
        for scheme in ("iast", "hk", "slp1"):
            self.assertTrue(self.cases["avagraha-apostrophe"]["schemes"][scheme]["collision"])
        self.assertFalse(self.cases["avagraha-apostrophe"]["schemes"]["romenagri"]["collision"])
        self.assertEqual(self.cases["avagraha-apostrophe"]["schemes"]["romenagri"]["rejections"], 1)

    def test_downstream_normalization_hazards_are_separate(self):
        self.assertIn("lower", self.cases["case-sensitivity"]["schemes"]["slp1"]["downstream_transform_collisions"])
        self.assertIn("strip_diacritics", self.cases["z-sibilant"]["schemes"]["iast"]["downstream_transform_collisions"])
        self.assertIn("strip_punctuation_including_underscore", self.cases["kh-vs-cluster"]["schemes"]["romenagri"]["downstream_transform_collisions"])

    def test_canonical_equivalence_is_separated_from_phonological_collision(self):
        row = self.cases["nukta-precomposed"]["schemes"]["iast"]
        self.assertTrue(row["canonical_equivalence_output_merges"])
        self.assertFalse(row["collision"])

    def test_exact_round_trip_field_exists_for_every_case_input(self):
        for case in self.report["cases"]:
            for scheme in self.report["schemes"]:
                for row in case["schemes"][scheme]["inputs"]:
                    self.assertIn("exact_round_trip", row)
                    self.assertIn("input_codepoints", row)

    def test_unicode_sweep_covers_all_declared_schemes_and_codepoints(self):
        with SWEEP.open(encoding="utf-8", newline="") as f:
            rows = list(csv.DictReader(f))
        self.assertEqual(len(rows), 309 * 12)
        self.assertEqual(set(row["scheme"] for row in rows), set(self.report["schemes"]))
        self.assertTrue(SWEEP_COLLISIONS.exists())
        with SWEEP_COLLISIONS.open(encoding="utf-8", newline="") as f:
            collision_rows = list(csv.DictReader(f))
        self.assertGreater(len(collision_rows), 0)

    def test_cross_scheme_ambiguities_require_different_decoded_inputs(self):
        for row in self.report["cross_scheme_ambiguities"]:
            self.assertNotEqual(row["left"]["scheme"], row["right"]["scheme"])
            self.assertNotEqual(row["left"]["decoded"], row["right"]["decoded"])


if __name__ == "__main__":
    unittest.main()
