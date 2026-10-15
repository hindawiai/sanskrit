# Pushkalāvatī rule compiler

GPL-3.0-only. Copyright © 2026 Abhishek Choudhary.

This is a compiler, not a claim that the Aṣṭādhyāyī is implemented. The compiler-side Romenagri module is a per-sound table-key audit, not the word-level encoder in `../transliteration/`; neither claims native C parity.

`data/sutras.json` is the source index: 3,983 records with id, text, type, padaccheda, anuvṛtti, and gloss. It is not relicensed by this notice. The Śivasūtras in `src/shiva.js` are the traditional public-domain pāṭha.

## Rule classification contract — first set

The functional taxonomy and required **Precondition → Rule → Postcondition** structure are documented in [`docs/rule-classification-set-01.md`](docs/rule-classification-set-01.md). This is the specification for classifying the full source inventory. The table-driven classifier is now implemented in `src/classify.js`, with category definitions and matching predicates in `data/meta-grammar.json`. It distinguishes source interpretation, functional category, and executable semantics; allows multiple categories per sūtra; and retains unclassified records rather than forcing a label. Lexical/pattern matches are reviewable hypotheses, not authoritative grammatical interpretations.

## What it compiles

- Saṃjñā whose definiens is a *t*-it vowel name or a pratyāhāra. 1.1.70 and 1.1.71 are applied. `āt` is ā, not the pratyāhāra *at*; the regression test checks the `āt` case in 6.1.45.
- Explicit anuvṛtti stays marked `source_annotation`. Adhikāra inferred from a locative head is marked `gloss_confirms` or `inferred_unconfirmed`.
- A genitive-nominative rule with both classes resolved becomes `derivable_untested`. No substitute map is invented, so it is not executable.
- The BUILD-0016 compiler output marks 20 operations `executable_tested`: 6.1.45, 6.1.66, 6.1.77, 6.1.78, 6.1.87, 6.1.88, 6.1.94, 6.1.101, 6.1.109, 6.1.131, 6.4.81, 6.4.110, 7.1.86, 8.3.15, 8.3.23, 8.3.34, 8.4.40, 8.4.41, 8.4.55, and 8.4.58. Each operation is still rule-local; this count is not a full derivation pipeline.
- The original four operations are pairwise vowel substitutions/fusions. The five first additions are context-bearing morphology operations. The context-bearing vowel-sandhi operations include 6.1.78 (ec → ay/av/āy/āv before a vowel), 6.1.109 (pada-final e/o before short a, represented with optional orthographic avagraha), and 6.1.94 (pararūpa for an a/ā-final upasarga before an e/o-initial dhātu). These are rule-local operations, not a complete derivation pipeline.
- Paribhāṣā are interpreter policy, not rewrites. Atideśa and everything else stay `needs_semantic_annotation`.

## Current status (BUILD-0016 freshly regenerated outputs)

| Status | Count |
|---|---:|
| `executable_tested` | 20 |
| `derivable_untested` | 3 |
| `definition_resolved` | 30 |
| `meta_rule` | 23 |
| `blocked_unresolved_class` | 473 |
| `needs_semantic_annotation` | 3,434 |
| **Total records** | **3,983** |

The three still `derivable_untested` records are explicitly retained:

- **2.4.41 `वेञो वयिः`** — the published Kāśikā examples include `उवाय`, `ऊयतुः`, and `ऊयुः` (source below). The rule is optional in `लिट्` and interacts with reduplication, samprasāraṇa, and neighboring rules. The present executor does not model those derivational stages, so it is not promoted based on a root substitution alone.
- **3.4.106 `इटोऽत्`** — published examples include `पचेय`, `यजेय`, `कृषीय`, and `हृषीय` (source below). The rule replaces a specific ātmanepada first-person singular ending in liṅ/āśīrliṅ contexts; this compiler has no person/pada/tense-aware affix representation yet. The example forms are not falsely treated as a context-free string rewrite.
- **7.1.40 `अमो मश्`** — the published account describes a Vedic-only substitution of the first-person singular aorist ending, with whole-affix replacement and Vedic licensing. The compiler does not yet represent chandas, aorist, person, or tiṅ-affix identity. It remains untested rather than turning the pratyāhāra-like text into a fabricated map.

These three have published examples available, but do not yet have an implemented operation shape that can faithfully execute their grammatical conditions. This is a deliberate hold, not a missing search.

## Source reference for the latest executable sandhi operation

