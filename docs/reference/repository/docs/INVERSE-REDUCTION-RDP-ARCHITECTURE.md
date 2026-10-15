# Inverse Reduction Parser (RDP): architecture proposal and implementation record

**Status:** design input documented; not yet implemented as a complete parser  
**Source:** project-owner notes and Gemini discussion supplied on 2026-10-11  
**Purpose:** preserve the proposed architecture, its worked trace, and its intended relationship to Pushkalāvatī, Hindawi, and Romenagri without conflating a design proposal with verified runtime behavior.

## 1. Executive summary

The proposed **InverseReductionParser** analyzes a surface form by reducing it toward a stem and its grammatical components. Its intended control flow is:

1. accept native-script input;
2. tokenize it at a defined akṣara/phonological level;
3. anchor a known prefix using longest-match selection;
4. detect a sandhi junction and apply a licensed inverse transformation;
5. reduce inflectional endings through a morphology-aware suffix pass;
6. validate the reconstructed stem and return the reduction trace;
7. retain explicit failure states and the rule/provenance path used for every reduction.

The intended parser model is top-down recursive descent (RDP), with rule functions corresponding to grammar operations. Prefix and suffix scans may use iterative loops; recursion is reserved for nested analysis. The architecture favors rule execution over enumerating all surface forms in advance.

This is an architectural proposal, not a claim that every Aṣṭādhyāyī sūtra can be mapped directly to a deterministic function or that inverse analysis is always unique. The repository currently contains related prototypes, but not the complete implementation described here.

## 2. Worked reduction supplied by the project owner

The supplied example uses the surface input **उपेन्द्रो** and proposes this reduction trace:

| Step | Proposed operation | Proposed result | Required evidence/status |
|---|---|---|---|
| 1 | Preserve the input surface form | `उपेन्द्रो` | Input record |
| 2 | Longest prefix anchor | `उप` | Prefix inventory plus boundary match |
| 3 | Recognize the inherent final `अ` associated with the prefix and isolate the junction | Remaining surface begins `ेन्द्रो` | Requires a defined native-script tokenizer and boundary model |
| 4 | Direct suffix/lexical lookup fails; inspect inverse vowel rules | Candidate inverse Guṇa: `ए → अ + इ` | Must identify the applicable forward rule and prove its context is invertible here |
| 5 | Reconstitute the tail | `इन्द्रो` | Candidate intermediate form, not yet a validated stem |
| 6 | Morphological reduction of the ending | `इन्द्र` | Requires an explicit nominal-ending, ru/visarga and utva analysis; cannot be implemented as blind string trimming |
| 7 | Validate the lexical stem and return components | `उप + इन्द्र + [ending analysis]` | Requires lexical evidence and a trace of each licensed rule |

The source notes describe the final components as `उप` (upasarga), `इन्द्र` (prātipadika), and `सुँ` (suṅ/sup-related ending). The precise grammatical analysis of the input and the exact ending derivation have **not** been independently validated by this documentation task. Preserve the example as the project’s target test case, and validate the linguistic derivation before treating it as a golden test.

### Required trace object

A successful parse should return more than the final stem. Each step should record at least:

- input span and output span;
- operation and source sūtra/rule ID;
- direction (`inverse` or `forward-validation`);
- matched context and preconditions;
- status (`APPLIED`, `NOT_APPLICABLE`, `UNRESOLVED`, or `ERROR`);
- candidate alternatives, if the inverse is not unique;
- lexical/attestation source used for validation.

This trace makes the reduction inspectable and allows later comparison with a forward derivation without making forward generation the parser’s only execution strategy.

## 3. Proposed parser phases

### 3.1 Native-script input and akṣara segmentation

The project preference is to process Devanagari/Indic text directly and preserve orthographic boundaries, conjuncts, vowel signs, and inherent-vowel information rather than require a Latin transliteration as the primary representation.

Implementation requirement: UTF-8 code points are not themselves akṣaras. The tokenizer must define how it handles consonant letters, virāma, dependent vowel signs, independent vowels, anusvāra, visarga, nukta, avagraha, Vedic marks, punctuation, normalization, and malformed sequences. An optional transliteration adapter may be useful for test fixtures or external sources, but it must not silently replace the native-script representation.

