# Project Pushkalāvatī / Nirgundi

Integrated research repository for the Sanskrit source inventory, data-driven rule compiler, observed-form bootstrap, Sūtram rule-rewrite language, and Sanskrit analysis pipeline.

**Core architectural decision:** grammatical rules are data; the meta-grammar defines functional categories and interprets rule records; the runtime supplies generic operation handlers. Functional categories overlap and are not sequential compiler passes.

## Quick start

Requirements: Python 3.10+ and Node.js 18+; no external package install is needed for the repository's core tests.

```bash
# Full integrated tests
./scripts/test_all.sh

# Rebuild Pushkalāvatī's data-driven compiler artifacts
npm run compile:rules

# Run Sūtram language example
node lang/js/run.js lang/examples/ganana.su mula

# Run full-corpus observed-form bootstrap
python3 scripts/nirgundi/observed_form_bootstrap.py

# Run the original Nirgundi literal baseline on an explicit corpus/inventory
python3 scripts/nirgundi/run_experiment.py --help
```

The Sūtram example prints `12`; its returned result is `13` because the sample program adds one after printing.

## Repository map

- `data/sutras.json` — 3,983 source-index records; preserved as source data.
- `tools/pushkalavati-compiler/data/meta-grammar.json` — functional categories and table-driven classification predicates.
- `tools/pushkalavati-compiler/data/operations.json` — source-linked operation specifications and examples.
- `tools/pushkalavati-compiler/src/` — classification, fixed-point expansion, compilation, and generic execution.
- `tools/pushkalavati-compiler/out/` — generated classification, IR, expansion, ledger, and status reports.
- `scripts/nirgundi/observed_form_bootstrap.py` — annotation-to-sūtra literal bootstrap; emits a reproducible experiment package.
- `nirgundi/` — original literal inventory baseline and structural cycle experiment.
- `lang/` — Sūtram source language, parser/interpreter, JavaScript rewrite engine, conversion/self-hosting prototypes, and tests.
- `tools/pushkalavati-compiler/src/inverse-reduction.js` — initial native-Devanagari inverse-reduction candidate generator (6.1.87/6.1.88); morphology is explicitly unresolved.
- `python/`, `js/` — Sanskrit segmentation/morphology pipeline slices.
- `PROJECT_OVERVIEW.md` — consolidated repository map, measured status, invariants, and change discipline.
- `docs/INVERSE-REDUCTION-RDP-ARCHITECTURE.md` — documented inverse-reduction RDP proposal, worked example, open implementation gaps, and acceptance tests.
- `HANDOFF.md` — numbered open requirements and acceptance criteria.
- `docs/GEMINI-HANDOFF-DATA.md` — consolidated technical handoff data for AI collaborators; one document, not a bundle of separate prompt files.
- `IMPLEMENTATION_STATUS.md` — snapshot-specific implementation status.
- `docs/INTEGRATED-ARCHITECTURE.md` — data flow, contracts, and scope boundaries.

## Current measured state

- Source index: 3,983 records.
- Rule-local executable-tested operations: 20 in BUILD-0016 compiler outputs. This is not full Aṣṭādhyāyī execution.
- Functional categories: 15 overlapping labels; preliminary classifications remain reviewable hypotheses.
- Structural anuvṛtti expansion: fixed-point batch processing with provenance; scope candidates are not silently promoted to inheritance.
- Sūtram bootstrap fixture: 22 sūtras across eight sections, 56 meta-steps in the existing test fixture; not full-corpus self-hosting.
- Sanskrit sentence pipeline: limited vowel-sandhi and a small morphology slice; full morphology and kāraka parsing remain incomplete per `IMPLEMENTATION_STATUS.md` / `HANDOFF.md`.

## Observed-form experiment caveat

The integrated experiment uses an explicitly specified tokenizer and deterministic longest-first literal replacement. Its metrics are generated from the included `data/sutras.json`; see `experiments/nirgundi/observed-form-bootstrap/REPRODUCIBILITY.md`. Metrics from other extraction variants must not be silently substituted or treated as the same run.

## Licensing and provenance

Source data and code retain their own attribution/licensing boundaries. The compiler package's GPL-3.0-only notice applies to that package's code, not automatically to all source datasets. See `LICENSE`, `tools/pushkalavati-compiler/LICENSE`, and `docs/nirgundi/source-rights.md`.

## Documentation and browser laboratory

- GitHub Pages source directory: `docs/` (the workflow uploads `docs` as the site root).
- Local browser lab: open `docs/index.html` in a modern browser or serve the repository with any static HTTP server.
- Language specifications: `docs/specifications/index.html`.
- Compilation pipeline: `docs/pipeline.html`.
- Validation and release gates: `docs/validation.html`.
- Static-page regression tests: `./tests/test_static_pages.sh`.

## Romenagri upstream build

```sh
./scripts/vendor_romenagri.sh
./scripts/build_romenagri.sh
./scripts/romenagri_perso_arabic_filter.sh input.txt > output.txt
```

The upstream clone/build requires network access and the upstream repository's own build dependencies. The current offline build did not materialize the original C source or sed filter, so native Romenagri compilation and filter fixtures remain unverified. Do not treat the browser demonstrator as a substitute for those native components.

## Curated Sūtram backend and Sanchalan frontend

- `node lang/js/backend.js lang/examples/ganana.su c mula > /tmp/ganana.c` emits standalone C for the documented Sūtram subset.
- `gcc -std=c11 -Wall -Wextra -Werror /tmp/ganana.c -o /tmp/ganana && /tmp/ganana` compiles and executes the C backend.
- `node lang/js/backend.js lang/examples/ganana.su rust mula > /tmp/ganana.rs` emits Rust source. Run `rustc --edition=2021 -D warnings /tmp/ganana.rs -o /tmp/ganana-rs` where rustc is installed.
- `node lang/js/raise.js` is a library module for the conservative C/Rust reverse frontend; tests are in `lang/js/test_backend.js`.
- `node lang/suktam/suktam.js` parses the supplied Sanchalan Suktam V1.0 source, writes JSON IR, and generates C/Rust lexical-report programs.
- Sanchalan's lexical IR preserves residual text and does not claim full Sanskrit grammar or OS operation execution.

GitHub Pages source is `docs/`. Start at `docs/index.html`; the task list, feature inventory, test register, Sūtram compiler, Sanchalan frontend, all language specifications, and reference/handoff documents are linked there. `CURATION-REPORT.md` records which parts were selected from the two input archives and the verification boundary. Native C/Rust compilation and original Romenagri/sed execution are not available inside a static browser page.


## Romenagri BUILD-0016 correlation

The combined dossier, 84-token inventory, Devanagari/ACII/Romenagri trace matrix, and full test report are available under [`docs/research/romenagri/`](../research/romenagri/index.html). The word-level Python reconstruction, compiler-side table-key adapter, and legacy C converter are separate layers; native C parity remains unverified.
