# Transliteration

Romenagri is the default scheme behind `tools/transliteration`. This Python implementation is reconstructed from Rahnuma 1.3.0, chapter 17; it is **not** the legacy Romenagri C converter and is not claimed to be byte-for-byte compatible with `uni2acii`, `acii2cf`, `rmn2acii`, or `acii2uni`.

| scheme | implementation/source | license | status |
|---|---|---|---|
| romenagri | local reconstruction from Rahnuma 1.3.0, ch. 17 | GPL-3.0-only for this tree | default; ASCII-oriented; 13/13 named forms match, 12/13 round-trip exactly on the current fixture |
| iast, hk, slp1, itrans, velthuis, wx and other script adapters | vendored `indic_transliteration` Python library | MIT | active Python adapters; speed and round-trip are measured separately |
| `sanscript.js` | vendored JavaScript implementation | MIT | vendored reference/possible browser adapter; not called by the current Python harness |
| vidyut-lipi | vendored Rust library | MIT | independent transliteration implementation, not currently called by this Python harness |

## Evidence boundaries

- **Attested-output matching is not round-trip fidelity.** All 13 named Rahnuma forms match the expected Romenagri spelling. The fixture's `ज्ञाान` input has a doubled long-a sign; the expected form is `j_ynaana`, and decoding returns `ज्ञान`. That is the single known non-identical Romenagri round trip in this fixture.
- In the vendored FOSS schemes, the same `ज्ञाान` spelling normalizes differently, and `क्ह` is ambiguous with `ख` in several romanization schemes. These are fixture/source representation issues, not measurements of phonetic fidelity.
- The benchmark does not measure pronunciation or phonetic equivalence. Rahnuma 1.3.0 chapter 17 notes that spelling does not fully determine sound across speech communities; phonetic fidelity remains open research.
- This module's word encoder/decoder is a separate abstraction from `tools/pushkalavati-compiler/src/romenagri.js`, which maps canonical sound tokens to audited legacy table keys only. Neither layer establishes parity with the legacy C parser.
- The legacy table contains 84 rows including the control/sentinel; BUILD-0015's JSON records `source_table_length: 84` and 83 entries excluding that sentinel. Unsupported sound tokens are reported rather than assigned guessed keys.


## Lossless document front end (extension)

`tools/transliteration/romenagri_document.py` adds an **opt-in, lossless
transport wrapper** for mixed Devanagari documents. It uses the existing
Romenagri encoder for grapheme-like clusters that encode and decode exactly.
For unsupported Devanagari clusters, punctuation, numerals, Latin text,
Unicode controls, and other unsupported characters, it emits reversible
Unicode scalar escapes of the form `~{201C}`. A literal `~` is escaped too.

This is a Pushkalāvatī front-end extension, **not part of the inherited
Rahnuma Romenagri notation** and not a claim of compatibility with the legacy
C filters. Keep the strict `encode()` API for callers that require the base
inventory and want unsupported input to return an error. Use
`encode_lossless()` / `decode_lossless()` only when lossless document
preservation is the requirement. An escaped grapheme is preserved verbatim;
it is not claimed to have been transliterated.

Run its test suite with branch coverage:

```sh
PYTHONPATH=tools:third_party/indic_transliteration coverage run --branch -m unittest tests/test_romenagri_document.py
coverage report -m tools/transliteration/romenagri_document.py
```

The current focused suite exercises every statement and branch in this wrapper.
That is **100% statement and branch coverage for this one module**, not 100%
coverage of the entire repository or all Unicode semantics.

## Run

From the repository root:

```sh
PYTHONPATH=tools:third_party/indic_transliteration python3 tools/transliteration/compare.py
python3 tests/test_transliteration.py
```

The vendored library's scheme tables are TOML. On Python 3.11+, the local `third_party/indic_transliteration/toml.py` shim uses the standard-library `tomllib` read API; it is intentionally not a full TOML writer. On Python 3.10, install the upstream `toml` dependency or use Python 3.11+.
