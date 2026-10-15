# Nirgundi run — what was actually executed

Date: 2026-10-09. Method: existing `nirgundi/baseline.py`, unchanged.

## Corpus

`data/corpus_rv_1.1.json`. Five verses, Rigveda 1.1 padapatha, 47 words, IAST. GRETIL / Sansknet, CC BY-NC-SA 4.0. This is the only Sanskrit corpus in the repository. It is not a mandala and not a complete Vedic corpus.

Declared view `words`: the `words` arrays joined by spaces and newlines. That is a decode of the JSON fields, not a linguistic normalization. Code points: 341.

## Inventory

Cologne Digital Sanskrit Dictionaries, `csl-orig` `v02/mw/mw.txt`, retrieved this run.

- SHA-256: `555ecf5aadaaf21e5965d6b3b419f428fc9ab9237f563627001ceca468d0cff8`
- Bytes: 50,163,993
- Licence: CC BY-SA 4.0
- Extracted k1 headwords, no transliteration: 286,525 records, 194,083 unique forms
- Script: SLP1, as written in the source
- Duplicate policy: every source record kept; replacement uses the first exact surface form. 92,442 later duplicate records are in the crosswalk.

Nighantu XML, Amarakosha transcription, GRETIL Nirukta, and e-Nighantu were not retrieved. They are not in this inventory. See `docs/nirgundi/source-gaps.md`.

## Result

Literal search-and-replace, longest form first, integer ids assigned after sorting.

- Matched occurrences: 74
- Distinct ids that matched: 52
- Matched code points: 215 (63.05% of 341)
- Unmatched code points: 126 (36.95%)
- Residual file: `experiments/nirgundi/rv11-words/residual.txt`

This percentage is not lexical coverage of Sanskrit. SLP1 and IAST share ASCII letters, so headwords such as `a`, `i`, `e`, `agni`, `ratna` match substrings of IAST words. `evam` matched inside `devam`. Diacritics (`ī`, `ṛ`, `ḥ`, `ñ`) remain in the residual. No transliteration was applied. A script-aligned run is a separate experiment and was not done.

## 3,983 sutras

`scripts/nirgundi/expand_all_sutras.py` converted every record in `data/sutras.json`.

- 3,983 records written to `data/nirgundi/all-sutras-converted.jsonl`
- 3,971 have a parsed padaccheda
- 74 single-locative adhikara headings
- 9,318 executable inherited terms, 3,828 unconfirmed
- 1.1.3 inherits वृद्धिः and गुणः from the anuvrtti field
- 1.4.24 inherits कारके, gloss-confirmed
- 8.4.68 is included

This is a structural skeleton (case role, anuvrtti copy, locative scope). It is not a derivation of each rule and does not close the morphological analyzer.

## Fix, 2026-10-09

The first run used substring replacement. `evam` matched inside `devam`. That was wrong.

The baseline now sorts by descending length, assigns ids after the sort, and replaces only when the lexeme equals the whole whitespace-delimited token. The first exact form in that order wins. A shorter form cannot match inside a longer token. `devam` is not an MW k1 form, so it stays residual. `evam` matches only where it is the token.

Rerun: 6 whole-token matches, 17 code points, 324 unmatched. Residual is the padapatha with those six tokens removed.
