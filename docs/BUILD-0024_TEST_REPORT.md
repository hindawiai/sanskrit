# BUILD-0024 test and timing report

**Result:** `scripts/test_all.sh` completed with `ALL AVAILABLE TESTS PASSED` after running from the extracted BUILD-0024 working tree with shell executable modes enabled.

## Test outcomes

| Area | Result | Boundary |
|---|---|---|
| Integrated suite | Passed | Full command and output are in `BUILD-0024_TEST_LOG.txt`. |
| JavaScript/Sūtram demonstrations and tests | Passed | C runtime and Sanchalan C runtime tests compiled and executed. Rust targets were structurally checked only because `rustc` is unavailable. |
| Romenagri integration contract | Passed | Contract checks wrappers and source expectations; does not alone prove all upstream filters compile. |
| Native legacy Romenagri C probes | Passed | Directly compiled `rmn2acii.c`, `acii2rmn.c`, `stack.c` and the probe harness. The harness explicitly records terminal-stem behavior and the `_3` reverse-parser gap. |
| Lossless Romenagri document wrapper | 100% statements and branches | 107 statements, 44 branches; coverage applies only to `romenagri_document.py`. |
| Collision audit regression tests | 10 passed | 36 curated cases, 12 schemes; rejects are not counted as collisions. |
| Unicode inventory sweep | Passed | 309 code points × 12 schemes = 3,708 records; context-free diagnostic, not valid-text accuracy. |
| Transliteration attested fixtures | 13/13 Romenagri outputs matched | Exact round trips differ for some schemes on the 13-case fixture; see `tools/transliteration/results/transliteration.json`. |
| Hindawi C/C++ keyword-table integrity | Passed | 68 profiles; zero failures. |
| Sanchalan versus localized C ports | Exited successfully | Eight profiles remain explicitly marked incomplete; they were not filled with invented keywords. |
| Pushkalāvatī compiler | Passed after regenerating rule artifacts | 3,983 records; 24 executable-tested, 3 derivable-untested. The test assertion was updated from 20 to 24. |
| Python rule-IR parity | Passed | 3,983 source records. |
| Python unittest discovery | 56 tests, 55 passed, 1 skipped | The skipped test requires external Cologne MW lexicon and prior RV experiment artifacts not bundled in the archive. |
| Pages/browser tests | Passed | 29 HTML files checked; 12 HTTP smoke URLs returned 200; browser regressions passed. |

## Native C build limit

The native C core compiles and direct-function probes pass. `make all` does not complete because `flex` is not installed, so the generated Flex filter executables and full `uni2acii → filters → acii2rmn` pipeline were not built in this environment. The source archive includes the `.lex` specifications; the missing tool is an environment dependency, not a claim that the source is absent.

## Timing methodology and results

The adversarial transliteration benchmark used 3 warm-up rounds and 31 measured rounds, with 85 input occurrences per round for each of 12 schemes. It reports median and p95 latency for encode-only and encode+decode. Results are in `tools/transliteration/results/collision_benchmark.csv` and summarized in `docs/COLLISIONS.md`.

The main 13-case fixture comparison uses 200 repetitions per fixture and reports per-call times in `tools/transliteration/results/transliteration.json`. The numeral diagnostic uses 500 repetitions over six cases and six schemes; its timings are exploratory and should not be used as a ranking. Full benchmark claims should use the 31-round harness and the same environment for all revisions.

## Reproducible commands

From the repository root:

```sh
bash scripts/test_all.sh
python3 tools/transliteration/collision_tests.py
python3 tools/transliteration/unicode_inventory_sweep.py
python3 tools/transliteration/benchmark_collisions.py
PYTHONPATH=tools:third_party/indic_transliteration python3 tools/transliteration/compare.py
PYTHONPATH=tools:third_party/indic_transliteration python3 tools/transliteration/numeral_compare.py
```

The first command is the integrated regression suite. After the final documentation-index update, `bash tests/test_static_pages.sh` was also rerun independently and passed (130 Markdown documents indexed, 29 HTML files checked, 12 HTTP smoke URLs returned 200, browser regressions passed). The benchmark commands produce machine-readable output under `tools/transliteration/results/`.

## Claims not made

- No claim of complete Unicode Devanagari coverage.
- No claim of phonetic fidelity from spelling round trips.
- No claim of native C filter parity until `flex` is available and the full filter pipeline is executed.
- No claim that 2,000-word Grok results are reproduced; the original corpus and per-row outputs are not present.
- No claim of 100% repository-wide coverage. The 100% statement/branch figure applies only to the lossless document wrapper module.
