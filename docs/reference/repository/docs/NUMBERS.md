# What the numbers mean

These are not one number. Each build reports several, and they measure different things.

## executable_tested

How many of the 3983 sutras have a handler that was run against an attested example and produced the expected output. Serialization is not execution. A sutra in the IR is not an executable rule.

| Build | executable_tested | What was added |
|---|---|---|
| BUILD-0002 | 15 | Phonological substitutions over the closed sound inventory, after 8.3.34 and 8.4.40 were split |
| BUILD-0003 | 16 | 6.1.66, lopa of v or y before a val consonant |
| BUILD-0004 | 17 | 8.4.41, dental s to ṣ before retroflex ṭ |
| BUILD-0005 | 18 | 8.3.23, final m to anusvara before a consonant |
| BUILD-0006 | 19 | 8.4.58, anusvara to the class nasal of the following stop |
| BUILD-0007 | 19 | No new rule. Residual driven to zero by deferred lexicon entries |
| BUILD-0008 | 19 | No new rule. Library boot |
| BUILD-0009 | 19 | No new rule. First-prompt kernel |
| BUILD-0010 | 20 | 8.4.55, final g to k before unvoiced k, closed to that pair |

The other counts in the compiler report are classification, not execution:

- `definition_resolved`: sound-class definitions the meta-cycle expanded
- `meta_rule`: paribhasha and policy, not rewrites
- `needs_semantic_annotation`: the compiler cannot yet say what the sutra does
- `blocked_unresolved_class`: a substitution shape was seen, but a class in it is not resolved
- `derivable_untested`: a candidate exists and has not been run against an example

## Suktam residual and recognized nodes

Residual is unmatched code points in the 22 verses after the lexical scan. Recognized nodes are lexicon hits.

| Build | recognized nodes | residual code points |
|---|---|---|
| BUILD-0002 | 141 | 814 |
| BUILD-0003 | 159 | 655 |
| BUILD-0004 | 186 | 428 |
| BUILD-0005 | 212 | 271 |
| BUILD-0006 | 215 | 256 |
| BUILD-0007 and after | 286 | 0 |

## What residual zero means

It means every span in this one source is in the closed lexicon. The scanner was corrected to longest-match. The leftover spans, including the title and sandhi fragments, were added as `residual` / `deferred`.

It does not mean the verses were grammatically parsed. It does not mean sandhi-viccheda ran. It does not mean morphology or chanda ran. It does not mean the operations were executed as an operating system. Unknown text outside this source is still kept. A deferred span is recognized and not run.
