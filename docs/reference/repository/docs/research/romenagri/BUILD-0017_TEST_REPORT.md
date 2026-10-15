# BUILD-0017 — Test, coverage, and timing report

**Date:** 14 October 2026  
**Source archive:** `BUILD-0016__pushkalavati-hindawi-ilm-2026-10-14.zip`  
**Source SHA-256:** `0db293a3dc2f27be6a1ef2072e774ebf1db25d78cf619b9990e82c10046c670c`  
**Runtime:** Node v22.16.0; npm 10.9.2; Python 3.13.5; GCC 14.2.0. `rustc` and `flex` are not installed.

## Summary

- Added an opt-in lossless Romenagri document wrapper, `tools/transliteration/romenagri_document.py`.
- Added 10 focused front-end tests. The full Python discovery run is **46 tests: 45 pass, 1 skipped**.
- Achieved **100% statement and branch coverage for the new wrapper module only**: 107 statements, 44 branches, no missed statements or branches.
- Precomputed the word-level decoder's longest-match token table once, rather than rebuilding it for each decode call.
- Added a 21-round timing harness, with a 200-repeat factor for each 13-item attested fixture and a separate synthetic 2,000-record lossless workload.
- Directly retested the four terminal-virāma examples quoted by Grok. All four exact round trips pass.
- Confirmed avagraha U+093D maps to `_3` and round-trips exactly.
- Confirmed strict base encoder gaps for curly quotes, candra vowels, nukta, ZWJ, dashes, and double danda. The new lossless wrapper preserves these via explicit Unicode escapes.

## Results by test stage

| Stage | Result | Details |
|---|---|---|
| JavaScript/Sūtram/Sanchalan runtime | PASS | Parser, interpreter, conversion, precedence, OOP, paradigms, backend; Sanchalan C runtime compiled with `-Wall -Wextra -Werror` and executed |
| Romenagri integration contract | PASS | Static vendoring/wrapper contract only; not native C parity |
| Rahnuma transliteration fixtures | PASS | 13/13 expected Romenagri outputs match |
| Hindawi C/C++ keyword tables | PASS | 68 profiles, zero failures |
| Sanchalan language-port profiles | PASS with explicit incomplete states | Eight profiles report missing keyword rows; no unsupported keywords are invented |
| Pushkalāvatī rule compilation | PASS | 3,983 source records; status artifacts regenerated |
| Pushkalāvatī compiler tests | PASS | Compiler tests and two-way 6.1.94 test |
| Python unit tests | PASS with one skip | 46 run; 45 passed; 1 skipped because external Cologne MW/RV artifacts are absent |
| Python rule-IR parity | PASS | 3,983 records; four baseline executable operations plus sandhi/morphology fixtures and negative applicability checks |
| Python Sūtram smoke test | PASS | `ganana.su -> 13` |
| Shaili Robot static tests | PASS | Square, nested parser, colour, invalid argument, unmatched bracket, heading |
| Pages/browser tests | PASS when run independently | 29 HTML files; 12 HTTP URLs; browser lab and app smoke tests |
| New lossless front-end branch coverage | PASS | 100% statement and branch coverage for `romenagri_document.py` |
| Timing benchmark | PASS | 21 measured rounds; 200 repeats per attested fixture; synthetic 2,000-record exact round trip 2,000/2,000 |

## Important qualification about the complete suite

A prior one-shot invocation of the integrated suite did not finish within the available execution window. The current `scripts/test_all.sh` includes the focused coverage stage, but a single uninterrupted exit-0 run of that exact final script has not been recorded. The constituent stages were run separately and completed successfully, including the Pages/browser stage. This report does **not** falsely label the monolithic invocation as an exit-0 run.

The canonical `scripts/test_all.sh` was restored from the supplied archive and extended with the focused coverage check. It remains the full-suite entry point. The detailed independent stage results and elapsed times are recorded in `BUILD-0017_TEST_TIMINGS.csv`.

## Timing methodology

- Environment: Python 3.13.5, same runtime and machine for before/after comparison.
- Warm-up: one warm-up pass.
- Attested workload: the 13 named Rahnuma 1.3.0 chapter-17 cases.
- Measured rounds: 21.
- Repeats per round: 200 passes over the 13 cases for each scheme (2,600 per-scheme records per measured round).
- Workloads: encode-only; encode/decode round trip; lossless wrapper round trip over 2,000 deterministic synthetic records.
- Statistics: median and nearest-rank p95 across 21 round timings.
- The synthetic 2,000-record set is a stress/performance fixture, **not** Grok's missing 2,000-word sample. It must not be used to validate Grok's 156-failure aggregate.

### Performance change from decoder table caching

| Workload | Before cache median | After cache median | Approx. change |
|---|---:|---:|---:|
| Base Romenagri round trip, 13-item fixture | 146.1 µs/record | 37.2 µs/record | 74.5% lower |
| Lossless synthetic 2,000-record round trip | 295.0 µs/record | 49.5 µs/record | 83.2% lower |

These are local Python microbenchmarks, not native C timings or a general scheme ranking. The complete per-scheme timing output is in `tools/transliteration/results/frontend-timings.csv`.

## Explicit non-results

- No raw Grok 2,000-word corpus or per-word failure CSV was available; its aggregate scores are not reproduced.
- No separate Grok BUILD-0016 archive was available as a distinct mounted file; the available ZIP hash matches the prior assistant-produced BUILD-0016 archive. No two-build source diff is claimed.
- The original Romenagri C kernel and named upstream filters were not available in the integration vendor path, so native C build/filter differential tests remain open.
- Rust checks are structurally checked only because `rustc` is unavailable.
- QEMU was not run.
- 100% coverage refers only to the new lossless wrapper module, not the entire repository, legacy C, all transliteration schemes, or all Unicode input.
