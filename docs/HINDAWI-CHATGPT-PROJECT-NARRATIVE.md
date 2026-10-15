# Hindawi Project Narrative — ChatGPT Consolidated Account

**Document ID:** `HINDAWI-CHATGPT-NARRATIVE`  
**Document version:** `1.0.0`  
**Status:** Versioned project narrative; evidence-bounded; updateable  
**Created:** 2026-10-13  
**Applies to:** Hindawi/HPS, Chintamani, BangaBhasha, Romenagri, target-language forms historically called Shaili, multilingual ports, and the Sanchalan Suktam integration in this repository  
**Source snapshot:** `pushkalavati-combined-grok-latest-and-chatgpt-2026-10-13.zip` as supplied in this conversation  
**Change policy:** Preserve the version and revision history below. Update this document when repository evidence, source lineage, or test results change. Do not silently replace historical claims with newer assumptions.

> This document records the project's conceptual architecture, the facts supplied by the project owner, artifacts found in the supplied repository snapshot, reported test evidence, and unresolved work. It is a narrative and orientation document, not a substitute for executable specifications or test logs.

## 0. How to read this document

Claims are classified as follows:

- **Project-owner fact:** explicitly specified by the project owner; preserve unless the owner changes it.
- **Repository evidence:** directly represented by files, source code, configuration, or documentation in the supplied snapshot.
- **Reported result:** a result recorded by a previous run or supplied by a collaborator; it is not necessarily reproduced by the latest merge.
- **Inference / design interpretation:** an architectural conclusion drawn from the preceding evidence.
- **Unverified / incomplete:** the available evidence does not establish the claimed behaviour.

A file's presence is not proof that it builds. A table's presence is not proof of a working port. A successful translation or compilation smoke test is not proof of full semantic equivalence.

---

## 1. Project purpose

Hindawi is a programming-system lineage intended to let people work with established programming languages through human-language interfaces. It is not merely a set of translated keywords, a beginner-only teaching language, or a collection of independent localized compilers.

The project seeks to preserve the target programming language's computational model and use its established toolchain while providing a human-language-specific way to express and inspect programs. The relevant engineering concerns include:

- localized programming vocabulary and syntax;
- language identity, script identity, and orthographic conventions;
- conversion between the localized form and the target-language representation;
- target-specific adapters, filters, scanners, and toolchain invocation;
- reverse conversion where supported;
- source identity, diagnostics, and original-symbol debugging;
- reuse of genuinely shared constructs across language ports without erasing real differences.

**Governing principle:** the unit of completion is a tested port and its integration path, not the count of translated words or generated tables.

## 2. Project lineage and terminology

### 2.1 Owner-defined port relationships

The following are **project-owner facts** and must be preserved in documentation and data models:

- **Hindawi** is the central programming-system lineage.
- **Chintamani is the Telugu port of Hindawi.**
- **BangaBhasha is the Bangla port of Hindawi.**
- **HPS** is used in the project's established terminology in relation to Hindawi; HPS is the Brahmic specialization of ILM.
- **Bangabhasha** is HPS restricted to Bangla.
- **Chintamani** is HPS restricted to Telugu.

These relationships are port-of / specialization relationships, not merely package dependencies. Do not model Chintamani or BangaBhasha as unrelated tools that happen to call Hindawi. The original source lineage and the language-specific interface both matter.

The public sources captured in the historical documentation support the broader Hindawi lineage and historical programming-form family. They do not, by themselves, independently establish every detail of the owner-defined Chintamani and BangaBhasha relationships. Treat the relationships above as project-owner facts unless primary source artifacts provide additional corroboration.

### 2.2 Language and script are separate dimensions

A profile must not be identified by a language label alone. The registry and port architecture need to distinguish at least:

1. human language;
2. script and orthographic profile;
3. target programming language / computational system;
4. localized target-form name and vocabulary;
5. conversion direction and representation;
6. canonical construct identity;
7. adapter/toolchain and verification status.

