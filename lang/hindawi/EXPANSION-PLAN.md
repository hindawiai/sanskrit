# Hindawi multilingual integration — canonical architecture

## Preserve the three-axis architecture

The authoritative source is the existing Romenagri/HPS project, not a parallel translator:

1. **Script projection:** `tables/*_to_deva.tsv` projects a writing system to the Devanagari hub.
2. **Language vocabulary:** `langspec/data/lang_<code>.csv` binds language-specific native keywords to canonical construct IDs and Romenagri spellings.
3. **Construct semantics:** `langspec/data/keyword_ontology.csv` and the standard-generation layer bind constructs to the target language/compiler paradigm.

For the Perso-Arabic family, the original Chintamani `fltr_hi_ur` / `fltr_ur_hi` pair is a seed path, not a universal substitute for every language's orthography. Urdu, Persian/Farsi, Arabic, Shahmukhi Punjabi, Sindhi and Kashmiri need their own language/script profile and reviewed residual rules. Do not collapse Urdu into Hindi, Persian into Arabic, or Punjabi Gurmukhi into Shahmukhi.

## Canonical upstream inputs

- Romenagri: `https://github.com/project-ilm/romenagri`
- Language registry: `langspec/data/language_registry.csv`
- Language keyword inventories: `langspec/data/lang_*.csv`
- Construct ontology: `langspec/data/keyword_ontology.csv`
- Script projection tables: `tables/*_to_deva.tsv`
- Romenagri generators: `langspec/generator/`
- Legacy filters: the original Chintamani `fltr_hi_ur`, `fltr_ur_hi` and related tools.

The live Romenagri repository currently declares 68 language profiles and 201 constructs. The script-table files must still be checked for actual mapping records: a file that exists but contains only a comment is not an operational transliterator. Likewise, rows marked `romenagri_pending_*` are unfinished keyword profiles, not completed ports.

## New audit integration

Run the audit against the actual checkouts:

```sh
python3 scripts/hindawi_language_port_audit.py \
  --romenagri-root /path/to/romenagri \
  --chintamani-root /path/to/chintamani \
  --output build/hindawi-language-port-audit.csv
```

For a release gate, add `--strict`. It exits nonzero if profiles remain unverified. The report is CSV and records, per language, the canonical source files, keyword row count, pending rows, invalid Romenagri identifiers, script-table mapping count, discovered original filter pair and explicit status.

Statuses intentionally distinguish missing data, pending vocabulary, empty projection tables, available base filters with missing language-specific overlay, and keyword inventories awaiting compiler conformance. No status is promoted to `supported` merely because a registry row or file exists.

## Source-symbol debugging invariant

Never overwrite source. Preserve the exact original-language source file and compiler diagnostics. Any transformation used for compilation must retain a deterministic reversible path to original source coordinates and symbol spellings. Before claiming low-level source debugging, test actual compiler debug information, breakpoints, stepping, locals, macro expansion and error locations with the upstream toolchain. A transliteration round trip alone does not prove debugger fidelity.

## Current boundary

This repository archive does not contain a complete Chintamani/Romenagri checkout. The audit tool is implemented and tested against synthetic fixtures, but the real 68-language source tree has not been vendored into this offline environment. Therefore the archive does not claim that all language/script ports compile or that the existing script projection tables are complete. Run the audit on the canonical checkout and treat its CSV output as the next evidence-based worklist.
