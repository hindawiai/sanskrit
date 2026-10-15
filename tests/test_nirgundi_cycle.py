import unittest
from nirgundi.cycle import run_cycle


class CycleTests(unittest.TestCase):
    def test_evam_does_not_consume_devam_and_vichheda_can(self):
        records = [
            {"source_id": "mw", "source_record_id": "1", "original_form": "evam"},
            {"source_id": "mw", "source_record_id": "2", "original_form": "deva"},
            {"source_id": "mw", "source_record_id": "3", "original_form": "ratna"},
        ]
        converted = {"6.1.107": {"inherited": [{"term": "अकः", "verification": "source_annotation", "executable": True}]}}
        state = run_cycle("devam ratna-dhātamam evam", records, converted=converted)
        self.assertIn("evam", state.matched_forms)
        self.assertNotIn("devam", state.matched_forms)
        self.assertIn("6.1.107", state.rules_fired)
        self.assertTrue(any(item["token"] == "devam" for item in state.rounds[0]["vichheda_consumed"]))
        self.assertNotIn("devam", state.residual_tokens)

    def test_stops_when_no_rule_consumes(self):
        records = [{"source_id": "mw", "source_record_id": "1", "original_form": "eva"}]
        state = run_cycle("īḷe", records)
        self.assertEqual(state.residual_tokens, ["īḷe"])
        self.assertEqual(state.rules_fired, {})


    def test_next_rules_consume_only_listed_stems(self):
        records = [
            {"source_id": "mw", "source_record_id": "1", "original_form": "deva"},
            {"source_id": "mw", "source_record_id": "2", "original_form": "agni"},
        ]
        converted = {
            "7.3.103": {"inherited": [{"term": "अतः", "verification": "source_annotation", "executable": True}]},
            "4.1.2": {"inherited": [{"term": "समासत्तौ", "verification": "unconfirmed", "executable": False}]},
        }
        state = run_cycle("devebhiḥ agnibhiḥ pūrvebhiḥ", records, converted=converted)
        self.assertIn("7.3.103", state.rules_fired)
        self.assertNotIn("4.1.2", state.rules_fired)
        self.assertNotIn("devebhiḥ", state.residual_tokens)
        self.assertIn("agnibhiḥ", state.residual_tokens)
        self.assertIn("pūrvebhiḥ", state.residual_tokens)


if __name__ == "__main__":
    unittest.main()
