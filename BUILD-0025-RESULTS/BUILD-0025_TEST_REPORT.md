# BUILD-0025 test report

Baseline: BUILD-0024__pushkalavati-hindawi-ilm-2026-10-14.zip
SHA-256: b81e4c0472b935ac7f85406967dffb53ecf5efcc4d20e571b57726fe544bfda7

## Environment

- Linux hds-iaktjo8w95pa 6.12.8+ x86_64
- Python 3.10.21
- gcc 12.2.0
- GNU Make 4.3
- flex: not available (apt install blocked by permission)
- rustc 1.98.1, cargo 1.98.1

## Summary

| area | result |
|---|---|
| Native Flex filter regeneration | BLOCKED — flex unavailable |
| Native C core (existing .c) | PASS — librmnagri.a built, probe executed |
| Native/Python differential | documented — see CSV |
| Rust (vidyut-prakriya lib) | PASS — 57 tests |
| Skipped Python test | SKIPPED — Cologne MW artifacts absent |
| Integrated suite | NOT RUN — no source changes made |

## Native filter build (Priority A)

The Makefile target `filters` depends on Flex to regenerate from `.lex` files. Flex is not installed and cannot be installed in this environment (`apt-get` fails with permission errors). The existing pregenerated `.c` files (`rmn2acii.c`, `acii2rmn.c`, `stack.c`) compiled into `librmnagri.a`. The Flex regeneration step is BLOCKED.

## Native/Python differential (Priority B)

Direct calls to `rmn2acii` / `acii2rmn` on the compiled library:

| input | native back | python encode | notes |
|---|---|---|---|
| chaee_t | chaee_t | chaee_t | agree |
| sarwam | sarwam | sarwam | agree |
| paapam | paapam | paapam | agree |
| _u_d_dhara_nnam | _u_d_dhara_nnam | _u_d_dhara_nnam | agree |
| k_ha | k_ha | k_ha | agree |
| k | k | k | agree on this path |
| _3 | 3 | _3 | native collapses to digit |

The earlier report that native reverse adds a trailing `a` was not reproduced by these direct function calls. The functions return the stem unchanged on this path. The discrepancy may be in a different entry point (the Flex filter pipeline, which was not built).

## _3 discrepancy (Priority C)

`rmn2acii("_3")` emits byte `0x33` (ASCII `3`). `acii2rmn` of that returns `3`. The Python profile maps `_3` to avagraha `ऽ`. These are different contracts. The native path treats `_3` as the digit. The Python path treats it as the avagraha marker documented in the reconstructed profile. No change made.

## Rust (Priority D)

`cargo test --lib` in `third_party/vidyut` (vidyut-prakriya) passed: 57 tests, 0 failed. This is the vendored Vidyut library, not a Pushkalāvatī-owned Rust component. `cargo check` also completed.

## Skipped Python test (Priority E)

`tests/test_nirgundi_experiment.py::test_residual_agrees_with_statistics` skips because `experiments/nirgundi/rv11-words/statistics.json` is absent. The Cologne MW lexicon and prior RV artifacts are not in the archive. Remains SKIPPED.

## Limitations

- Flex filter chain not regenerated.
- Native/Python comparison is on the compiled C core functions, not the Flex filter pipeline.
- No source changes made. No new archive required for source; reports are the deliverable.

## Cologne MW added

Downloaded mwxml.zip from sanskrit-lexicon.uni-koeln.de. Extracted 287,432 key1 headwords to data/external/mw/mw-k1.jsonl. Ran scripts/nirgundi/run_experiment.py against data/corpus_rv_1.1.json. tests/test_nirgundi_experiment.py: 2 tests, both passed (previously 1 skipped).
