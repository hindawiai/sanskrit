# Pushkalāvatī / Sūtram — consolidated AI handoff data

**Snapshot:** 2026-10-14 (BUILD-0016). This file consolidates the major project facts and implementation constraints for an AI collaborator. It is a documentation handoff, not a claim that every listed feature is complete. Use it alongside [`PROJECT_OVERVIEW.md`](../PROJECT_OVERVIEW.md), [`HANDOFF.md`](../HANDOFF.md), and the source code. Where a source file or test disagrees with this snapshot, inspect the current code and report the discrepancy instead of silently choosing one.

## 1. Repository and source inventory

- Canonical source index: `data/sutras.json`, 3,983 records. Records include fields such as sūtra ID, text, type, padaccheda, anuvṛtti, and gloss where available.
- Do not create a parallel mutable copy of this dataset. The compiler reads the root canonical data.
- The compiler package is under `tools/pushkalavati-compiler/`; generated reports are in `tools/pushkalavati-compiler/out/`.
- The Sūtram rewrite engine and prototypes are in `lang/js/`. The legacy Python files `lang/lexer.py`, `lang/parser.py`, and `lang/interpreter.py` are explicitly deprecated as the first imperative attempt.
- Nirgundi's baseline and experiments are separate in purpose from rule compilation; observed literal correspondences do not establish grammatical semantics.

## 2. Exact current compiler status

Read `tools/pushkalavati-compiler/out/progress.json` as the machine-generated status report for this checkout. Its current values are:

| Status | Count | Meaning boundary |
|---|---:|---|
| `executable_tested` | 20 | Only status that has run against an attested example |
| `derivable_untested` | 3 | Potentially derivable but not faithfully executable/tested yet |
| `definition_resolved` | 30 | Definitions compiled; not general execution |
| `meta_rule` | 23 | Identified as meta-rules; not automatically executable |
| `blocked_unresolved_class` | 473 | Required class/interpretation remains unresolved |
| `needs_semantic_annotation` | 3,434 | Semantic interpretation is still needed |
| **Total** | **3,983** | Source records represented in the report, not rules executed |

The functional classifier currently reports 2,826 classified records, 855 multi-classified records, and 302 unclassified records. Functional categories overlap. The category counts in `out/progress.json` must not be added together as if mutually exclusive; `scope_inherit` is a structural category, not a primary grammatical function. The classifier is table-driven and reviewable, but lexical/pattern hits remain hypotheses pending grammatical review.

### Fixed-point meta-expansion

The current report records convergence in 16 rounds, 68,870 provenance-bearing expanded facts, 1,755 records with non-surface terms, 1,609 adhikāra-head candidates, 2,370 scope candidates, and zero unresolved/dangling edges. These numbers describe graph closure and provenance, not unique rules or executable coverage. Locative-head heuristics do not prove adhikāra; scope candidates are not automatically injected into rule inheritance or execution.

## 3. The 20 rule-local executable operations (BUILD-0016)

The current operation table identifies these as `executable_tested`:

- **6.1.45** — context-bearing root transformation `glai → glā`, `śo → śā`, conditioned on upadeśa-dhātu status and following affix not being śit.
- **6.1.66** — context-bearing `v/y` lopa before `val`; vector `kay + ta → kata`.
- **6.1.77** — ik → yaṇ map (`i/ī → y`, `u/ū → v`, `ṛ/ṝ → r`, `ḷ → l`) before a vowel; examples `dadhi + atra → dadhyatra`, `madhu + atra → madhvatra`.
- **6.1.78** — ec → ay/av/āy/āv before a vowel; vectors `ce + anam → cayanam`, `lo + anam → lavanam`, `cai + aka → cāyaka`, `lau + aka → lāvaka`.
- **6.1.87** — guṇa fusion with initial `a/ā` on the left; e.g. `upa + indra → upendra`.
- **6.1.88** — vṛddhi fusion with initial `a/ā` on the left; e.g. `kṛṣṇa + eka → kṛṣṇaika`.
- **6.1.94** — pararūpa for an a/ā-final upasarga before an e/o-initial dhātu, with caller-supplied upasarga/dhātu flags.
- **6.1.101** — savarṇa vowel lengthening; e.g. `daṇḍa + agra → daṇḍāgra`.
- **6.1.109** — pada-final e/o before short a, represented with optional avagraha; examples `agne + atra → agneऽtra`, `vāyo + atra → vāyoऽtra`.
- **6.1.131** — context-bearing intermediate transformation `div → diu` when pada conditions hold.
- **6.4.81** — root `iṇ` transformation before a vowel-initial affix; test includes `i + anti → yanti`.
- **6.4.110** — context-bearing `kṛ`/u-pratyaya operation with sarvadhātuka and kṅit context; example `vidāṅkaru + tām → vidāṅkurutām`.
- **7.1.86** — pathin-family strong-form stem operation; test includes `supathin → supathan` under sarvanāmasthāna context.
- **8.3.15** — final `r` to visarga before khar/avasāna.
- **8.3.23** — final `m` to anusvāra before a consonant.
- **8.3.34** — visarga to `s` before khar; kept separate from the following ṣcu substitution.
- **8.4.40** — `s` to `ś` before ṣcu.
- **8.4.41** — `s` to `ṣ` before ṣṭu.
- **8.4.55** — jhal-to-car before khar.
- **8.4.58** — anusvāra to class nasal before yay, with caller-supplied class nasal.

