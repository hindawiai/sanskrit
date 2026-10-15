# BUILD-0027 correction report

## īḷe

Confirmed defect. `indic_transliteration` maps IAST `ḷ` to the independent vowel `ऌ` (U+090C). In RV 1.1.1 `īḷe` the `ḷ` is the retroflex lateral consonant. Correct intermediate is `ईळे` (U+0908 U+0933 U+0947).

Correction added at `scripts/conversion/iast_devanagari.py`. It post-processes the library output: `ऌ` + vowel-letter becomes `ळ` + matra. The library is unchanged.

After correction: Devanagari is `ईळे`. Romenagri encode rejects it because `ळ` (U+0933) is not in the reconstructed inventory. The word is retained in IAST in the experiment corpus. Status: rejected, retained as IAST. Reason: unmapped codepoint U+0933.

## rayim and yam

Both fully converted. Intermediate Devanagari is `रयिम्` and `यम्`. Final Romenagri equals the source IAST spelling. Disposition is `full`, with reason `output equals source spelling`. Output equality is not treated as skipped conversion.

## Rejected RV words

Nine occurrences rejected. Eight contain hyphen (U+002D). One is `īḷe` (contains `ळ`). All nine are retained as original IAST in `data/corpus_rv_1.1_romenagri.json`. None discarded.

## Regenerated match result

Unchanged: 10 matched occurrences, 9 distinct inventory IDs, 50/436 code points. All 10 matches are on fully converted tokens. No match involves a retained-IAST token.

## MW

Unchanged: 287,432 source, 287,312 converted, 120 rejected (ळ 92, ॠ 14, ॡ 8, ऌ 6).
