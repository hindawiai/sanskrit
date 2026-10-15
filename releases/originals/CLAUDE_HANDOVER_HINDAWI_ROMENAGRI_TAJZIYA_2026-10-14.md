# Hindavi / Hindawi, Romenagri, Devanagari and Tajziya

## Final technical handover and development report for Claude

**Snapshot date:** 14 October 2026\
**Purpose:** Consolidated status, evidence ledger, design rationale, and
proposed integration plan for `zistgah/tajziya`.\
**Status:** Handover document; no project source code was changed in
preparing it. This is not a release certification.

------------------------------------------------------------------------

## 1. Executive summary

This report consolidates the current Hindavi/Hindawi and Romenagri
implementation picture, the Devanagari priorities and character-boundary
rationale, the MW/RV conversion experiment through
BUILD-0027-CORRECTION, and a concrete proposal for carrying the work
into the public `zistgah/tajziya` project.

The central architectural recommendation is **not to create a second,
competing Romenagri implementation inside Tajziya**. Tajziya already
contains `src/tajziya/romenagri.py`, which wraps the author's vendored
native Romenagri implementation from `hindawiai/chintamani` at pinned
commit `3ad87785a75dc2b18438a8b068807103cb920c81`. That implementation
is built with its own Makefile and runs the pipeline
`UTF-8 → UTF-16 → uni2acii → acii2rmn` for Devanagari-to-Romenagri and
the reverse pipeline for Romenagri-to-Devanagari. The package declares
the upstream Romenagri code as GPL-2.0-or-later.

The BUILD-0024/0027 work adds valuable *separate evidence*: a
reconstructed Python word-level profile, adversarial collision and
Unicode tests, a conversion audit for a large MW inventory, and an RV
1.1 surface-form experiment. That reconstructed profile must not be
silently substituted for Tajziya's pinned native implementation. The two
layers have different histories and observed behavior; their
compatibility boundary must be tested, documented, and versioned.

Tajziya's current `main` already identifies the relevant work package:
**P-SAN-01 --- "Classical Sanskrit: Devanagari input through the
Romenagri tables to the segmenter's internal form."** The Classical
Sanskrit module currently refuses Devanagari input at L1 because the
script pivot is not bound. P-SAN-01 is therefore the correct initial
integration gate. The generic shared script-pivot package **P-L1-01** is
for scripts without a Romenagri table; it should not be used to bypass
or duplicate the existing Devanagari/Romenagri path.

The BUILD-0027 correction reports: - MW: 287,432 source records; 287,312
converted; 120 rejected and explicitly accounted for. - RV 1.1: 47 word
occurrences; 38 fully converted; 9 rejected and retained as original
IAST. - `īḷe`: upstream IAST-to-Devanagari defect corrected in the test
path from the incorrect `ईऌए` to `ईळे`; Romenagri still rejects `ळ`
(U+0933), so this token remains in IAST in the experiment corpus. -
Nirgundi: 10 exact-token matches, 9 distinct MW inventory IDs, 50
matched code points out of 436 concatenated-corpus code points. All ten
matches are reported to involve fully converted tokens. - Tests reported
by Grok: two Nirgundi experiment tests passed, the direct `īḷe`
conversion check passed, and the experiment-regeneration command exited
successfully.

Those results are useful but the correction archive is not a complete
reproducibility bundle. The summary audit still has stale RV counts, the
"CSV" match ledger is JSON Lines, the checksum file's self-hash entry
does not match the file's actual hash, and the correction archive omits
the regenerated corpus and complete experiment output directory. The
correction function also uses global output-string substitutions;
negative tests are needed to protect genuine vocalic-L forms.

**Proposed sequence:** (1) reconcile and preserve the BUILD-0027
evidence; (2) harden and test the transliteration contract; (3)
implement P-SAN-01 using Tajziya's existing native Romenagri wrapper
plus an explicit, audited adapter to the Sanskrit segmenter's internal
representation; (4) make unsupported input and ambiguity explicit rather
than guessing; (5) pass the packet acceptance command and repository
gate; (6) only then consider extracting a general shared engine or
binding more scripts/languages.

## 2. Terminology and scope

  ------------------------------------------------------------------------
  Term                    Meaning in this handover Boundary
  ----------------------- ------------------------ -----------------------
  **Language**            A linguistic system such Not the same thing as a
                          as Hindi, Marathi,       script or
                          Sanskrit, or another     transliteration scheme.
                          language.                

  **Script**              A writing system, such   A script can write more
                          as Devanagari.           than one language; a
                                                   language can use more
                                                   than one script.

  **Transliteration       A declared mapping       Not a pronunciation
  scheme**                between written          model, and not
                          representations.         automatically
                                                   reversible.

  **Romenagri**           The author's             Not a language, not
                          ASCII-oriented           Devanagari, not IAST,
                          computational            and not interchangeable
                          representation and       with every Latin
                          associated conversion    transliteration.
                          tools.                   

  **Hindavi/Hindawi**     The wider localized      Not merely a keyboard
                          programming/computing    or an input-method
                          and linguistic           editor.
                          infrastructure context   
                          in which Romenagri is    
                          one component.           

  **ILM**                 The integrative          An architectural
                          linguistic/multiscript   objective, not a claim
                          architecture and layer   that all script pivots
                          model.                   or language modules are
                                                   already implemented.

  **Nirgundi baseline**   An exact                 Not morphological
                          whitespace-delimited     analysis, sandhi
                          surface-token matching   reversal, fuzzy
                          experiment.              matching, or semantic
                                                   interpretation.

  **Tajziya**             The language-parsing     It must obey its module
                          front end in the         API, registry, refusal,
                          Dhancha/Project ILM      provenance, licensing,
                          architecture.            and acceptance
                                                   contracts.
  ------------------------------------------------------------------------