Do not collapse Hindi and Urdu. Do not collapse Punjabi Shahmukhi and Gurmukhi. Persian and Arabic remain distinct languages even where scripts overlap. Kashmiri and Sindhi may have separate script profiles. Assamese and Bengali must not be made equivalent merely because their script profiles overlap.

### 2.3 A common semantic spine

A shared construct ontology can support multiple frontends and targets where the computational meaning is genuinely shared. It does not make different natural languages, scripts, or programming-language grammars interchangeable.

Use canonical construct identities to connect localized vocabulary to target constructs. Keep localized spelling, grammar, script, ambiguity, and reversibility rules explicit. Reuse a rule only when its meaning and preconditions are actually shared.

---

## 3. The Shaili principle: target-specific and human-language-specific naming

This section records a key architectural correction made during the project review.

### 3.1 What is a Shaili?

In the historical Hindawi terminology, *Shaili* (शैली) is used for a programming-language form associated with a particular target programming language or computational system. It is part of the historical Hindi naming/interface layer; it must not be assumed to be a universal, unlocalized label.

Historical target-form names present in the project lineage include:

| Target | Historical Hindi name recorded in the project |
|---|---|
| C | Guru |
| C++ | Shraeni |
| OpenJava/JVM | Kritrim |
| Lex | Shabda |
| Yacc | Vyaaka |
| x86 Assembly | Yantrik |
| BASIC | Prathmik |
| LOGO | Robot |

These are historical names, not a newly imposed naming scheme. Preserve the source spelling and capitalization in source-level references; reconcile variants against the original source artifacts before standardizing display labels.

### 3.2 The word “Shaili” itself must be localized

The name of the programming form depends on two distinct dimensions:

- **Target:** which programming language or computational system the form corresponds to.
- **Human-language port:** the language in which the programmer encounters and uses the form.

Therefore, the Hindi term *Shaili* must not automatically be copied into Telugu Chintamani, Bangla BangaBhasha, or other ports. Nor should the system mechanically concatenate a fixed word with the historical target name and call that a localized name.

The implementation should maintain a stable internal target-form identifier and a port-specific localized name and vocabulary. The localized term must come from the relevant port's own source and conventions.

**Unresolved:** this snapshot does not establish the exact Telugu and Bangla equivalents of the term itself. Recover them from Chintamani and BangaBhasha source artifacts, examples, documentation, or releases. Do not invent translations.

### 3.3 Historical Shaili Robot versus the new browser demonstrator

**Shaili is a programming paradigm in the Hindawi approach, not a synonym for one language. Shaili Prathmik is the Hindi BASIC-like language; Shaili Robot is the LOGO-like programming interface and can also be used to program robots.** This repository also contains a newer static browser-based LOGO/turtle-graphics demonstrator.

The new demonstrator is not verified as a reproduction of the original Shaili Robot implementation. Its working commands and tests establish the behaviour of the new demonstrator only. Historical command vocabulary, original parser/filter behaviour, examples, and backend compatibility require original-source recovery and fixtures.

---

## 4. Historical record and source lineage

The repository's historical page records the following chronology with different evidence grades. Dates marked as reported or retrospective should not be treated as primary release proof without the original release artifact.

| Date | Record | Evidence grade in the current documentation |
|---|---|---|
| 15 August 2004 | Reported initial public release | Retrospective secondary claim |
| 15 August 2005 | Reported version 2 release | Retrospective claim requiring primary confirmation |
| 20 November 2005 | Hindawi project blog entry | Dated first-party project record |
| 17 December 2005 | Detailed project description of programming forms and conversion | Dated first-party project record |
| 28 December 2005 | SourceForge registration | Hosting metadata |
| 16 August 2006 | Reported Linux port | Retrospective account |
| March 2007 | *Linux Magazine* coverage naming Shaili Robot and the Shaili family | Contemporary third-party source |
| 10 April 2008 | Archived `hindawilinux.tgz` listing | SourceForge file metadata |
| 26 April 2014 | SourceForge “last update” metadata | Hosting metadata, not proof of a source change on that date |
| 4 September 2024 | Revision date on a later overview page | Secondary-source metadata, not a project release |
| October 2026 | Current reconstruction and integration work | Current project activity, not proof that every historical feature has been reproduced |

