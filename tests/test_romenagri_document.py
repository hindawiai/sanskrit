#!/usr/bin/env python3
"""Lossless document-front-end tests for the Romenagri Unicode escape wrapper."""
from __future__ import annotations

import sys
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "tools"))
from transliteration.romenagri_document import encode_lossless, decode_lossless


class RomenagriDocumentTests(unittest.TestCase):
    def assert_lossless(self, source: str) -> None:
        encoded = encode_lossless(source)
        decoded, note = decode_lossless(encoded.output)
        self.assertEqual(note, "", (source, encoded, note))
        self.assertEqual(decoded, source, (source, encoded, decoded))
        self.assertGreaterEqual(encoded.escaped_codepoints, 0)
        self.assertGreaterEqual(encoded.escaped_clusters, 0)

    def test_empty_and_whitespace(self):
        for source in ("", " ", "\n", "\t", " \n\t"):
            with self.subTest(source=source):
                self.assert_lossless(source)

    def test_core_devanagari_and_attested_conventions(self):
        for source in (
            "अ", "आ", "इ", "ई", "उ", "ऊ", "ऋ", "ए", "ऐ", "ओ", "औ",
            "क", "का", "कि", "कु", "क्", "ज्ञ", "क्षि", "चेत्",
            "सर्वम्", "पापम्", "उद्धरणम्", "ऽ", "।", "अः", "अं", "अँ",
        ):
            with self.subTest(source=source):
                self.assert_lossless(source)

    def test_reported_extended_symbols_are_losslessly_escaped(self):
        source = "ऽ “quoted” ‘single’ कॉ कॅ क़ क्‍षि क्‍ ॥ 45–52—"
        encoded = encode_lossless(source)
        self.assertGreater(encoded.escaped_codepoints, 0)
        decoded, note = decode_lossless(encoded.output)
        self.assertEqual(note, "")
        self.assertEqual(decoded, source)

    def test_exactly_preserves_the_reported_word_examples(self):
        for source in ("चेत्", "सर्वम्", "पापम्", "उद्धरणम्"):
            with self.subTest(source=source):
                encoded = encode_lossless(source)
                self.assertEqual(encoded.escaped_codepoints, 0)
                decoded, note = decode_lossless(encoded.output)
                self.assertEqual((decoded, note), (source, ""))

    def test_ascii_punctuation_digits_latin_and_literal_escape_marker(self):
        for source in ("।।36।।", "45-52।", "'अ", "abc 123", "literal ~{ text", "|", "%"):
            with self.subTest(source=source):
                self.assert_lossless(source)

    def test_every_unicode_scalar_fallback_boundary(self):
        for source in ("\u093c", "\u0945", "\u0949", "\u200d", "\u200c",
                       "\u2018", "\u201c", "\u201d", "\u2013", "\u2014",
                       "🙂", "\x00", "\U0010ffff"):
            with self.subTest(source=source):
                self.assert_lossless(source)

    def test_escape_decoder_rejects_malformed_syntax(self):
        for source in ("~{", "~{ZZZZ}", "~{123}", "~{0000000}", "~{D800}", "~{110000}"):
            with self.subTest(source=source):
                decoded, note = decode_lossless(source)
                self.assertIsNone(decoded)
                self.assertNotEqual(note, "")

    def test_escape_decoder_rejects_unescaped_non_token_characters(self):
        for source in ('"', "“", "-", "🙂", "abc!"):
            with self.subTest(source=source):
                decoded, note = decode_lossless(source)
                self.assertIsNone(decoded)
                self.assertNotEqual(note, "")

    def test_escape_decoder_rejects_invalid_base_segment(self):
        decoded, note = decode_lossless("q")
        self.assertIsNone(decoded)
        self.assertIn("Romenagri segment", note)
        decoded, note = decode_lossless("q~{201C}")
        self.assertIsNone(decoded)
        self.assertIn("before escape", note)

    def test_cluster_fallback_preserves_noncanonical_doubled_matra(self):
        source = "ज्ञाान"
        encoded = encode_lossless(source)
        decoded, note = decode_lossless(encoded.output)
        self.assertEqual(note, "")
        self.assertEqual(decoded, source)
        self.assertGreater(encoded.escaped_codepoints, 0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
