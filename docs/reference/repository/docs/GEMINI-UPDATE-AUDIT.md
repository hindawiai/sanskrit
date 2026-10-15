# Gemini update: audit and integration record

**Date:** 2026-10-11  
**Scope:** Review of the proposed `rule_corrections.js` patch and its accompanying inventory.

## Findings accepted into the project record

The following findings agree with the repository's existing implementation and are now explicit regression constraints:

- Śivasūtra 8 ends in the it-marker `ñ`; pratyāhāra boundaries must be positional, not found by marker character alone.
- Sūtras 6.1.77 (*iko yaṇ aci*) and 6.1.78 (*eco 'yavāyāvaḥ*) are separate rules. The former has the `ik → yaṇ` left-substitution map; the latter has a context-bearing `ec → ay/av/āy/āv` transformation.
- Unknown mappings must not be filled with arbitrary defaults. The compiler must preserve explicit unresolved/not-applicable/error outcomes.
- Corpus ingestion, classification, structural expansion, semantic resolution, and execution testing are distinct lifecycle claims. Only attested execution vectors justify `executable_tested`.
- The source snapshot reports 3,983 corpus records; 11 executable-tested operations; 3 derivable-but-untested rules; 30 definition-resolved records; 23 meta-rules; 478 blocked/unresolved records; and 3,438 records requiring semantic annotation. Status totals sum to 3,983; functional classification labels overlap and are not lifecycle states.

## Why Gemini's code block was not copied verbatim

The proposed patch is useful as a review artifact but is not yet safe to merge as a replacement implementation:

1. **The 6.1.77 mapping is incomplete.** It omits the long-vowel inputs `ī`, `ū`, and `ṝ`, although the existing operation table includes them.
2. **The proposed pratyāhāra sets do not apply savarṇa expansion.** The raw Śivasūtra stream does not itself enumerate all long-vowel variants; phoneme identity and savarṇa expansion must remain distinct layers.
3. **The interface assumes a pre-tokenized phoneme array.** The snippet does not provide or test the tokenizer that converts Sanskrit strings into tokens such as `ai` and `au`; code-point splitting would not be equivalent.
4. **It duplicates existing code.** The repository already has a position-aware Śivasūtra representation in `tools/pushkalavati-compiler/src/shiva.js`, a canonical data-driven operation table in `data/operations.json`, and context-aware execution in `src/execute.js`. Adding a second independent registry/executor risks divergent behavior.
5. **The snippet has no test suite or provenance assertions.** It should not be described as verified until positive and negative cases execute in the repository.

For these reasons, this update retains the canonical implementation and adds regression assertions rather than introducing a competing executor. Any future replacement should reuse the canonical Śivasūtra and operation data, document its tokenization contract, and prove parity against the existing test vectors.

## Current implementation boundary

The operation table already represents 6.1.77 separately from 6.1.78. Tests exercise the 6.1.77 examples and the 6.1.78 vowel transformations, including negative applicability checks and the 6.1.109 exception interaction. The additional regression assertions explicitly protect the separation and the full 6.1.77 mapping.

The lifecycle counts and Nirgundi measurements in Gemini's message are reported baseline values, not evidence that Gemini executed the repository. The Nirgundi discrepancy remains unresolved: the integrated reproduction reports 6,248 forms, 19,283 substitutions, and 68.20% estimated coverage, while an earlier report used 6,048 forms, 19,256 substitutions, and 68.37%. Do not reconcile these without the exact source data and procedure.

## Required verification

Run from the repository root:

```sh
./scripts/test_all.sh
```

Record the actual command output and environment. Do not treat this documentation change or the regression assertions alone as proof that the full parser, morphology analyzer, or self-hosting meta-grammar is complete.

## Follow-up implementation: executable meta-rule primitives

The follow-up build adds `src/meta-runtime.js`, a deliberately small runtime for two meta-rules whose semantics can be specified and tested without inferring them from glosses:

- **1.1.7 — halo'nantarāḥ saṃyogaḥ:** tokenizes supported IAST segments and reports adjacent consonant clusters. It explicitly does not claim full syllabification or handle every orthographic convention.
- **1.1.71 — ādir antyena sahetā:** delegates pratyāhāra expansion to the existing position-aware Śivasūtra stream, retaining explicit unresolved/error outcomes.

These are counted as two executable *meta-rule handlers*, not added to the 11 executable-tested surface-operation rules. The 3,983-row corpus status totals are unchanged. Unsupported meta-rules return `UNRESOLVED`; there is no generic fallback.
