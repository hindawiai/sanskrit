# Archive comparison and Romenagri integration

## Chosen merge

Baseline: `pushkalavati-rule-12-6.1.94-2026-10-11.zip`.
Selective additions: inverse-reduction work from `pushkalavati-inverse-reduction-organised.zip`.

Why: the rule-12 archive has 12 `executable_tested` operations, including 6.1.94, and passes the compiler test suite. The inverse-reduction archive has 11 executable operations and lacks 6.1.94, but provides the organised inverse-reduction CLI/Python entry and benchmark material. Therefore the second archive is a source for selective inverse-reduction additions, not the replacement baseline.

## Romenagri sound-table audit

The source `src/acii.h` declares 84 entries. The first entry is a control sentinel; remaining entries are legacy transliteration key-to-byte strings. `src/unicode.h` declares 73 byte-to-UTF-16-unit mappings. The table is not a one-to-one Sanskrit phoneme inventory: it contains syllabic/consonant-with-inherent-vowel keys (`ka`, `kha`, `ta`), independent-vowel and matra keys (`_a`, `^aa`), legacy conventions (`_m`, `_hh`, `_3`), and multi-byte compounds (`kxa`, `_tra`).

The bridge currently distinguishes two layers:

1. Canonical sound tokens used by the rule executor (`ai`, `au`, `ā`, `ṭ`, `ṣ`, etc.).
2. Audited ACII table keys for only those tokens with a defensible key mapping.

This is deliberate: the legacy ACII table is not used to fabricate a key for a sound it does not encode distinctly. `ṝ`, `ḷ`, and `ḹ` are tokenizable but remain `UNRESOLVED` for ACII-key encoding. An empty `^a` mapping, the legacy UTF-16LE-like converter, and unsafe unknown-key lookup are explicitly tracked.

## Integration status boundary

The context-bearing sandhi executor now tokenizes inputs into the Romenagri-aligned sound-token layer before applying 6.1.78, 6.1.94, and 6.1.109. The public input/output remains IAST for compatibility with existing examples and IR. This is an incremental substrate migration, not yet a byte-for-byte replacement of the full legacy C converter. Native Devanagari span-preserving tokenization and differential tests against the upstream C binaries remain follow-up work.
