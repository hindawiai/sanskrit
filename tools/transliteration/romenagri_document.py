"""
Lossless document wrapper around the Rahnuma-derived Romenagri word encoder.

The base encoder remains strict and unchanged. This wrapper transliterates
supported Devanagari grapheme-like clusters and uses explicit Unicode scalar
escapes for unsupported clusters, punctuation, digits, Latin text, and controls.
It is a documented transport extension, not a claim that these escapes belong
to the inherited Romenagri 1.3.0 convention or legacy C filter grammar.

Escape syntax: ~{HEX}, with 4-6 uppercase hexadecimal digits. A literal '~'
is escaped as ~{007E}. Escapes are parsed only by decode_lossless().
"""
from __future__ import annotations

import unicodedata
from typing import NamedTuple

from .romenagri import encode as encode_word, decode as decode_word

ESCAPE = "~{"


class EncodingReport(NamedTuple):
    output: str
    escaped_codepoints: int
    escaped_clusters: int


def _is_devanagari(ch: str) -> bool:
    return 0x0900 <= ord(ch) <= 0x097F


def _is_mark(ch: str) -> bool:
    return unicodedata.category(ch).startswith("M")


def _cluster_end(text: str, start: int) -> int:
    """Return an approximate Devanagari grapheme-cluster end.

    It includes combining marks and follows virama + optional joiner +
    consonant sequences, so nukta/candra-vowel/joiner cases fall back as a
    unit rather than corrupting neighbouring consonant-vowel composition.
    """
    i = start + 1
    while i < len(text):
        ch = text[i]
        if _is_mark(ch):
            i += 1
            continue
        if ch == "\u200d" or ch == "\u200c":
            # Joiners are attached to the cluster; if preceded by virama,
            # also include the following Devanagari consonant.
            i += 1
            if i < len(text) and _is_devanagari(text[i]):
                i += 1
                while i < len(text) and _is_mark(text[i]):
                    i += 1
            continue
        if text[i - 1] == "\u094d" and _is_devanagari(ch):
            i += 1
            while i < len(text) and _is_mark(text[i]):
                i += 1
            continue
        break
    return i


def _escape(ch: str) -> str:
    return f"~{{{ord(ch):04X}}}"


def encode_lossless(text: str) -> EncodingReport:
    """Encode a mixed Devanagari document without silently dropping input.

    Supported clusters use the existing word-level Romenagri encoder.
    Unsupported or non-Devanagari characters are represented with reversible
    Unicode escapes. If a cluster is not exactly reversible through the base
    encoder, every code point in that cluster is escaped verbatim.
    """
    out: list[str] = []
    escaped_codepoints = 0
    escaped_clusters = 0
    i = 0

    while i < len(text):
        ch = text[i]

        if ch in (" ", "\n", "\t"):
            out.append(ch)
            i += 1
            continue

        if _is_devanagari(ch):
            end = _cluster_end(text, i)
            cluster = text[i:end]
            encoded, note = encode_word(cluster)
            if encoded is not None and not note:
                decoded, decode_note = decode_word(encoded)
                if decoded == cluster and not decode_note:
                    out.append(encoded)
                    i = end
                    continue
            out.extend(_escape(c) for c in cluster)
            escaped_codepoints += len(cluster)
            escaped_clusters += 1
            i = end
            continue

        # All other characters, including punctuation, digits, ASCII letters,
        # joiners outside a Devanagari cluster, and the escape introducer, are
        # preserved explicitly rather than confused with Romenagri tokens.
        out.append(_escape(ch))
        escaped_codepoints += 1
        escaped_clusters += 1
        i += 1

    return EncodingReport("".join(out), escaped_codepoints, escaped_clusters)


def decode_lossless(text: str) -> tuple[str | None, str]:
    """Decode the lossless wrapper syntax, rejecting malformed escapes."""
    out: list[str] = []
    segment: list[str] = []

    def flush_segment() -> tuple[bool, str]:
        if not segment:
            return True, ""
        decoded, note = decode_word("".join(segment))
        if decoded is None or note:
            return False, note or "base Romenagri decode failed"
        out.append(decoded)
        segment.clear()
        return True, ""

    i = 0
    while i < len(text):
        if text.startswith(ESCAPE, i):
            ok, note = flush_segment()
            if not ok:
                return None, f"invalid Romenagri segment before escape at {i}: {note}"
            close = text.find("}", i + 2)
            if close < 0:
                return None, f"unterminated Unicode escape at {i}"
            digits = text[i + 2:close]
            if not (4 <= len(digits) <= 6) or any(c not in "0123456789ABCDEF" for c in digits):
                return None, f"invalid Unicode escape at {i}: {digits!r}"
            cp = int(digits, 16)
            if cp > 0x10FFFF or 0xD800 <= cp <= 0xDFFF:
                return None, f"invalid Unicode scalar U+{cp:04X} at {i}"
            out.append(chr(cp))
            i = close + 1
            continue
        # The base layer's token alphabet is letters/underscore plus danda
        # marker and ordinary whitespace. Non-token characters must be
        # explicit escapes so accidental raw punctuation cannot be swallowed.
        ch = text[i]
        if ch.isascii() and (ch.isalpha() or ch.isdigit() or ch == "_" or ch == "|" or ch in " \n\t"):
            segment.append(ch)
            i += 1
            continue
        return None, f"unescaped character U+{ord(ch):04X} at {i}"
    ok, note = flush_segment()
    if not ok:
        return None, f"invalid final Romenagri segment: {note}"
    return "".join(out), ""
