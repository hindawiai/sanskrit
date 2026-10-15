"""
Transliteration abstraction. Romenagri is the default.

The interface is the same for every scheme: encode(text, source, target).
Romenagri is the scheme used when no scheme is named. Other schemes are
adapters over vendored FOSS implementations.

Phonetic fidelity is not computed here. Rahnuma 1.3.0 chapter 17 states
the reason: a Unicode string records the spelling, not the sound, and
the same Devanagari text is pronounced differently in Lucknow and in
Pune. That question is open research (Scharf and Hyman, Linguistic
Issues in Encoding Sanskrit; the integrative-linguistic-multiscript
line). The measured quantities are speed and round-trip fidelity.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable

from .romenagri import encode as romenagri_encode
from .romenagri import decode as romenagri_decode
from .adapters import ADAPTERS

DEFAULT_SCHEME = "romenagri"


@dataclass
class Result:
    scheme: str
    output: str | None
    status: str
    note: str = ""


def encode(text: str, source: str = "devanagari", target: str = DEFAULT_SCHEME) -> Result:
    """Transliterate. The default target is Romenagri."""
    return _dispatch(text, source, target)


def decode(text: str, source: str = DEFAULT_SCHEME, target: str = "devanagari") -> Result:
    """Inverse. The default source is Romenagri."""
    return _dispatch(text, source, target)


def round_trip(text: str, scheme: str = DEFAULT_SCHEME, hub: str = "devanagari") -> dict:
    """hub -> scheme -> hub. Reports whether the original returns."""
    forward = encode(text, hub, scheme)
    if forward.output is None:
        return {"scheme": scheme, "input": text, "forward": None, "back": None, "identical": False, "note": forward.note}
    back = decode(forward.output, scheme, hub)
    return {
        "scheme": scheme,
        "input": text,
        "forward": forward.output,
        "back": back.output,
        "identical": back.output == text,
        "note": back.note,
    }


def _dispatch(text: str, source: str, target: str) -> Result:
    if {source, target} <= {"romenagri", "devanagari"}:
        if target == "romenagri":
            out, note = romenagri_encode(text)
            return Result("romenagri", out, "ok" if out is not None else "unresolved", note)
        if source == "romenagri":
            out, note = romenagri_decode(text)
            return Result("romenagri", out, "ok" if out is not None else "unresolved", note)
    adapter = ADAPTERS.get(target) or ADAPTERS.get(source)
    if adapter is None:
        return Result(target, None, "no_adapter", f"no adapter for {source}->{target}")
    try:
        out = adapter(text, source, target)
        return Result(target if target != "devanagari" else source, out, "ok")
    except Exception as exc:
        return Result(target, None, "error", str(exc))
