from __future__ import annotations
import csv
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "scripts" / "hindawi_language_port_audit.py"

class LanguagePortAuditTests(unittest.TestCase):
    def fixture(self, base: Path):
        r = base / "romenagri"
        (r / "langspec/data").mkdir(parents=True)
        (r / "tables").mkdir()
        c = base / "chintamani"
        c.mkdir()
        (r / "langspec/data/language_registry.csv").write_text(
            "code,language_name,iso639,script,xlit_script,source,speakers\n"
            "hindi,Hindi,hin,Devanagari,devanagari,sanskrit,600M\n"
            "urdu,Urdu,urd,Perso-Arabic,arabic,arabic,230M\n"
            "tibetan,Tibetan,bod,Tibetan,tibetan,sanskrit,6M\n", encoding="utf-8")
        header = "construct_id,native_keyword,romenagri,note\n"
        (r / "langspec/data/lang_hindi.csv").write_text(header + "KW_IF,यदि,yadi,if\n", encoding="utf-8")
        (r / "langspec/data/lang_urdu.csv").write_text(header + "KW_IF,اگر,agar,if\n", encoding="utf-8")
        (r / "langspec/data/lang_tibetan.csv").write_text(header + "KW_IF,yadi,yadi,romenagri_pending_tibetan\n", encoding="utf-8")
        (r / "tables/devanagari_to_deva.tsv").write_text("# identity\n", encoding="utf-8")
        (r / "tables/arabic_to_deva.tsv").write_text("# not populated\n", encoding="utf-8")
        (r / "tables/tibetan_to_deva.tsv").write_text("# not populated\n", encoding="utf-8")
        (c / "fltr_hi_ur").write_text("s/a/b/\n", encoding="utf-8")
        (c / "fltr_ur_hi").write_text("s/b/a/\n", encoding="utf-8")
        return r, c

    def test_classifies_actual_architecture_without_faking_support(self):
        with tempfile.TemporaryDirectory() as td:
            r, c = self.fixture(Path(td))
            p = subprocess.run([sys.executable, str(AUDIT), "--romenagri-root", str(r), "--chintamani-root", str(c)], capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stderr)
            rows = list(csv.DictReader(p.stdout.splitlines()))
            by = {x["code"]: x for x in rows}
            self.assertEqual(len(rows), 3)
            self.assertEqual(by["hindi"]["status"], "keyword-spec-present-needs-compiler-conformance")
            self.assertEqual(by["urdu"]["status"], "filter-chain-present-table-still-required")
            self.assertEqual(by["urdu"]["forward_filter"], "fltr_hi_ur")
            self.assertEqual(by["tibetan"]["status"], "prototype-keywords-pending")

    def test_strict_mode_fails_on_unverified_profiles(self):
        with tempfile.TemporaryDirectory() as td:
            r, c = self.fixture(Path(td))
            p = subprocess.run([sys.executable, str(AUDIT), "--romenagri-root", str(r), "--chintamani-root", str(c), "--strict"], capture_output=True, text=True)
            self.assertEqual(p.returncode, 1)

    def test_duplicate_registry_code_fails(self):
        with tempfile.TemporaryDirectory() as td:
            r, c = self.fixture(Path(td))
            path = r / "langspec/data/language_registry.csv"
            with path.open("a", encoding="utf-8") as f: f.write("hindi,Hindi,hin,Devanagari,devanagari,sanskrit,600M\n")
            p = subprocess.run([sys.executable, str(AUDIT), "--romenagri-root", str(r)], capture_output=True, text=True)
            self.assertEqual(p.returncode, 2)
            self.assertIn("duplicate language code", p.stderr)

    def test_missing_keyword_file_is_explicit(self):
        with tempfile.TemporaryDirectory() as td:
            r, c = self.fixture(Path(td))
            (r / "langspec/data/lang_urdu.csv").unlink()
            p = subprocess.run([sys.executable, str(AUDIT), "--romenagri-root", str(r)], capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stderr)
            rows = list(csv.DictReader(p.stdout.splitlines()))
            by = {x["code"]: x for x in rows}
            self.assertEqual(by["urdu"]["status"], "blocked-missing-keyword-file")

if __name__ == "__main__": unittest.main()