Historical references captured in the project documentation:

- Hindawi project blog: https://hindawi.blogspot.com/
- *Linux Magazine*, issue 76, March 2007: https://www.linux-magazine.com/index.php/content/download/63246/487546/version/1/file/Linux_World_News.pdf
- SourceForge project: https://sourceforge.net/projects/hindawi/
- SourceForge old files: https://sourceforge.net/projects/hindawi/files/OldFiles/
- Romenagri source: https://github.com/project-ilm/romenagri

The next historical research pass should recover primary release artifacts, original filters, original examples, and the source lineage for Chintamani and BangaBhasha. Do not infer an exact port release date from a repository's last-update metadata.

---

## 5. Programming-language breadth: historical adapters versus multilingual integrations

### 5.1 Existing target-language lineage

The vendored Chintamani material contains historical Hindi-oriented adapters, converters, launchers, specifications, and samples for multiple target languages. The archive contains artifacts in these families:

| Target | Historical form / component | Representative artifacts in this snapshot |
|---|---|---|
| C | Guru | `h2c.uhin`, `c2h.uhin`, `gurucc`, `HindiC.uhin` |
| C++ | Shraeni | `h2cpp.uhin`, `cpp2h.uhin`, `shraenicc`, C++ specification |
| Python | Soochee | `h2py.uhin`, `py2h.uhin`, `soocheecc` |
| BASIC | Praatha | `h2b.uhin`, `b2h.uhin`, `praathacc` |
| Assembly | Hindi ASM | `HindiASM.uhin` and assembly sample |
| Java | Hindi Java | `HindiJAVA.uhin` |
| Lex | Hindi Lex | `HindiLEX.uhin` |
| Yacc | Wyaaka | `h2yacc.uhin`, `yacc2h.uhin`, `wyaakacc` |
| LOGO | Shaili Robot | Historical references plus the newer browser demonstrator |

The files demonstrate historical programming-language breadth. Their presence alone does not establish that every adapter builds in the current environment or that it is integrated with every human-language port.

### 5.2 Multilingual generated tables

The generated language-port layer currently has:

| Target | Profile count | Constructs per profile | Meaning |
|---|---:|---:|---|
| C | 68 | 20 | Generated candidate keyword tables |
| C++ | 68 | 25 | Generated candidate keyword tables; collisions are recorded |
| Python | 68 matrix rows | — | Multilingual integration not implemented/verified |
| BASIC | 68 matrix rows | — | Multilingual integration not implemented/verified |
| Assembly | 68 matrix rows | — | Multilingual integration not implemented/verified |
| Java | 68 matrix rows | — | Multilingual integration not implemented/verified |
| Lex | 68 matrix rows | — | Multilingual integration not implemented/verified |
| Yacc | 68 matrix rows | — | Multilingual integration not implemented/verified |

`lang/hindawi/ports/language_x_programming_language.csv` contains 544 rows representing 68 profiles × eight target families. It is a coverage/status matrix, **not 544 completed compiler ports**.

The generator derives C/C++ tables from canonical Romenagri language specifications and the shared keyword ontology. It does not fabricate missing translations. C++ collisions remain review findings; a colliding localized spelling is not automatically reversible or semantically unambiguous.

### 5.3 Required completion evidence

For a given language × target × script profile, the release gate should include, where applicable:

1. source vocabulary and grammar;
2. script-aware input and representation;
3. correct forward conversion through the established pipeline;
4. reverse conversion and round-trip fixtures where supported;
5. target compiler/interpreter/assembler acceptance;
6. execution against expected behaviour;
7. diagnostics and error handling;
8. preservation and debugging of original symbols;
9. profile-specific regression fixtures;
10. recorded toolchain version, command, logs, and exit status.

A keyword table passing shape or round-trip tests satisfies only a subset of these requirements.

---

## 6. Romenagri, script projections, and filters

The supplied repository vendors Romenagri inventories, language specifications, script-projection tables, and the generated port machinery. The registry describes 68 profiles; actual data completeness varies by profile.

Important distinctions:

