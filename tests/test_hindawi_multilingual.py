import csv
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

class HindawiMultilingualTests(unittest.TestCase):
    def test_registry_is_csv_and_profiles_are_distinct(self):
        path = ROOT / 'lang/hindawi/languages/registry.csv'
        with path.open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream))
        ids = {row['profile_id'] for row in rows}
        for required in ('hi-Deva','sa-Deva','ur-Arab','fa-Arab','ar-Arab','pa-Arab','sd-Arab','ks-Arab','bo-Tibt','si-Sinh','he-Hebr','bn-Beng','gu-Gujr','ta-Taml','te-Telu','kn-Knda','ml-Mlym','mni-Mtei'):
            self.assertIn(required, ids)
        self.assertNotEqual(next(r for r in rows if r['profile_id']=='hi-Deva')['profile_id'], next(r for r in rows if r['profile_id']=='sa-Deva')['profile_id'])

    def test_sanskrit_keyword_inventory_is_csv_and_source_is_preserved(self):
        path = ROOT / 'lang/hindawi/keywords/sa/keywords.csv'
        with path.open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream))
        pairs = {(r['source'], r['c_token']) for r in rows if r['review_status'] == 'proposed'}
        self.assertIn(('यदि','if'), pairs)
        self.assertIn(('पूर्णाङ्क','int'), pairs)
        self.assertIn(('मुख्य','main'), pairs)
        source = (ROOT/'lang/sanskrit-c/tests/input.sa.c').read_text(encoding='utf-8')
        self.assertIn('यदि', source)
        self.assertIn('प्रतिदाय', source)
        self.assertTrue((ROOT/'lang/sanskrit-c/examples/ganana.sa.c').is_file())

    def test_hebrew_filter_longest_match_and_unmapped_preservation(self):
        p = subprocess.run([sys.executable, str(ROOT/'lang/hindawi/filters/fltr_hi_he.py')], input='क्ष नमस्ते, test! 🧪\n', capture_output=True, text=True)
        self.assertEqual(p.returncode, 0, p.stderr)
        self.assertTrue(p.stdout.startswith('קְשׁ'))
        self.assertIn('test!', p.stdout)
        self.assertIn('🧪', p.stdout)
        self.assertIn('unmapped input code points', p.stderr)

    def test_hebrew_filter_file_input_matches_stdin(self):
        sample = 'नमस्ते\nकर्म'
        with tempfile.TemporaryDirectory() as td:
            path = Path(td)/'in.txt'
            path.write_text(sample, encoding='utf-8')
            a = subprocess.run([sys.executable, str(ROOT/'lang/hindawi/filters/fltr_hi_he.py'), str(path)], capture_output=True, text=True)
            b = subprocess.run([sys.executable, str(ROOT/'lang/hindawi/filters/fltr_hi_he.py')], input=sample, capture_output=True, text=True)
        self.assertEqual(a.returncode, 0, a.stderr)
        self.assertEqual(b.returncode, 0, b.stderr)
        self.assertEqual(a.stdout, b.stdout)

    def test_csv_tables_have_headers_unique_keys_and_utf8_content(self):
        for path, key in (
            (ROOT/'lang/hindawi/languages/registry.csv', 'profile_id'),
            (ROOT/'lang/hindawi/keywords/sa/keywords.csv', 'source'),
            (ROOT/'lang/hindawi/filters/hi_he_map.csv', 'source_grapheme'),
        ):
            with path.open(encoding='utf-8-sig', newline='') as stream:
                reader = csv.DictReader(stream)
                self.assertIn(key, reader.fieldnames)
                rows = list(reader)
            values = [row[key] for row in rows if row[key]]
            self.assertEqual(len(values), len(set(values)), f'duplicate {key} in {path}')
            self.assertTrue(rows, f'empty CSV table: {path}')

    def test_hebrew_mapping_covers_multicodepoint_graphemes(self):
        with (ROOT/'lang/hindawi/filters/hi_he_map.csv').open(encoding='utf-8-sig', newline='') as stream:
            rows = list(csv.DictReader(stream))
        mapping = {row['source_grapheme']: row['target_sequence'] for row in rows}
        self.assertIn('क्ष', mapping)
        self.assertIn('ज्ञ', mapping)
        self.assertTrue(all(row['status'] == 'provisional' for row in rows))
        self.assertTrue(all(row['target_sequence'] for row in rows))

    def test_hindi_and_sanskrit_sources_remain_separate_and_unmodified(self):
        sa = ROOT/'lang/sanskrit-c/tests/input.sa.c'
        sample = sa.read_text(encoding='utf-8')
        self.assertIn('पूर्णाङ्क मुख्य', sample)
        self.assertTrue((ROOT/'lang/hindawi/keywords/hi/README.md').exists())
        # No build/test path rewrites the native Sanskrit source in place.
        self.assertEqual(sa.read_text(encoding='utf-8'), sample)

    def test_no_json_in_multilingual_payload(self):
        for path in (ROOT/'lang/hindawi/languages/registry.json', ROOT/'lang/hindawi/keywords/sa/keywords.json', ROOT/'lang/hindawi/filters/hi_he_map.json', ROOT/'scripts/hindawi_translate_c.py'):
            self.assertFalse(path.exists(), f'forbidden prototype artifact remains: {path}')

if __name__ == '__main__':
    unittest.main()
