# BUILD-0027 audit report

Baselines preserved:
- BUILD-0025: 4f158697bcd891053a21b1a9ecebf33f7d5261a7a0de53e553330f05d22f3c25
- BUILD-0026: 64bf96b15f8459b0ee6bf0326e8df656a67dab87c8e65e383e286cbdcc048ea5

## MW accounting

| disposition | count |
|---|---|
| source records | 287,432 |
| full conversion | 287,312 |
| rejected | 120 |
| omitted without reason | 0 |

The 120 rejections are unsupported Devanagari code points after the SLP1 → Devanagari step:

| code point | character | count |
|---|---|---|
| U+0933 | ळ | 92 |
| U+0960 | ॠ | 14 |
| U+0961 | ॡ | 8 |
| U+090C | ऌ | 6 |

These are not in the reconstructed Romenagri inventory. No record was dropped without a recorded reason.

Distinct SLP1 forms mapping to the same Romenagri form: 0.

## RV accounting

47 word occurrences across 5 verses.

| disposition | count |
|---|---|
| full | 36 |
| rejected | 9 |
| unchanged | 2 |

Rejections: 8 contain hyphen (U+002D), which the encoder does not map; 1 is `īḷe` (contains ऌ, U+090C). The two unchanged (`rayim`, `yam`) produced output equal to input.

The corpus is not fully converted. Nine occurrences remain rejected.

## Experiment

Regenerated against the converted inputs. Exact-token matching (whitespace-delimited), not substring.

| metric | value | definition |
|---|---|---|
| matched occurrences | 10 | exact token matches in the ledger |
| distinct matched IDs | 9 | unique inventory IDs in the ledger |
| matched code points | 50 | sum of (end − start) over ledger rows |
| corpus code points | 436 | length of the concatenated Romenagri corpus |
| RV word occurrences | 47 | original word count |

10/47 is the exact-token match rate on this five-verse sample. 50/436 is the code-point ratio on the concatenated converted corpus. Neither is lexical coverage. The before-conversion denominator was 341 (IAST); the after-conversion denominator is 436 (Romenagri). The percentages are not a controlled comparison.

Nirgundi matches exact surface forms. It does not analyse morphology or resolve inflection. MW headwords are citation forms; RV forms are inflected. That is why the match count is low.

## Tests

Conversion audit scripts executed as part of this report. Existing `tests/test_nirgundi_experiment.py`: 2 passed (BUILD-0025). No Nirgundi algorithm change.
