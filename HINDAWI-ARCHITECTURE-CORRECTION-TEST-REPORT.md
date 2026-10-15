# Hindawi architecture correction and deep-test report

Date: 2026-10-13

## Corrections made

- Removed the JSON-driven generic C token translator. It was not the user's established Hindawi architecture and must not be used as a substitute for the existing filters/converters/compiler driver.
- Converted the newly introduced language/script profile inventory to `lang/hindawi/languages/registry.csv`.
- Converted the provisional Sanskrit keyword inventory to `lang/hindawi/keywords/sa/keywords.csv`. This remains a review inventory, not an executable translator.
- Converted the Hindi-to-Hebrew mapping table to `lang/hindawi/filters/hi_he_map.csv`.
- Updated the Hebrew filter to read CSV, choose longest grapheme matches first, preserve unknown characters and report unmapped code points.
- Updated the architecture documents and Grok handoff to require the actual existing Romenagri filters and Hindawi compiler path.
- Kept Hindi and Sanskrit source/profile directories separate. No native source is rewritten by the tests.

## Deep verification performed

Command:

```sh
bash scripts/test_all.sh
```

Result: exit status 0; `ALL AVAILABLE TESTS PASSED`.

- JavaScript/Sūtram tests passed.
- Native C runtime test compiled with `gcc -std=c11 -Wall -Wextra -Werror` and passed.
- Existing Romenagri integration contract passed (this validates its fail-closed integration contract, not a successful upstream filter execution when the upstream tree is absent).
- Pushkalāvatī compiler and inverse-reduction tests passed.
- Python suite: 22 tests, 21 passed and 1 skipped due to external Cologne MW lexicon/prior RV artifacts not bundled.
- New Hindawi-specific tests: 8 passed. These cover CSV schema/uniqueness, language-profile separation, Sanskrit inventory presence, preservation of native sources, Hebrew longest-match behaviour, unknown-character retention/reporting, file-vs-stdin equivalence, and absence of the removed JSON prototype assets.
- Python parity passed for 3,983 compiler records.
- Static page links passed for 25 HTML files.
- HTTP smoke tests passed for 12 URLs.
- Browser lab regression tests passed; Sūtram-to-C compilation/execution and Sanchalan browser parsing/generated-C execution passed.

## Not verified / blocked

- The real upstream `fltr_hi_ur`, `fltr_ur_hi`, and full Chintamani/Romenagri tree were not available in this workspace. Therefore the upstream Hindi filter path was not executed end to end here.
- Sanskrit C has not been integrated into the actual Hindawi compiler and is not claimed to compile.
- Urdu, Persian/Farsi, Arabic, Shahmukhi, Sindhi, Kashmiri, Tibetan, Sinhala and other profiles are inventory entries, not completed ports.
- The Hindi-to-Hebrew table remains provisional and requires the user's manual audit.
- GDB/source-level original-symbol debugging has not been demonstrated against the actual compiler/debug information.
- QEMU was not run, per scope.

## Interpretation

The full existing project regression suite is green. The new CSV-driven table/filter tests are green. This is not evidence of a successful upstream Hindawi build. The next gate is to vendor the real upstream source, run the existing filter/compiler path unchanged, and then integrate Sanskrit through that method while testing original-symbol debugging.
