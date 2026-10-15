# Project Pushkalāvatī — consolidated project overview

**Snapshot:** 2026-10-11  
**Purpose:** Canonical orientation document for maintainers and AI collaborators. Read this before implementing changes; use [`HANDOFF.md`](HANDOFF.md) for open acceptance requirements and [`docs/GEMINI-HANDOFF-DATA.md`](docs/GEMINI-HANDOFF-DATA.md) for the consolidated, evidence-bounded technical handoff.

## 1. Project boundary

This repository combines related but distinct research tracks. They share data and concepts, but their maturity and guarantees must not be conflated.

1. **Sanskrit source index and analysis pipeline** — `data/sutras.json`, `python/`, `js/`, `data/corpus_rv_1.1.json`. The inventory has 3,983 source-index records. The general morphology analyzer, kāraka parser, and top-level sentence pipeline are not complete.
2. **Pushkalāvatī rule compiler** — `tools/pushkalavati-compiler/`. It classifies source records, propagates source-annotated anuvṛtti facts, emits a reviewable IR, and executes a small set of explicitly tested operations. It does not execute the entire Aṣṭādhyāyī.
3. **Sūtram rewrite language** — `lang/js/engine.js`, `shivasutras.js`, `padartha.js`, `interpreter.js`, and related prototypes. Its rewrite engine and a limited `.su` front end are executable. A 22-sūtra/eight-section bootstrap fixture is a prototype, not full self-hosting.
4. **Nirgundi experiments** — `nirgundi/`, `scripts/nirgundi/`, and `experiments/nirgundi/`. These include a literal baseline, structural cycle, and observed-form bootstrap. Literal substitutions are not grammatical analysis.

## 2. Reproducible entry points

From the repository root, with Python 3.10+ and Node.js 18+:

```sh
./scripts/test_all.sh
npm test
npm run compile:rules
node lang/js/run.js lang/examples/ganana.su mula
python3 scripts/nirgundi/observed_form_bootstrap.py
```

The `.su` example's observed stdout is `12`; its result summary reports `13` because the program adds one after printing. Treat those as the recorded behavior of that example, not as proof of complete language support. Run the commands on the current checkout before making a new test claim; historic test reports are not a substitute for fresh execution.

## 3. Current compiler status

The checked-in `tools/pushkalavati-compiler/out/progress.json` reports 3,983 source records and these mutually exclusive status counts:

| Status | Count |
|---|---:|
| `executable_tested` | 12 |
| `derivable_untested` | 3 |
| `definition_resolved` | 30 |
| `meta_rule` | 23 |
| `blocked_unresolved_class` | 478 |
| `needs_semantic_annotation` | 3,437 |
| **Total** | **3,983** |

Only `executable_tested` denotes an operation run against an attested example. `definition_resolved`, `meta_rule`, and a serialized IR entry do not imply executable semantics. Functional categories are overlapping labels and must not be confused with these status counts.

The fixed-point anuvṛtti expansion report records 16 rounds, 68,870 provenance-bearing facts, 1,755 records with terms beyond direct annotations, and zero dangling source IDs. These are graph/closure measurements, not a count of grammatical rules understood or executed. Inferred adhikāra scope candidates remain candidates until confirmed; they are not silently applied to rule execution.

## 4. Sūtram status and architectural constraint

The executable rewrite model lives in JavaScript under `lang/js/`. The older `lang/lexer.py`, `lang/parser.py`, and `lang/interpreter.py` are a deprecated first attempt and must not be described as the current self-hosting implementation. The existing `.su` front end is conventional syntax parsing followed by lowering to rewrite-engine rules. The Paninian self-hosting meta-grammar remains incomplete.

The bootstrap fixture at `lang/js/cycle-result.json` covers 22 hand-translated sūtras across eight sections and records 56 meta-steps. It demonstrates a bounded mechanism, not full corpus coverage. Preserve its provenance and scope limitations when extending it.

## 5. Śivasūtra and rule-engine invariants

