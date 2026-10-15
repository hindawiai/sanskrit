# Conjuncts and collisions

## What was tested

619 unique Devanagari forms: every consonant with virama, with inherent vowel, and with each matra; plus two-consonant combinations (conjunct, conjunct+ā, and inherent-a between).

| scheme | forms | failed to encode | colliding outputs |
|---|---|---|---|
| romenagri | 619 | 0 | 0 |
| IAST | 677 | 0 | 0 |
| Harvard-Kyoto | 677 | 0 | 0 |
| SLP1 | 677 | 0 | 0 |

On this set, none of the schemes collide. A diacritic scheme achieves injectivity by assigning a distinct symbol or symbol sequence to each distinction. That is a substitution table.

## Where the schemes differ

**Alphabet.** The reconstructed Romenagri word-level profile uses an ASCII-oriented token alphabet for its core letters, with `_` carrying structural meaning; the wider legacy table also has punctuation/control conventions. IAST emits `ā ī ū ṛ ṝ ḷ ṃ ḥ ṅ ñ ṭ ḍ ṇ ś ṣ`. Those code points are not valid in a C identifier, a POSIX shell variable, or a filename on a non-Unicode filesystem. Harvard-Kyoto and SLP1 are ASCII, but they were not constrained by a compiler’s identifier grammar.

**Virama encoding — profile boundary.** The Rahnuma-derived Python word-level adapter encodes `क्` as `k` and decodes bare `k` as `क्`. The native C pair is direction-sensitive: `acii2rmn` emits a bare stem when its ACII input contains halant, but `rmn2acii` parses bare `k` as the inherent-vowel form `ka`; `k^` is needed to express the halant explicitly on the reverse-parser input. Thus the reconstructed word-level adapter is not byte-for-byte/parser-equivalent to the legacy C implementation. See `docs/COLLISIONS.md` and the C probes in `tests/test_legacy_romenagri.c`.

**Conjunct encoding.** `क्त` is `k_ta` in Romenagri, `kta` in IAST, `kta` in Harvard-Kyoto, `kta` in SLP1. `कट` is `kata`, `kaṭa`, `kaTa`, `kawa` respectively. No collision in any scheme. The Romenagri form uses the same stem rule as the single-consonant case; it does not add a special conjunct symbol.

**What the diacritic schemes do not provide.** A Devanagari-to-Latin-with-diacritics table may suffice for scholarly transcription, but it does not by itself specify compiler-safe tokenization, exact round-trip behavior, unsupported-input handling, or compatibility with a native filter pipeline. The reconstructed word-level profile’s constraints — identifier-safe core alphabet, terminal-stem convention, dental/retroflex by underscore placement, no diacritics — are the part that is not a substitution table. The legacy C parser has a different directional contract for terminal stems; do not merge those claims.

## Exact outputs on the tested pairs

| Devanagari | romenagri | IAST | HK | SLP1 |
|---|---|---|---|---|
| क् / क | k / ka | k / ka | k / ka | k / ka |
| क्त / कट | k_ta / kata | kta / kaṭa | kta / kaTa | kta / kawa |
| स्त्र / स्तर | s_tra / s_tara | stra / stara | stra / stara | stra / stara |
| ज्ञ / ज्न | j_yna / jna | jña / jna | jJa / jna | jYa / jna |
| क्ष / क्श | kxa / ksha | kṣa / kśa | kSa / kza | kza / kSa |
| त्र / तर | _tra / _tara | tra / tara | tra / tara | tra / tara |
| न्त / नत | n_ta / na_ta | nta / nata | nta / nata | nta / nata |
| श्च / शच | shcha / shacha | śca / śaca | zca / zaca | Sca / Saca |

No scheme collides on these curated pairs. The diacritic schemes distinguish them by adding a mark or a capital. The reconstructed Romenagri word-level profile distinguishes them with its stem and underscore conventions. This result is bounded to these test vectors and this profile; it is not evidence of native C round-trip parity. See `docs/COLLISIONS.md` for adversarial collisions and normalization hazards.
