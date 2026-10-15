# Transliteration collision and normalization audit — BUILD-0024

**Executable suite:** `python3 tools/transliteration/collision_tests.py`  
**Regression assertions:** `python3 tests/test_collision_audit.py -v`  
**Machine results:** `tools/transliteration/results/collisions.json` ([Pages mirror](research/romenagri/results/collisions.json))

## Method

The suite covers 36 deliberately selected minimal-pair, Unicode, punctuation, numeral, and pipeline cases across 12 schemes: Romenagri's reconstructed word-level profile, IAST, Harvard–Kyoto, SLP1, ITRANS, Velthuis, ISO 15919, ISO Vedic, WX, TITUS, Kolkata, and Optitrans.

The suite reports four separate outcomes:

1. **Encoding coverage:** whether the scheme returned an output or rejected the input.
2. **Exact round trip:** whether decoding returns the exact original Unicode code-point sequence.
3. **Native output collision:** whether distinct inputs successfully encode to the same output within one named scheme.
4. **Downstream-transform collision:** whether lowercasing, case-folding, diacritic stripping, Unicode normalization, or punctuation stripping collapses outputs that were distinct before that transform.

A pair of rejected inputs is **not** a collision. Unsupported input is counted as a coverage event. Canonically equivalent precomposed/decomposed Unicode forms are recorded separately from non-equivalent phonological collisions. Cross-scheme ambiguities are reported separately because the same roman string can mean different things when scheme identity is omitted.

The 36 cases produce 1,020 input/scheme evaluations (including repeated inputs used in separate diagnostic cases). These are designed adversarial vectors, not a random corpus and not a representative accuracy percentage.

## Results from the current run

| Scheme | Successful encodes | Rejections | Exact round trips | Cases with native collisions | Cases with downstream-transform collisions |
|---|---:|---:|---:|---:|---:|
| Romenagri word-level | 68 | 17 | 65 | 2 | 17 |
| IAST | 85 | 0 | 67 | 13 | 25 |
| Harvard–Kyoto | 85 | 0 | 68 | 13 | 24 |
| SLP1 | 85 | 0 | 76 | 4 | 11 |
| ITRANS | 85 | 0 | 68 | 12 | 25 |
| Velthuis | 85 | 0 | 69 | 12 | 24 |
| ISO 15919 | 85 | 0 | 69 | 11 | 26 |
| ISO Vedic | 85 | 0 | 69 | 11 | 26 |
| WX | 85 | 0 | 76 | 4 | 12 |
| TITUS | 85 | 0 | 75 | 4 | 17 |
| Kolkata | 85 | 0 | 67 | 13 | 25 |
| Optitrans | 85 | 0 | 68 | 13 | 24 |

These counts are counts of test-vector evaluations, not unique words or language coverage. A collision case may contain three or four inputs. A downstream-transform collision is not a native collision of the scheme; it demonstrates a hazard introduced by a later text-processing layer.

The audit found 634 cross-scheme same-string/different-decoding ambiguities in the complete comparison set. The JSON preserves a representative list capped at 200 records and records the uncapped count. Do not interpret 634 as 634 unique roman strings; the same output can recur in multiple diagnostic cases.

## Confirmed examples

### Aspirate versus consonant + halant + ह

| Inputs | IAST | HK | ITRANS | Romenagri word-level |
|---|---|---|---|---|
| छ / च्ह | `cha` / `cha` | `cha` / `cha` | distinct | `chha` / `ch_ha` |
| ख / क्ह | `kha` / `kha` | `kha` / `kha` | `kha` / `kha` | `kha` / `k_ha` |
| घ / ग्ह | `gha` / `gha` | `gha` / `gha` | `gha` / `gha` | `gha` / `g_ha` |
| थ / त्ह | `tha` / `tha` | `tha` / `tha` | `tha` / `tha` | `_tha` / `_t_ha` |
| झ / ज्ह | `jha` / `jha` | `jha` / `jha` | distinct | `jha` / `j_ha` |
| ध / द्ह | `dha` / `dha` | `dha` / `dha` | `dha` / `dha` | `_dha` / `_d_ha` |
| फ / प्ह | `pha` / `pha` | `pha` / `pha` | `pha` / `pha` | `pha` / `p_ha` |
| भ / ब्ह | `bha` / `bha` | `bha` / `bha` | `bha` / `bha` | `bha` / `b_ha` |
| श / स्ह | distinct | distinct | `sha` / `sha` | `sha` / `s_ha` |