- **6.1.94 `एङि पररूपम्`** — after an a/ā-final upasarga, an e/o-initial dhātu takes pararūpa: `प्र + एजते → प्रेजते`, `परा + एजते → परेजते`, `उप + ओषति → उपोषति`, and `प्र + ओषति → प्रोषति`. This is an exception to the vṛddhi result otherwise expected under 6.1.88. The executor requires caller-supplied `upasarga: true` and `dhatu: true` flags; it does not infer lexical or morphological identity from the strings. [Aṣṭādhyāyī.com, 6.1.94](https://ashtadhyayi.com/sutraani/6/1/94).

## Source references for the two earlier executable sandhi operations

- **6.1.78 `एचोऽयवायावः`** — the published account gives the four substitutions e → ay, o → av, ai → āy, au → āv and examples `चे + अन → चयनम्`, `लो + अन् → लवनम्`, `चै + अक → चायकः`, and `लौ + अक → लावकः`. Tests use the corresponding IAST intermediate forms `ce + anam → cayanam`, `lo + anam → lavanam`, `cai + aka → cāyaka`, and `lau + aka → lāvaka`. [Bodha Research, 6.1.78](https://www.bodharesearch.in/library/sections/ashtadhyayi/6.1.78); [Learn Sanskrit, ac sandhi](https://learnsanskrit.org/vyakarana/sandhi/ac-sandhi/).
- **6.1.109 `एङः पदान्तादति`** — the published Kāśikā / Siddhāntakaumudī explanations give `अग्ने + अत्र → अग्नेऽत्र` and `वायो + अत्र → वायोऽत्र`; this is the exception to the general 6.1.78 substitution for pada-final e/o before short a. Tests assert the output including avagraha, and negative tests ensure that non-pada-final e/o and following vowels other than short a do not trigger the operation. [Aṣṭādhyāyī.com, 6.1.109](https://ashtadhyayi.com/sutraani/6/1/109).

These are rule-local sandhi operations. The executor requires the caller to supply context flags such as `pada_final` and `following_short_a`; it does not infer word boundaries or vowel length from an unannotated sentence.

## Source references for the five new executable operations

- **6.1.45 `आदेच उपदेशेऽशिति`** — Kāśikā examples `ग्लै — ग्लाता, ग्लातुम्, ग्लातव्यम्` and `शो — निशाता, निशातुम्, निशातव्यम्`; the operation tests the intermediate root substitution `glai → glā` / `śo → śā` and refuses the śit-affix context. [Ashtadhyayi.com, 6.1.45](https://ashtadhyayi.com/sutraani/6/1/45).
- **6.1.131 `दिव उत्`** — the published derivation explicitly shows `दिव् + भ्याम् → दि उ + भ्याम् → द्युभ्याम्`; the tested operation is the rule-local intermediate `div → diu`, conditioned on pada status. [Ashtadhyayi.com, 6.1.131](https://ashtadhyayi.com/sutraani/6/1/131).
- **6.4.81 `इणो यण्`** — published derivation gives `आ + इ + अन्ति → आ + य् + अन्त् → आयन्`, and the commentary gives `यन्ति`; the test checks the rule-local `i + anti → yanti` transformation before an initial vowel. [Ashtadhyayi.com, 6.4.81](https://ashtadhyayi.com/sutraani/lp600).
- **6.4.110 `अत उत् सार्वधातुके`** — the published commentary gives `विदाङ्कुरुताम्` and distinguishes the applicable `क्ङित्` context from forms such as `करोति`; the test checks `vidāṅkaru + tām → vidāṅkurutām` and refuses the non-kṅit context. [Ashtadhyayi.com, 6.4.110 commentary](https://ashtadhyayi.com/sutraani/6/4/110?expand=sutra-commentary-kashika-region&focus=sutra-commentary-kashika-region&highlight=%E0%A4%B0%E0%A5%8B%E0%A4%B7).
- **7.1.86 `इतोऽत् सर्वनामस्थाने`** — the published derivation gives `सुपथिन् + जस् → सुपथिन् + शि → सुपथन् + इ`, and describes the `pathin`, `mathin`, and `ṛbhukṣin` family in strong cases; the test checks the rule-local `supathin → supathan` stem operation. [Ashtadhyayi.com, 7.1.86](https://ashtadhyayi.com/sutraani/ssk273).

The examples for these five are source-linked intermediate derivation steps, not claims that the compiler performs all subsequent rules needed to derive each complete word-form. The IR stores source URLs with each operation.

## Run

```bash
node tests/compiler.test.js
node src/cli.js
python3 python/execute.py
```

`out/progress.json` is the status count. `out/rules-ir.json` is the canonical IR. Python reads and executes that same IR; it does not compile a second rule inventory. The JS and Python executors implement matching operations and applicability predicates, tested against the same vectors and negative cases.

Serialization of 3,983 records is not execution of 3,983 rules.

## Batch meta-expansion (fixed-point stage)

`src/meta.js` runs over the complete 3,983-record inventory, rather than selecting individual rules. It constructs source-annotated anuvṛtti edges, propagates terms through those edges in rounds, preserves the originating sūtra and complete expansion chain, and stops when a round adds no new facts. The compiler embeds per-record results in `out/rules-ir.json` and writes the inspectable batch report to `out/meta-expansion.json`.

The current corpus run converges in 16 rounds, producing 68,870 provenance-bearing facts; 1,755 records expose at least one term not present in their direct anuvṛtti annotation. The run finds no dangling anuvṛtti source IDs. These are closure statistics, not counts of distinct grammatical rules or executable operations.

The engine also emits locative-head/adhikāra scope candidates for human review. The source index has no explicit `adhikara` type field, and a locative form alone does not prove an adhikāra. Consequently these candidates are **not** injected into inheritance or promoted to executable rules. Likewise, expanded terms do not by themselves determine a substitution map, apavāda/utsarga relationship, or vipratiṣedha ordering. Those require typed semantic annotations and attested derivation tests. `tests/compiler.test.js` checks convergence, deterministic output, provenance retention, batch-scale expansion, and that unconfirmed scope candidates are not silently applied.

`out/generated-rules.json` is the batch conversion ledger: it contains the generated executable-rule inventory, the three deliberately unpromoted candidates, and unresolved records with expanded context and provenance. The executable inventory is now 12. Fixed-point inheritance supplies context, not a substitute for the grammatical operation itself. No additional operation is promoted merely because a term propagated.

## Meta-compiler first pass (2026-10-11)

The meta-compiler phase is now represented explicitly in `src/meta-compiler.js` and emitted as `out/meta-compiler-catalog.json`. It separates (1) a source-grounded inventory of meta-rule candidates from (2) the generic interpreter contracts needed to execute such rules safely.

The canonical corpus contains **290 explicitly typed meta-rule candidates**: 200 `samjna`, 23 `paribhasha`, and 67 `atidesha`. Of these, **222 occur in Adhyāya 1 across pādas 1–4**. These are corpus counts, not claims that all 290 have complete executable semantics. Each record preserves source text, gloss, explicit anuvṛtti references, and source ID, and starts in `CANDIDATE_REVIEW_REQUIRED` with `executable: false`.

The initial engine contract defines 18 generic meta-compiler operators: source preservation, explicit type dispatch, definition/policy/transfer candidate registration, source-annotated anuvṛtti, fixed-point inheritance, review-gated adhikāra candidates, pratyāhāra and savarṇa handling, applicability/effect separation, conflict policy, provenance, status gating, diagnostics, deterministic order, and termination. These operators are the interpreter's contracts; they are not 18 newly implemented grammatical rules and do not promote the source candidates.

Run `npm test` at repository root. The compiler test verifies candidate counts, source types, conservative lifecycle status, deterministic inventory constraints, and the existing rule regression tests. Semantic promotion must happen one rule family at a time with explicit preconditions, effects, provenance, positive examples, and negative applicability tests.

### Executable meta-rule runtime

`src/meta-runtime.js` currently implements two separately tested meta-rule handlers: 1.1.7 for adjacent consonant-cluster recognition over supported IAST tokens, and 1.1.71 for pratyāhāra expansion via the canonical Śivasūtra stream. These are interpreter primitives, not additional surface rewrite operations, and do not change the corpus lifecycle counts. Unsupported handlers return explicit `UNRESOLVED` diagnostics. See `docs/GEMINI-UPDATE-AUDIT.md` for scope and limitations.

## Romenagri sound-token substrate (incremental migration)

The rule executor now tokenizes rule inputs using `src/romenagri.js`, a longest-match Sanskrit sound-token layer aligned with the audited Romenagri ACII table. `applyRule` and the context-bearing vowel-sandhi executor operate on token arrays, so `ai`/`au` and aspirated/retroflex sounds are not split by Unicode code-point slicing. Existing public examples and rule IR remain IAST-compatible.

The audited table is recorded in `data/romenagri/acii-table.json`; the upstream lineage and exact limits are documented in `vendor/romenagri/README.md` and `docs/ZIP-COMPARISON-ROMENAGRI-INTEGRATION.md`. This is not a claim that the legacy C converter has been vendored or that this adapter reproduces its byte-level behavior. Legacy table keys encode orthographic units with inherent-vowel/state conventions, not a standalone phoneme ID system. The adapter therefore reports per-sound key coverage separately from rule execution and does not serialize a word by concatenating table keys.

Known uncovered legacy-table sounds: `ṝ`, `ḷ`, and `ḹ`. The source also documents an empty `^a` mapping; its UTF-16-like conversion path is not a UTF-8 decoder; and unknown-key lookup can return `NULL`. These hazards must be addressed before treating the original converter as a total production boundary.

Run `node tests/compiler.test.js` for tokenization and rule regressions. The next integration gate is differential testing against the original Romenagri C binaries, including Unicode spans, virāma/mātrā state, avagraha, and ambiguous round trips.