### Design rationale recorded from the project owner

Some Sanskrit-specific characters were not implemented in the
reconstructed Romenagri inventory for reasons that include regional
variation in pronunciation and the risk of asserting one pronunciation
without a clearly declared convention. A parallel priority was to
support practical Devanagari workflows for Hindi, Marathi, and related
languages, rather than making every Sanskrit-specific or historical
character a prerequisite for the core system.

This rationale should be represented accurately: **regional
pronunciation variation does not make orthographic representation
impossible**. A system can preserve a written distinction without
asserting a universal spoken realization. Future support can therefore
be profile-based and evidence-gated. The current absence of a mapping is
an implementation fact; it should not be automatically interpreted as a
permanent policy exclusion.

The Marathi letter **ळ** (retroflex lateral) is particularly important.
It is not the same character as **ऌ** (independent vocalic-L vowel) or
**ॡ** (long vocalic-L vowel). Similarly, **ॠ** is a long vocalic-R
letter, not a variant of the consonant **र**.

  -----------------------------------------------------------------------
  Character         Unicode           Identification    Current
                                                        BUILD-0027 audit
                                                        role
  ----------------- ----------------- ----------------- -----------------
  ळ                 U+0933            Retroflex lateral 92 MW records
                                      consonant letter; rejected because
                                      used in Marathi   the reconstructed
                                      and other         Romenagri
                                      languages.        inventory does
                                                        not map it; RV
                                                        `īḷe` also
                                                        reaches this
                                                        unsupported
                                                        character.

  ऌ                 U+090C            Independent       6 MW records
                                      vocalic-L vowel.  rejected. It was
                                                        also involved in
                                                        the erroneous
                                                        pre-correction
                                                        intermediate for
                                                        `īḷe`.

  ॡ                 U+0961            Long vocalic-L    8 MW records
                                      vowel.            rejected.

  ॠ                 U+0960            Long vocalic-R    14 MW records
                                      vowel.            rejected.

  र                 U+0930            Consonant letter  Must remain
                                      ra.               distinct from
                                                        vocalic-R
                                                        letters.
  -----------------------------------------------------------------------

Use exact Unicode code points and named orthographic categories in code,
specifications, and bug reports. Informal labels such as "Lri" should
not collapse ळ, ऌ, and ॡ into one category.

## 3. Current Tajziya architecture: verified against public `main`

