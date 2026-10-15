# Nirgundi baseline

This is the first executable spine for the specified Nirgundi experiment, not a completed traditional lexicon.

## Input contract

Pass a corpus string and an iterable of `(source_id, form)` pairs. The source inventory must be curated; this module does not claim to discover or translate traditional lexeme sets.

## Algorithm

1. Sort lexeme forms by descending string length; preserve input order for equal lengths.
2. Assign integer IDs after sorting.
3. Sequentially replace literal occurrences with protected ID markers.
4. Return the transformed corpus, actual replacement occurrences with original offsets, and exact residual.

Duplicate surface forms are rejected rather than silently assigned arbitrary precedence. Decide source precedence or run each source inventory separately before combining overlapping inventories.

No Unicode normalization, tokenization, morphology, sandhi reversal, compound splitting, or fuzzy matching is applied. The exact input string is the experimental surface.

## Run tests

From repository root:

```sh
python3 -m unittest tests/test_nirgundi_baseline.py -v
```

## Not yet included

- a validated inventory assembled from traditional sources;
- corpus-scale run configuration and reproducible run manifest;
- export formats for the full mapping/occurrence/residual reports;
- evaluation against a curated gold set.
