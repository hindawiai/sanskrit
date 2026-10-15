# Implementation split

Date: 2026-10-11. Source tree: `pushkalavati-inverse-reduction-implemented-2026-10-11`.

JavaScript is the implementation. Python is a placeholder.

## Canonical

- Inverse reduction: `tools/pushkalavati-compiler/src/inverse-reduction.js`
- Runner: `node src/inverse-cli.js <devanagari-form>` from `tools/pushkalavati-compiler`
- Tests: `tools/pushkalavati-compiler/tests/compiler.test.js` (the `उपेन्द्रो` block)
- Rule compiler and meta-runtime: the other modules under `tools/pushkalavati-compiler/src/`
- Sūtram engine: `lang/js/engine.js` and the modules beside it

## What the JavaScript inverse slice actually does

- Devanagari grapheme segmentation
- Longest prādi prefix, no default to `उप`
- Inverse candidates at a dependent-vowel boundary for 6.1.87 and 6.1.88
- Both candidates kept (`इन्द्रो` and `ईन्द्रो` for `उपेन्द्रो`)
- Suffix morphology left `UNRESOLVED`. The architecture forbids stripping `ो` to `इन्द्र` without a licensed ending derivation.

That is an implemented slice, not a complete parser.

## Python

- `tools/pushkalavati-compiler/python/inverse_reduction.py` raises `NotImplementedError` and points at the JavaScript module.
- `python/pipeline.py` morphological and kāraka paths remain stubs.
- `python/sandhi.py` and `tools/pushkalavati-compiler/python/execute.py` are forward helpers, not the inverse parser.

## Not bundled

The Cologne lexicon and the earlier Rigveda Nirgundi experiment artifacts are absent. Do not treat a missing artifact as a failed parse.
