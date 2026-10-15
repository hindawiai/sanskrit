import unittest
from nirgundi.baseline import order_lexemes, run_baseline


class NirgundiBaselineTests(unittest.TestCase):
    def test_longest_first_and_stable_ids(self):
        lexemes = order_lexemes([("short", "राम"), ("long", "रामः"), ("same2", "गज"), ("same1", "नर")])
        self.assertEqual([x.form for x in lexemes], ["रामः", "राम", "गज", "नर"])
        self.assertEqual([x.integer_id for x in lexemes], [1, 2, 3, 4])

    def test_longest_first_prevents_short_form_stealing_longer_form(self):
        result = run_baseline("रामः राम", [("short", "राम"), ("long", "रामः")])
        self.assertIn("⟦NG000001⟧", result.transformed)
        self.assertIn("⟦NG000002⟧", result.transformed)
        self.assertEqual(result.residual, " ")

    def test_residual_is_preserved(self):
        result = run_baseline("रामः xyz", [("ramah", "रामः")])
        self.assertEqual(result.residual, " xyz")
        self.assertEqual(result.unmatched_characters, len(" xyz"))

    def test_empty_form_rejected(self):
        with self.assertRaises(ValueError):
            order_lexemes([("bad", "")])

    def test_duplicate_surface_requires_explicit_policy(self):
        with self.assertRaisesRegex(ValueError, "duplicate surface form"):
            order_lexemes([("source-a", "राम"), ("source-b", "राम")])

    def test_occurrences_only_report_matches_that_actually_fire(self):
        result = run_baseline("रामः", [("short", "राम"), ("long", "रामः")])
        self.assertEqual([(o.source_id, o.start, o.end) for o in result.occurrences],
                         [("long", 0, 4)])


    def test_shorter_form_does_not_match_inside_longer_token(self):
        result = run_baseline("devam evam", [("short", "evam"), ("other", "deva")])
        self.assertEqual([o.form for o in result.occurrences], ["evam"])
        self.assertEqual(result.residual, "devam ")
        self.assertEqual(result.occurrences[0].start, 6)


if __name__ == "__main__":
    unittest.main()
