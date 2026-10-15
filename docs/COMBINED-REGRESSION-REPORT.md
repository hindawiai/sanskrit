# Combined regression run — 2026-10-13

Command: `bash scripts/test_all.sh`
Working tree: combined release candidate before ZIP packaging.
Result: exit code 0; final line `ALL AVAILABLE TESTS PASSED`.

Observed checks:
- JavaScript / Sūtram tests: passed.
- C runtime compiled with `gcc -std=c11 -Wall -Wextra -Werror` and executed: passed.
- Romenagri integration contract: passed.
- Pushkalāvatī rules compilation: 3,983 records processed.
- Compiler tests and inverse reduction (`6.1.94`): passed.
- Python unit tests: passed with one test skipped because external Cologne MW lexicon and prior RV experiment artifacts are not bundled.
- Static links: passed (27 HTML files).
- HTTP smoke tests: 12 URLs returned HTTP 200.
- Browser tests: passed.
- Shaili Robot static runner test: included in main suite and passed.
- Sanchalan parser/lowering test: 22 verses, 141 lexical nodes, 814 residual code points; generated C compiled and ran. This remains lexical-IR output, not full OS semantics.
- Rust compilation skipped because `rustc` is unavailable.

Environment note: Python startup emitted a non-fatal spreadsheet-runtime warmup warning from the host environment; the test process continued and exited successfully.