Repository reviewed:
[zistgah/tajziya](https://github.com/zistgah/tajziya), default branch
`main`, on 14 October 2026. Key sources: -
[README.md](https://github.com/zistgah/tajziya/blob/main/README.md) -
[CONTRACT.md](https://github.com/zistgah/tajziya/blob/main/CONTRACT.md) -
[CONTEXT.md](https://github.com/zistgah/tajziya/blob/main/CONTEXT.md) -
[src/tajziya/romenagri.py](https://github.com/zistgah/tajziya/blob/main/src/tajziya/romenagri.py) -
[src/tajziya/api.py](https://github.com/zistgah/tajziya/blob/main/src/tajziya/api.py) -
[modules/cls/python/sanskrit_paninian_v0/**init**.py](https://github.com/zistgah/tajziya/blob/main/modules/cls/python/sanskrit_paninian_v0/__init__.py) -
[modules/cls/module.json](https://github.com/zistgah/tajziya/blob/main/modules/cls/module.json) -
[roadmap/packages.json](https://github.com/zistgah/tajziya/blob/main/roadmap/packages.json) -
[vendor/romenagri/UPSTREAM.json](https://github.com/zistgah/tajziya/blob/main/vendor/romenagri/UPSTREAM.json)

### 3.1 Existing native Romenagri layer

Tajziya already exposes these functions in `src/tajziya/romenagri.py`: -
`roman(text)` and `roman_lines(lines)`: Devanagari to Romenagri. -
`devanagari(text)` and `devanagari_lines(lines)`: Romenagri to
Devanagari. - `acii_lines(lines)`: Devanagari to the ACII pivot bytes. -
`build(force=False)`, `available()`, and `missing_tools()`.

The vendored source is declared byte-for-byte from the `Romenagri`
directory of `hindawiai/chintamani`, pinned at commit
`3ad87785a75dc2b18438a8b068807103cb920c81`, with licence
`GPL-2.0-or-later`. The native build requires `gcc`, `flex`, `make`, and
`iconv`. The wrapper invokes the native programs and performs encoding
conversion through `iconv`.

This is the project's canonical pinned Romenagri implementation. The
wrapper currently returns strings rather than a structured conversion
result with per-character rejection, provenance, or lossiness
diagnostics. It also decodes subprocess output with replacement behavior
and encodes reverse input as ASCII with replacement. Therefore it must
be guarded by a stricter layer for untrusted or unsupported text; do not
assume a successful return means lossless conversion.

### 3.2 The current Classical Sanskrit module

`modules/cls/module.json` declares: - L0 phonology: `not_built`. - L1
script pivot: `not_built`. - L2 orthography: `wired_unproven`. - L3s
segmentation: `built`. - L3m morphology: `not_built`. - L4 syntax:
`not_built`. - Accepted input script: `Latn`. - Scope exclusions include
Devanagari input because the script pivot is not bound.

The port's `pivot()` explicitly refuses Devanagari and names P-SAN-01
and the `abugida` engine. The existing segmenter is based on IAST-like
Latin input; it is not established that native Romenagri output can be
passed directly into it. For example, Tajziya documents
`roman("वृद्धिरादैच्") → "w_ri_d_dhiraa_daich"`, which is Romenagri, not
IAST.

Therefore the required path is not simply "call `roman()` and feed the
output into the parser." It needs a declared and tested bridge from the
Romenagri representation to the segmenter's internal representation, or
an explicit change to the parser's internal representation with a
documented compatibility contract. Until that bridge is proven, P-SAN-01
must remain open and Devanagari parsing must continue to refuse
honestly.

### 3.3 Existing contracts that govern integration

The current Tajziya contract requires: - A language module imports only
`tajziya.api`; the core can change beneath it. - The registry alone
chooses a module binding. - Unbuilt layers refuse by name and identify
their packages/engines; they must not return plausible fabricated
analyses. - Ambiguity is returned whole; no reading is silently selected
or truncated. - Rules and data have source provenance. - Script,
language, and standard are separate axes. - Modules are accepted using
the common acceptance harness. - `make check` is the repository gate
(`ops/verify.sh`); `make deps && make check` also checks the spine. -
Generated process/quest artifacts and append-only ledgers must be kept
consistent where a package requires them.

Do not bypass these rules by importing internal Tajziya modules directly
from a language module. If the stable API needs a Romenagri/pivot
service, expose it deliberately through `tajziya.api`, with API-version
consequences documented.

## 4. Hindavi/Romenagri implementation status and evidence boundaries

The available project history describes several distinct things that
must not be collapsed:

1.  **Historical native Romenagri:** C/Flex filters and ACII pipeline,
    vendored into Tajziya from the pinned Chintamani source.
2.  **BUILD-0024 reconstructed Python word-level profile:** a separate
    implementation based on Rahnuma 1.3.0, chapter 17, used for corpus
    conversion and collision audits.
3.  **Lossless wrapper:** an opt-in wrapper that can preserve
    unsupported Unicode using explicit `~{HEX}` escapes. Escaping
    preserves data; it does not mean the escaped character has been
    transliterated.
4.  **Compiler-side adapter:** a mapping between canonical sound tokens
    and audited legacy table keys. This is another interface and must
    not be confused with word-level transliteration.
5.  **Other transliteration adapters:** IAST, Harvard--Kyoto, SLP1,
    ITRANS, Velthuis, WX, ISO 15919, ISO Vedic, TITUS, Kolkata,
    Optitrans, and others have their own conventions and collisions.
    Their outputs are not interchangeable without a scheme identifier.

### Evidence already recorded in BUILD-0024

-   Full available repository suite reported
    `ALL AVAILABLE TESTS PASSED` in the BUILD-0024 working tree.
-   Python discovery: 56 tests, 55 passed, one skipped due unavailable
    Cologne MW lexicon and prior RV artifacts.
-   Collision audit regression tests: 10 passed.
-   Unicode inventory sweep passed.
-   Native C core direct-function probes passed.
-   Romenagri attested fixtures: 13/13 expected outputs matched; 12/13
    round trips were identical. The known non-identical fixture involved
    `ज्ञाान`: encoding `j_ynaana`, decoding `ज्ञान`.
-   Python compiler rule-IR parity passed across 3,983 records.
-   Hindawi C/C++ keyword-table integrity: 68 profiles, zero failures.
-   Static-page checks: 29 HTML files checked; 12 HTTP URLs returned
    200.
-   Full Flex-generated native filter build remained unverified because
    `flex` was unavailable in that environment; Rust compilation
    remained unverified because `rustc` was unavailable.
-   The native core probes showed a meaningful compatibility boundary:
    native `k` round-tripped to `ka`, while `k^` round-tripped to `k`.
    Native examples such as `chaee_t`, `sarwam`, `paapam`, and
    `_u_d_dhara_nnam` acquired a final `a` after the forward/reverse
    pair. This is evidence of a profile/direction boundary, not proof
    that the historical decoder simply strips virāma.
-   ACII byte `0xEB` decoded to `_3`, while feeding `_3` to the reverse
    parser produced `3`; this remains a separate case for explicit
    contract and regression testing.

The BUILD-0024 adversarial collision suite covered 36 curated cases
across 12 schemes, with 1,020 input/scheme evaluations and 3,708
code-point/scheme records. It found that scheme identity and
normalization matter: examples include `za` meaning different Devanagari
outputs under HK and SLP1, case loss destroying SLP1 distinctions,
diacritic stripping destroying IAST distinctions, underscore stripping
destroying Romenagri distinctions, and numeral normalization merging
Devanagari `५` with ASCII `5`. These tests are adversarial, not a
representative corpus accuracy benchmark.

**Integration rule:** carry these tests into Tajziya as evidence
fixtures and regression tests, but do not copy the reconstructed Python
profile over the pinned native implementation. First establish an
explicit compatibility matrix.

## 5. BUILD-0027 conversion audit: current corrected snapshot

### 5.1 Baselines and hashes

Actual archive hashes measured for the files available in this
session: - BUILD-0025:
`4f158697bcd891053a21b1a9ecebf33f7d5261a7a0de53e553330f05d22f3c25` -
BUILD-0026:
`64bf96b15f8459b0ee6bf0326e8df656a67dab87c8e65e383e286cbdcc048ea5` -
BUILD-0027-RESULTS.zip:
`fa53c87b160a482f282dc9b0d646825365c2f1e686a30fda3efe522cab825958` -
BUILD-0027-CORRECTION.zip:
`15f6229f55f081e2fa0e52acc85fdb7fb7c50e1dd23b6a82db5382f61b61fd06`

BUILD-0025, BUILD-0026, and the original BUILD-0027 results are reported
as preserved. This document does not alter those archives.

### 5.2 MW inventory accounting

  ------------------------------------------------------------------------
  Measure                                      Count Interpretation
  --------------------- ---------------------------- ---------------------
  Original MW source                         287,432 MW k1 inventory
  records                                            derived from
                                                     `mwxml.zip`, per the
                                                     source note.

  Fully converted                            287,312 Records included in
  records                                            converted inventory.

  Rejected records                               120 Unsupported
                                                     Devanagari code
                                                     points after SLP1 →
                                                     Devanagari.

  Unaccounted source                               0 Every source record
  records                                            has a recorded
                                                     disposition.

  Distinct SLP1 forms                     0 reported No collision observed
  colliding among                                    in this comparison;
  retained converted                                 not a universal
  records                                            collision-freedom
                                                     claim.
  ------------------------------------------------------------------------

  Rejected character   Unicode     Record count
  -------------------- --------- --------------
  ळ                    U+0933                92
  ॠ                    U+0960                14
  ॡ                    U+0961                 8
  ऌ                    U+090C                 6
  **Total**            ---              **120**

The accounting is internally consistent and was independently checked
against the source and converted inventories in the available archives.
It establishes complete accounting of the conversion attempt, not
complete conversion of the MW corpus.

### 5.3 RV 1.1 accounting after the `īḷe` correction

The RV sample contains five verses and 47 word occurrences.

  -------------------------------------------------------------------------
  Disposition                                  Count Interpretation
  --------------------- ---------------------------- ----------------------
  Fully converted                                 38 Includes `rayim` and
                                                     `yam`; both have
                                                     Devanagari
                                                     intermediates and a
                                                     final output equal to
                                                     the source spelling.

  Rejected and retained                            9 Eight hyphenated forms
  as IAST                                            and `īḷe`, rejected
                                                     because the
                                                     native/reconstructed
                                                     encoder does not
                                                     support the
                                                     encountered character
                                                     or hyphen.

  Discarded                               0 reported Rejected forms remain
                                                     in the experiment
                                                     corpus as source IAST.

  **Total**                                   **47** All occurrences
                                                     accounted for.
  -------------------------------------------------------------------------

The correction report confirms that `indic_transliteration` mapped IAST
`ḷ` to independent vowel `ऌ`, giving the erroneous intermediate `ईऌए`.
The correction function now yields `ईळे` for `īḷe`. The Romenagri encoder
still rejects `ळ` (U+0933), so the word is retained as IAST. This is the
correct distinction between an upstream conversion defect and a
downstream inventory limitation.

**Potential scope risk:** `scripts/conversion/iast_devanagari.py`
applies global replacements of output sequences such as `ऌए` → `ळे`. The
test `īḷe` is a positive case, but genuine vocalic-L forms are needed as
negative cases. A source-aware/context-aware correction is safer than an
unrestricted output-string replacement. Do not expand Romenagri to
include `ळ` as part of this correction unless separately specified and
tested.

The original BUILD-0027 audit summary still says 36 full, nine rejected,
two unchanged. The corrected RV CSV and correction report classify
`rayim` and `yam` as full, giving 38 full and nine rejected. These
values reconcile if "unchanged" meant only that the final Latin spelling
equals the source, not that conversion was skipped. The final project
report and generated statistics should use one consistent taxonomy.

### 5.4 Nirgundi experiment

  ----------------------------------------------------------------------------
  Metric                    Corrected reported value Definition
  --------------------- ---------------------------- -------------------------
  Exact-token match                               10 Whitespace-delimited
  occurrences                                        surface-token matches.

  Distinct matched MW                              9 `_aa` matches twice and
  inventory IDs                                      contributes two
                                                     occurrences but one ID.

  Matched code points                             50 Sum of `(end - start)`
                                                     across the occurrence
                                                     ledger.

  Concatenated corpus                            436 Code-point count under
  code points                                        the current
                                                     converted-input
                                                     representation.

  RV word occurrences                             47 Five-verse sample.

  Exact-token rate                    10/47 = 21.28% Sample-only surface-token
                                                     rate.

  Code-point ratio                   50/436 = 11.47% Representation-specific
                                                     ratio; not lexical
                                                     coverage.
  ----------------------------------------------------------------------------

The corrected report says all ten matches occur on fully converted
tokens and none involves a token retained as IAST. That is a useful
stratification result, but the occurrence-level ledger should explicitly
carry conversion disposition to make the claim independently auditable.

The pre-conversion denominator was 341 code points in IAST; the
post-conversion denominator is 436 code points in the Romenagri-labelled
representation. The denominators differ, and some rejected words are
retained as IAST. The before/after percentages are not a controlled
comparison of lexical coverage.

Nirgundi matches exact surface tokens. It does not resolve inflection,
perform morphology, reverse sandhi, split compounds, or interpret
semantics. MW headwords are citation forms, while RV forms are inflected
and context-specific. Low literal matching is therefore an expected
limitation of this baseline, not a measurement of the overall capability
of a future Tajziya parser.

### 5.5 What is still incomplete in the correction package

The correction archive reports: -
`python3 -m unittest tests.test_nirgundi_experiment -v`: 2 passed. -
Direct `īḷe` conversion check: passed (`ईळे`). - Experiment regeneration
command: exit 0. - No skipped or blocked tests in that correction run.

The available correction archive includes the correction script and
audit/report files, but it does not include the regenerated
`data/corpus_rv_1.1_romenagri.json` or the complete experiment output
directory (statistics, manifest, residual, transformed corpus, and other
generated artifacts). The conversion log refers to the corpus-generation
code as "inline Python" without including the complete program. Thus the
run is reported and partially supported by the regenerated audit, but it
cannot be fully replayed from the correction ZIP alone.

Other audit-package issues: - `BUILD-0027_AUDIT_REPORT.md` retains stale
RV summary values (36 full, 9 rejected, 2 unchanged) rather than the
corrected 38 full, 9 rejected taxonomy. - `BUILD-0027_MATCH_RESULTS.csv`
is JSON Lines, not CSV, and has ten rows for ten occurrences but nine
unique inventory IDs. Rename to `.jsonl` or emit a true CSV with header
and explicit occurrence identifiers. - Nine of ten match occurrences are
not the issue; the ledger does contain ten entries, with `_aa` twice.
The key requirement is to preserve occurrence-level rows and make the
schema truthful. - All listed artifact hashes in
`BUILD-0027_SHA256SUMS.txt` match their corresponding archive members
except the entry for the checksum file itself. Its listed hash is
`93a15537c044359851ec2880bd8472d5f4c132d6e0ee6628098f86cf8a92d229`,
while the actual hash of the included checksum file is
`f1292d5098f0343331f47fd9506b7a3e53095692481a64bd1220a4dddbb58753`. Use
a detached checksum or omit the checksum file from its own list. - The
collision audit is empty apart from its header; report this as "no
collision rows supplied" rather than a demonstrated universal absence of
collisions.

## 6. Integration proposal for `zistgah/tajziya`

### Guiding principle

**Integrate the capability through Tajziya's existing architecture; do
not transplant the whole Pushkalāvatī/Nirgundi project or introduce a
parallel transliteration runtime.** Tajziya already has a pinned native
Romenagri component and an explicit Sanskrit pivot work package. The
work should improve that contract, establish conversion correctness, and
supply auditable evidence.

### Phase 0 --- evidence reconciliation, no algorithm change

Before touching the Tajziya parser: 1. Preserve BUILD-0025, BUILD-0026,
original BUILD-0027 results, and BUILD-0027-CORRECTION as immutable
evidence. 2. Regenerate the final BUILD-0027 report, statistics,
manifest, and source notes so they agree on 38 full / 9 rejected RV
occurrences. 3. Include the corrected corpus, full experiment output
directory, conversion script, and exact command used to generate the
corpus. Do not rely on unrecorded inline code. 4. Make the match ledger
a true CSV or explicitly named JSONL and preserve one row per
occurrence. 5. Repair checksum reporting. 6. Add negative tests for
genuine vocalic-L sequences before accepting the global `ऌ`-to-`ळ`
correction as generally safe. 7. Record every input/output hash and the
exact conversion profile used.

This phase improves evidence without changing Nirgundi semantics or
Tajziya.

### Phase 1 --- make the Romenagri contract explicit

In Tajziya, retain `src/tajziya/romenagri.py` as the public wrapper
around the pinned native implementation. Add a stricter structured
service layer rather than changing the semantics of the raw functions
without evidence.

A candidate service contract should expose: - Input text and declared
source representation. - Target representation. - Profile/backend
identifier and pinned implementation version. - Output text, only when
valid. - Per-input status: `converted`, `unchanged_after_conversion`,
`rejected`, `lossy`, or `ambiguous`. - Unsupported code points and their
positions. - Warnings and provenance. - Round-trip result where
requested. - Whether lossless escape mode was used. - Exact source and
output hashes for corpus jobs.

The exact type and naming should follow Tajziya's conventions. Do not
introduce a second ad hoc API before checking `src/tajziya/api.py` and
the master Dhancha contract. If the service must be callable by language
modules, expose it through the stable `tajziya.api` surface and account
for the API version. The module contract currently says language modules
import `tajziya.api` and nothing else from Tajziya.

The wrapper should preflight inputs and detect subprocess failures.
Avoid silently converting unsupported characters through
`errors="replace"` or ASCII replacement when a caller expects fidelity.
Keep a clearly named raw/legacy path if byte-compatible historical
behavior must remain available.

### Phase 2 --- finish P-SAN-01: Devanagari → Romenagri → segmenter representation

This is the highest-value direct integration.

Current state: - The Sanskrit port accepts `Latn`. - `pivot()` refuses
Devanagari input and names P-SAN-01 and `abugida`. - `P-SAN-01` is open
and owns `modules/cls/`. - `P-ENG-09` describes the shared abugida
engine: resolve inherent vowels, conjuncts, and vowel signs through
Romenagri script tables. - `P-L1-01` is the generic pivot for scripts
without a Romenagri table and should remain distinct.

Implementation steps: 1. Establish the segmenter's actual internal
representation from the vendored parser's code and tests. 2. Verify
whether a lossless, documented adapter exists from native Romenagri
output to that representation. Do not assume Romenagri is IAST. 3. If no
valid bridge exists, define one as a separate, testable adapter or
change the parser's internal input contract deliberately. Preserve the
distinction between script transliteration and phonological
normalization. 4. Implement the pivot for the Classical Sanskrit module,
with explicit refusal for unsupported or ambiguous forms. 5. Record
provenance of each transformation: original Devanagari, native Romenagri
result, any intermediate representation, and final parser input. 6.
Update `modules/cls/module.json` only after behavior and tests are
demonstrated; change L1 from `not_built` only when the pivot actually
works. 7. Keep L0 phonology, L3m morphology, and L4 syntax marked
unbuilt until their separate packets pass.

Candidate acceptance tests: - `वृद्धिरादैच्` follows the pinned native
Romenagri example and has a documented path to the parser's internal
representation. - Known attested Devanagari words and the current
12-word placeholder lexicon are covered. - Unsupported characters such
as ळ, ऌ, ॡ, ॠ are explicitly rejected or handled by a documented
profile; they are not silently altered. - Round-trip checks distinguish
exact round trip from canonical/expected equivalence. - Terminal virāma,
inherent vowel, explicit virāma marker, conjuncts, punctuation,
whitespace, numerals, and hyphens are tested. - Native behavior and the
reconstructed Python profile are compared in a separate differential
suite; differences are reported rather than silently normalized. -
Ambiguous readings are all returned; unsupported readings produce
`NotBuilt`/`Unknown` according to the contract rather than a fabricated
parse. - `PYTHONPATH=src python3 -m unittest tests.test_p_san_01`
passes. - `bash ops/verify.sh` passes. -
`PYTHONPATH=src python3 -m tajziya accept modules/cls --integration`
passes. - `make check` passes; run `make deps && make check` when
validating the full spine.

### Phase 3 --- shared script/representation engine only after P-SAN-01

Do not prematurely extract a universal engine from a single Sanskrit
example. Once P-SAN-01 is stable, generalize the mechanism into a
reusable L1/abugida service.

Separate the axes: - **Script layer:** decode orthographic units and
script-specific structure. - **Transliteration layer:** apply a named
reversible or partially reversible mapping. - **Orthographic layer:**
preserve/normalize Unicode according to a declared policy. -
**Phonological layer:** only apply language-specific sound
interpretation when there is sourced evidence. - **Lexical/morphological
layers:** match lexemes and analyse forms after the script path is
complete.

Potential reusable operations include: - Unicode normalization with
original text retained. - Script detection and explicit script
profile. - Grapheme/code-point inspection. - Mapping candidates with
source and rule provenance. - Forward and inverse transformations. -
Reversibility and collision reports. - Rejection/ambiguity handling. -
Corpus accounting and per-record status. - Scheme-aware exact matching.

The generic engine should not hard-code Sanskrit-only exceptions.
Language- or corpus-specific correction rules should be profile-scoped,
named, tested, and provenance-bearing.

### Phase 4 --- language and corpus modules

After the shared mechanism is accepted: - Add corpus fixtures as
`modules/cls/reference/examples.json` or a dedicated test corpus with
source, licence, and exact provenance. - Do not add the complete MW
inventory to Tajziya merely because it was used in the audit. Check
source terms and redistribution rights; include only appropriately
licensed data, and record every data source in `data/SOURCES.json`. -
Treat MW/RV as a benchmark/test corpus with separate conversion
disposition, not as proof that a morphological analyzer exists. -
Morphological work belongs in P-SAN-03/P-SAN-04/P-SAN-05 once sourced
sandhi rules and an appropriately licensed lexicon are available. - Do
not bind Vedic or Epic stages to the Classical Sanskrit segmenter until
P-SAN-08 validation passes. - Preserve the current honest refusal
behavior for morphology and karaka syntax.

### Phase 5 --- cross-scheme and multilingual reuse

The collision suite can inform shared L1 test infrastructure. Its
strongest reusable result is methodological: every representation must
have a scheme ID, normalization policy, and explicit fidelity contract.
Examples to retain as regression tests include: - IAST diacritic
stripping merges distinctions. - SLP1 case folding loses distinctions. -
HK and SLP1 can assign different values to the same visible Latin
sequence. - Removing underscores can collapse Romenagri distinctions. -
Numeral normalization can merge Devanagari digits with ASCII digits. - A
native Romenagri round trip may differ from a reconstructed Python
profile even for terminal-consonant cases.

These should become scheme-specific tests and common contract tests, not
a blanket claim that Romenagri is universally superior or that all other
schemes are defective.

## 7. Proposed work packages and acceptance gates

  ---------------------------------------------------------------------------------
  Work item               Proposed home                     Acceptance condition
  ----------------------- --------------------------------- -----------------------
  Reconcile BUILD-0027    Development/audit artifacts; not  Reports, generated
  evidence                a parser module                   data, manifest,
                                                            checksums, and logs
                                                            agree; all 47 RV
                                                            occurrences and all
                                                            287,432 MW records are
                                                            accounted for.

  Strict native Romenagri `src/tajziya/romenagri.py` plus   Unsupported input is
  service contract        stable `tajziya.api` façade if    not silently replaced;
                          needed                            statuses/provenance are
                                                            explicit; historical
                                                            native path remains
                                                            pinned.

  Sanskrit Devanagari     Existing `P-SAN-01`,              Devanagari input is
  pivot                   `modules/cls/`                    mapped to the
                                                            segmenter's actual
                                                            internal form with
                                                            tests; `NotBuilt`
                                                            removed only after
                                                            acceptance.

  Shared abugida engine   `P-ENG-09` / script-axis engine   Extracted only after
                                                            the Sanskrit path is
                                                            proven; engine remains
                                                            script-axis, not
                                                            language-specific.

  Generic script pivot    `P-L1-01`, `src/tajziya/pivot/`   Missing table and
  for scripts lacking a                                     ambiguous mappings
  Romenagri table                                           refuse explicitly; no
                                                            guessed mapping.

  Transliteration         `tests/` plus sourced test        Minimal pairs,
  collision regression    fixtures                          normalization, reverse
  suite                                                     mapping, and lossiness
                                                            tests run in CI.

  Corpus provenance and   `modules/cls/data/SOURCES.json`   Licence, source
  licensing               or relevant data-source manifests revision, hash,
                                                            attribution, and
                                                            redistribution
                                                            permission are recorded
                                                            before data are
                                                            committed.

  Morphology              P-SAN-03, P-SAN-04, then P-SAN-05 Sourced rules and
                                                            licensed lexicon
                                                            precede executable
                                                            morphology; do not
                                                            claim morphology from
                                                            token matching.
  ---------------------------------------------------------------------------------

Do not invent new package identifiers or alter existing packet semantics
without first inspecting the repository's packet schema and AAB/ledger
rules. If the scope is too large for P-SAN-01, propose a new packet with
an acceptance command and update the package/quest/ledger artifacts
required by the repository contract.

## 8. Test plan for Claude

### 8.1 Native Romenagri availability and build

-   Inspect `vendor/romenagri/UPSTREAM.json` and verify pinned source
    hashes.
-   Check `gcc`, `flex`, `make`, and `iconv` availability.
-   Run the existing `build()` path and capture full output and exit
    status.
-   Run the actual filter build and tests; do not infer full filter
    parity from direct C-function probes.
-   If `flex` is unavailable, mark the build `BLOCKED`, not `PASS`.

### 8.2 Minimal-pair and round-trip matrix

At minimum include: - `क`, `का`, `क्`, and explicit `^` cases according
to the native notation. - `चेत्`, `सर्वम्`, `पापम्`, `उद्धरणम्`. - `ळ`, `ऌ`,
`ॡ`, `ॠ`, `र`, and related forms. - `īḷe` → `ईळे`; negative tests for
genuine vocalic-L sequences. - Hyphenated forms and punctuation. -
Devanagari numerals and ASCII numerals. - Empty text, multiple lines,
trailing newline, whitespace, unsupported symbols. - All current
attested fixtures and the BUILD-0024 collision vectors.

For every case record input bytes/code points, source profile, expected
output, actual output, exit code, exact-round-trip status, and any
loss/rejection.

### 8.3 Differential testing

Run the same test vectors through: 1. Tajziya's pinned native Romenagri
wrapper. 2. The reconstructed Python word-level profile, when available
in the working source. 3. The IAST/Devanagari adapter. 4. The proposed
parser pivot.

Compare results only under an explicitly stated shared contract.
Classify differences as profile mismatch, unsupported input, collision,
information loss, normalization difference, or unresolved. Do not "fix"
the implementations merely to force byte-for-byte equality.

### 8.4 Tajziya conformance

Run:

``` bash
PYTHONPATH=src python3 -m unittest tests.test_p_san_01
bash ops/verify.sh
PYTHONPATH=src python3 -m tajziya accept modules/cls --integration
make check
```

Run `make deps && make check` when validating the full dependency spine.
Capture complete logs and versions. Existing tests may have different
names in the current checkout; inspect before running and use the actual
declared acceptance command.

### 8.5 Result taxonomy

Every test must be classified as: - `PASS`: executed and passed. -
`FAIL`: executed and failed. - `BLOCKED`: a real dependency/prerequisite
prevented execution. - `SKIPPED`: intentionally not executed, with
reason. - `NOT RUN`: not attempted.

Never translate an unavailable dependency into a pass, and never claim
the native implementation is verified just because the reconstructed
Python profile passes.

## 9. Licensing, provenance, and repository discipline

Tajziya's README describes code as GPL-3.0-or-later, documents as
CC-BY-SA-4.0, and registry/metadata as CC0-1.0 except the copied ILM
registry; vendored components retain their own licences. The native
Romenagri upstream metadata identifies GPL-2.0-or-later. Preserve its
licence and attribution.

MW source data and RV text require their own provenance and licence
assessment. Do not commit a large external corpus into Tajziya merely
because it was available in a local archive. The current Tajziya
contract requires every data source to be identified and licensed;
restricted material must not be redistributed.

All module code should import only `tajziya.api`. Any new stable API
service must have tests, versioning, and an explicit compatibility
contract. The registry---not caller code---selects implementations. Any
package/work packet must retain its acceptance command, source records,
and required append-only configuration ledger. Do not edit generated
state in ways that bypass `make check` or `ops/verify.sh`.

## 10. Decisions requested from Claude

Claude should return an evidence-based engineering response that
answers:

1.  What is the smallest correct P-SAN-01 implementation given Tajziya's
    current `romenagri.py` and the Sanskrit parser's current internal
    representation?
2.  What adapter is required between native Romenagri output and the
    segmenter's IAST/internal form, and what is the evidence for each
    mapping?
3.  Which behavior should be preserved exactly for backward
    compatibility, and which should be exposed through a stricter
    structured service?
4.  Should the API façade expose a stable pivot/romenagri service, and
    what API versioning changes would follow?
5.  How should the `īḷe` correction be narrowed or tested so it cannot
    corrupt genuine vocalic-L sequences?
6.  What is the smallest test fixture that demonstrates the native
    C/Python profile boundary and terminal-virāma behavior?
7.  Which data may be committed under current licences, and which should
    remain as local-only or externally referenced test fixtures?
8.  Which existing package/quest/ledger files need updating for a
    conformant implementation?
9.  What exact commands will demonstrate P-SAN-01, module integration
    acceptance, and the full repository gate?
10. What remains honestly `not_built` after the pivot is accepted?

Claude should not claim that this handover itself modifies Tajziya. It
is a development plan and evidence report. Any code change must be made
against a freshly inspected checkout of `zistgah/tajziya` and returned
with a per-file change manifest, test logs, and provenance.

## 11. Immediate Claude task brief (copy/paste)

> Work in `zistgah/tajziya`, default branch `main`. Read `README.md`,
> `CONTRACT.md`, `CONTEXT.md`, `src/tajziya/api.py`,
> `src/tajziya/romenagri.py`, `modules/cls/module.json`,
> `modules/cls/python/sanskrit_paninian_v0/__init__.py`,
> `registry/bindings.json`, `registry/engines.json`,
> `roadmap/packages.json`, and the relevant packet/quest/ledger files
> before coding.
>
> Treat this report and the BUILD-0025/0026/0027 artifacts as evidence,
> not as authority to bypass repository contracts. Preserve the pinned
> native Romenagri implementation. Do not replace it with the
> reconstructed Python profile. First propose a minimal implementation
> plan for P-SAN-01, including the exact path from Devanagari through
> Romenagri to the parser's internal representation. Prove the adapter
> rather than assuming Romenagri equals IAST. Keep unbuilt layers
> refusing by name.
>
> Before changing code, reconcile the corrected BUILD-0027 audit:
> 287,432 MW records, 287,312 converted, 120 rejected; 47 RV
> occurrences, 38 full and 9 rejected/retained as IAST; ten exact-token
> matches, nine distinct IDs, 50/436 code-point ratio. Treat the `īḷe`
> upstream correction as tested but examine the global replacement for
> collateral effects on genuine vocalic-L forms. The current correction
> package does not contain all regenerated experiment outputs, so do not
> claim full reproducibility until the corpus-generation script and
> outputs are available.
>
> Use the existing packet acceptance command and repository verification
> gate. Make no unrelated changes, do not commit restricted data, and do
> not mark a layer built until its tests prove the contract. Return: (a)
> a concise architecture decision, (b) a per-file implementation plan,
> (c) exact tests and commands, (d) a risk/unknown list, and (e) only
> then, if the plan is sound, a minimal patch with full logs and a
> change manifest.

## 12. Source and artifact ledger

### Project sources reviewed

-   `zistgah/tajziya` public `main`: README, CONTRACT, CONTEXT, API,
    Romenagri wrapper, Sanskrit port and manifest, registry, engines,
    and roadmap package definitions, retrieved on 14 October 2026.
-   `vendor/romenagri/UPSTREAM.json`: pinned native source and licence
    metadata in Tajziya.
-   BUILD-0024 test report, collision report, and research strategy from
    the available local artifacts.
-   BUILD-0027-RESULTS and BUILD-0027-CORRECTION ZIP archives and their
    included audit files.

### Local archive hashes

``` text
BUILD-0025__pushkalavati-hindawi-ilm-2026-10-14.zip
4f158697bcd891053a21b1a9ecebf33f7d5261a7a0de53e553330f05d22f3c25

BUILD-0026__pushkalavati-hindawi-ilm-2026-10-14.zip
64bf96b15f8459b0ee6bf0326e8df656a67dab87c8e65e383e286cbdcc048ea5

BUILD-0027-RESULTS.zip
fa53c87b160a482f282dc9b0d646825365c2f1e686a30fda3efe522cab825958

BUILD-0027-CORRECTION.zip
15f6229f55f081e2fa0e52acc85fdb7fb7c50e1dd23b6a82db5382f61b61fd06
```

### Important evidence limits

-   No Tajziya source files were modified while preparing this handover.
-   The public `main` branch was inspected through the GitHub connector;
    no local Tajziya build or test was run in this task.
-   BUILD-0027 correction test outcomes are reported by Grok and
    supported by included logs/audit files, but the complete regenerated
    corpus and experiment output directory were not present in the
    correction archive.
-   The Romenagri/Python/native compatibility boundary remains a test
    target, not a solved equivalence claim.
-   No universal phonetic or lexical coverage claim is made.

------------------------------------------------------------------------

## Final recommendation

Start with **P-SAN-01**, because it is already the repository's named
acceptance unit for the exact missing capability: Devanagari input
through Romenagri to the Sanskrit segmenter's internal representation.
Preserve the pinned native implementation; make the representation
bridge explicit; build strict rejection, provenance, and round-trip
tests around it. Once this path is accepted, extract reusable script
mechanisms into P-ENG-09 or P-L1-01 as appropriate. Do not treat the
current MW/RV literal-matching experiment as morphology, and do not use
unsupported character behavior as a reason to silently flatten
orthographic distinctions.