These are rule-local operations with explicit applicability/context and test vectors. They do not constitute a complete derivational pipeline. In particular, **6.1.77 and 6.1.78 are different operations and must not share a conflated mapping**. Source references and test contracts are in `tools/pushkalavati-compiler/README.md` and `data/operations.json`.

## 4. Three derivable-but-untested candidates

- **2.4.41 `वेञो वयिः`** — optional perfect, with reduplication and samprasāraṇa interactions; published examples include `उवाय`, `ऊयतुः`, `ऊयुः`. A context-free root substitution is inadequate.
- **3.4.106 `इटोऽत्`** — requires person, pada, mood/tense, and affix-aware context; examples include `पचेय`, `यजेय`, `कृषीय`, `हृषीय`.
- **7.1.40 `अमो मश्`** — Vedic-only aorist/person/tiṅ-affix context. The executor lacks the required Vedic and affix identity representation.

Do not promote these by inventing a mapping. Keep them `derivable_untested` until their grammatical conditions and attested outputs can be represented and tested.

## 5. Śivasūtra inventory and pratyāhāra invariants

Traditional 14-row sequence represented in the implementation:

1. `a i u ṇ`
2. `ṛ ḷ k`
3. `e o ṅ`
4. `ai au c`
5. `h y v r ṭ`
6. `l ṇ`
7. `ñ m ṅ ṇ n m`
8. `jh bh ñ`
9. `gh ḍh dh ṣ`
10. `j b g ḍ d ś`
11. `kh ph ch ṭh th c ṭ t v`
12. `k p y`
13. `ś ṣ s r`
14. `h l`

Important: the closing marker in row 8 is **ñ**, not ṇ. Marker boundaries are positional; marker characters recur, so a character-only lookup is unsafe. The closing it-marker is not itself a member of the pratyāhāra. Membership tests should cover `ik`, `yaṇ`, `ac`, `ec`, and `hal`. Keep phoneme identity, savarṇa relations, vowel quantity, and orthographic normalization separate.

## 6. Sūtram engine and self-hosting boundary

- Core rewrite engine: `lang/js/engine.js`; Śivasūtra primitives: `lang/js/shivasutras.js`; padārtha type-system prototype: `lang/js/padartha.js`.
- `.su` interpreter and CLI: `lang/js/interpreter.js`, `lang/js/run.js`; sample: `lang/examples/ganana.su`.
- Recorded invocation: `node lang/js/run.js lang/examples/ganana.su mula`. Observed stdout is `12`; stderr summary reports result `13` and `rewrite_steps: 9`. The printed value and final returned result differ by design in that example.
- Bootstrap artifact: `lang/js/cycle-result.json` — 22 hand-translated sūtras across eight sections, 56 meta-steps. It is a selected prototype slice, not a full self-hosting parser or full-corpus conversion.
- The `.su` front end currently uses conventional syntax parsing and lowers to the rewrite engine. REQ-2.1 in `HANDOFF.md`—expressing Sūtram's own grammar as runnable samjñā/paribhāṣā rules and parsing a real program through that rule-set—remains outstanding.
- `MorphAnalyzer`, `KarakaParser`, and top-level Sanskrit sentence pipeline are still stubs/partial. Full morphology, kāraka/syntax, consonant and visarga sandhi parity, a full Vedic Mandala, Āryabhaṭa numerals, Brahmagupta arithmetic, standalone JS compilation, and persistent/shared review storage remain incomplete.

### Rule-engine safety contracts

