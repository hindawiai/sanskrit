#!/usr/bin/env python3
"""IAST to Devanagari with the RV ḷ correction.

indic_transliteration maps IAST ḷ to the independent vowel ऌ (U+090C).
In RV forms such as īḷe the ḷ is the retroflex lateral consonant ळ (U+0933)
followed by a vowel. This module applies that correction after the
library conversion. It does not change the library.
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path = [p for p in sys.path if "indic_transliteration" not in p]
import toml  # real toml before the vendored stub shadows it
sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "third_party" / "indic_transliteration"))
from indic_transliteration import sanscript

# ऌ + vowel-letter -> ळ + matra
_CORRECTION = {
    "ऌअ": "ळ",
    "ऌआ": "ळा",
    "ऌइ": "ळि",
    "ऌई": "ळी",
    "ऌउ": "ळु",
    "ऌऊ": "ळू",
    "ऌए": "ळे",
    "ऌऐ": "ळै",
    "ऌओ": "ळो",
    "ऌऔ": "ळौ",
}


def iast_to_devanagari(text: str) -> str:
    dev = sanscript.transliterate(text, sanscript.IAST, sanscript.DEVANAGARI)
    for src, dst in _CORRECTION.items():
        dev = dev.replace(src, dst)
    return dev
