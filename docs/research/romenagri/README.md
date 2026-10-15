# Romenagri / Pushkalāvatī research bundle — BUILD-0024

BUILD-0024 preserves the 84-entry inherited Romenagri ACII table, the compiler-side per-sound/table-key audit, the Rahnuma-derived Python word-level profile, and the native Chintamani/Romenagri C implementation as distinct layers. It adds direct native C probes, a 36-case collision suite across 12 schemes, a 309-code-point Unicode sweep, per-scheme timing results, a complete BUILD-0017 → BUILD-0023 → BUILD-0024 file/mode manifest, and a research strategy for reproducible evaluation.

## Current dossier and reports

- [Combined Pāṇinian and Romenagri dossier — BUILD-0024](Romenagri_Phoneme_Manipulation_and_Panini_Dossier_BUILD-0024_COMBINED_2026-10-14.md)
- [BUILD-0023 source correlation and omissions](../../BUILD-0023-CORRELATION.md)
- [Collision and normalization audit](../../COLLISIONS.md)
- [Research and reproducibility strategy](../../TRANSLITERATION_RESEARCH_STRATEGY.md)
- [BUILD-0024 test report](../../BUILD-0024_TEST_REPORT.md)
- [Full integrated test log](../../BUILD-0024_TEST_LOG.txt)
The complete file-level comparison is recorded in the repository-root `BUILD-0024_FILE_CHANGE_MANIFEST.csv`; the root `BUILD-0024-MANIFEST.csv` records build metadata and the file-manifest hash. Both are included in the BUILD-0024 archive.

## Machine-readable collision and timing artifacts

- [Collision cases and per-scheme round trips](results/collisions.json)
- [Unicode code-point sweep](results/unicode_inventory_sweep.csv)
- [Context-free duplicate-output groups](results/unicode_inventory_collisions.csv)
- [31-round per-scheme benchmark](results/collision_benchmark.csv)
- [Numeral round-trip diagnostics](results/numerals.json)
- [13-case attested fixture timings/results](results/transliteration.json)

## Historical records retained

- [BUILD-0017 dossier](Romenagri_Phoneme_Manipulation_and_Panini_Dossier_BUILD-0017_COMBINED_2026-10-14.md)
- [BUILD-0016 dossier](Romenagri_Phoneme_Manipulation_and_Panini_Dossier_BUILD-0016_COMBINED_2026-10-14.md)
- [BUILD-0016 84-token inventory](Romenagri_84_Token_Inventory_BUILD-0016_CORRELATED_2026-10-14.csv)
- [BUILD-0016 Devanagari ↔ ACII ↔ Romenagri trace matrix](Romenagri_Devanagari_ACII_Romenagri_Trace_Matrix_BUILD-0016_2026-10-14.csv)

The strict word-level encoder remains strict. The opt-in `romenagri_document.py` wrapper uses reversible Unicode escapes for unsupported characters. Neither the wrapper nor the per-sound compiler bridge is a substitute for native C compatibility testing. The native C core probes pass; full filter generation remains blocked by unavailable `flex`.