- A rule evaluation must explicitly report `APPLIED`, `NOT_APPLICABLE`, `UNRESOLVED`, or `ERROR` (or the repository's equivalent typed outcomes). Do not silently treat unresolved as not applicable.
- Never invent a default replacement for unknown mappings; no fallback such as mapping an unknown symbol to `y`.
- Do not rely on arbitrary set iteration for rule ordering.
- `vipratiṣedhe paraṃ kāryam` is not a universal global “later rule wins” shortcut. Resolve conflicts only after applicability/domain checks and with explicit specificity/apavāda rules.
- Generic interpreter behavior must be backed by positive and negative tests.

## 7. Nirgundi observed-form bootstrap

Current integrated experiment: `scripts/nirgundi/observed_form_bootstrap.py`; reproducibility details and generated artifacts under `experiments/nirgundi/observed-form-bootstrap/`.

Current report: 3,983 source records; 6,248 distinct observed forms; 3,981 records with at least one literal match; 19,283 substitution occurrences; 2,483 distinct residual fragments and 3,217 residual-fragment occurrences under this implementation's residual representation; estimated matched code-point coverage 68.20%.

A prior reported variant had 6,048 forms, 19,256 substitutions, 1,782 distinct residual tokens, 10,104 residual occurrences, and 68.37% coverage. These are a known discrepancy, not interchangeable measurements. Reconciliation needs the exact input hash and exact original tokenizer/extraction/substitution/residual implementation. Do not tune the current code to make the numbers match without recovering that evidence.

Method in the integrated run: extract forms from `term`, `padaccheda`, `gloss`, and `anuvrtti[].term`; split on whitespace, danda, double danda, comma, and semicolon; sort longest-first by Unicode code-point length, then lexical order; substitute literally in `sutra`, protecting replaced material with integer markers. No normalization, transliteration, morphology, sandhi, fuzzy matching, or compound analysis. A literal match is not proof of grammatical understanding. Preserve residuals; do not silently correct them.

## 8. Known false starts / invalid implementation patterns

Reject or explicitly correct these patterns if proposed by an AI collaborator:

1. **Synthetic corpus padding:** creating a few real examples plus thousands of placeholder rows and claiming all 3,983 are parsed/resolved/compiled/tested. This is invalid. Every status must be supported by actual source data and executed tests.
2. **Incorrect 6.1.77 example/context:** a demonstration that supplies `v i ā p t u m` and expects an `ac` context to pass is invalid if the implementation's context test does not normalize or correctly recognize long ā. A later normalization workaround does not justify mixing 6.1.78 ec transformations into 6.1.77.
3. **Incorrect 1.3.9 deletion:** deleting a phoneme merely because it belongs to a pratyāhāra does not implement grammatical it-marker deletion.
4. **Universal vibhakti mapping:** mapping ṣaṣṭhī to target, saptamī to right context, and pañcamī to left context as universal semantics is unsupported without interpretation/context.
5. **Silent fallback:** unknown class or mapping must remain unresolved or error; never pick the first candidate, invent a replacement, or mark it resolved for convenience.
6. **Unconditional later-rule wins:** do not implement `vipratiṣedhe paraṃ kāryam` as a global registration-order rule without applicability and conflict-domain analysis.
7. **Category/status conflation:** functional categories overlap; execution statuses do not mean the same thing. Do not report classifier coverage as executable rule coverage.
8. **Literal match overclaim:** Nirgundi's literal replacement inventory is a bootstrap experiment, not a Sanskrit morphological or grammatical parser.

## 9. Tests and claims

Useful commands:

```sh
./scripts/test_all.sh
npm test
npm run compile:rules
node tests/compiler.test.js
node lang/js/run.js lang/examples/ganana.su mula
```

The repository's status documents report a prior successful integrated test run with JavaScript tests, 13 Python tests, one legacy test skipped because external MW/RV artifacts were absent, and Python rule-IR parity over all 3,983 records. The Python runner has also been observed emitting an unrelated `artifact_tool` startup traceback on stderr while exiting zero. Re-run on the current checkout and report the actual exit status, stdout, stderr, and skipped tests; do not present a historical result as a fresh run.

## 10. Required method for the next implementation cycle

1. Read `PROJECT_OVERVIEW.md`, `HANDOFF.md`, this document, the relevant specification, implementation, tests, and generated status report.
2. State the exact acceptance criterion being addressed and the source evidence for any grammatical claims.
3. Implement one bounded vertical slice; do not spread shallow placeholders across the corpus.
4. Add positive, negative, and unresolved-context tests. Preserve source provenance in the IR/trace.
5. Run the relevant tests and integrated tests. Record exact commands and results.
6. Update the corresponding documentation and generated status artifacts only from measured results.
7. Explicitly list unresolved work. Do not claim remote push/publication unless performed.


## 12th executable-tested surface operation: 6.1.94

`एङि पररूपम्` is implemented in the shared JavaScript/Python sandhi executor. It requires caller-supplied upasarga and dhātu context and has four positive examples plus negative applicability tests. See `tools/pushkalavati-compiler/README.md` and `data/operations.json`.


## BUILD-0016 transliteration layers

- `tools/pushkalavati-compiler/src/romenagri.js`: canonical Sanskrit sound tokens → individual audited legacy table keys (`table_key_only: true`); not word encoding. It explicitly reports `chh`, `ṝ`, `ḷ`, and `ḹ` as unsupported in that bridge.
- `tools/transliteration/romenagri.py`: separate Rahnuma-derived word-level Devanagari/Romenagri encoder and decoder. All 13 named output fixtures match; Romenagri round trips 12/13 because the doubled-mātrā `ज्ञाान` fixture canonicalizes to `ज्ञान`.
- FOSS Python adapters use vendored `indic_transliteration`; `sanscript.js` is vendored but not invoked by the Python harness. Native upstream C/filter parity is unverified. See `docs/research/romenagri/BUILD-0016_CORRELATION_AND_TEST_REPORT.md`.
