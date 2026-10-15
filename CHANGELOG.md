## BUILD-0002 — 2026-10-13

- Corrected the conceptual distinction: **Shaili Prathmik is the Hindi BASIC-like language; Shaili Robot is the LOGO-like/robot-programming interface**.
- Added per-verse Sanchalan metrics and explicit lexical-vs-semantic status report.
- Seeded template-based Hindawi/ILM language-standard profiles for Hindi C/C++ and Bangla C/C++.
- Added an original, tested C quicksort implementation and release privacy/sensitive-content triage report.
- ZIP name begins with `BUILD-0002` to prevent build confusion.

# Changelog

## BUILD-0016 — 2026-10-14 — combined Romenagri integration and test pass

- Correlated BUILD-0015's new Rahnuma-derived word-level Romenagri implementation and FOSS adapters with the inherited 84-entry ACII table, BUILD-0014 sound-token adapter, and Devanagari/ACII trace. These are documented as distinct abstraction layers; native C parity is not claimed.
- Added a read-only `tomllib` compatibility shim for the vendored Python transliteration tables on Python 3.11+, explicit transliteration regression tests, and the transliteration harness to the integrated test runner. Python 3.10 requires the upstream `toml` package for those adapters.
- Fixed terminal-virāma round-trip loss, added avagraha/danda and postvocalic-sign coverage, corrected `^a` wording to avoid treating the empty value alone as a proven defect, and added `chh` to the explicit unsupported-sound report.
- Restored the Pages workflow omitted from BUILD-0015 and restored executable bits needed by shell test scripts.
- Regenerated the compiler reports: 20 executable-tested operations out of 3,983 source records.
- Test and correlation details: `docs/research/romenagri/BUILD-0016_CORRELATION_AND_TEST_REPORT.md`.


## 2026-10-13 — Hindawi project narrative v1.0.0

- Added `docs/HINDAWI-CHATGPT-PROJECT-NARRATIVE.md`, a versioned, evidence-bounded narrative covering project lineage, owner-defined Chintamani/BangaBhasha relationships, Shaili localization, historical programming-language adapters, multilingual tables, Romenagri, Sanchalan, QEMU evidence, archive provenance, tests, unresolved work, and update protocol.
- Distinguished repository artifacts and reported historical test results from freshly reproduced results.
- Linked the narrative from the repository README and static documentation navigation.
- Documentation-only change; no compiler/runtime behavior intentionally changed.


## 2026-10-11 — twelfth executable-tested surface rule

- Added source-linked 6.1.94 `एङि पररूपम्` to the canonical `SANDHI_ATTESTED` operation table.
- Implemented shared-IR execution in JavaScript and Python with required upasarga/dhātu context flags; tested four positive vectors and negative applicability cases.
- Regenerated compiler outputs and updated the executable inventory from 11 to 12. This is one additional rule-local operation, not full grammatical derivation or full Aṣṭādhyāyī execution.


## 2026-10-11 — Inverse Reduction RDP architecture documented

- Added `docs/INVERSE-REDUCTION-RDP-ARCHITECTURE.md` to consolidate the project-owner's inverse-reduction/RDP proposal, the `उपेन्द्रो` worked trace, proposed native-script tokenizer and module hierarchy, Hindawi/Romenagri integration intent, and acceptance gates.
- Distinguished supplied design intent from implemented behavior. Flagged hard-coded fallbacks and stem/suffix shortcuts in the illustrative C++ sketch as unsafe to copy into production.
- Recorded complexity/performance comparisons as hypotheses pending benchmarks, rather than treating unverified FST/RDP claims as measured facts.
- No executable-rule count or runtime semantics changed in this documentation-only update.

## 2026-10-11 — consolidated project handoff

- Added `PROJECT_OVERVIEW.md` as the single top-level orientation document for the parser, Pushkalāvatī compiler, Sūtram, and Nirgundi tracks.
- Added `docs/GEMINI-HANDOFF-DATA.md` consolidating corpus/status counts, executable operations, three held candidates, Śivasūtra invariants, Sūtram self-hosting boundaries, Nirgundi metric discrepancy, known failed implementation patterns, and test discipline into one document suitable for an AI handoff.
- Linked the consolidated documents from `README.md` and `HANDOFF.md`; kept the numbered acceptance requirements intact.
- Corrected stale `lang/SPEC.md` roadmap wording to distinguish existing prototypes from complete acceptance-criterion fulfillment.
- Ran `./scripts/test_all.sh`: all available tests passed; 14 Python tests ran, 13 passed, and one legacy experiment test was skipped because external artifacts are absent.

## 2026-10-11 — integrated research build

- Combined the aligned Sanskrit parser / Sūtram interpreter repository with the latest Pushkalāvatī data-driven meta-grammar compiler.
- Preserved all 3,983 source-index records and added the functional classifier, operation tables, fixed-point expansion outputs, generated-rule ledger, and Python/JavaScript rule parity.
- Integrated Sūtram bootstrap/conversion prototypes, explicit engine-precedence tests, Vaiśeṣika OOP mapping, and functional/imperative paradigm examples.
- Added a reproducible full-corpus observed-form bootstrap with stable ID mapping, per-sūtra substitutions, residuals, metrics, and SHA-256 provenance.
- Added a one-command test runner and Python smoke test for the language interpreter.
- Regenerated the Nirgundi all-sūtra structural conversion artifact.
- Explicitly documented the difference between earlier reported bootstrap metrics and this checkout's reproducible run; did not silently alter the algorithm to force a match.
- Test status: all available tests pass; one legacy experiment-artifact test is skipped because the external Cologne MW lexicon and prior RV experiment artifacts are not bundled.

## 2026-10-11 — Meta-rule execution follow-up

- Added explicit runtime handlers and tests for meta-rules 1.1.7 (saṃyoga recognition) and 1.1.71 (pratyāhāra expansion).
- Kept meta-rule execution status separate from executable-tested vidhi operations; corpus status totals are unchanged.
- Unsupported meta-rule IDs return `UNRESOLVED` rather than a guessed fallback.

## 2026-10-11 — Inverse-reduction RDP first executable slice

- Added `tools/pushkalavati-compiler/src/inverse-reduction.js` for native-Devanagari grapheme segmentation, longest prādaya anchoring, and guarded inverse vowel-junction candidate generation for 6.1.87/6.1.88.
- Added tests for `उपेन्द्रो`, ambiguity preservation, unsupported boundaries, no-match behavior, and caller-supplied lexical checks.
- Morphological endings remain unstripped unless an explicit morphology rule is implemented; this work does not claim full-corpus execution.