The supplied C++ sketch declares `Aksara` and `TokenStream`, but its `tokenize_aksaras()` body is a stub. Therefore the sketch is a type/interface proposal, not a working native-script tokenizer.

### 3.2 Longest prefix anchor

The proposed parser uses a prādaya/upasarga inventory and chooses the longest valid prefix at a permitted boundary. The inventory in the supplied sketch is illustrative and requires canonicalization and source-backed review before it becomes authoritative.

Required behavior:

- return the actual matched prefix and its input span;
- return “no match” when none matches—never default to `उप`;
- handle overlapping prefixes by explicit longest-match ordering;
- preserve alternative parses when grammar or lexical context permits more than one analysis;
- distinguish a prefix used as an upasarga from the same string occurring inside a stem.

The sample C++ `match_longest_prefix()` ends with `return "उप";`, which would falsely report a match after failure. That fallback must not be copied into production code.

### 3.3 Inverse sandhi at a junction

The example proposes reversing a Guṇa outcome such as `ए` into `अ + इ` at a prefix/stem boundary. The runtime must not perform this replacement globally. It must:

1. locate a candidate junction;
2. select the applicable rule and its source-backed context;
3. apply only an inverse licensed by that rule;
4. record whether the inverse is unique or yields alternatives;
5. continue only when downstream morphology/lexicon evidence supports the candidate.

Inverse phonological mappings can be many-to-one. A surface vowel alone does not always uniquely determine the original pair. Deterministic execution can mean deterministic *candidate ordering and control flow*; it must not mean fabricating certainty where the data underdetermines the analysis.

### 3.4 Morphological ending reduction

The proposal calls for a suffix-reduction pass over subanta/tiṅanta morphology and related ru/visarga/utva effects. It should be implemented as a morphology-aware module with explicit ending tables/rules, features, conditions, and provenance.

It must not:

- remove arbitrary final characters merely because a string contains them;
- replace a candidate stem with a hard-coded `इन्द्र`;
- label a stripped ending as `सुँ` without a derivational path;
- conflate a surface ending, its underlying pratyaya, and transformations that produced the surface form.

The supplied C++ sketch currently hard-codes `इन्द्र` and checks `rfind("ो") != npos`, which tests whether `ो` occurs anywhere, not whether a licensed suffix occurs at the end. That code is illustrative pseudocode and is not safe as an implementation.

### 3.5 Lexical validation and results

The output model should represent at least:

- prefix/upasarga candidates;
- prātipadika or dhātu candidates;
- underlying pratyaya and observed surface ending;
- rule sequence and contextual features;
- lexical/attestation result;
- ambiguity and unresolved conditions.

A failed lexical lookup should not automatically mean the candidate is invalid: the lexicon may be incomplete. Conversely, a familiar-looking string should not be accepted solely because it resembles a known stem. Report lexical status separately from grammatical derivability.

## 4. Execution model and complexity claims

The supplied design prefers recursive descent over a large precomputed surface-form table or an unrestricted search over possible splits. It proposes longest-prefix anchoring, localized inverse transformations, and iterative prefix/suffix handling, with memoization for repeated subproblems.

These are reasonable design hypotheses to benchmark, but the accompanying conversation makes stronger claims—such as universal superiority over FST/chart systems, an automatic change from exponential to O(N), zero state overhead, and elimination of all combinatorial ambiguity—that are **not established by the provided evidence**.

Actual complexity depends on:

- number of candidate prefix anchors and junction positions;
- branching factor of inverse rules;
- whether the grammar licenses multiple analyses;
- memoization key and cache hit rate;
- cost of morphological/lexical validation;
- recursion depth and repeated suffix analyses.

A deterministic recursive-descent implementation can still backtrack exponentially if it explores many alternatives without memoization or pruning. Conversely, an FST can execute in linear time in input length for a fixed transducer. The relevant comparison is between measured implementations on the same corpus and test suite, not architectural labels alone.