- Śivasūtra 8 ends in the it-marker **ñ**, not ṇ.
- Pratyāhāra expansion must be position-aware: marker boundaries matter, and the closing it-marker is excluded from the phoneme members. Duplicate marker characters mean character-only marker lookup is unsafe.
- Keep savarṇa matching, vowel length, phoneme identity, and orthographic normalization as separate concepts.
- Do not conflate 6.1.77 (ik → yaṇ before a vowel) with 6.1.78 (ec → ay/av/āy/āv before a vowel).
- Rule outcomes should distinguish `APPLIED`, `NOT_APPLICABLE`, `UNRESOLVED`, and `ERROR`. Unknown mappings must not fall through to invented defaults.
- `vipratiṣedhe paraṃ kāryam` must not be implemented as an unconditional global “last rule wins”; applicability, rule domain, and specificity matter.

## 6. Nirgundi measurement boundary

The integrated observed-form bootstrap reproduces 6,248 distinct observed forms, 19,283 literal substitutions, 3,981 records with at least one literal match, and 68.20% estimated matched code-point coverage for its declared input and tokenizer. An earlier report cited 6,048 forms, 19,256 substitutions, and 68.37% coverage under a different or not-yet-reproduced procedure. Both are documented; do not force them to agree. Reconciliation requires the exact original data hash and extraction/substitution implementation.

Longest-first literal replacement is not morphology, sandhi, fuzzy matching, or semantic interpretation. Preserve residual material rather than silently correcting it.

## 7. Change discipline

- Preserve the canonical `data/sutras.json`; do not introduce a second mutable copy in the compiler.
- Do not synthesize placeholder records to make a corpus appear complete or mark records parsed/compiled/tested without evidence.
- Source historical, linguistic, and grammatical claims. Keep source facts, hypotheses, and implementation behavior visibly distinct.
- Make narrow changes, add positive and negative tests, run the affected tests and the integrated test command, and report exact commands/results.
- Do not claim remote publication or push unless it actually occurred.
- Consult `HANDOFF.md` before selecting work; acceptance requirements remain open unless verified complete in code and tests.

## 8. Key documents

- [`HANDOFF.md`](HANDOFF.md) — numbered outstanding requirements and acceptance criteria.
- [`docs/GEMINI-HANDOFF-DATA.md`](docs/GEMINI-HANDOFF-DATA.md) — single-document technical handoff data, invariants, known traps, and current measurements.
- [`IMPLEMENTATION_STATUS.md`](IMPLEMENTATION_STATUS.md) — snapshot-specific implementation status.
- [`docs/INTEGRATED-ARCHITECTURE.md`](docs/INTEGRATED-ARCHITECTURE.md) — subsystem architecture and data flow.
- [`docs/INVERSE-REDUCTION-RDP-ARCHITECTURE.md`](docs/INVERSE-REDUCTION-RDP-ARCHITECTURE.md) — owner-supplied inverse-reduction/RDP design, worked `उपेन्द्रो` trace, implementation gaps, and acceptance gates.
- [`lang/SPEC.md`](lang/SPEC.md) — Sūtram design and the distinction between the older parser and rewrite engine.
- [`docs/nirgundi/OBSERVED-FORM-BOOTSTRAP-INTEGRATED.md`](docs/nirgundi/OBSERVED-FORM-BOOTSTRAP-INTEGRATED.md) — exact current observed-form experiment method and metrics.

## Meta-compiler first pass

The compiler now emits `tools/pushkalavati-compiler/out/meta-compiler-catalog.json`. It catalogs 290 source-explicit meta candidates (200 saṃjñā, 23 paribhāṣā, 67 atideśa), including 222 in Adhyāya 1. All remain review-gated candidates until their semantics are formally specified and tested. The first interpreter contract has 18 generic operators; these are not counted as newly executable grammatical rules. See `tools/pushkalavati-compiler/README.md`.


## 2026-10-12 curated backend snapshot

- Native backend module: `lang/js/backend.js`; reverse subset frontend: `lang/js/raise.js`; tests: `lang/js/test_backend.js`.
- Sūtram `ganana.su` lowers to C, compiles under GCC C11 with `-Wall -Wextra -Werror`, and matches interpreter stdout/result. Rust source generation exists, but Rust compilation is unverified in this environment (`rustc` absent).
- Sanchalan Suktam parser: `lang/suktam/grammar.json`, `suktam.js`; current snapshot is 22 verses / 134 lexical nodes / 828 residual code points. Generated C reports the lexical IR and compiles/runs; this is not OS operation execution or full Sanskrit grammar.
- GitHub Pages root remains `docs/`. Use `docs/tasks.html`, `docs/tests.html`, `docs/sutram-compiler.html`, `docs/sanchalan-suktam.html`, and `docs/reference.html`.