- A script projection is not automatically a complete orthographic or linguistic conversion.
- A language inventory is not a compiler frontend.
- A base filter for one language/script pair cannot be assumed correct for a related language.
- Missing table rows must be reported, not guessed.
- Transliteration collisions and language-specific spelling must remain explicit.
- Existing upstream filters should be reused; do not recreate `fltr_*` logic without a demonstrated need.
- New inventories, keyword tables, filters, and source maps follow the project's CSV conventions unless the existing upstream contract specifies otherwise.

`lang/hindawi/PORT-STATUS.md` records several explicit gaps: Urdu needs differential testing with the actual `fltr_hi_ur` and `fltr_ur_hi` filters; Persian and Arabic need their own language-specific conformance; Shahmukhi Punjabi must remain distinct from Gurmukhi; Sindhi and Kashmiri script profiles must remain distinct; Tibetan and Sinhala contain pending entries in the vendored keyword data; and the Hebrew mapping is provisional.

The required audit is against the actual Romenagri and Chintamani source trees, with the exact filters and toolchain pinned. Do not claim all 68 profiles are complete because the registry contains 68 entries.

---

## 7. Sanchalan Suktam: source, compiler stages, and integration boundary

### 7.1 Source and associated artifacts

The original Sanskrit source is `lang/suktam/sanchalan.suktam`, with 22 numbered verses. Related artifacts include:

- `lang/suktam/lib/sanchalan.c` and `.h`;
- `lang/suktam/out/sanchalan.c`;
- `lang/suktam/out/sanchalan.json`;
- `lang/suktam/out/sanchalan.rs`;
- `lang/suktam/out/sanchalan-qemu.c`;
- `lang/suktam/out/sanchalan-x86`;
- `lang/suktam/out/sanchalan-riscv64`;
- the Hindi Hindawi source and conversion stages under `lang/suktam/hindawi/build/`;
- the Sanskrit-C prototype under `lang/sanskrit-c/`.

These artifacts represent different stages and purposes. Do not treat them as interchangeable source files.

### 7.2 Current Suktam parser/lowering status

The recorded generated reporting C output was:

```text
verses=22 recognized=141 residual=814 status=LEXICAL_IR_ONLY
```

This is a lexical-IR/reporting path. It establishes that the current parser recognized a subset of the input and generated a C program that reports that analysis. It does not establish that all Sanskrit constructs are understood or that the verses have been implemented as an operating system.

The 814 residual code points remain a known limitation. A successful compilation of the reporting program proves that generated C is compilable; it does not prove full semantic interpretation or execution of the instructions expressed in the Suktam.

### 7.3 Hindi Hindawi C conversion path

The source-stage files include:

- `lang/suktam/hindawi/build/sanchalan.c.uhin`;
- `lang/suktam/hindawi/build/sanchalan.c.uhin.acii`;
- `lang/suktam/hindawi/build/sanchalan.c`;
- corresponding header stages;
- `lang/suktam/hindawi/fixtures/tiny.c`;
- `lang/suktam/hindawi/build.sh`;
- `lang/suktam/hindawi/STATUS.md`;
- `lang/suktam/hindawi/TOOLCHAIN.md`.

The Hindi `.uhin` source is Hindi Hindawi C. It is distinct from the original Sanskrit Suktam input and from a future Sanskrit-keyword Hindawi library source.

### 7.4 Upstream conversion and build result reported by Grok

The vendored upstream lineage is recorded as:

- Chintamani: `3ad87785a75dc2b18438a8b068807103cb920c81`;
- Romenagri localized C tables and language inventories: `ef57fa4`.

Grok reported that Romenagri built after `flex`, `m4`, and `libfl` were present, and that the Hindawi/Guru `h2c` and `c2h` tools built.

The working conversion path reported was:

```text
C source -> c2h -> ACII -> acii2cf -> h2c -> C
```

The `gurucc` path using `acii2uni | iconv | h2c` was rejected because the built scanner matched romanized tokens rather than Devanagari. A minimal program stayed Hindi and did not compile through that path.