The collisions are properties of the named romanization convention on these spellings. They do not mean IAST or HK is defective for its intended scholarly use; these schemes were not necessarily designed to preserve the distinction between an aspirated phoneme and an explicitly written consonant cluster in every arbitrary Devanagari input.

### Downstream transforms can destroy distinctions

- **SLP1 case folding:** `sa` (स) and `Sa` (श) collide after lowercasing.
- **IAST diacritic stripping:** `śa` (श) and `ṣa` (ष) both reduce to `sa`.
- **Romenagri punctuation stripping:** `kha` (ख) and `k_ha` (क्ह) become the same if `_` is removed. The underscore is semantic, not decoration.
- **Numeral normalization:** the Romenagri adapter maps `५` and `5` to `5`. This is a real exact-string collision if numeral-script identity must be preserved. It is consistent with the inherited `fixuninum` normalization, but it is not lossless.
- **Scheme identity:** `za` means श in HK and ष in SLP1. The scheme identifier is part of the decoding context.
- **Avagraha:** IAST, HK, and SLP1 produce `so'pi` for both `सोऽपि` and `सो'पि`; a literal apostrophe and the avagraha are not recoverable separately from that output.
- **Unicode canonical equivalence:** precomposed nukta letters and their canonically decomposed forms may produce the same roman string. The report labels these separately; exact code-point identity and linguistic equivalence are not the same metric.

### Coverage gaps are not collisions

The Romenagri word-level profile rejects the following tested inputs rather than guessing: Latin-source strings, extended candra vowels, nukta-bearing forms, Vedic accent marks, join controls, and some longer-vocalic forms. This is a front-end coverage limitation. It is not a collision unless two successfully encoded, distinct inputs map to the same output.

## Legacy C profile is a separate contract

BUILD-0023 added the upstream Chintamani/Romenagri C source. BUILD-0024 compiles and probes the core C functions directly. This matters because the word-level Python reconstruction and the native C parser do not use identical terminal-stem semantics.

Observed native C behavior:

- `rmn2acii("k ")` followed by `acii2rmn` returns `ka `.
- `rmn2acii("k^ ")` followed by `acii2rmn` returns `k `.
- `rmn2acii("chaee_t ")` followed by `acii2rmn` returns `chaee_ta `.
- `rmn2acii("sarwam ")`, `rmn2acii("paapam ")`, and `rmn2acii("_u_d_dhara_nnam ")` followed by `acii2rmn` return `sarwama `, `paapama `, and `_u_d_dhara_nnama ` respectively. These are the four strings in Grok’s report, run through the actual native C pair.
- `rmn2acii("chaee_t^ ")` followed by `acii2rmn` returns `chaee_t `.
- ACII byte `0xEB` decodes to `_3`, but feeding `_3` to the reverse parser yields `3 ` in the current source.

Therefore the C forward converter can represent a final virāma by emitting a bare stem, while the reverse parser interprets that bare stem as an inherent-vowel form unless the explicit caret is supplied. The native C run therefore reproduces a final inherent `a` when these *bare-stem strings* are supplied as input to `rmn2acii`; the explicit-caret forms are handled by the C parser. This is a **direction/profile compatibility boundary**, not evidence that the 2004 `acii2rmn` decoder simply strips a virāma. The reconstructed Python word-level profile intentionally maps a bare stem to terminal virāma; it must not be described as byte-for-byte or parser-equivalent to the legacy C pair.

The C core compiles and the direct-function probes pass. `make all` cannot complete in this environment because `flex` is unavailable, so the generated filter executables and complete upstream filter pipeline have not been built here.

## Interpretation boundary

These results test spelling-level injectivity, exact round trips, Unicode coverage, and downstream transformation hazards. They do not measure phonetic fidelity, lexical correctness, Sanskrit grammatical analysis, or universal language coverage. Those require separate datasets and metrics.

## Context-free Unicode inventory sweep

