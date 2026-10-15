# BUILD-0016 — Correlation and integrated test report

**Date:** 14 October 2026  
**Base:** BUILD-0015, with the missing BUILD-0014 Pages workflow restored  
**Build archive identity:** BUILD-0015 input SHA-256 `99a6ef9d11628a8e131f6d7c8884abee0e82a24ce9559a4972743347f5e640ef`  
**Earlier baseline:** BUILD-0014 SHA-256 `780e9c13eb86090adfc38d5d695ab3d009eda9ad68c2fcd124000faa3dfd0b84`

## 1. What was combined

- Preserved BUILD-0015's added `tools/transliteration/` package, vendored FOSS libraries, and comparison harness.
- Preserved BUILD-0014's compiler-side Romenagri sound-token/table-key bridge and the inherited 84-entry ACII inventory as a distinct layer.
- Integrated the submitted dossier, inventory, and trace matrix with BUILD-0014's correlation, then added BUILD-0015/0016 findings.
- Restored `.github/workflows/pages.yml`, which was missing from BUILD-0015 although the static-page test requires it.
- Restored executable mode bits on shell scripts required by the test runner. These bits were not preserved by the supplied ZIP extraction.
- Corrected the `^a` description so an empty value is not called a proven runtime defect; added `chh` to explicit unsupported-sound reporting.
- Fixed the word-level decoder's final-virāma stripping (`क् → k → क` became `क् → k → क्`), and added avagraha, danda, and postvocalic-sign support/regressions.
- Added a narrow read-only `tomllib` shim for the vendored Python scheme tables on Python 3.11+. Python 3.10 requires the upstream `toml` package for this optional transliteration adapter path.

## 2. Fresh transliteration results

The comparison harness matches all **13/13** expected Romenagri outputs from the named Rahnuma 1.3.0 chapter-17 fixture. Exact round trips on that same 13-item fixture:

| Scheme | Exact round trips | Interpretation |
|---|---:|---|
| Romenagri | 12/13 | `ज्ञाान → j_ynaana → ज्ञान`; fixture contains a doubled long-a sign while expected spelling keeps one |
| IAST | 11/13 | The doubled-mātrā case and `क्ह`/`ख` ambiguity |
| Harvard-Kyoto | 11/13 | The doubled-mātrā case and `क्ह`/`ख` ambiguity |
| SLP1 | 12/13 | The doubled-mātrā case |
| ITRANS | 11/13 | The doubled-mātrā case and `क्ह`/`ख` ambiguity |
| Velthuis | 11/13 | The doubled-mātrā case and `क्ह`/`ख` ambiguity |

This is a fixed spelling fixture, not a general accuracy ranking or a phonetic-fidelity measurement. Timing values vary between runs and are not treated as statistically meaningful.

## 3. Full test run

Command: `./scripts/test_all.sh`  
**Exit status: 0 — `ALL AVAILABLE TESTS PASSED`.**

Observed checks:

- JavaScript/Sūtram parser, interpreter, conversion, precedence, OOP, paradigms, backend, and Sanchalan C runtime: passed.
- Romenagri vendoring/wrapper contract: passed. This is a static contract test, not native upstream C execution.
- Transliteration harness: 13/13 expected Romenagri outputs matched; round-trip results above were recorded.
- Hindawi C/C++ keyword-table integrity: `profiles=68 failures=0`.
- Sanchalan ports: complete/incomplete profiles are reported according to the existing contract; missing keywords are not invented.
- Pushkalāvatī compiler artifacts regenerated from 3,983 source records; compiler tests passed; two-way 6.1.94 passed.
- Python tests: **35 tests, 34 passed, 1 skipped**. The skipped legacy experiment test requires the external Cologne MW lexicon and prior RV artifacts, which are not bundled.
- Python rule-IR parity: passed for 3,983 records.
- Shaili Robot static runner: passed.
- Pages validation: 29 HTML files checked for local links; 12 HTTP smoke-test URLs returned HTTP 200; browser lab and browser-app smoke tests passed.
- Rust compilation: skipped because `rustc` is unavailable in the execution environment; generated Rust is structurally checked only.

The nine transliteration-specific unit tests also pass in isolation (`python3 tests/test_transliteration.py`). The complete console output is preserved in `BUILD-0016_TEST_LOG.txt`; checksums and the machine-readable build manifest are in `BUILD-0016-MANIFEST.json` at the repository root.

## 4. Current generated compiler status

Fresh `npm run compile:rules` output:

| Status | Count |
|---|---:|
| `executable_tested` | 20 |
| `derivable_untested` | 3 |
| `definition_resolved` | 30 |
| `meta_rule` | 23 |
| `blocked_unresolved_class` | 473 |
| `needs_semantic_annotation` | 3,434 |
| **Total source records** | **3,983** |

These are mutually exclusive record statuses. `executable_tested` is rule-local execution against an attested example; this does not imply full Aṣṭādhyāyī derivation or complete self-hosting.

## 5. Correlation findings still open

1. **Cross-layer vowel semantics:** compiler adapter `e → _ae`, `ai → _aee` versus Rahnuma-derived Python mapping `ए → _aee`, `ऐ → _ai`. Preserve this discrepancy until the source-specific semantics are traced.
2. **Chandrabindu representation:** Python layer uses `_am`; inherited table includes `_na` associated with U+0901. No equivalence claim without a direct vector.
3. **Unsupported Sanskrit tokens:** `chh`, `ṝ`, `ḷ`, and `ḹ` are explicitly reported as unsupported by the compiler-side table-key bridge. No mapping is guessed.
4. **Legacy native parity:** current ZIP lacks upstream Romenagri C sources, Makefile, and `fltr_ur_hi` under the integration vendor path. Native compilation, original filter execution, and byte-level differential tests were not run.
5. **Historical build narrative:** `docs/CANONICAL-NARRATIVE.md` records an earlier reported clone/build. The current archive's integration manifest says the clone was not completed in that build environment. The historical claim is retained as history, not treated as a result reproduced in BUILD-0016.
6. **FOSS JavaScript adapter:** `sanscript.js` is vendored but not invoked by the current Python comparison harness; Python adapters use `indic_transliteration`.

See the combined dossier and CSV artifacts in this directory for per-token details.


## BUILD-0017 clarification

The terminal-virāma correction above refers only to the Rahnuma-derived Python reconstruction, not the 2004 legacy C decoder. The project owner confirms the original decoder already handled terminal virāma correctly. BUILD-0017 tests the four words from Grok’s report against the currently supplied Python implementation; all four round-trip exactly. The 2,000-word corpus and raw 156 failure rows were not present in the supplied archive, so the aggregate Grok claim is not independently reproduced.
