# Romenagri source lineage and integration boundary

Source project: https://github.com/project-ilm/romenagri (extracted from the `hindawiai/chintamani` lineage).
Audited source files: `src/acii.h`, `src/rmn2acii.c`, `src/acii2rmn.c`, `src/unicode.h`, `src/uni2acii.c`, and `src/acii2uni.c`.

This directory records the integration boundary and source lineage. The Pushkalāvatī adapter in `src/romenagri.js` is a separately written, testable JavaScript bridge; it does not pretend to be a line-by-line port of the legacy C parser. The original Romenagri C implementation should remain the reference for byte-level compatibility tests when the full upstream source is vendored.

The audited ACII table has `ACII_LEN 84` entries. It maps multi-character keys such as `ka`, `kha`, `_a`, `^aa`, `_ri`, `^_ri`, `^za`, and `_3` to legacy single-byte codes (some entries are multi-byte strings). `unicode.h` maps 73 legacy codes to UTF-16 code-unit pairs, predominantly Devanagari U+0901–U+0979. These are legacy code-page tables, not UTF-8 mappings.

Important source-observed constraints:
- `^a` maps to the empty string in `acii.h`; the source itself documents an empty-match bug.
- `uni2acii.c` reads input in two-byte pairs, treats them as legacy UTF-16LE-like units, and falls back to writing the first byte for unmapped values. It is not a safe general UTF-8 Unicode decoder.
- `rmn2acii.c` has a `lookup()` path that returns `NULL` for unknown keys, with a source comment warning this can cause a segmentation fault.
- The table mixes Sanskrit-relevant entries with Hindi/Perso-Arabic lineage and legacy conventions. Coverage must be explicit; unsupported phonemes are not silently approximated.

License: the upstream Romenagri sources state GPL v2 or later. See upstream repository for the full license text. Pushkalāvatī's GPL-3.0-only project license is compatible with GPLv2-or-later components only when the selected upstream version's licensing and distribution conditions are verified; preserve the original notices when vendoring upstream code.
