# Hindawi filters

## `fltr_hi_he.py`

A provisional Hindi-Devanagari-to-Hebrew-script filter. Its review table is `hi_he_map.csv` with columns `source_grapheme,target_sequence,status,notes`.

Run:

```sh
python3 lang/hindawi/filters/fltr_hi_he.py input.txt
cat input.txt | python3 lang/hindawi/filters/fltr_hi_he.py
```

The filter uses longest-grapheme matching, preserves unmapped input, and reports unmapped non-ASCII code points to standard error. The table is for manual audit. It is not an approved standard, is not a Hebrew translation, and is not guaranteed reversible. Keep the original source unchanged.

## Existing Romenagri filters

Use the original upstream `fltr_hi_ur`, `fltr_ur_hi`, and other relevant filters from the vendored Romenagri tree. `scripts/romenagri_perso_arabic_filter.sh` intentionally locates and executes the canonical upstream filter rather than reproducing its rules. If the upstream source is absent or ambiguous, the wrapper fails rather than using a homemade replacement.

Urdu, Persian/Farsi, Arabic, Shahmukhi Punjabi, Sindhi and Kashmiri require separate evidence-backed profile paths. A shared script does not imply identical orthography or a single reversible mapping.
