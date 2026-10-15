# Nirgundi method, after the architecture

Nirgundi is still the coverage loop. It is not a second grammar.

1. Freeze source forms. Sort by descending code-point length. Assign ids after the sort.
2. Match a whole token. The first equal form in that order wins. A shorter form does not match inside a longer token. `evam` does not match inside `devam`.
3. Keep the residual. It is the result of this pass, not a defect.

The next pass does not own a private rule list. It reads `data/nirgundi/all-sutras-converted.jsonl`, the structural conversion already produced from padaccheda, anuvrtti, and locative adhikara.

A vidhi may consume a residual token only when that converted record has executable provenance: an inherited term marked `source_annotation` or `gloss_confirms`, or an own pada licensed by 1.1.49, 1.1.66, or 1.1.67. An unconfirmed adhikara is not understanding and does not execute. 4.1.2 is in that state: its sup list is still a nominative, and its inherited adhikara is unconfirmed, so the cycle refuses it.

If two licensed vidhis compete for one token, 1.4.2 applies at that point: the later sutra wins. The loser is recorded, not deleted.

Then the loop returns to step 1. It stops when no licensed converted rule consumes anything.

Coverage counts rules that fired with that provenance. A propagated label is not coverage.