`python3 tools/transliteration/unicode_inventory_sweep.py` checks 309 individual code points across the Devanagari block, Vedic extensions, generic combining marks, join controls, selected punctuation, ASCII digits and Devanagari digits. It produces 3,708 code-point/scheme records in `results/unicode_inventory_sweep.csv` and duplicate-output groups in `results/unicode_inventory_collisions.csv`.

| Scheme | Encoded outputs | Unchanged Devanagari/mark pass-throughs | Explicit unresolved results | Exact code-point round trips in isolated probes |
|---|---:|---:|---:|---:|
| Romenagri word-level | 82 | 0 | 227 | 59 |
| IAST | 119 | 190 | 0 | 88 |
| Harvard–Kyoto | 114 | 195 | 0 | 86 |
| SLP1 | 114 | 195 | 0 | 86 |
| ITRANS | 116 | 193 | 0 | 89 |
| Velthuis | 110 | 199 | 0 | 83 |
| ISO 15919 | 122 | 187 | 0 | 92 |
| ISO Vedic | 122 | 187 | 0 | 91 |
| WX | 117 | 192 | 0 | 90 |
| TITUS | 122 | 187 | 0 | 91 |
| Kolkata | 119 | 190 | 0 | 90 |
| Optitrans | 121 | 188 | 0 | 92 |

These figures count single-code-point probes, not supported grapheme clusters. The sweep intentionally supplies combining marks and controls in isolation; an output that passes through unchanged is not counted as transliteration coverage. The 313 duplicate-output groups are context-free diagnostics and may reflect marks that require a base character or a scheme's expected input domain. They must be triaged before being described as defects on valid text.

## Timing of the adversarial vector workload

`tools/transliteration/benchmark_collisions.py` uses 3 warm-up rounds followed by 31 measured rounds, with the same 85 input occurrences per round for every scheme. The CSV records Python/platform metadata, encode and encode+decode median/p95 latency, and the number of accepted/rejected inputs. These are adapter microbenchmarks on a small adversarial workload, not comparable to a representative corpus benchmark.

| Scheme | Encode median µs/input | Encode p95 | Encode+decode median µs/input | Encode+decode p95 | Accepted / rejected |
|---|---:|---:|---:|---:|---:|
| Romenagri word-level | 1.926 | 7.570 | 40.948 | 57.374 | 68 / 17 |
| IAST | 25.024 | 54.346 | 61.902 | 122.699 | 85 / 0 |
| Harvard–Kyoto | 6.204 | 12.452 | 12.442 | 23.511 | 85 / 0 |
| SLP1 | 6.661 | 13.752 | 14.210 | 26.477 | 85 / 0 |
| ITRANS | 16.857 | 33.231 | 45.493 | 63.676 | 85 / 0 |
| Velthuis | 7.020 | 16.833 | 12.638 | 32.256 | 85 / 0 |
| ISO 15919 | 20.422 | 35.385 | 56.942 | 79.935 | 85 / 0 |
| ISO Vedic | 20.205 | 32.956 | 53.204 | 66.470 | 85 / 0 |
| WX | 21.307 | 42.791 | 45.714 | 67.481 | 85 / 0 |
| TITUS | 21.856 | 37.171 | 57.596 | 128.206 | 85 / 0 |
| Kolkata | 20.565 | 26.458 | 58.611 | 89.515 | 85 / 0 |
| Optitrans | 20.706 | 29.950 | 45.592 | 62.046 | 85 / 0 |

The accepted/rejected counts matter when interpreting latency: Romenagri rejects 17 of the 85 inputs rather than spending time encoding them. The table is therefore a runtime profile of this interface and input set, not an overall performance ranking.

## Numeral round-trip diagnostics

The separately rerun `tools/transliteration/numeral_compare.py` shows:

- Romenagri preserves ASCII digits (`36 → 36`) but normalizes Devanagari digits (`३६ → 36`), so the original numeral script cannot be recovered.
- IAST, HK, SLP1, ITRANS and Velthuis preserve Devanagari digit input through a round trip, but ASCII digits return as Devanagari digits (`36 → ३६`).
- In mixed text, the same distinction appears: `अध्याय ३` round-trips exactly in those five FOSS schemes, while the Romenagri profile returns `अध्याय 3`.

This is not inherently a phonological failure. It is a document-preservation policy decision that must be explicit.
