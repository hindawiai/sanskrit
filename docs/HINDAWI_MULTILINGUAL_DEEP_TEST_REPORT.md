# Hindawi multilingual integration — deep test report

Date: 2026-10-13
Scope: local Pushkalāvatī integration archive; QEMU excluded.

## What was changed

- Added `scripts/hindawi_language_port_audit.py`, which consumes the canonical Romenagri language registry, each `lang_<code>.csv`, script projection TSVs, and the original Chintamani filter pair when a checkout is supplied.
- Added four focused tests covering normal inventory classification, strict release-gate failure, duplicate profile rejection, and missing keyword-file reporting.
- Updated the expansion plan and README to preserve the three axes: script projection, language vocabulary, and shared construct ontology.
- Added `lang/hindawi/PORT-STATUS.md` to distinguish upstream profile data from verified runnable ports.
- Kept all new inventory and test reports in CSV/Markdown. No new JSON data files were introduced.

## Commands executed

```sh
python3 -m unittest tests/test_hindawi_language_port_audit.py -v
bash scripts/test_all.sh
```

Results:

- Focused language-port audit tests: 4/4 passed.
- Full project suite: `ALL AVAILABLE TESTS PASSED`.
- Python suite: 26 tests, 25 passed, 1 skipped (external Cologne MW lexicon and prior RV experiment artifacts absent).
- Existing compiler parity check: 3,983 records passed.
- C runtime compiled with `-std=c11 -Wall -Wextra -Werror` and passed.
- Static page links: 25 HTML files passed.
- HTTP smoke tests: 12 URLs passed.
- Browser app smoke tests passed.
- Rust compilation skipped because `rustc` is unavailable.

## What the tests prove

The new audit utility correctly parses the canonical data contracts, detects missing or duplicate inputs, distinguishes pending language keyword data from empty script projection tables, and does not falsely classify an upstream filter pair as a complete language port. The test fixtures are synthetic and intentionally include incomplete profiles to verify conservative status reporting.

## What the tests do not prove

The full canonical `project-ilm/romenagri` and `hindawiai/chintamani` source trees were not locally available; the environment could not resolve GitHub for a clone. Therefore the audit utility has **not** been run against a complete local upstream checkout in this session. The original `fltr_hi_ur` / `fltr_ur_hi` pair was not executed or differentially tested here. No claim is made that Persian, Arabic, Shahmukhi, Sindhi, Kashmiri, Tibetan or Sinhala compiler source passes through the actual native Hindawi toolchain.

The canonical upstream repository metadata inspected for this task declares 68 language profiles and 201 constructs. Its `lang_tibetan.csv` and `lang_sinhala.csv` contain `romenagri_pending_*` markers, and their corresponding script-table files inspected in the current upstream branch contain only comments. Those are genuine unfinished inputs, not ports that can be completed by adding profile labels. The strict audit is intended to make such gaps visible.

## Release decision

The local integration and tests are green. Multilingual language/script ports remain **not release-ready** until the audit runs on the complete upstream checkouts and the missing script projections / language-specific filter overlays are implemented and differentially tested. This report deliberately does not convert a passing project regression suite into an unsupported claim of full multilingual compiler support.