Grok reported that the selected path successfully converted a tiny C fixture, compiled and linked the Sanchalan library, and returned a nonzero result for an unknown operation. The script separates `check-deps`, `translate`, `compile`, `test`, and `clean` stages and stores generated artifacts under `lang/suktam/hindawi/build/`.

These are recorded results from the supplied integration work. The final merge did not rerun the upstream toolchain because `CHINTAMANI_ROOT` was not configured in that merge session. Line-by-line semantic equivalence to the original C was not claimed.

### 7.5 Sanskrit vocabulary and Sanskrit Sanchalan are separate deliverables

The repository contains:

- `lang/hindawi/keywords/sa/keywords.csv`;
- Sanskrit C/C++ candidate keyword tables;
- `lang/sanskrit-c/examples/ganana.sa.c`;
- the original Sanskrit Suktam;
- the Hindi Hindawi Sanchalan source and final ordinary C.

These artifacts establish Sanskrit vocabulary/prototype work. They do **not** establish that the Sanchalan library has been translated into a Sanskrit-keyword Hindawi source and compiled through the original pipeline.

The Sanchalan header explicitly says Sanskrit conversion comes later. The Sanskrit library build remains unresolved.

The correct next step is to derive and review the Sanskrit vocabulary using the established project conventions, maintain separate Hindi and Sanskrit source/vocabulary directories, integrate through the existing Hindawi pipeline, and test conversion, compilation, linking, execution, diagnostics, reverse conversion, and original-symbol debugging.

---

## 8. Sanchalan keyword-port tests

The supplied archive includes two distinct audit layers.

### 8.1 General generated-table audit

`python3 lang/hindawi/test_ports.py` audits the generated C/C++ table layer, including coverage and collision metadata. Its reported result is zero table-integrity failures across the 68 profiles.

This is not an end-to-end compiler test.

### 8.2 Sanchalan-specific C keyword check

`python3 lang/hindawi/test_sanchalan_ports.py` checks whether required Sanchalan C keywords are present in each vendored localized C table and round-trip to the same C tokens.

The reported passing profiles are:

- Arabic
- Bengali
- Gujarati
- Hindi
- Kannada
- Malayalam
- Marathi
- Odia
- Persian
- Punjabi (Gurmukhi)
- Sanskrit
- Tamil
- Telugu
- Urdu

Eight profiles were reported incomplete because the required Sanchalan keywords were absent:

- Aramaic
- Assamese
- Hebrew
- Nepali
- Pali
- Phoenician
- Prakrit
- Syriac

Grok explicitly left these profiles incomplete instead of inventing missing rows.

The test checks a limited set of required C keywords. It does not establish complete grammar support, compiler integration, runtime semantics, diagnostics, or original-symbol debugging for those profiles. Sanskrit passing this keyword test does not establish a Sanskrit Sanchalan library build.

---

## 9. QEMU and architecture evidence

Grok reported QEMU user-mode runs for x86-64 and RV64GC with matching Sanchalan verse traces. The archive carries the corresponding binaries and outputs forward.

Evidence boundary:

- The final merge did not rerun QEMU.
- User-mode execution is not a physical Shakti-board boot.
- Matching traces establish agreement for the recorded test case, not universal architecture equivalence.
- These results do not establish full OS semantics for the Sanskrit Suktam.

The combined manifest records that the trace files were byte-identical in the supplied archive. Treat that as carried-forward evidence unless a fresh QEMU run is performed.

---

## 10. Static web pages and documentation

The supplied project includes a static documentation site with the Hindawi history page, Shaili Robot lab, source-stage documentation, pipeline and status pages, and the wider Pushkalāvatī documentation catalog.

The Shaili Robot browser demonstrator additions include:

- `docs/shaili-robot.html`;
- `docs/shaili-robot.js`;
- `tests/test_shaili_robot.js`;
- `npm run test:logo-static`;
- navigation updates.

The demonstrator includes browser-side turtle graphics, movement, turns, pen control, heading changes, colors, nested `REPEAT` blocks, and error reporting. Its tests cover those implemented behaviours. It remains a new demonstrator, not a recovered original implementation.

