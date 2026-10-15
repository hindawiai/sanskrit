"""Adapters over vendored FOSS transliterators. Each returns a string or raises."""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INDIC = ROOT / "third_party" / "indic_transliteration"
if str(INDIC) not in sys.path:
    sys.path.insert(0, str(INDIC))

_SCHEME = {
    "devanagari": "DEVANAGARI",
    "iast": "IAST",
    "hk": "HK",
    "harvard-kyoto": "HK",
    "slp1": "SLP1",
    "itrans": "ITRANS",
    "velthuis": "VELTHUIS",
    "wx": "WX",
    "iso": "ISO",
    "bengali": "BENGALI",
    "telugu": "TELUGU",
    "tamil": "TAMIL",
    "gujarati": "GUJARATI",
    "kannada": "KANNADA",
    "malayalam": "MALAYALAM",
    "gurmukhi": "GURMUKHI",
    "oriya": "ORIYA",
}


def _indic(text: str, source: str, target: str) -> str:
    from indic_transliteration import sanscript
    src = getattr(sanscript, _SCHEME[source.lower()])
    dst = getattr(sanscript, _SCHEME[target.lower()])
    return sanscript.transliterate(text, src, dst)


ADAPTERS = {
    "iast": _indic,
    "hk": _indic,
    "harvard-kyoto": _indic,
    "slp1": _indic,
    "itrans": _indic,
    "velthuis": _indic,
    "wx": _indic,
    "iso": _indic,
    "bengali": _indic,
    "telugu": _indic,
    "tamil": _indic,
    "gujarati": _indic,
    "kannada": _indic,
    "malayalam": _indic,
    "gurmukhi": _indic,
    "oriya": _indic,
    "devanagari": _indic,
}