Recommended benchmark: report corpus and input lengths, number of rule attempts, candidate branches, memoization hits, peak memory, wall-clock time, and correctness/ambiguity coverage. Do not publish a complexity or superiority claim before measurement and a stated model of the grammar/search space.

## 5. Relationship to Hindawi and Romenagri

The project notes position the parser as compatible with the Hindawi and Romenagri compiler approach: deterministic, native-script-aware front-end processing with grammar rules executed as compiler operations. This document records that as the intended integration direction.

Integration requirements still to specify:

- the canonical token/akṣara interface shared by the front end and parser;
- whether Romenagri is an input/output adapter, an internal notation, or both;
- how source-script spans survive normalization and rule rewriting;
- how rule IDs and provenance flow into diagnostics;
- how parser results are serialized for the Pushkalāvatī IR;
- how Hindawi source constructs call the reduction engine without bypassing grammar preconditions.

No assumption is made here that the existing Romenagri/Hindawi implementation already provides all these interfaces; the supplied material describes the desired relationship, not a verified code audit of those components.

## 6. Proposed module hierarchy

The following is a module decomposition, not a claim that these modules already exist:

```text
PaniniInverseReductionParser
├── NativeScriptTokenizer
├── PrefixAnchorMatcher
├── JunctionDetector
├── InverseRuleDispatcher
│   ├── VowelSandhiInverse
│   ├── ConsonantSandhiInverse
│   └── RuleContextValidator
├── MorphologicalReducer
│   ├── SubantaEndingReducer
│   ├── TingantaEndingReducer
│   └── SurfaceEndingTransformationResolver
├── LexicalValidator
├── CandidateRankerOrAmbiguityReporter
└── ReductionTraceSerializer
```

The dispatch layer should reuse the canonical rule IR and existing rule/runtime contracts wherever possible. Avoid a second, independent store of rule meanings. Each handler must return explicit status and a provenance-bearing result.

## 7. Minimal result/status contract

- `APPLIED`: a specific, licensed reduction was applied and recorded.
- `NOT_APPLICABLE`: a known rule was checked and its preconditions did not hold.
- `UNRESOLVED`: needed lexical, semantic, or grammatical information is missing, or multiple candidates remain unresolved.
- `ERROR`: malformed input, invalid internal state, or violated implementation contract.

`NO_MATCH` may be represented as a distinct parser-level result for prefix or lexical lookup; it must not be silently converted into success. A parser may return several successful candidate analyses where the grammar supports ambiguity.

## 8. Implementation plan and acceptance gates

### Phase A — formalize interfaces

- Specify Unicode normalization and native Devanagari akṣara tokenization.
- Replace hard-coded prefix fallback with real longest-match logic.
- Define source spans, candidate state, status values, and trace schema.
- Connect rule dispatch to the canonical Pushkalāvatī rule IR.

### Phase B — implement one complete inverse reduction

- Validate the `उपेन्द्रो` example with a cited grammatical/lexical source and an explicit forward derivation.
- Implement the matching prefix rule and inverse Guṇa rule with contextual guards.
- Implement the actual ending analysis and its surface transformations; no hard-coded stem or suffix deletion.
- Add negative cases: no prefix, wrong vowel context, absent/incorrect ending, malformed Devanagari, and ambiguous inverse.

### Phase C — generalize by rule family

- Add further vowel-sandhi inverses only where the inverse conditions are specified.
- Add consonant/visarga and morphological ending families as separate handlers.
- Reuse the same trace/status interface and add corpus-based tests.

### Phase D — measure and compare

- Benchmark against a defined baseline on the same inputs.
- Measure branches, runtime, memory, and correctness, including ambiguous forms.
- Describe FST/chart approaches accurately and compare concrete systems only when their implementations and evidence are available.

### Acceptance criteria

A feature is not complete merely because its class/function exists. It must have positive and negative tests, rule-source provenance, a reproducible command, observed outputs, and a documented scope boundary. The example `उपेन्द्रो` should become a golden test only after its full grammatical derivation and target analysis are independently verified.

## 9. Current repository boundary

