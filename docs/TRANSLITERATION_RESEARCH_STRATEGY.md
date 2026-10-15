# Research strategy: evaluate transliteration as an engineering system

## Objective

The goal is not to claim that every existing transliteration scheme is defective, nor to argue that a lookup table is intrinsically complex. The goal is to specify and measure the requirements of a transliteration layer when it must function as a compiler-facing representation, a language-port substrate, a document format, and a research artifact.

The correct response to “this is simple” is a reproducible experiment with explicit contracts—not an appeal to prestige, implementation age, or rhetorical force.

## 1. State the contract before comparing schemes

Evaluate each scheme against separate requirements:

1. **Phonological/orthographic distinctions:** which contrasts must remain distinguishable?
2. **Exact reversibility:** does decode(encode(x)) reproduce the same Unicode code-point sequence?
3. **Canonical equivalence:** are NFC/NFD or precomposed/decomposed forms allowed to normalize?
4. **Coverage:** which code points, combining sequences, controls, punctuation and scripts are accepted?
5. **Rejection semantics:** are unsupported inputs rejected with location and code point, preserved losslessly, or silently dropped?
6. **Identifier safety:** can outputs pass through the intended lexer, shell, filesystem, database and linker without altering semantic markers?
7. **Context preservation:** does the encoded data retain the scheme identity and options required to decode it?
8. **Native compatibility:** does the implementation match the actual upstream C filters and their parser states, not just a reconstructed adapter?
9. **Performance:** what are median/p95 latency, throughput, allocation/size cost and worst-case behavior?
10. **Provenance:** which exact implementation, revision, license, corpus and command produced each result?

No single score should collapse these dimensions.

## 2. Establish reproducible baselines

Use the same pinned corpus and input sequence for every scheme. Record:

- source corpus and license;
- Unicode version and normalization policy;
- scheme/library name and exact revision;
- command line, runtime version and environment;
- raw input code points, encoded output, decoded output, and status;
- exact-match, canonical-normalized-match, and word-core-match fields;
- unsupported code points and failure location;
- per-stage timings, not only a combined total.

Keep attested examples separate from adversarial minimal pairs and natural-text corpora. The 36-case BUILD-0024 collision set is an adversarial suite; it is not a random sample and must not be presented as a language-wide accuracy estimate.

## 3. Expand the test space systematically

### A. Minimal pairs

- aspirate versus consonant + virāma + ह;
- dental versus retroflex stops and nasals;
- श / ष / स;
- ऋ / रि and ॠ / री;
- anusvāra, candrabindu and homorganic nasal;
- visarga versus h;
- independent vowel versus dependent sign;
- inherent vowel versus virāma and final virāma;
- avagraha versus literal apostrophe;
- precomposed nukta letters versus decomposed sequences.

### B. Unicode and document layer

- NFC, NFD and compatibility normalization;
- combining marks alone and in context;
- Vedic accents U+0951/U+0952 and generic combining marks;
- ZWJ/ZWNJ in conjunct contexts;
- candra vowels, nukta, extended signs and rare letters;
- danda/double danda, quotation marks, dashes, brackets, punctuation and literal delimiter characters;
- ASCII and Devanagari numerals, mixed-script digits, whitespace, tabs, line endings and zero-width characters.

### C. Downstream transformations

Run outputs through realistic destructive operations: lowercase/casefold, diacritic removal, punctuation/underscore stripping, Unicode normalization, case-insensitive collation, URL/path normalization, shell tokenization and language lexing. Record these as *pipeline-induced* collisions, not native scheme collisions.

### D. Native profile parity

Run both directions of the original C implementation on byte-exact fixtures. Separately test the wrappers/filters, including `uni2acii`, `acii2rmn`, `rmn2acii`, `acii2uni`, `fixuninum`, and the intended `fltr_*` paths. A table match is not proof that the parser accepts the key; a successful C core compile is not proof that the Flex filters are built; a round trip inside a Python reconstruction is not proof of native parity.

