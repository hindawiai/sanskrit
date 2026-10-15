# Implementation status — integrated build (2026-10-11)

This status update supersedes older progress snapshots where they conflict. The original handoff requirements remain open unless explicitly satisfied below.

## Verified in this build

- Source inventory: 3,983 records, preserved in `data/sutras.json`.
- Data-driven Pushkalāvatī classifier and operation tables integrated; category labels are overlapping functional categories, not a sequential pipeline.
- Batch anuvṛtti expansion with provenance and generated classification/IR/ledger reports.
- 11 rule-local operations are `executable_tested`; 3 remain derivable but untested; the rest are not thereby executable.
- Sūtram JavaScript rewrite engine, `.su` front end, interpreter, Śivasūtra primitives, padārtha/OOP prototype, conversion/bootstrap prototypes, and paradigm demonstrations included.
- Nirgundi literal baseline, structural cycle, full-sūtra conversion, and observed-form bootstrap included.
- `./scripts/test_all.sh` passed: JavaScript Sūtram/compiler tests, 13 Python tests passed, 1 legacy test skipped because external MW/RV experiment artifacts are absent, and Python rule-IR parity passed across 3,983 records.

## Still incomplete

- Full semantic interpretation or execution of all 3,983 Aṣṭādhyāyī records.
- Full self-hosting meta-grammar; the demonstrated bootstrap remains a 22-sūtra / eight-section fixture.
- Full morphology and kāraka/syntax pipeline; current analysis code is a limited slice with stubs as detailed in `HANDOFF.md`.
- Complete consonant/visarga sandhi parity, complete Vedic corpus, Aryabhata numerals, Brahmagupta arithmetic, standalone JS compilation, and persistent review backend. See the original numbered acceptance criteria below.
- Remote push/publication to `hindawiai/sanskrit` was not performed.

---

# Integration status — Pushkalavati and Sūtram

Date: 2026-10-10

## Completed in this integration

- The uploaded archive does not contain a `.git/` directory. Commit-history preservation cannot be verified from this ZIP; do not treat it as a Git clone.
- Integrated Grok's Pushkalavati compiler under `tools/pushkalavati-compiler/`.
- Removed the compiler's second mutable copy of `data/sutras.json`; compile and tests now read the repository's canonical `data/sutras.json`.
- Tightened definition compilation: when a saṃjñā row has multiple candidate classes, the compiler no longer chooses the first one by source order and labels it resolved. Ambiguous cases remain `needs_semantic_annotation`.
- Added negative applicability tests for the four executable sandhi rules. In particular, the 6.1.77 implementation rejects a consonant as the following sound, and the 6.1.101 implementation rejects non-savarṇa vowel pairs.
- Added `lang/js/interpreter.js` and CLI `lang/js/run.js`. The interpreter parses the `.su` subset represented by `lang/examples/ganana.su`, lowers instructions into state-transition `Rule`s, and executes through `Engine.run()`'s rule-selection/fixpoint loop.
- Added root `npm test` scripts and tests for the interpreter and compiler.

## Verified execution

Command:

```sh
node lang/js/run.js lang/examples/ganana.su mula
```

Observed stdout:

```text
12
```

Observed stderr summary:

```json
{
  "result": 13,
  "rewrite_steps": 9
}
```

`likh` prints 12; the subsequent `yoga 1` makes the returned `phala` 13.

Command:

```sh
npm test
```

Observed: exit status 0. The Shiva-Sutra tests, padartha tests, existing rule-engine demo, Sūtram interpreter tests, and Pushkalavati compiler tests all passed.

Compiler report:

- 3,983 records represented in the IR.
- 4 rules are classified `executable_tested`.
- 8 are `derivable_untested`.
- 479 are `blocked_unresolved_class`.
- 3,442 are `needs_semantic_annotation`.
- 23 are `meta_rule`.
- 27 are `definition_resolved`.

These are status categories, not a claim that 3,983 rules execute. The Python runner reported `python parity passed records 3983`; its process also emits an unrelated `artifact_tool` startup traceback to stderr, although it exits 0.

## Explicit scope limits

The first Sūtram interpreter subset is executable, but the entire original HANDOFF.md is **not complete**.

- The `.su` parser is currently a conventional syntax front end; REQ-2.1's self-hosting Paninian meta-grammar is still outstanding.
- Supported syntax: `adhyaya`, `pada`, `adhikara`, positional parameters, `karta`, `yoga`, `viyoga`, `dviguna`, `likh`, `phala`, unary `adhikara` calls, integer literals, `laghu`/`guru`, and the illustrative `netra`/`veda` literals.
- It does not yet implement Aryabhata numerals, Brahmagupta arithmetic modes, OOP/functional/imperative demonstrations as separate acceptance artifacts, standalone JS compilation, GitHub Pages, or shared review persistence.
- The original Python `MorphAnalyzer`, `KarakaParser`, and top-level Sanskrit sentence pipeline remain stubs; consonant/visarga sandhi parity and a full Vedic Mandala are not completed.
- No remote GitHub push was performed. The delivered ZIP is a source archive, not a verified Git repository; the historical commit hash above cannot be authenticated from the uploaded files.

## Reproduce

From the repository root:

```sh
npm test
node lang/js/run.js lang/examples/ganana.su mula
npm run compile:rules
```

## 2026-10-12 Romenagri integration slice

- Rule-12 archive retained as baseline; inverse-reduction organised archive selectively merged for CLI/Python entry and benchmark artifacts.
- Added `tools/pushkalavati-compiler/src/romenagri.js` and `data/romenagri/acii-table.json`; context-bearing sandhi and generic `applyRule` now tokenize with the Romenagri-aligned sound-token inventory before rule evaluation.
- This is an incremental substrate migration. It does not yet include the original upstream C converter source or prove byte-level compatibility; differential tests against the C implementation remain outstanding.
- Audited source hazards: `^a` empty mapping; legacy UTF-16LE-like conversion rather than UTF-8; `lookup()` can return NULL; long ṝ and vocalic ḷ/ḹ are not represented by the current table-key bridge.
- Verification: `scripts/test_all.sh` passed; 14 Python unit tests passed with one known external-data test skipped. Compiler remains at 12 `executable_tested` operations and 3 `derivable_untested` candidates.


## 2026-10-12 curated merge additions

- Merged the Pages/specification build with Grok's curated two-way and Sanchalan Suktam work.
- Added a native C/Rust code generator for the documented Sūtram subset and a conservative reverse frontend for a tiny C/Rust subset.
- Verified generated C for `ganana.su` with GCC C11, warnings-as-errors; executable prints 12 and reports result 13, matching the interpreter.
- Added Sanchalan Suktam lexical grammar/IR and C/Rust report generators. C output compiles/runs; parser retains residual text. Current metrics: 22 verses, 134 recognized lexical nodes, 828 residual code points.
- Added static pages for task/feature status, test register, Sūtram backends, Sanchalan, and handoff documents. The Pages workflow validates and deploys `docs/` as site root and now runs on code/test changes.
- Rust compiler execution remains unverified because `rustc` is unavailable. Original Romenagri C utilities and Perso-Arabic sed filter remain blocked on retrieving the upstream source; no compatibility claim is made.
