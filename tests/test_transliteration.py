#!/usr/bin/env python3
"""Regression checks for the BUILD-0015 transliteration abstraction."""
from __future__ import annotations
import json
import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "third_party" / "indic_transliteration"))
from transliteration import encode, round_trip
from transliteration.romenagri import decode as rmn_decode, encode as rmn_encode

REPORT = ROOT / "tools" / "transliteration" / "results" / "transliteration.json"

class TransliterationTests(unittest.TestCase):
    def test_all_thirteen_rahnuma_attested_outputs_match(self):
        data = json.loads(REPORT.read_text(encoding="utf-8"))
        self.assertEqual(len(data["attested"]), 13)
        self.assertTrue(all(row["match"] for row in data["attested"]), data["attested"])

    def test_romenagri_round_trip_loss_is_explicit_and_reproducible(self):
        data = json.loads(REPORT.read_text(encoding="utf-8"))
        rows = [r for r in data["round_trip"] if r["scheme"] == "romenagri"]
        self.assertEqual(len(rows), 13)
        losses = [r for r in rows if not r["identical"]]
        self.assertEqual([(r["input"], r["forward"], r["back"]) for r in losses],
                         [("ज्ञाान", "j_ynaana", "ज्ञान")])

    def test_romenagri_reports_unmapped_input(self):
        result = encode("🙂")
        self.assertIsNone(result.output)
        self.assertEqual(result.status, "unresolved")

    def test_basic_vowel_matra_and_conjunct_vectors(self):
        vectors = [
            ("अ", "_a"), ("क", "ka"), ("का", "kaa"), ("कि", "ki"),
            ("कु", "ku"), ("क्", "k"), ("ज्ञ", "j_yna"),
            ("क्षि", "kxi"), ("क्ह", "k_ha"),
        ]
        for source, expected in vectors:
            with self.subTest(source=source):
                encoded, note = rmn_encode(source)
                self.assertEqual((encoded, note), (expected, ""))
                self.assertEqual(rmn_decode(encoded), (source, ""))

    def test_terminal_virama_round_trips(self):
        encoded, note = rmn_encode("क्")
        self.assertEqual((encoded, note), ("k", ""))
        self.assertEqual(rmn_decode(encoded), ("क्", ""))

    def test_grok_reported_terminal_virama_examples_round_trip_exactly(self):
        vectors = [
            ("चेत्", "chaee_t"),
            ("सर्वम्", "sarwam"),
            ("पापम्", "paapam"),
            ("उद्धरणम्", "_u_d_dhara_nnam"),
        ]
        for source, expected in vectors:
            with self.subTest(source=source):
                encoded, note = rmn_encode(source)
                self.assertEqual((encoded, note), (expected, ""))
                self.assertEqual(rmn_decode(encoded), (source, ""))

    def test_avagraha_and_danda_round_trip(self):
        for source, expected in [("ऽ", "_3"), ("।", "|")]:
            with self.subTest(source=source):
                encoded, note = rmn_encode(source)
                self.assertEqual((encoded, note), (expected, ""))
                self.assertEqual(rmn_decode(encoded), (source, ""))

    def test_postvocalic_signs_round_trip(self):
        for source, expected in [("अः", "_a_hh"), ("अं", "_a_m"), ("अँ", "_a_am")]:
            with self.subTest(source=source):
                encoded, note = rmn_encode(source)
                self.assertEqual((encoded, note), (expected, ""))
                self.assertEqual(rmn_decode(encoded), (source, ""))

    def test_legacy_sound_table_audit_reports_chh_gap(self):
        source = (ROOT / "tools" / "pushkalavati-compiler" / "src" / "romenagri.js").read_text(encoding="utf-8")
        self.assertIn('unsupported_sanskrit_sounds: ["chh", "ṝ", "ḷ", "ḹ"]', source)
        self.assertIn("known_legacy_questions", source)

    def test_external_schemes_have_no_silent_adapter_errors(self):
        data = json.loads(REPORT.read_text(encoding="utf-8"))
        schemes = {"iast", "hk", "slp1", "itrans", "velthuis"}
        rows = [r for r in data["round_trip"] if r["scheme"] in schemes]
        self.assertEqual(len(rows), 65)
        self.assertTrue(all(r["forward"] is not None and r["back"] is not None for r in rows),
                        [r for r in rows if r["forward"] is None or r["back"] is None])

if __name__ == "__main__":
    unittest.main(verbosity=2)