## 4. Report collisions precisely

Classify every mismatch as one of:

- **native collision:** distinct inputs, same successful output within the same scheme;
- **scheme-identity ambiguity:** same roman string decodes differently when the scheme ID changes;
- **normalization collision:** a downstream transform merges outputs;
- **canonical-equivalence merge:** code-point strings are canonically equivalent but not byte-identical;
- **coverage rejection:** one or more inputs are unsupported;
- **silent loss:** an input component disappears without an explicit error;
- **directional/profile mismatch:** forward and reverse implementations use different terminal-stem or token semantics;
- **test-harness defect:** wrong denominator, stale assertion, `None` counted as output, wrong adapter, stale generated artifacts or inconsistent corpus.

Report counts at the case, input, and unique-source levels. Always show the denominator. Do not call rejected inputs collisions, and do not count repeated vectors as unique words.

## 5. Performance methodology

- Run a warm-up phase, then at least 30 measured rounds for published benchmarks.
- Report median, p95, interquartile range and operations/second.
- Use separate workloads: single grapheme, short word, long word, punctuation-heavy text, mixed script, and full corpus.
- Separate import/startup time, encoding, decoding, normalization, and document-wrapper overhead.
- Publish raw timings and a script that regenerates summary tables.
- Compare versions on the same machine/runtime; do not compare timing values collected under different environments without qualification.

The BUILD-0024 309-code-point sweep is a coverage diagnostic, not a performance benchmark. The collision tests are correctness diagnostics, not statistical estimates.

## 6. Demonstrate the engineering contribution with ablations

Compare at least these configurations:

1. scheme encoder/decoder alone;
2. scheme plus explicit error handling;
3. scheme plus lossless escape fallback;
4. scheme plus normalization policy;
5. scheme plus identifier/lexer integration;
6. scheme plus scheme-ID metadata;
7. scheme plus native C compatibility adapter.

For each, measure which failure classes disappear and which remain. This makes the contribution attributable to specific design choices instead of relying on a broad “better” claim.

## 7. Reproducibility package for a paper or review

Publish:

- exact source archive and SHA-256;
- per-file change manifest;
- source/license/commit provenance for vendored code;
- test corpus and licenses;
- machine-readable per-input results;
- test and benchmark scripts;
- CI output and known skips;
- collision taxonomy and interpretation policy;
- limitations, especially phonetic fidelity versus orthographic fidelity;
- versioned output artifacts.

A reviewer should be able to reproduce the key tables with a small number of documented commands and see the exact raw records behind every headline number.

## 8. Responding to “this was simple”

Use a calm, evidence-first response:

> The mapping table is only one component. The testable contribution is the explicit contract across encoding, decoding, Unicode normalization, unsupported-input behavior, identifier safety, native-filter compatibility, and downstream transformations. We publish minimal-pair collisions, exact round-trip records, code-point coverage, and ablation results so that each claim can be independently falsified. If a requirement is already satisfied by an existing scheme, we record that rather than claiming novelty for it.

Then point to a concrete result—not to the amount of code or the age of the project. For example, a case where removing `_` collapses two otherwise distinct Romenagri forms is a falsifiable pipeline claim. A terminal-virāma difference between the reconstructed Python profile and the legacy C parser is an integration finding. Neither alone proves universal superiority; together they define precisely what the engineering work must solve.

## 9. Current limits

- The BUILD-0024 adversarial set is hand-designed, not a representative linguistic corpus.
- The 309-code-point sweep deliberately tests many marks and controls in isolation; its duplicate-output groups are context-free diagnostics, not all valid-text collisions.
- The native C core has been compiled and directly probed, but `make all` is blocked by missing `flex`; full filter parity remains outstanding.
- The original Grok 2,000-word corpus and per-row results have not been supplied, so the reported 156/2,000 result remains unreproduced.
- Vendored upstream source revisions need immutable commit identifiers and license-file checks before a formal release.
