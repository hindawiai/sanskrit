# Sutra categories, from Tajziya

Source: `zistgah/tajziya`, `modules/cls/data/ashtadhyayi/sutraani.tsv`. Upstream is the data that powers ashtadhyayi.com, free to use with credit. Text is cross-checked there against vidyut-prakriya's MIT sutrapatha. All 3983 ids match this tree.

| type | count | what it is |
|---|---|---|
| vidhi | 3629 | operational rules |
| samjna | 200 | technical names |
| atidesha | 67 | transfer of a name or operation |
| adhikara | 64 | scope headings |
| paribhasha | 23 | meta-rules |

The non-empty `type_name` values name the samjna and paribhasha groups: nipata (43), karaka (33), kit-atidesha (13), sarvanama (10), pragrihya (9), and the rest. Full rows are in `data/sutra-categories.jsonl`.

This is classification. It is not execution. A vidhi row is not an executable rule.

# Dhatupatha

Ingested from `ambuda-org/vidyut`, `vidyut-prakriya/data/dhatupatha.tsv`, MIT. 2259 roots, columns `code`, `dhatu`, `artha`. File: `data/external/vidyut-dhatupatha.tsv`.

# Vidyut-prakriya, what it actually has

Vidyut is a word generator. It implements more than 2000 rules of the Ashtadhyayi, plus about 500 Unadi and about 50 Linga rules, per the ISCLS 2024 paper. It generates tinanta, krdanta, taddhitanta, and subanta, with partial samasa and accent. It is MIT.

It does not select rules dynamically. It applies them in a fixed procedural order. A derivation is a `Prakriya` of `Term`s. Each term carries tags from anubandha removal.

Its modules, and the roles they cover:

| module | role |
|---|---|
| it_samjna | 1.3.2–1.3.9, anubandha removal |
| dhatupatha | root list |
| dhatu_karya | root setup, prefixes |
| vikarana | 3.1.33–3.1.90, thematic suffixes |
| krt | 3.1.91+, primary suffixes |
| taddhita | 4.1.76+, secondary suffixes |
| tin_pratyaya | verbal endings |
| sup_karya | nominal endings |
| angasya | 6.4.1, stem operations |
| ac_sandhi | 6.1.66–6.1.127, vowel sandhi |
| tripadi | 8.2–8.4, final sandhi |
| samasa | compounds |
| stritva | feminine |
| sanadi | desiderative and related |
| samjna | technical names |
| atidesha | transfer |

What this tree has that Vidyut does not: a programming-language front end, a Suktam, a first-prompt kernel, Hindawi ports. What Vidyut has that this tree does not: a derivation engine that can produce a word and list the rules that made it.
