"""
Romenagri encoder/decoder reconstructed from the letter table and the
attested word forms in Rahnuma 1.3.0, chapter 17, pages 56-58.

This is not a claim of byte-identical behaviour with the legacy C
filters (uni2acii, acii2cf, rmn2acii, acii2uni). It implements the
mapping those filters are documented to produce, for the inventory and
the named examples in that chapter.

Alphabet: A-Z, a-z, underscore. Independent vowels carry a leading
underscore. Dental and retroflex are distinguished by the marker.
Virama drops the inherent vowel; a consonant with no vowel after it
stands for the virama.
"""
from __future__ import annotations

# Independent vowels and consonants, as Devanagari = Romenagri.
# Source: Rahnuma 1.3.0 p.56, "Letters, as Devanagari = Romenagri".
INDEPENDENT = {
    "अ": "_a", "आ": "_aa", "इ": "_i", "ई": "_ee", "उ": "_u", "ऊ": "_oo",
    "ऋ": "_ri", "ए": "_aee", "ऐ": "_ai", "ओ": "_oa", "औ": "_ou",
}
CONSONANT = {
    "क": "ka", "ख": "kha", "ग": "ga", "घ": "gha", "ङ": "_nga",
    "च": "cha", "छ": "chha", "ज": "ja", "झ": "jha", "ञ": "_yna",
    "ट": "ta", "ठ": "tha", "ड": "da", "ढ": "dha", "ण": "_nna",
    "त": "_ta", "थ": "_tha", "द": "_da", "ध": "_dha", "न": "na",
    "प": "pa", "फ": "pha", "ब": "ba", "भ": "bha", "म": "ma",
    "य": "ya", "र": "ra", "ल": "la", "व": "wa", "श": "sha", "ष": "xa",
    "स": "sa", "ह": "_ha",
}
# Matras, applied in place of the inherent vowel.
MATRA = {
    "ा": "aa", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo",
    "े": "aee", "ै": "ai", "ो": "oa", "ौ": "ou",
    "ृ": "_ri", "ॄ": "_rri", "ॢ": "_li", "ॣ": "_lli",
    "ं": "_m", "ः": "_hh", "ँ": "_am",
}
VIRAMA = "्"
AVAGRAHA = "ऽ"
# Upstream fixuninum maps every Indic digit to ASCII. That is normalisation:
# the inverse cannot recover whether the source was ५ or 5.
DEVANAGARI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")
ASCII_DIGITS = set("0123456789")

# Inverse: longest Romenagri token first.
_INVERSE = {}
for dev, rom in INDEPENDENT.items():
    _INVERSE[rom] = dev
for dev, rom in CONSONANT.items():
    _INVERSE[rom] = dev + VIRAMA  # bare consonant is the virama form; rebuilt below
# Rebuild inverse properly: the encoder produces either "stem+vowel" or "stem" for virama.
_STEM = {}
for dev, rom in CONSONANT.items():
    # "ka" -> stem "k", inherent "a"; "_ta" -> stem "_t", inherent "a"
    if rom.endswith("a") and not rom.endswith("aa"):
        _STEM[rom[:-1]] = dev
_INVERSE_TOKENS = sorted(_INVERSE, key=len, reverse=True)


def _build_decode_table() -> tuple[dict[str, str], list[str]]:
    """Build the longest-match decoder table once, not for every input."""
    token_map: dict[str, str] = {}
    for dev, rom in INDEPENDENT.items():
        token_map[rom] = dev
    for dev, rom in CONSONANT.items():
        token_map[rom] = dev
        stem = rom[:-1] if rom.endswith("a") and not rom.endswith("aa") else rom
        for matra, vowel in MATRA.items():
            token_map[stem + vowel] = dev + matra
        token_map[stem] = dev + VIRAMA
    # These are Rahnuma-derived spelling-layer tokens, not a claim of
    # equivalence with every legacy ACII table key.
    token_map["_m"] = "ं"
    token_map["_hh"] = "ः"
    token_map["_am"] = "ँ"
    token_map["_3"] = AVAGRAHA
    token_map["|"] = "।"
    return token_map, sorted(token_map, key=len, reverse=True)


_DECODE_TOKEN_MAP, _DECODE_ORDERED = _build_decode_table()


def encode(text: str) -> tuple[str | None, str]:
    """Devanagari to Romenagri. Returns (output, note)."""
    if not text:
        return "", ""
    out = []
    i = 0
    while i < len(text):
        ch = text[i]
        if ch in INDEPENDENT:
            out.append(INDEPENDENT[ch])
            i += 1
            continue
        if ch in CONSONANT:
            base = CONSONANT[ch]
            stem = base[:-1] if base.endswith("a") and not base.endswith("aa") else base
            inherent = "a" if base.endswith("a") and not base.endswith("aa") else ""
            nxt = text[i + 1] if i + 1 < len(text) else ""
            if nxt == VIRAMA:
                out.append(stem)
                i += 2
                continue
            if nxt in MATRA:
                vowel = MATRA[nxt]
                out.append(stem + vowel)
                i += 2
                # Rahnuma p.56 lists ज्ञाान -> j_ynaana; the source string
                # carries a doubled long-a matra. The attested form keeps one.
                if i < len(text) and text[i] == nxt:
                    i += 1
                continue
            out.append(base)
            i += 1
            continue
        if ch in MATRA:
            # Marks can follow independent vowels or appear at a token boundary;
            # consonant+mark cases are consumed above as a contextual replacement.
            out.append(MATRA[ch])
            i += 1
            continue
        if ch == AVAGRAHA:
            out.append("_3")
            i += 1
            continue
        if ch == "।":
            out.append("|")
            i += 1
            continue
        if ch in (" ", "\n", "\t"):
            out.append(ch)
            i += 1
            continue
        if ch in ASCII_DIGITS:
            out.append(ch)
            i += 1
            continue
        mapped = ch.translate(DEVANAGARI_DIGITS)
        if mapped != ch:
            out.append(mapped)
            i += 1
            continue
        return None, f"unmapped codepoint U+{ord(ch):04X} at {i}"
    return "".join(out), ""


def decode(text: str) -> tuple[str | None, str]:
    """Romenagri to Devanagari, longest match. Incomplete for ambiguous stems."""
    if not text:
        return "", ""
    token_map = _DECODE_TOKEN_MAP
    ordered = _DECODE_ORDERED
    out = []
    i = 0
    while i < len(text):
        if text[i] in (" ", "\n", "\t") or text[i] in ASCII_DIGITS:
            out.append(text[i])
            i += 1
            continue
        match = next((tok for tok in ordered if text.startswith(tok, i)), None)
        if not match:
            return None, f"no token at {i}: {text[i:]!r}"
        out.append(token_map[match])
        i += len(match)
    # A bare consonant stem is the explicit virama form. Do not strip a final
    # virama: encode("क्") emits "k", so stripping it would violate round-trip
    # consistency and collapse distinct spellings.
    return "".join(out), ""