The static documentation should reflect the localized Shaili principle: retain historical Hindi names as historical names, but do not use “Shaili” as a universal unlocalized category in every port. The exact Telugu and Bangla terms remain source-recovery tasks.

---

## 11. Archive lineage and merge provenance

The project work passed through several supplied archives, including:

- `pushkalavati-hindawi-multilingual-integration-deep-tested-2026-10-13.zip`;
- `pushkalavati-hindawi-multilingual-integration-regression-fixed-2026-10-13.zip`;
- `pushkalavati-lib-qemu.zip`;
- `pushkalavati-ports-qemu.zip`;
- `pushkalavati-language-x-programming-language-ports-2026-10-13.zip`;
- `pushkalavati-hindawi-shaili-logo-history-2026-10-13.zip`;
- `sanchalan-lowered-source-stages-2026-10-13.zip`;
- `pushkalavati-combined-most-expansive-2026-10-13.zip`;
- `pushkalavati-combined-grok-latest-and-chatgpt-2026-10-13.zip`.

The latest combined archive used in this narrative is `pushkalavati-combined-grok-latest-and-chatgpt-2026-10-13.zip`, with 768 ZIP entries in the supplied snapshot. Its manifest reports preservation of all 523 paths from Grok's supplied build while retaining the expanded port audit, Shaili/history documentation, source-stage bundle, and tests.

An earlier archive had missing executable permissions on shell scripts. Those modes were restored in a corrected package. This was a packaging defect, not a compiler defect.

For future releases, keep the merge manifest and source hashes updated. Do not describe carried-forward test results as freshly reproduced. The exact archive used for any new release gate should be recorded alongside its checksum and fresh test log.

---

## 12. Regression status and evidence classification

### 12.1 Earlier broad regression run

The recorded `scripts/test_all.sh` run ended with `ALL AVAILABLE TESTS PASSED`. Its reported checks included:

- JavaScript / Sūtram tests;
- C runtime compilation with `gcc -std=c11 -Wall -Wextra -Werror`;
- Romenagri integration contract;
- Pushkalāvatī rule compilation over 3,983 records;
- compiler and inverse-reduction tests, including `6.1.94`;
- Python tests (26 run, 25 passed, one skipped for external Cologne MW/RV artifacts);
- static-page link checks and HTTP smoke tests;
- browser tests;
- Shaili Robot static runner test;
- Sanchalan parser/lowering and generated reporting C;
- Rust compilation skipped because `rustc` was unavailable.

The Sanchalan parser/lowering result remained lexical-IR-only. The Rust and external-data skips were not passes.

### 12.2 Latest merge evidence

| Check | Recorded state |
|---|---|
| ZIP integrity | Passed |
| Grok paths preserved | Passed: 523 paths |
| Generated C/C++ table audit | Passed |
| Sanchalan keyword test | 14 pass, 8 incomplete |
| Sanchalan reporting C | Compiled and ran in the recorded test |
| Shaili Robot tests | Reported passing |
| Romenagri integration contract | Reported passing |
| Full suite after the final merge | Not fully rerun in the latest merge session |
| Fresh upstream Hindawi conversion | Not rerun in the latest merge session |
| Fresh QEMU run | Not performed in the latest merge session |
| Rust compilation | Unverified; `rustc` unavailable |
| Sanskrit-keyword Sanchalan library | Not established |

### 12.3 Required result vocabulary

All future reports should use these labels precisely:

- **PASS:** executed and verified in the stated environment.
- **FAIL:** executed and failed.
- **SKIPPED:** intentionally not run.
- **BLOCKED:** unable to run because a dependency or artifact is unavailable.
- **UNVERIFIED:** evidence exists from an earlier run but was not reproduced.
- **INCOMPLETE:** required constructs or integration stages are missing.

Do not upgrade a prior report to PASS without reproducing the test. Do not treat a generated table, populated matrix row, or source file as proof of a working compiler port.

---

## 13. Corrective findings from the review

The review identified recurring analytical mistakes that must not recur in future documentation or implementation:

