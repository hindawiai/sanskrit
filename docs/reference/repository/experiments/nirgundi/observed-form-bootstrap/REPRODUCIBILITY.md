# Observed-form bootstrap — reproducibility report

This experiment cross-matches forms observed in the corpus annotations against each sūtra's compact `sutra` field. It is not a grammatical interpretation.

## Results

- **source records:** 3983
- **distinct observed forms:** 6248
- **records with at least one literal match:** 3981
- **records without literal match:** 2
- **substitution occurrences:** 19283
- **distinct residual tokens:** 2483
- **residual token occurrences:** 3217
- **sutra code points:** 73356
- **covered code points estimate:** 50031
- **character coverage estimate percent:** 68.2

## Method contract

Split term, padaccheda, gloss, and anuvrtti[].term on whitespace, danda, double danda, comma, and semicolon; no transliteration or Unicode normalization.

Exact literal string replacement in sutra field, forms ordered by descending code-point length then lexical order; already replaced text is protected by integer markers.

## Interpretation boundary

A literal match means only that an observed annotation token occurs in the sūtra text. It does not establish that the token is a grammatical operand, that the sūtra is understood, or that a rule is executable. Residuals are preserved without morphology, sandhi, fuzzy matching, or automatic correction.

Source SHA-256: `7b3d6a62aa0ec51ce21fdd9e4d0f876b688ff9c90de18a6d5685fe812ff23342`
