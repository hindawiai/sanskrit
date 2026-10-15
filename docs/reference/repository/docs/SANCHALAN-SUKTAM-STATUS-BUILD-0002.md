# Sanchalan Suktam: executable-lowering and lexical audit

**Build:** BUILD-0002  
**Source:** `lang/suktam/sanchalan.suktam` (22 numbered verses)  
**Method:** current checked-in `lang/suktam/suktam.js`, current checked-in lexicon/rules; fresh local run on 2026-10-13.

## Direct answer

- All **22/22 verse boundaries** are recognized and represented in generated C reporting data.
- **0/22 verses are lexically complete** under the current closed lexicon; **22/22 are lexically partial**.
- Current aggregate: **141 recognized lexicon nodes**, **814 residual Unicode code points**.
- The generated C is a report/IR program. It does **not** mean that all 22 verses are lowered into executable OS operations.
- The current parser does **not** implement general Sanskrit *sandhi-viccheda/padaccheda*, morphology, or chandas-aware parsing. It uses NFC normalization, numbered-verse framing, a longest-known-lexeme scan, and residual-span preservation. The one narrow visarga-related rule in the implementation is not a general sandhi engine.
- Keyword recognition is partial: recognized lexicon entries become nodes; unrecognized text remains residual and is not silently discarded or guessed.

## Per-verse measured status

| Verse | Recognized lexicon nodes | Residual code points | Lexical status |
|---:|---:|---:|---|
| 1 | 9 | 42 | LEXICALLY_PARTIAL |
| 2 | 4 | 63 | LEXICALLY_PARTIAL |
| 3 | 7 | 36 | LEXICALLY_PARTIAL |
| 4 | 7 | 28 | LEXICALLY_PARTIAL |
| 5 | 8 | 41 | LEXICALLY_PARTIAL |
| 6 | 7 | 38 | LEXICALLY_PARTIAL |
| 7 | 5 | 43 | LEXICALLY_PARTIAL |
| 8 | 6 | 34 | LEXICALLY_PARTIAL |
| 9 | 9 | 14 | LEXICALLY_PARTIAL |
| 10 | 9 | 29 | LEXICALLY_PARTIAL |
| 11 | 7 | 36 | LEXICALLY_PARTIAL |
| 12 | 5 | 44 | LEXICALLY_PARTIAL |
| 13 | 6 | 40 | LEXICALLY_PARTIAL |
| 14 | 7 | 40 | LEXICALLY_PARTIAL |
| 15 | 9 | 11 | LEXICALLY_PARTIAL |
| 16 | 5 | 34 | LEXICALLY_PARTIAL |
| 17 | 6 | 43 | LEXICALLY_PARTIAL |
| 18 | 3 | 58 | LEXICALLY_PARTIAL |
| 19 | 8 | 18 | LEXICALLY_PARTIAL |
| 20 | 4 | 37 | LEXICALLY_PARTIAL |
| 21 | 5 | 43 | LEXICALLY_PARTIAL |
| 22 | 5 | 42 | LEXICALLY_PARTIAL |

## Interpretation boundary

“Not working” has more than one possible meaning. On the available evidence, the defensible counts are: **22/22 verse frames parse; 22/22 remain lexically partial; 0/22 are demonstrated as complete semantic/executable programs.** This does not prove that all verses are semantically invalid; it means semantic lowering has not been implemented or established by these tests.

## Required next engineering stages

1. Keep the complete source string and exact code-point spans for every verse; do not reduce the input to an unordered keyword list.
2. Add a reversible *padaccheda/sandhi analysis* layer with candidate splits, source spans, rule/provenance IDs, and ambiguity preservation. Do not pretend one deterministic split is certain where it is not.
3. Separate chandas/metre analysis from lexical segmentation. Use Anuṣṭubh constraints as validation/diagnostics where applicable, not as a substitute for syntax.
4. Add a typed Sanskrit-facing AST/IR that maps recognized constructs to common backend operations; reject or quarantine unresolved constructs rather than emitting misleading executable code.
5. Generate C only for semantically typed/validated IR. Keep a distinct `lexical-report.c` target so report generation is never described as program execution.
6. Test the exact published Suktam source and every verse individually; report recognition, candidate segmentation, unresolved spans, type/semantic status, generated target status, and runtime result separately.
