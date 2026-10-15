# Combined release candidate — merge manifest

Date: 2026-10-13

## Composition and precedence

This archive uses `pushkalavati-language-x-programming-language-ports-2026-10-13.zip` as its base because it contains the most expansive language-port and audit data among the supplied integration builds (750 files before merge). It then overlays the Shaili/history additions from `pushkalavati-hindawi-shaili-logo-history-2026-10-13.zip`:

- `docs/hindawi-history.html`
- `docs/shaili-robot.html` (legacy `shaili-logo.html` redirects here)
- `docs/shaili-robot.js`
- `tests/test_shaili_robot.js`
- `package.json` (adds `test:logo-static`)
- `docs/index.html`, `docs/documentation.html`, `docs/specifications/logo.html` (navigation/documentation links)

The detailed `lang/hindawi/test_ports.py` from the language-port archive is retained because it checks generated table integrity and explicitly avoids claiming that a table proves compiler integration. Grok's distinct Sanchalan-vs-upstream-C-table test is retained as `lang/hindawi/test_sanchalan_ports.py`; both tests are wired into `scripts/test_all.sh` and exposed through `npm run test:hindawi-ports`.

The source-stage bundle is copied into `docs/source-stages/` for convenient inspection:
- `HINDI_HINDAWI_C.c.uhin`
- `SANSKRIT_INPUT.suktam`
- `LEXICAL_IR_GENERATED_C.c`
- `FINAL_C_BEFORE_COMPILATION.c`
- `FINAL_HEADER_BEFORE_COMPILATION.h`
- `RESULT_JSON.json`
- `BUILD_PIPELINE.sh`

## Project lineage facts supplied by project owner

- Chintamani is the Telugu port of Hindawi.
- BangaBhasha is the Bangla port of Hindawi.

These relationships should be preserved in project documentation; public evidence may independently corroborate them, but should not silently redefine them.

## Status boundaries

- Generated human-language keyword tables are not equivalent to end-to-end compiler ports.
- The Shaili Robot page is a new static browser demonstrator, not a verified reproduction of the historical Shaili Robot implementation.
- Sanchalan generated lexical IR and its C reporting output are not a full implementation of the operating-system behaviour described by the Suktam.
- The archive does not claim a completed Sanskrit-keyword conversion of the Sanchalan library. The Sanskrit inventory and Sanskrit-C prototype are present; the fully translated library stage still requires implementation and tests.
- QEMU executables/outputs are carried over from the selected base archive. This merge does not claim a new QEMU run on this machine.

## Grok integration and QEMU provenance

The Sanchalan/Hindawi integration files from Grok's latest supplied build are retained, including `lang/suktam/hindawi/build.sh`, vendored upstream snapshots, generated `.uhin`/ASCII/C files, and the build-status documentation. The integration script uses the existing upstream `c2h`, `acii2cf`, and `h2c` tools; it does not introduce a substitute translator.

The bundled QEMU user-mode binaries and logs are carried forward unchanged from the supplied QEMU archive. The x86-64 and RV64GC verse traces are byte-identical (SHA-256 `9705d4e32ccd...` for both trace files). This merge did not rerun QEMU. These runs test the Sanchalan library under user-mode emulation, not a Shakti board boot.

## Regression additions

- `npm run test:logo-static` is run by the combined `scripts/test_all.sh` suite.
- `python3 lang/hindawi/test_ports.py` checks 68 profiles × C/C++ table shape and collision metadata.
- `python3 lang/hindawi/test_sanchalan_ports.py` checks required Sanchalan C keywords against the vendored localized C tables. Eight tables remain incomplete; they are reported rather than populated with invented rows.
- `lang/suktam/hindawi/build.sh` requires the actual upstream Chintamani/Romenagri toolchain to be installed and configured. The current container does not have `CHINTAMANI_ROOT` set, so this merge session could not rerun that end-to-end conversion.



## BUILD-0024 continuation (14 October 2026)

The current release candidate is BUILD-0024, based on the supplied BUILD-0023 archive. Its complete file-level comparison, SHA-256 records, additions/removals/modifications, and test notes are in `BUILD-0024_FILE_CHANGE_MANIFEST.csv` and `docs/BUILD-0023-CORRELATION.md`. BUILD-0024 restores `.github/workflows/pages.yml`, adds native legacy Romenagri C probes, corrects the Vidyut registry path and stale executable-count assertion, and expands the transliteration collision/Unicode tests. The older composition history above remains as historical provenance; it is not the complete manifest for BUILD-0024.
