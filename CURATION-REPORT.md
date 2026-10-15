# Curated build report — 2026-10-12

## Curation decisions

The curated repository uses `pushkalavati-hindawi-romenagri-pages-specs-2026-10-12.zip` as its base because it includes the `/docs` GitHub Pages workflow, language specifications, Romenagri pipeline documentation, static browser lab, and static-page checks.

Selected work from `pushkalavati-curated.zip` was merged:
- `tools/pushkalavati-compiler/src/two-way.js` and `tests/two-way.test.js` for the 6.1.94 forward/inverse rule pair.
- `lang/suktam/` parser, source, tests, generated C/Rust report programs.
- `docs/TWO-WAY.md`.

The Pages-enhanced `README.md` and `scripts/test_all.sh` were retained and extended rather than replaced by the shorter versions from the curated archive.

## Implemented in this curation

- Standalone C/Rust source generators for the current Sūtram subset in `lang/js/backend.js`.
- Conservative C/Rust-to-Sūtram reverse front end in `lang/js/raise.js`.
- Sanchalan Suktam grammar, longest-first lexical IR, source spans, residual preservation, sequence diagnostics, and C/Rust report generation.
- Browser-side Sūtram compiler/reverse frontend and Sanchalan frontend under `docs/`.
- Task/feature register, test register, language specs, project-reference viewer, and complete static asset index.
- A reproducible documentation mirror (`scripts/build_docs_catalog.py`) indexes all 47 repository Markdown documents under the `/docs` Pages root; the catalog is rebuilt and checked during regression tests.
- Static-site validation starts a local HTTP server and checks 12 actual page/script/data/document URLs return HTTP 200.
- GitHub Pages workflow uploads `docs/` as the site root and installs stable Rust before running the regression suite.

## Verification run in this environment

- `bash scripts/test_all.sh` — PASS, exit 0.
- Pushkalāvatī compiler regeneration — PASS; 3,983 records, 12 executable-tested operations, 3 derivable-but-untested.
- Two-way 6.1.94 forward/inverse regression — PASS.
- Sūtram → C: generated, compiled with GCC C11 `-Wall -Wextra -Werror`, executed; prints `12` and reports result `13`, matching the interpreter.
- Restricted C/Rust → Sūtram: regression examples raised; raised Sūtram executes in the interpreter with result/output `12`.
- Sanchalan: 22 verses parsed, 134 lexical nodes, 828 residual code points preserved; generated C compiled with warnings-as-errors and executed, reporting all 22 verse records.
- Static Pages: 24 HTML pages, local links, JS syntax, browser UI smoke tests passed.
- Local HTTP server smoke: key Pages documents, JavaScript, lexicon, source and handoff files returned HTTP 200.

## Explicitly unverified / still open

- `rustc` is not installed in the local build environment. Rust code is generated and structurally checked here; native Rust compilation is a release gate wired into the GitHub Actions workflow, but has not been observed running in this environment.
- The Sūtram C/Rust backends support a documented numeric subset, not arbitrary Sūtram programs. Reverse frontends accept a narrow straight-line C/Rust subset and reject unsupported syntax.
- Sanchalan Suktam is a lexical IR/report compiler, not a complete Sanskrit grammar or an OS/process runtime. Residual text is retained intentionally.
- Complete upstream Romenagri C source and the original Perso-Arabic `fltr_ur_hi` sed filter could not be retrieved offline. The archive includes bootstrap and fail-closed wrapper scripts, not fabricated upstream source or filter rules.
- Neither uploaded ZIP contained a `.git/` directory. The delivered archive therefore makes no claim to preserve Git commit history; no remote push or GitHub Pages deployment is claimed.


## BUILD-0016 — 2026-10-14

- Added the BUILD-0015 word-level transliteration subsystem to the integrated evidence model without conflating it with the compiler's sound-token/table-key adapter.
- Added the combined 84-token inventory, Devanagari/ACII/Romenagri trace matrix, dossier, audit CSV, and test report under `docs/research/romenagri/`.
- Fresh compiler regeneration reports 20 executable-tested operations, 3 derivable-untested, 30 definition-resolved, 23 meta-rules, 473 blocked-unresolved-class, and 3,434 needing semantic annotation (3,983 total).
- `./scripts/test_all.sh` passed. The Python suite ran 35 tests (34 passed, 1 external-data test skipped); nine transliteration regressions passed; Pages validation checked 29 HTML files and 12 HTTP smoke-test URLs. Rust compile was skipped because `rustc` was unavailable.
- Restored the Pages workflow missing from BUILD-0015 and required shell-script execute bits. Native Romenagri C/filter differential testing remains unverified.