1. Counting keyword tables as completed language ports.
2. Treating Sanchalan keyword coverage as the whole multilingual project.
3. Narrowing the historical programming-language lineage to C alone.
4. Treating “Shaili” as a universal, unlocalized name.
5. Declaring Sanskrit port artifacts absent without checking the broader source tree.
6. Omitting existing Sanskrit inventory/prototype artifacts from an earlier source bundle.
7. Treating archive creation and ZIP integrity as proof of integration.
8. Reporting old test results without stating that the latest merge did not rerun them.
9. Treating the original Shaili Robot and the new browser demonstrator as the same implementation.
10. Treating matching QEMU traces as a Shakti board boot or as proof of full OS semantics.

The corrected unit of analysis is the complete port integration path, with its own human-language terminology, script representation, target grammar, conversion stages, toolchain and tests.

---

## 14. Prioritized continuation plan

### P0 — Preserve source truth and terminology

- Recover primary source artifacts for Hindawi, Chintamani, BangaBhasha and each target-form family.
- Pin source commits, hashes, license details and release provenance.
- Recover exact Telugu and Bangla terminology for the programming forms and the term corresponding to Hindi *Shaili*.
- Keep owner-defined lineage facts separate from independently corroborated historical claims.
- Maintain CSV inventories and explicit language/script identifiers.

### P1 — Establish representative end-to-end ports

- Reproduce the original Hindi Guru path from a clean environment.
- Establish a complete Telugu Chintamani path from original source to compilation and execution.
- Establish a complete Bangla BangaBhasha path.
- Test at least one non-C target form through its actual adapter and toolchain.
- Capture forward and reverse conversion, diagnostics, runtime outputs and original-symbol debugging.

### P2 — Complete the Sanchalan integration

- Reduce and explain the 814 residual code points in the current lexical output.
- Keep the reporting C distinct from the intended system implementation.
- Build a Sanskrit-keyword Hindawi version of the library using the existing pipeline.
- Add reviewed Sanskrit vocabulary and round-trip fixtures.
- Verify the complete Sanskrit path through conversion, compilation, linking, execution and debugging.

### P3 — Expand the multilingual matrix

- Integrate the generated C/C++ candidate tables with actual adapters.
- Resolve C++ collisions and language-specific ambiguities.
- Extend Python, BASIC, Assembly, Java, Lex and Yacc only through the existing project method.
- Keep the eight incomplete Sanchalan keyword tables explicitly incomplete until source-backed mappings and tests exist.
- Preserve separate profiles for languages that share scripts.

### P4 — Release verification

- Run `scripts/test_all.sh` against the exact final merged tree.
- Rebuild upstream toolchains where required.
- Rerun QEMU only when explicitly in scope and record the exact emulator, binary and logs.
- Record skipped and blocked tests.
- Update the merge manifest, checksum, versioned project narrative and changelog.
- Never claim completion beyond the evidence.

---

## 15. Version history and maintenance protocol

This document is versioned independently of the software release.

### Version 1.0.0 — 2026-10-13

Initial consolidated narrative covering:

- Hindawi/HPS lineage and owner-defined Chintamani/BangaBhasha relationships;
- the Shaili concept and the requirement to localize the term itself;
- historical programming-language breadth;
- the 68-profile C/C++ table layer and 544-row target matrix;
- Romenagri and script/filter distinctions;
- Sanchalan source, Hindawi conversion, Sanskrit gap and QEMU evidence;
- archive lineage and test boundaries;
- corrective findings and prioritized next steps.

### Update protocol

For every future revision:

1. Inspect the current source tree and test evidence before editing.
2. Add a new version-history entry with date, version and substantive changes.
3. Increment **major** for a structural or conceptual revision, **minor** for substantive additions, and **patch** for corrections that do not change the document's conceptual contract.
4. Distinguish project-owner facts, repository evidence, reported results and inference.
5. Update all paths, commit hashes, counts, and test results from the current tree rather than copying old values blindly.
6. Keep unresolved issues visible until tests or primary sources resolve them.
7. Update the matching project index and changelog entry.
8. Preserve prior archive manifests and source provenance; do not silently rewrite history.

**End of version 1.0.0.**
