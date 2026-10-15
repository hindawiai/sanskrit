import importlib.util, json, tempfile, unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
MOD_PATH = ROOT / 'scripts' / 'nirgundi' / 'observed_form_bootstrap.py'
spec = importlib.util.spec_from_file_location('observed_form_bootstrap', MOD_PATH)
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)

class ObservedFormBootstrapTests(unittest.TestCase):
    def test_extract_deduplicates_and_sorts_longest_first(self):
        rows = [
            {'id':'1.1.1','sutra':'अग्निः अग्नि','term':'अग्नि','padaccheda':'अग्निः १/१','gloss':'अग्नि देवः','anuvrtti':[{'term':'देवः'}]},
            {'id':'1.1.2','sutra':'देवः','term':'देवः','padaccheda':'','gloss':'','anuvrtti':[]},
        ]
        forms = mod.extract_forms(rows)
        self.assertEqual(len(forms), len(set(forms)))
        self.assertEqual(forms, sorted(forms, key=lambda s:(-len(s),s)))
        self.assertIn('अग्नि', forms)
        self.assertIn('देवः', forms)
    def test_full_corpus_run_is_repeatable_and_keeps_all_records(self):
        data = ROOT / 'data' / 'sutras.json'
        with tempfile.TemporaryDirectory() as d1, tempfile.TemporaryDirectory() as d2:
            m1 = mod.run(data, Path(d1)); m2 = mod.run(data, Path(d2))
            self.assertEqual(m1, m2)
            self.assertEqual(m1['source_records'], 3983)
            self.assertEqual(m1['records_with_at_least_one_literal_match'] + m1['records_without_literal_match'], 3983)
            self.assertTrue((Path(d1)/'observed-form-inventory.jsonl').exists())
            self.assertTrue((Path(d1)/'per-sutra-substitutions.jsonl').exists())
            self.assertTrue((Path(d1)/'residual-frequency.json').exists())
            self.assertEqual((Path(d1)/'metrics.json').read_bytes(), (Path(d2)/'metrics.json').read_bytes())

if __name__ == '__main__': unittest.main()
