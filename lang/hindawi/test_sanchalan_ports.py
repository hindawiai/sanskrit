#!/usr/bin/env python3
"""Load the Sanchalan library keywords through every vendored C port.

A port is working only when the library keywords it claims are present
round-trip back to the same C tokens. Incomplete tables are reported,
not treated as success.
"""
from __future__ import annotations
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LANGS = ROOT / "lang/hindawi/upstream/langs"
LIB = ROOT / "lang/suktam/lib/sanchalan.c"
REQUIRED = ["int", "void", "if", "else", "return", "const", "static", "for", "char"]


def load(path: Path):
    mapping = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        if not line.strip() or line.startswith("#"):
            continue
        parts = line.split("\t")
        if len(parts) < 3:
            continue
        native, _roman, c_kw = parts[0], parts[1], parts[2]
        mapping[c_kw] = native
    return mapping


def main() -> int:
    source = LIB.read_text(encoding="utf-8")
    used = [kw for kw in REQUIRED if kw in source]
    failures = 0
    for path in sorted(LANGS.glob("*_c.tsv")):
        mapping = load(path)
        missing = [kw for kw in used if kw not in mapping]
        if missing:
            print(f"INCOMPLETE {path.name} missing={missing}")
            continue
        rewritten = source
        for kw in sorted(mapping, key=len, reverse=True):
            if kw in used:
                rewritten = rewritten.replace(kw, mapping[kw])
        restored = rewritten
        reverse = {native: c_kw for c_kw, native in ((k, mapping[k]) for k in used)}
        for native in sorted(reverse, key=len, reverse=True):
            restored = restored.replace(native, reverse[native])
        if restored != source:
            print(f"FAIL {path.name} round-trip mismatch")
            failures += 1
        else:
            print(f"PASS {path.name} keywords={len(used)}")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
