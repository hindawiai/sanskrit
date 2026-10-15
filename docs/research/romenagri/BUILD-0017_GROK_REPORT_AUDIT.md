# BUILD-0017 — Audit of Grok's Romenagri failure report

**Date:** 14 October 2026  
**Scope:** Static correlation plus execution against the supplied BUILD-0016 code, focused front-end implementation, test suite, and timing runs.  
**Execution environment:** Node v22.16.0; Python 3.13.5; GCC 14.2.0. `rustc` and `flex` are unavailable. QEMU was not run.

## 1. Archive identity and comparison boundary

The one distinct archive mounted for this review is:

`BUILD-0016__pushkalavati-hindawi-ilm-2026-10-14.zip`

SHA-256: `0db293a3dc2f27be6a1ef2072e774ebf1db25d78cf619b9990e82c10046c670c`

That hash matches the BUILD-0016 archive previously produced by this assistant. Although two uploads were surfaced under the same filename, only one distinct archive was available at the mounted path. A second, independently identifiable Grok BUILD-0016 archive was not available for a source-to-source diff. This report therefore audits Grok's pasted claims against the supplied source; it does not pretend to compare two distinct builds.

The archive contains the Hindawi source/data tree. The unresolved native parity issue is narrower: the exact original Romenagri C kernel and named upstream filter files are not present in the relevant vendored path. Those are different facts.

## 2. Terminal-virāma claim: current evidence contradicts Grok's examples

The project owner states that the original 2004 decoder already handles a terminal virāma correctly. The audit does not attribute a terminal-virāma defect to that legacy decoder.

I executed the four quoted examples against the current Rahnuma-derived Python word-level encoder and decoder:

| Original | Encoded | Decoded | Exact |
|---|---|---|---|
| चेत् | `chaee_t` | चेत् | Yes |
| सर्वम् | `sarwam` | सर्वम् | Yes |
| पापम् | `paapam` | पापम् | Yes |
| उद्धरणम् | `_u_d_dhara_nnam` | उद्धरणम् | Yes |

All four pass exact string comparison. Therefore, the report's attribution of 101 of 104 changed outputs to terminal-virāma stripping is not reproduced by the current implementation. The source corpus, 104 changed rows, and remaining three mismatches were not supplied, so their aggregate counts cannot be independently verified.

This does not prove that every possible input round-trips. It establishes that the quoted examples do, and that the stated 101-case diagnosis is unsupported by the evidence currently available.

## 3. Avagraha claim: a demonstrable mismatch

The strict base encoder explicitly supports avagraha:

`ऽ → _3 → ऽ`

I executed this round trip; it is exact. Therefore, the claim that 19 U+093D avagraha cases were never encoded is incompatible with the current encoder if those rows used this implementation and those code points.

The other listed characters are genuinely unsupported by the strict base word-level encoder: U+201C, U+201D, U+2018, U+0949, U+2013, U+2014, U+200D, U+093C, and U+0945. The current encoder also does not map double danda U+0965. These are front-end repertoire/preservation gaps, not evidence that the inherited 84-entry C table or every Romenagri layer lacks the same behaviour.

## 4. Arithmetic inconsistency

The reported counts sum correctly: `52 + 104 = 156`.

The percentage does not:

- `1 - 156/2000 = 92.2%` exact success.
- `91.5%` success on 2,000 records implies 170 failures.

A different denominator or an additional exclusion rule might explain this, but Grok's pasted output does not state one.

## 5. Front-end implementation added in BUILD-0017

An opt-in wrapper, `tools/transliteration/romenagri_document.py`, now provides lossless document transport:

- supported Devanagari grapheme-like clusters use the existing word-level encoder;
- a cluster is accepted as transliterated only if the current decoder reconstructs it exactly;
- unsupported Devanagari clusters are escaped code point by code point;
- punctuation, numerals, Latin text, Unicode controls, emoji, and other unsupported characters use `~{HEX}` Unicode-scalar escapes;
- malformed escapes, surrogate values, out-of-range scalars, and unescaped non-token characters are rejected.

Example: `“कॉ”` is represented as a reversible mixture of Romenagri and explicit Unicode escapes. Unsupported graphemes are preserved verbatim, not claimed to be transliterated. The wrapper is a Pushkalāvatī front-end extension, not part of the inherited Rahnuma Romenagri convention and not a claim of native C-filter compatibility. The strict `encode()` API remains unchanged and still reports unsupported input rather than guessing.

This approach separates:
1. base-inventory transliteration;
2. lossless document preservation;
3. any optional normalization policy.

It avoids silently dropping punctuation or pretending that a symbol has a known phonological mapping.

## 6. Timing optimization

The base decoder previously rebuilt its token map and longest-match token ordering on every call. BUILD-0017 precomputes that table once at module import. No token mappings or longest-match ordering were changed.

On this environment's 21-round timing harness:

- Romenagri round-trip median: approximately **146.1 → 37.2 µs/record** before/after token-table caching.
- Synthetic 2,000-record lossless document round-trip median: approximately **295.0 → 49.5 µs/record** before/after caching.
- The synthetic 2,000-record workload round-tripped exactly **2,000/2,000**.

These are local microbenchmarks, not the missing Grok corpus and not a claim about end-to-end native C performance. Results are in `tools/transliteration/results/frontend-timings.csv`.

## 7. Test and coverage results

- Current Python unit suite: **46 tests, 45 passed, 1 skipped**. The skipped experiment requires the external Cologne MW lexicon and prior RV artifacts.
- All 13 named Rahnuma Romenagri output fixtures match.
- The four terminal-virāma examples pass exact round-trip checks.
- The lossless front-end suite has **100% statement and branch coverage for `romenagri_document.py` only**: 107 statements, 44 branches.
- Hindawi keyword-table integrity: 68 profiles, zero failures.
- Sanchalan port checks exit successfully but explicitly report eight incomplete language profiles; these are not silently counted as complete.
- Pushkalāvatī compiler tests and Python IR parity pass; the compiler status remains 20 executable-tested rules out of 3,983 source records.
- Static Pages checks pass when run independently: 29 HTML files, 12 HTTP smoke-test URLs, browser lab and app smoke tests.
- C runtime tests compile and run. Rust compilation was skipped because `rustc` is unavailable.
- Native Romenagri C differential tests were not possible because the original kernel/filter sources are not present in the supplied integration archive.

The monolithic legacy `scripts/test_all.sh` did not finish within the available execution window during this review. Its component stages were run independently; the relevant stages completed successfully. Do not label the monolithic invocation itself as a successful run.

## 8. Why the 2,000-word result remains unverified

The supplied archive does not contain the corpus, per-word encoded/decoded output, implementation hash used by Grok, or machine-readable failure rows. The 13-word Rahnuma fixture is a different dataset. The synthetic 2,000-record benchmark is for stress/timing only and must not be substituted for Grok's sample.

To reproduce Grok's aggregate, the experiment must supply the exact 2,000 input records and emit one row per `(case_id, scheme)` with original code points, implementation revision, encoded value/status, decoded value, exact-match result, normalization-aware result, and failure category. That will resolve the unexplained three mismatches and whether all schemes saw identical inputs.
