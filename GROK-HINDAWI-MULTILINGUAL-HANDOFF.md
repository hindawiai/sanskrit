# Grok handoff: extend existing Hindawi architecture

## Hard constraints

- Preserve the user's existing Hindawi/HPS/Romenagri method and repository conventions.
- Do not create a parallel compiler or replace the method with a generic token-aware lexer.
- Do not use JSON for the new language, keyword, filter, or source-map tables. Use CSV.
- Do not recreate existing `fltr_*` rules. Obtain and call the upstream filters.
- Keep Hindi C and Sanskrit C in separate source/vocabulary directories over the same existing compiler pipeline.
- Preserve original symbols and verify low-level debugging against the actual compiler/debugger.
- QEMU is out of scope for the current non-QEMU verification request.

## Current patch state

- `lang/hindawi/languages/registry.csv` is the profile inventory.
- `lang/hindawi/keywords/sa/keywords.csv` is a provisional Sanskrit vocabulary/review table, not an executable translator.
- `lang/hindawi/filters/hi_he_map.csv` is the provisional Hindi-to-Hebrew review table.
- `lang/hindawi/filters/fltr_hi_he.py` reads that CSV and reports unmapped characters.
- The prior JSON-driven token translator was removed because it did not follow the user's established architecture.
- Existing `scripts/romenagri_perso_arabic_filter.sh` remains the upstream-filter wrapper; it must use the actual vendored `fltr_ur_hi` filter and fail closed if absent or ambiguous.

## Required next actions

1. Inspect the actual repository and recover the upstream Romenagri/Chintamani source. Pin commit hashes.
2. Locate and inspect the actual `fltr_hi_ur`, `fltr_ur_hi`, Hindi keyword inventories, `gurucc`, `h2c`, `c2h`, and conversion tables.
3. Test the original Hindi pipeline before changes and preserve golden outputs.
4. Derive the Sanskrit vocabulary from the existing Hindi inventory and project conventions; review each Sanskrit spelling. Integrate through the existing mechanism, not through a replacement translator.
5. Test both Hindi and Sanskrit source files through the real toolchain: filters, conversion, compile, link, runtime and diagnostics.
6. Extend the existing filters for Urdu, Farsi, Arabic, Shahmukhi, Sindhi, Kashmiri and other requested languages only where the upstream method supports them. Maintain separate CSV records for language/script-specific differences.
7. Audit `hi_he_map.csv` manually with the user. Do not describe it as an approved standard.
8. Test original-symbol debugging with GDB or the actual supported debugger: breakpoints, stepping, locals, diagnostics and stack traces.
9. Run `bash scripts/test_all.sh` and targeted CSV/filter tests. Capture all logs. Report passed, failed, skipped and blocked separately.

## Verification boundary

The new CSV/filter tests can be run locally, but the actual Hindawi compiler and original filters are not included in this archive. Do not claim that Sanskrit C or all listed language ports compile until the real upstream toolchain has been built and exercised.
