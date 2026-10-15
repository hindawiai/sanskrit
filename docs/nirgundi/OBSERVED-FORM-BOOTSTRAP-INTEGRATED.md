# Nirgundi observed-form bootstrap — integrated run

Date: 2026-10-11. Source: the included `data/sutras.json` (3,983 records). The script is `scripts/nirgundi/observed_form_bootstrap.py`; output is under `experiments/nirgundi/observed-form-bootstrap/`.

## Reproduced metrics from this checkout

- 3,983 source records
- 6,248 distinct observed forms under the tokenization below
- 3,981 records with at least one literal match; 2 without
- 19,283 substitution occurrences
- 2,483 distinct residual fragments and 3,217 residual-fragment occurrences under this residual representation
- 68.20% estimated matched code-point coverage

The generated `metrics.json` and `REPRODUCIBILITY.md` are authoritative for this run. Stable IDs, per-sūtra substitutions, residual frequency and source hash are included alongside them.

## Method

Forms are extracted from `term`, `padaccheda`, `gloss`, and `anuvrtti[].term`, split on whitespace, danda, double danda, comma, and semicolon. Forms are ordered by descending Unicode code-point length, then lexical order. Each is substituted literally in the `sutra` field; replaced material is protected by integer markers. No Unicode normalization, transliteration, morphology, sandhi, fuzzy matching, or compound analysis is performed.

## Reconciliation with an earlier reported run

A previous report supplied in the project conversation stated 6,048 forms, 19,256 substitutions, 1,782 distinct residual tokens, 10,104 residual-token occurrences, and 68.37% character coverage. Those figures are preserved as reported research results, but **they do not reproduce under this checkout's declared extraction/tokenization and residual representation**. The current build does not silently tune tokenization to force agreement. A byte-identical input dataset and the original exact extraction/substitution implementation are required to establish whether the difference is due to data revision, tokenization, marker handling, or residual accounting.

## Interpretation

A literal match is evidence of a cross-representation correspondence only. It is not a proof that the observed form is a grammatical operand or that the rule is understood/executable. Residuals are data for subsequent classification, not automatic corrections.