This document records the proposed Inverse Reduction RDP architecture. The current repository's executable meta-runtime documents only its implemented handlers for 1.1.7 (saṃyoga recognition over its declared IAST token set) and 1.1.71 (pratyāhāra expansion through the existing Śivasūtra stream). These are not an implementation of the full InverseReductionParser described above.

The broader parser's morphological analyzer, kāraka parser, and full sentence pipeline remain incomplete as recorded in `IMPLEMENTATION_STATUS.md` and `HANDOFF.md`. Do not increment executable-rule counts because this design document was added.

## 10. Source material retained

This document consolidates the project-owner messages dated 2026-10-11 at approximately 16:06–16:27, including:

- the stepwise `उपेन्द्रो` inverse-reduction trace;
- the proposed `PaniniRDPParser` C++ type and call hierarchy;
- the preference for native Devanagari/akṣara-level processing;
- the intended Hindawi/Romenagri integration;
- the proposed use of recursive descent, iterative prefix/suffix scans, and memoization;
- performance comparisons and claims, explicitly marked above as hypotheses pending measurement.

## 11. First executable native-script inverse-reduction vertical slice (2026-10-11)

The module `tools/pushkalavati-compiler/src/inverse-reduction.js` now provides a conservative, testable starting point for the proposed architecture:

- NFC-normalizes input and segments it into Unicode grapheme clusters with `Intl.Segmenter`;
- chooses a longest-match prādaya candidate from a small explicit Devanagari inventory;
- inspects a dependent vowel sign at the prefix/stem boundary;
- generates inverse candidates for the supported guṇa matras under 6.1.87 (`े` → initial `इ`/`ई`; `ो` → initial `उ`/`ऊ`) and vṛddhi matras under 6.1.88 (`ै` → initial `ए`/`ऐ`; `ौ` → initial `ओ`/`औ`);
- emits a provenance-bearing trace and explicit status values;
- optionally checks a caller-supplied lexical `Set` without treating it as a complete Sanskrit lexicon.

The regression fixture `उपेन्द्रो` now yields the anchored prefix `उप` and inverse candidates `इन्द्रो` and `ईन्द्रो`. It deliberately returns `UNRESOLVED` because the inflectional ending has not been analyzed. It does **not** silently rewrite `इन्द्रो` to `इन्द्र`, claim `सुँ`, or validate a lexical stem that the runtime has not actually found.

This is a useful executable slice, not a complete Sanskrit parser. The tokenizer currently exposes orthographic grapheme clusters rather than the proposed packed 32-bit phonological akṣara representation; original byte spans, full visarga/consonant inverses, a full morphology engine, and grammar-driven lexical validation remain open. The rule family inventory in `INVERSE_REDUCTION_RULE_FAMILIES` is intentionally separate from `EXECUTABLE_META_RULES` and from the 11 attested forward surface operations: inverse candidate generation is not counted as a new attested forward rewrite.

Tests are in `tools/pushkalavati-compiler/tests/compiler.test.js`. The acceptance checks cover successful prefix anchoring, no-default-prefix behavior, the inverse candidate set, explicit unresolved morphology, both supported rule IDs, and optional lexicon behavior.


## 12. Twelfth executable-tested rule: 6.1.94 एङि पररूपम् (2026-10-11)

Added `6.1.94` as a context-bearing sandhi operation in `tools/pushkalavati-compiler/data/operations.json`, dispatched by the shared JavaScript and Python interpreters. When an a/ā-final upasarga precedes an e/o-initial dhātu, the following e/o is the single substitute (pararūpa), overriding the vṛddhi outcome otherwise available under 6.1.88. Source examples: `pra + ejate → prejate`, `parā + ejate → parejate`, `upa + oṣati → upoṣati`, `pra + oṣati → proṣati`. Source: [Aṣṭādhyāyī.com, 6.1.94](https://ashtadhyayi.com/sutraani/6/1/94).

Applicability requires explicit caller context `upasarga: true` and `dhatu: true`; negative tests verify that missing licensing context and non-e/o initial material do not trigger the rule. This is the twelfth executable-tested surface operation in the canonical compiler IR. It does not complete the full derivation of these words or imply full-corpus execution.
