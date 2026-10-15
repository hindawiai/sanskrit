# Romenagri: Phoneme/Token Manipulation Inventory and Pāṇinian-Historical Research Dossier — BUILD-0017

**Prepared:** 13 October 2026\
**Scope:** Source-driven technical inventory of Romenagri's inherited
ACII/ISCII conversion kernel, its token table and state transitions;
consolidated record of the associated discussion of Pāṇini, Avestan,
Sanskrit, Prakrit, writing, spoken usage, and language evolution.\
**Repository reviewed:**
[`project-ilm/romenagri`](https://github.com/project-ilm/romenagri),
especially `src/acii.h`, `src/acii2rmn.c`, `src/rmn2acii.c`,
`src/stack.c`, `src/acii2uni.c`, `src/uni2acii.c`, `src/unicode.h`,
`tests/README.md`, `docs/RUNBOOK.md`, `CONTINUITY.md`, and
`tables/canonical_basis.json`.\
**Historical lineage:**
[`hindawiai/chintamani/Romenagri`](https://github.com/hindawiai/chintamani/tree/master/Romenagri).\
**Execution status:** BUILD-0014 correlation is static. BUILD-0015 was then inspected, and the combined BUILD-0016 word-level transliteration implementation and repository test suite were run. Fresh BUILD-0016 results are in Section 16 and the accompanying test report. Native upstream Romenagri C/filter differential testing remains unverified; archive-reported measurements remain distinguished from fresh measurements.

**Revision note (14 October 2026):** This edition supersedes the earlier
interpretation that treated `j_yna`/`g_yna` as a Romenagri anomaly and the
empty `^a` row as a demonstrated technical problem. It adds the complete
Devanagari ↔ ACII ↔ Romenagri trace, including the point at which dependent
vowel signs replace the inherent final `a` in the Romenagri spelling.

------------------------------------------------------------------------

## 1. Executive summary

Romenagri is an algorithmic representation and conversion system, not
merely a font or glyph mapping. Its inherited C implementation converts
between an ASCII-oriented Romenagri token stream and an ACII
representation based on a legacy one-byte Indic encoding layer
associated with ISCII. The source contains an 84-entry mapping table, a
stack-based reverse converter, a staged recursive parser,
dependent-vowel handling, halant insertion, aspirate recognition,
special-token dispatch, compound sequences, and contextual rewrites.

The most important design distinction clarified in the discussion is:

-   **`_` (underscore)** is not merely an independent-vowel prefix. It
    introduces a disambiguating token namespace and dispatches the
    parser to a dedicated branch for independent vowels and special
    consonant/orthographic forms.
-   **`^` (caret)** is not merely a decorative mātrā prefix. It selects
    dependent-form processing and participates in consonant-state
    handling, halant representation, and contextual rewriting.
-   These semantics arise from the table and the parser together.
    Neither symbol should be interpreted in isolation.

A critical mapping distinction must be preserved: **unmarked `ta`,
`tha`, `da`, `dha` are the retroflex series in this convention; `_ta`,
`_tha`, `_da`, `_dha` are the corresponding dental series.** This
reverses what a reader might assume if treating underscore as a generic
"special form" marker without consulting the actual mapping.

The current source is algorithmic and structurally rich. That is enough
to refute the claim that it is merely a font trick. It does not
automatically establish a universal round-trip bijection over every
possible input, nor does it establish that the converter implements the
complete Aṣṭādhyāyī. Those are separate claims requiring separate
evidence.

The historical discussion raised a connected but distinct question: how
Romenagri's actual phonological/token operations can be compared with
Pāṇinian operations without flattening encoding, phonological
representation, grammatical derivation, and historical linguistic claims
into one category.

------------------------------------------------------------------------

## 2. Terminology and architecture

### 2.1 ACII is not ASCII

In this project, **ACII** refers to the internal one-byte representation
used by the legacy conversion layer and associated with ISCII. It is not
a misspelling of ordinary ASCII. The spelling was also historically
constrained by DOS 8.3 filename conventions.

Romenagri is the ASCII-oriented token notation; ACII/ISCII is a
substrate representation used by the conversion implementation. These
layers are related but are not identical.

### 2.2 Canonical architecture: keep the axes separate

The current `CONTINUITY.md` describes three independent axes:

1.  **Script:** a writing-system projection, including
    script-to-Devanagari-hub tables and a Romenagri ASCII-7
    representation.
2.  **Language:** each language's own vocabulary and keyword registry.
3.  **Standard:** a construct ontology that maps language-independent
    constructs into particular programming-language forms.

Do not collapse script into language, language into programming-language
standard, or transliteration into translation.

### 2.3 Conversion path

The legacy Indic flow described in the source lineage is:

`UTF-8 → UTF-16 → [optional canonicalization/filter stages] → uni2acii → ACII → acii2rmn → Romenagri`

The reverse direction is:

`Romenagri → rmn2acii → ACII → acii2uni → UTF-16 → UTF-8`

The wrappers and optional filters matter. A statement about
reversibility of `rmn2acii`/`acii2rmn` is not automatically a statement
about the entire Unicode pipeline. Unicode normalization, script
projection, unsupported code points, newline conversion, and punctuation
handling can introduce separate behaviour.

### 2.4 Core source files

  -----------------------------------------------------------------------
  File                                Responsibility
  ----------------------------------- -----------------------------------
  `src/acii.h`                        84-entry Romenagri-key ↔ ACII-byte
                                      table

  `src/acii2rmn.c`                    ACII to Romenagri conversion; table
                                      matching plus stack rewriting

  `src/rmn2acii.c`                    Romenagri to ACII conversion;
                                      staged parser and table lookup

  `src/stack.c`                       Stack storage and push/pop
                                      operations used by `acii2rmn`

  `src/unicode.h`                     Legacy ACII-to-Unicode mapping
                                      table

  `src/uni2acii.c`                    UTF-16 input to ACII byte
                                      conversion

  `src/acii2uni.c`                    ACII byte conversion to UTF-16
                                      output

  `tables/canonical_basis.json`       Machine-readable canonical
                                      Romenagri-to-ISCII basis

  `tests/README.md`,                  Repository-reported test
  `docs/RUNBOOK.md`                   definitions and historical
                                      measurements
  -----------------------------------------------------------------------

The current repository's `src/acii.h`, `src/acii2rmn.c`, and
`src/rmn2acii.c` carry the same Git blob identities as the previously
examined source lineage: - `acii.h`:
`f10362454e663e0c954227075589f1b58d12cb80` - `acii2rmn.c`:
`65c318f12a62fb2cea12157e7663c41ac66ca593` - `rmn2acii.c`:
`6e4b437ca4b42b54c3db6e5de11e4bc6c7b0a6bd`

This anchors the analysis to identifiable source, rather than a guessed
or reformatted version.


### 2.5 End-to-end Devanagari ↔ ACII ↔ Romenagri trace

This section follows the actual conversion direction through the legacy
tables and functions. It is the controlling explanation for the vowel
and `j_yna` questions; a table row must not be interpreted without its
parser and Unicode-table context.

#### A. What `unicode.h` represents

`unicode.h` defines entries of the form `{low_byte, 9, legacy_character}`.
For the Devanagari block, the first two values form a UTF-16LE-style code
unit in the U+09xx range; the third value is a legacy one-byte character
used by the ACII layer. `uni2acii.c` reads input in two-byte units and
matches those pairs. It is not a UTF-8 decoder. The surrounding wrappers
must perform the UTF-8/UTF-16 conversion where applicable.

The direction is therefore:

`Devanagari UTF-16 code unit → unicode_hin lookup → legacy ACII byte → acii_chrt lookup → Romenagri spelling`

The reverse direction is:

`Romenagri spelling → rmn2acii parser → legacy ACII byte(s) → unicode_hin reverse lookup → Devanagari UTF-16 code unit(s)`

`acii2rmn.c` and `rmn2acii.c` are not simple inverses of individual table rows. They apply contextual logic around the table.

#### B. Independent अ has a representation; it is not a matra

For independent अ (U+0905), `unicode.h` contains `{5, 9, '¤'}`. In
`acii.h`, `¤` maps to `_a`. Therefore the path is:

`अ (U+0905) → '¤' → _a`

On the reverse path, `_a` is handled by `level1()` → `level2c()`, which
selects the independent-vowel entry and emits `¤`; `acii2uni` then maps
that byte back to U+0905, अ.

This establishes the central distinction:

- `_a` denotes the independent vowel अ.
- `^a` is the parser/table convention for the inherent short `a`, not an
  independent-vowel spelling.
- Devanagari has no dependent-vowel sign/mātrā for अ. The inherent vowel
  is the default reading of a consonant letter unless a virāma suppresses
  it or another dependent vowel sign replaces it.

#### C. क, का, कि, and क् in the forward direction

The actual Unicode table maps the consonant and dependent signs as follows:

| Devanagari input | UTF-16LE-style pair | Legacy byte | `acii.h` key | Romenagri output |
|---|---:|---|---|---|
| क (U+0915) | `{21, 9}` | `³` | `ka` | `ka` |
| ा (U+093E) | `{62, 9}` | `Ú` | `^aa` | contextually rewrites preceding `ka` to `kaa` |
| ि (U+093F) | `{63, 9}` | `Û` | `^i` | contextually rewrites preceding `ka` to `ki` |
| ु (U+0941) | `{65, 9}` | `Ý` | `^u` | contextually rewrites preceding `ka` to `ku` |
| ् (U+094D) | `{77, 9}` | `è` | `^` | removes the final inherent `a`, leaving `k` |

For `का`, the byte sequence is `³ Ú`. `acii2rmn()` first pushes
`ka`; when it encounters `Ú`, it finds the `^aa` row, sees that the key
starts with `^`, pops one byte from the accumulated output (the final
`a`), and pushes `aa`. The result is `kaa`. For `कि`, the same operation
replaces the final `a` with `i`, yielding `ki`. The caret-prefixed key
is used to recognise the *incoming dependent sign*; the caret itself is
not emitted in the ordinary Romenagri spelling.

For क्, the halant byte maps to key `^`. The forward converter removes
the final `a` from `ka`, leaving `k`. In the reverse direction, the
parser reads `k`, emits the consonant byte for क, and appends the halant
byte because the consonant has no following inherent-vowel spelling.
The Unicode projection therefore reconstructs क्.

These examples demonstrate when a matra is generated: **a dependent
vowel sign is emitted when the Romenagri input specifies a vowel other
than the inherent `a` after a consonant**. For example, `kaa` parses as
the consonant byte for क followed by the `^aa`/`Ú` byte for ा; `ki`
parses as क followed by the `^i`/`Û` byte for ि. Plain `ka` emits the
consonant byte only; it does not emit an explicit sign for अ.

#### D. Why `^a` has an empty value

There is no Unicode code point for a dependent sign “matra for अ” in
Devanagari. Accordingly, the converter has no separate dependent sign to
emit for inherent `a`. In `rmn2acii.c`, the `matra()` `case 'a'` consumes
the `a`; when no further vowel component follows, it reaches the end of
the token and emits no separate matra. This is consistent with the
orthographic model described above.

`acii.h` carries a historical comment saying that the change to `^a`
was undone and that a bug remained. That comment is relevant historical
provenance, but it must not be detached from the current parser and
orthographic behaviour. The table's empty value alone does not establish
a defect in the Devanagari conversion. To demonstrate a defect, one would
need to identify a concrete input context in which the parser treats
`^a` incorrectly relative to the intended Romenagri contract. No such
test was run for this document.

#### E. ज्ञ and the `j_yna` table entry

The relevant entries are:

- `ja` → `º` → ज (U+091C).
- `_yna` → `¼` → ञ (U+091E).
- `^` → `è` → virāma/halant (U+094D).
- `j_yna` → `ºè¼`, the composition `ja` + halant + `_yna`.

Thus the Unicode sequence ज + ् + ञ is rendered as ज्ञ, and the
Romenagri form is `j_yna`. This composition agrees with the table entry.
The adjacent comment `/*correct to g_yna*/` is a note for the
`acii2hin` path, as clarified by the project author; it is not evidence
that the `j_yna` key is a defect in `acii.h`. Do not classify it as an
unresolved Romenagri mapping issue.

#### F. What the Pushkalāvatī adapter does—and does not do

In the earlier `BUILD-0013` integration snapshot, and retained in
`BUILD-0014`, `tools/pushkalavati-compiler/src/romenagri.js` declares a
canonical Sanskrit sound-token layer and maps each sound to an audited
Romenagri table key. Its own comments state that this is a *per-sound table-key
audit*, not word encoding and not byte-for-byte emulation of the legacy
C parser. The adapter is therefore a separate abstraction layer; its
token arrays must not be mistaken for the output of `acii2rmn()`.

The integration archive's `acii-table.json` labels the empty `^a` value a
“known legacy hazard,” and the adapter's audit repeats that label. The
source trace above provides the necessary qualification: Devanagari has no
dependent sign for inherent अ, and the empty table value alone does not
prove a defect in the complete conversion path. Keep the original C source
comment as provenance, but do not promote the adapter's label into a
confirmed defect without a concrete failing context. BUILD-0014 retains
the stronger “hazard” wording; this dossier records the discrepancy rather
than silently editing the archive.

The archive also states that the complete upstream C source was not
vendored in that environment and that native C parity has not been
verified. This document does not claim such parity. No build, test, or
Pushkalāvatī iteration was run as part of this tracing exercise.

------------------------------------------------------------------------

## 3. The 84-entry token table: complete inventory

The table below reproduces the 84 key/value pairs from `src/acii.h`. The
"interpretation" column is deliberately conservative: it records what
can be inferred from the key, parser branch, comments, or Unicode table,
and flags cases whose precise phonological interpretation needs a
further trace. It does not pretend that every table row is an
independent phonological rule.

  ------------------------------------------------------------------------------------------------
                 \# Romenagri key ACII table    Class / operational role   Notes
                                  value                                    
  ----------------- ------------- ------------- -------------------------- -----------------------
                  1 empty key     `ïB`          Control/sentinel           Comment says control
                    `""`                                                   should be at index 0;
                                                                           also used by the
                                                                           forward converter's
                                                                           control-character
                                                                           condition.

                  2 `__`          `_`           Escape                     Expands an encoded
                                                                           underscore to the
                                                                           literal underscore in
                                                                           the reverse mapping.

                  3 `_a`          `¤`           Independent vowel          Independent short-a
                                                                           token.

                  4 `^a`          empty string  Zero-width inherent-a      Devanagari has no
                                                convention / parser       dependent sign for अ.
                                                convention                `^a` is consumed as
                                                                           the inherent short-a
                                                                           case in the parser;
                                                                           the empty table value
                                                                           alone is not evidence
                                                                           of a defective
                                                                           Devanagari matra map.
                                                                           Preserve the source's
                                                                           historical comment as
                                                                           provenance, not as a
                                                                           proven runtime defect.

                  5 `_aa`         `¥`           Independent vowel          Independent long-a
                                                                           token.

                  6 `^aa`         `Ú`           Dependent vowel            Long-a dependent form.

                  7 `_i`          `¦`           Independent vowel          Independent i.

                  8 `^i`          `Û`           Dependent vowel            Dependent i.

                  9 `_ee`         `§`           Independent vowel          Independent e-class
                                                                           token in this
                                                                           convention.

                 10 `^ee`         `Ü`           Dependent vowel            Dependent e-class
                                                                           token.

                 11 `_u`          `¨`           Independent vowel          Independent u.

                 12 `^u`          `Ý`           Dependent vowel            Dependent u.

                 13 `_oo`         `©`           Independent vowel          Independent oo-class
                                                                           token.

                 14 `^oo`         `Þ`           Dependent vowel            Dependent oo-class
                                                                           token.

                 15 `_ri`         `ª`           Independent vowel          Independent ri-class
                                                                           token.

                 16 `^_ri`        `ß`           Dependent vowel            Distinct dependent
                                                                           form; the parser can
                                                                           replace a previously
                                                                           emitted halant with
                                                                           this token.

                 17 `_ae`         `«`           Independent vowel          Independent ae-class
                                                                           token.

                 18 `^ae`         `à`           Dependent vowel            Dependent ae-class
                                                                           token.

                 19 `_aee`        `¬`           Independent vowel          Independent aee-class
                                                                           token.

                 20 `^aee`        `á`           Dependent vowel            Dependent aee-class
                                                                           token.

                 21 `_ai`         `­`            Independent vowel          Independent ai.

                 22 `^ai`         `â`           Dependent vowel            Dependent ai.

                 23 `_ow`         `¯`           Independent vowel          Independent ow-class
                                                                           token.

                 24 `^ow`         `ä`           Dependent vowel            Dependent ow-class
                                                                           token.

                 25 `_oa`         `°`           Independent vowel          Independent oa-class
                                                                           token.

                 26 `^oa`         `å`           Dependent vowel            Dependent oa-class
                                                                           token.

                 27 `_ou`         `±`           Independent vowel          Independent ou-class
                                                                           token.

                 28 `^ou`         `æ`           Dependent vowel            Dependent ou-class
                                                                           token.

                 29 `_au`         `²`           Independent vowel          Independent au.

                 30 `^au`         `ç`           Dependent vowel            Dependent au.

                 31 `_ao`         `®`           Independent vowel          Independent ao-class
                                                                           token.

                 32 `^ao`         `ã`           Dependent vowel            Dependent ao-class
                                                                           token.

                 33 `ka`          `³`           Consonant with inherent    Unmarked consonant
                                                vowel                      token; the `a` is part
                                                                           of the token
                                                                           convention.

                 34 `kha`         `´`           Aspirated consonant        Distinct token for kha.

                 35 `ga`          `µ`           Consonant with inherent    Base consonant token.
                                                vowel                      

                 36 `gha`         `¶`           Aspirated consonant        Distinct token for gha.

                 37 `_nga`        `·`           Special nasal consonant    Underscore namespace
                                                                           selects the token.

                 38 `cha`         `¸`           Consonant with inherent    Parsed through the
                                                vowel                      special `c` path.

                 39 `chha`        `¹`           Aspirated consonant        Parsed through the `c`
                                                                           path plus `h`
                                                                           recognition.

                 40 `ja`          `º`           Consonant with inherent    Base consonant token.
                                                vowel                      

                 41 `jha`         `»`           Aspirated consonant        Distinct token for jha.

                 42 `_yna`        `¼`           Special                    Exact phonological
                                                nasal/palatal-class token  label should follow the
                                                                           project's canonical
                                                                           sound inventory;
                                                                           preserve key spelling
                                                                           in machine data.

                 43 `ta`          `½`           Retroflex consonant        **Unmarked `ta` is
                                                                           retroflex in this
                                                                           convention.**

                 44 `tha`         `¾`           Retroflex aspirated        Follows the unmarked
                                                consonant                  retroflex series.

                 45 `da`          `¿`           Retroflex consonant        **Unmarked `da` is
                                                                           retroflex in this
                                                                           convention.**

                 46 `dha`         `À`           Retroflex aspirated        Follows the unmarked
                                                consonant                  retroflex series.

                 47 `_nna`        `Á`           Special nasal / retroflex  Distinct token in
                                                nasal class                underscore namespace.

                 48 `_ta`         `Â`           Dental consonant           **`_ta` is dental,
                                                                           unlike unmarked `ta`.**

                 49 `_tha`        `Ã`           Dental aspirated consonant Dental counterpart to
                                                                           unmarked retroflex
                                                                           `tha`.

                 50 `_da`         `Ä`           Dental consonant           **`_da` is dental,
                                                                           unlike unmarked `da`.**

                 51 `_dha`        `Å`           Dental aspirated consonant Dental counterpart to
                                                                           unmarked retroflex
                                                                           `dha`.

                 52 `na`          `Æ`           Nasal consonant with       Ordinary n-class token.
                                                inherent vowel             

                 53 `pa`          `È`           Consonant with inherent    Base consonant.
                                                vowel                      

                 54 `pha`         `É`           Aspirated consonant        Distinct token.

                 55 `ba`          `Ê`           Consonant with inherent    Base consonant.
                                                vowel                      

                 56 `bha`         `Ë`           Aspirated consonant        Distinct token.

                 57 `ma`          `Ì`           Nasal consonant with       Base m-class token.
                                                inherent vowel             

                 58 `ya`          `Í`           Consonant with inherent    Base y-class token.
                                                vowel                      

                 59 `ra`          `Ï`           Consonant with inherent    Base r-class token.
                                                vowel                      

                 60 `_rra`        `Ð`           Special r-class consonant  Distinct token in
                                                                           underscore namespace.

                 61 `la`          `Ñ`           Consonant with inherent    Base l-class token.
                                                vowel                      

                 62 `wa`          `Ô`           Consonant with inherent    Source spelling is `w`,
                                                vowel                      not silently normalized
                                                                           to `v`.

                 63 `lvra`        `Ò`           Special                    `level2b()` has a
                                                consonant/liquid-vocalic   dedicated `v` path for
                                                form                       this token family.

                 64 `sha`         `Õ`           Sibilant token             Preserve the project's
                                                                           key; exact
                                                                           phonetic/orthographic
                                                                           label should be taken
                                                                           from the canonical
                                                                           sound inventory.

                 65 `xa`          `Ö`           Sibilant/extended          Preserve source
                                                consonant token            spelling; do not infer
                                                                           a modern
                                                                           transliteration value
                                                                           without canonical
                                                                           documentation.

                 66 `sa`          `×`           Sibilant token             Base s-class token.

                 67 `_ha`         `Ø`           Special h-class token      Underscore dispatch
                                                                           selects the special
                                                                           form.

                 68 `_m`          `¢`           Nasal sign / trailing      Source comment: "only
                                                bindu-related token        for trailing bindu else
                                                                           find warg." Exact
                                                                           interpretation depends
                                                                           on context.

                 69 `_hh`         `£`           Special h-class token      Separate branch handles
                                                                           doubled `hh`.

                 70 `_na`         `¡`           Special nasal/sign token   Unicode mapping
                                                                           associates this byte
                                                                           with U+0901 in the
                                                                           legacy table; do not
                                                                           assume its key alone
                                                                           settles its linguistic
                                                                           function.

                 71 `^za`         `é`           Modifier / nukta-related   `unicode.h` maps this
                                                form                       legacy character to
                                                                           U+093C (Devanagari
                                                                           nukta). It is also the
                                                                           trigger for contextual
                                                                           rewrite logic in
                                                                           `acii2rmn()`.

                 72 `|`           `ê`           Punctuation / danda-like   Explicitly
                                                token                      table-mapped.

                 73 `^`           `è`           Halant / virāma token      Used for consonant
                                                                           termination and
                                                                           dependent-form state.

                 74 `_rda`        `¿é`          Composite: `da` plus       Encodes a base `da`
                                                modifier                   byte followed by the
                                                                           nukta-related byte.

                 75 `_rdha`       `Àé`          Composite: `dha` plus      Encodes a base `dha`
                                                modifier                   byte followed by the
                                                                           nukta-related byte.

                 76 `^ra`         `èÏ`          Composite: halant plus     Represents the
                                                `ra`                       halant/ra sequence.

                 77 `r`           `Ïè`          Composite: `ra` plus       A distinct sequence
                                                halant                     from `^ra`; order is
                                                                           meaningful.

                 78 `kxa`         `³èÖ`         Composite consonant        Equivalent table value
                                                sequence                   is `ka` + halant +
                                                                           `xa`.

                 79 `_tra`        `ÂèÏ`         Composite consonant        Equivalent table value
                                                sequence                   is `_ta` + halant +
                                                                           `ra`; note `_ta` is
                                                                           dental.

                 80 `j_yna`       `ºè¼`         Composite consonant        Table comment says
                                                sequence                   "correct to g_yna";
                                                                           this comment and key
                                                                           conflict and must
                                                                           remain a documented
                                                                           anomaly pending
                                                                           clarification.

                 81 `shra`        `ÕèÏ`         Composite consonant        Equivalent table value
                                                sequence                   is `sha` + halant +
                                                                           `ra`.

                 82 `_jza`        `€`           Extended Devanagari token  `unicode.h` comments
                                                                           that this character is
                                                                           placed at U+0979.
                                                                           Preserve the source's
                                                                           mapping; verify the
                                                                           exact phonetic label
                                                                           separately.

                 83 `_nza`        `Ç`           Special nasal/extended     Legacy Unicode table
                                                token                      maps this byte to
                                                                           U+0929; retain the
                                                                           mapping as source fact
                                                                           and keep phonetic
                                                                           interpretation
                                                                           explicit.

                 84 `_3`          `ë`           Avagraha                   Source comment
                                                                           explicitly identifies
                                                                           this as Avagraha.
  ------------------------------------------------------------------------------------------------

### 3.1 What the table does---and does not---mean

The table combines several kinds of entries:

-   Independent-vowel tokens.
-   Dependent-vowel tokens.
-   Consonants conventionally carrying an inherent `a`.
-   Aspirated consonants.
-   Distinctions among consonant series.
-   Special nasal and h-class tokens.
-   Modifier-bearing composites.
-   Halant sequences.
-   Punctuation and avagraha.
-   A control/sentinel entry and an underscore escape.

Therefore, it is not a pure one-row-per-phoneme alphabet. Some rows
encode phonological contrasts; some encode a dependent orthographic
state; some encode a sequence of legacy bytes; some are control or
punctuation conventions.

A future normalized inventory should separate at least these fields:
`source_key`, `legacy_value`, `phonological_category`,
`orthographic_role`, `parser_path`, `compositional_expansion`,
`Unicode_projection`, `reversibility_class`, and `evidence_status`.

------------------------------------------------------------------------

## 4. `_` and `^`: formal operational semantics

### 4.1 Underscore `_`: disambiguating namespace and parser dispatch

The parser's `level1()` routine sends `_` to `level2c()`:

``` c
case '_':
    level2c (++tok);
    break;
```

`level2c()` then dispatches based on the next characters. The source
includes branches for: - `_a`, `_aa`, `_ae`, `_aee`, `_ai`, `_ao`, `_au`
and related independent vowels; - special forms beginning with `_t` and
`_d`; - `_ha` and `_hh`; - `_na`, `_nna`, `_nga`, `_nza`; - `_ri`,
`_rd`, `_rr`; - `_jza`; - `_m` and `_s` paths.

The exact sequence is parsed, not simply printed as a prefix. For
example, `_tra` enters the underscore branch; `level2c()` sees `t`,
calls `level2b()` with the `_t` stem, and the remaining `ra` is resolved
as a following consonant after a halant transition. The table value
`ÂèÏ` corresponds to `_ta` + halant + `ra`.

**Operational conclusion:** underscore selects a disambiguated token
namespace and a dedicated parser path. It distinguishes otherwise
colliding forms, including dental versus retroflex consonants and
independent-vowel tokens versus ordinary consonant sequences. It is not
merely a visual marker for vowels.

The exact scope is defined by the table and the parser together. An
entry in the table does not guarantee that the recursive parser consumes
that whole entry as one atomic token; composite entries must be checked
against the actual branch behaviour.

### 4.2 Caret `^`: dependent-form selection and consonant-state handling

The parser sends `^` to `matra()`:

``` c
case '^':
    matra (++tok);
    break;
```

The `matra()` routine resolves dependent-vowel forms including: - `^i`,
`^u`, `^ee`; - `^aa`; - `^ae`, `^aee`, `^ai`, `^ao`, `^au`; - `^oo`,
`^ow`, `^oa`, `^ou`; - `^za`; - `^_ri`.

It also handles terminal state. If `matra()` receives an empty suffix,
it appends the table value for `^`, i.e. the halant byte.

The forward converter behaves differently because it is translating from
legacy bytes into the ASCII-oriented representation. When a mapped legacy
byte denotes a dependent vowel sign, the matching table key begins with
`^`. If the stack is nonempty, `acii2rmn()` removes the final byte of the
already-emitted consonant spelling (normally its inherent `a`) and pushes
the dependent vowel spelling in its place. Thus the caret-prefixed table
key is an internal classification of the incoming Devanagari sign; the
normal output is a fused Romenagri spelling such as `kaa` or `ki`, not a
literal `k^aa` sequence. For the special `^z` path, the converter pops
additional prior material and inspects it to choose `_rda`, `_rdha`, or
another sequence.

**Operational conclusion:** caret is a table-level selector for dependent
forms and a parser-level control marker. Its interpretation depends on
which direction is running. It is not simply printed as a prefix before
every Devanagari vowel sign.

### 4.3 The two prefixes are complementary, not interchangeable

-   `_` primarily disambiguates the identity of the token and dispatches
    into a special-token namespace.
-   `^` primarily selects dependent-vowel or consonant-ending state and
    can trigger a rewrite of preceding material.
-   `^_ri` is a distinct token, not a generic combination whose meaning
    can be inferred from either marker alone.
-   The sequence `^a` has an empty table value because the inherent
    short `a` has no separate Devanagari dependent-vowel sign. In the
    reverse parser, `^a` is consumed by the `matra()` short-a path without
    emitting a separate sign. This is consistent with Devanagari
    orthography; the table row's historical comment should be retained
    as provenance, but the row alone does not prove a functional defect.

------------------------------------------------------------------------

## 5. Reverse parsing: `rmn2acii.c` in detail

The reverse parser uses the character-class string:

``` c
char *lev1 = "|kgcjtdnpbmyrlwsxh_^";
```

This string is consulted to decide whether a following character should
trigger a halant transition. It is an implementation-level character
set, not a full phonological feature system.

### 5.1 `level1()`: primary dispatch

`level1()` reads the next Romenagri character and dispatches:

-   `|`: emit the punctuation token.
-   `n`, `m`, `y`, `w`, `x`, `r`: emit the corresponding base token and
    call `level2a()` on the suffix.
-   `g`, `c`, `t`, `d`, `p`, `b`, `s`, `l`, `k`, `j`: use `level2b()` to
    resolve inherent-vowel and aspirate cases.
-   `_`: call `level2c()` for the disambiguated namespace.
-   `^`: call `matra()` for dependent-form processing.
-   Anything else: append the literal character to output and continue.

The `h` case is commented out in the source. Although `h` appears in
`lev1`, `level1()` does not have an active direct `h` branch. The
character `h` is primarily consumed as an aspirate continuation or
through the underscore special-form path. This is an implementation fact
and should be documented, not silently assumed to be a conventional
standalone `ha` mapping.

### 5.2 `level2a()`: consonant boundary, halant, or dependent vowel

`level2a()` implements the key contextual decision:

-   If no suffix remains, append the halant token `^`.
-   If the next character belongs to `lev1`, append `^` and call
    `level1()` on that next character.
-   Otherwise, pass the suffix to `matra()`.

This is a stateful transition between a consonant token and its
following material. It is one of the clearest examples of Romenagri not
being a flat lookup table.

### 5.3 `level2b()`: inherent vowel, aspirates, and `lvra`

`level2b(tok, lk)` starts with a consonant stem `lk`:

-   If the input ends, it forms `lk + "a"`, emits that token, then emits
    halant.
-   If the next character is `h`, it forms `lk + "ha"`, emits the
    aspirated token, and continues through `level2a()`.
-   If the next character is `v`, it forms `lk + "vra"` and advances
    through the special `lvra` path.
-   Otherwise, it forms `lk + "a"` and passes the remaining input to
    `level2a()`.

The `c` case in `level1()` advances differently because the base key is
`ch`; that allows `cha` and `chha` to be distinguished. The same broad
mechanism recognises pairs such as `k`/`kh`, `g`/`gh`, `t`/`th`,
`d`/`dh`, `p`/`ph`, `b`/`bh`, and related families where the table
contains those tokens.

This is an orthographic/token recognition procedure. It is not, by
itself, a grammatical derivation rule.

### 5.4 `matra()`: dependent-vowel recognition

`matra()` uses the suffix after `^` to resolve dependent-vowel forms:

-   `i` → `^i`
-   `u` → `^u`
-   `e` → `^ee` (advancing by two characters)
-   `z` → `^za`, then `level2a()`
-   `_` → `^_ri` (the code comments this path as redundant)
-   `oo`, `ow`, `oa`, `ou` → their matching dependent forms
-   `aa`, `ae`, `aee`, `ai`, `ao`, `au` → their matching dependent forms
-   Otherwise, a literal character is appended and parsing continues.

The branch for `a` first checks whether the next character is in `lev1`.
If it is, the parser treats the `a` as inherent/implicit and continues
rather than emitting a separate dependent vowel. This is how the
representation differentiates a consonant's inherent vowel from an
explicitly selected dependent-vowel form.

### 5.5 `level2c()`: disambiguated token processing

`level2c()` is the parser's most extensive special-token branch. It
resolves: - special `_s`, `_u`, `_m`, `_i`, `_ee`; - `_yna`; - `_t` and
`_d` families through `level2b()`; - `_ha` and `_hh`; - `_oo`, `_ow`,
`_oa`, `_ou`; - `_na`, `_nna`, `_nga`, `_nza`; - `_ri`, including the
context-sensitive replacement of a trailing halant with `^_ri`; - `_rd`
and `_rr` families; - `_a`, `_aa`, `_ae`, `_aee`, `_ai`, `_ao`, `_au`; -
`_jza`; - default literal fallback.

The function's `switch` and lookahead patterns are not a general-purpose
longest-match lexer. They implement a particular recursive parsing
strategy whose behaviour depends on the order of branches and how much
each branch advances the input pointer.

### 5.6 Composite keys are not necessarily atomic parser productions

The table contains `kxa`, `_tra`, `j_yna`, and `shra`, whose ACII values
are composites of base tokens and halant sequences. The table's
existence does not prove the parser consumes every composite spelling as
a single token. The parser may produce the same ACII byte sequence
compositionally, or it may fail to recognise a table composite as an
atomic key.

The `j_yna` entry is compositional: `ºè¼` expands to `ja` + halant +
`_yna`, yielding ज् + ञ = ज्ञ. The `/*correct to g_yna*/` comment is a
note for the downstream `acii2hin` path, as clarified by the project
author. It is not evidence of a Romenagri key/value inconsistency and
should not be tracked as a Romenagri defect.

------------------------------------------------------------------------

## 6. Forward conversion: `acii2rmn.c` in detail

The forward converter resets the stack and iterates over the ACII input.
For each byte it searches the 84-entry table by checking whether the
byte matches the first character of a table value.

When a match is found:

1.  If the corresponding Romenagri key does not begin with `^`, the
    whole key is pushed.
2.  If the key begins with `^` and the stack is nonempty, the converter
    pops one byte of prior stack content.
3.  For ordinary dependent forms, it pushes the suffix after the caret.
4.  For the special `^z` case, it pops more material and inspects it:
    -   If the prior character is `d`, it emits `_rda`.
    -   If the prior two characters are `d` then `h` in the relevant
        stack order, it emits `_rdha`.
    -   Otherwise, it reconstructs a sequence involving `za` or `hza`
        and the preceding character.
5.  If no table value matches, the current character may be passed
    through, subject to the control-character condition.
6.  At the end, the converter pops the accumulated stack and copies it
    into `msg`.

This is a local, stack-driven rewrite system. The output for a dependent
form depends on previously emitted material, and the `^z` path
explicitly inspects the preceding token state.

### 6.1 Source-level concerns to document, not silently fix

-   The loop calls `strlen(tok)` on each iteration, creating avoidable
    repeated work.
-   The expression `tok[i - 1]` is evaluated in the unmatched-character
    condition, including the possibility of `i == 0`. In C, that is an
    out-of-bounds read unless separately guarded. The source reviewed
    here contains this expression; repository continuity notes mention a
    historical underflow fix, so the exact built/guarded variant must be
    identified before asserting the bug's current runtime status.
-   The `^a` table value is empty. The normal Devanagari mapping has no
    dependent sign for अ, and the reverse parser consumes the inherent-a
    case without emitting a separate matra. The table comment records a
    historical concern, but the empty value alone is not a demonstrated
    failure in the full conversion path. Do not classify it as a defect
    without a specific failing input and an intended-output contract.
-   The code uses global/shared buffers and stack state; re-entrancy and
    thread safety should not be assumed.
-   `push()` can fail at its fixed capacity, but the caller does not
    visibly propagate every failure.
-   `pop()` returns a shared buffer and can return `NULL` on underflow.
    Callers must not assume every pop succeeds.
-   `lookup()` returns `NULL` for an unknown key; the source itself
    comments that this can cause a segmentation fault.
-   The `strcat`/`strcpy`-based routines depend on adequate buffer
    capacity and valid NUL termination.

These observations do not negate the algorithmic design. They define the
distinction between historical design, current source behaviour, and
hardening status.

------------------------------------------------------------------------

## 7. Phoneme-manipulation inventory by operation family

This section classifies the actual manipulations rather than treating
every table row as a separate sound-change rule.

### 7.1 Independent vowel selection

The underscore namespace identifies independent vowel forms: `_a`,
`_aa`, `_i`, `_ee`, `_u`, `_oo`, `_ri`, `_ae`, `_aee`, `_ai`, `_ow`,
`_oa`, `_ou`, `_au`, `_ao`.

The reverse parser handles these through `level2c()`. The representation
explicitly separates independent vowel tokens from dependent forms.

### 7.2 Dependent vowel selection

Caret-prefixed forms select dependent-vowel representations: `^a`,
`^aa`, `^i`, `^ee`, `^u`, `^oo`, `^_ri`, `^ae`, `^aee`, `^ai`, `^ow`,
`^oa`, `^ou`, `^au`, `^ao`.

The dependent `a` is special because Devanagari has no separate matra
for अ. The table maps `^a` to the empty string, and the reverse parser
consumes that inherent-a spelling without emitting a separate dependent
sign. The historical source comment should be recorded, but this is not
by itself proof of information loss or a conversion defect.

### 7.3 Inherent-vowel handling

Consonant keys generally contain an `a`, e.g. `ka`, `ga`, `ta`, `da`,
`pa`. `level2b()` emits the inherent-vowel token when the next character
is not an aspirate marker or the special `v` sequence. The following
`level2a()` decides whether to attach a dependent form or emit halant
before another consonant.

### 7.4 Halant / virāma insertion

The `^` token maps to the ACII halant byte. `level2a()` emits it: - at
the end of a consonant sequence; - before another consonant-like
token; - when the parser's character-class test selects a consonant
boundary.

The exact emitted sequence is order-sensitive: `^ra` is halant + `ra`,
while `r` is `ra` + halant. These are not equivalent encodings.

### 7.5 Aspirate recognition

`level2b()` recognises an `h` following certain consonant stems and
emits a combined aspirated token. The `c` branch's pointer advancement
enables `cha` and `chha` to be differentiated. This is an
orthographic/token-level rule for identifying a combined consonant
spelling.

### 7.6 Dental/retroflex distinction

The token table establishes a non-obvious but critical convention:

-   Unmarked `ta`, `tha`, `da`, `dha`: retroflex series.
-   Underscored `_ta`, `_tha`, `_da`, `_dha`: dental series.

This is a direct representational distinction. It is not itself a
retroflexion sound-change rule. A phonological rule would require an
operation that changes a sound under a stated environment; the table
instead distinguishes two categories.

### 7.7 Nasal and special consonant distinctions

The table distinguishes `na`, `_na`, `_nna`, `_nga`, `_yna`, and `_nza`.
These should not be collapsed into one generic nasal token. The parser
has distinct branches for `_na`, `_nna`, `_nga`, `_nza`, and `_yna`.
Their precise sound labels should be grounded in the project's canonical
phoneme inventory rather than inferred solely from their spellings.

### 7.8 Sibilants and special h-class tokens

`sha`, `xa`, `sa`, `_ha`, and `_hh` have distinct table entries or
parser paths. The source spelling should be retained as the primary key.
Exact IPA/Indic phonological labels should be drawn from the canonical
sound specification, not guessed from Roman-letter names.

### 7.9 Nukta/modifier-bearing rewrites

The legacy table maps `^za` to the character `é`; the Unicode table maps
that character to U+093C, Devanagari nukta. Composite keys `_rda` and
`_rdha` correspond to a base `da`/`dha` byte followed by that modifier
byte.

The forward converter detects the `^z` family and inspects prior stack
content to emit `_rda` or `_rdha` when the prior consonant context
matches. This is a genuine contextual rewrite in the encoding converter.
It is not automatically equivalent to a Pāṇinian retroflexion rule.

### 7.10 Composite consonant sequences

The table encodes: - `^ra` as halant + `ra`; - `r` as `ra` + halant; -
`kxa` as `ka` + halant + `xa`; - `_tra` as `_ta` + halant + `ra`; -
`j_yna` as `ja` + halant + `_yna`; - `shra` as `sha` + halant + `ra`.

These entries are sequence encodings. They may represent orthographic
conjuncts or explicit consonant boundaries, but they are not all
independent phonemes.

### 7.11 Punctuation, control, escape, and avagraha

The table explicitly encodes `|`, `__`, the empty-key control entry, and
`_3` for avagraha. These belong in the complete inventory because a
compiler-grade substrate must preserve non-phonemic syntax and
delimiters as well as sound categories.

### 7.12 Literal fallback

The parser passes unrecognised characters through in several branches.
`acii2rmn()` also copies unmatched bytes under its existing
control-character condition. Literal pass-through is useful for
preserving unrecognised data but can complicate claims of canonical,
unambiguous interpretation. The accepted character domain must be
stated.

------------------------------------------------------------------------

## 8. Round-trip correctness and measured status

### 8.1 The mathematical invariants

Let `φ` represent the Romenagri-to-ACII conversion and `ρ` represent
ACII-to-Romenagri conversion, or vice versa according to the chosen
naming convention. Define the direction explicitly in any test report.

Exact reversibility requires identity over the declared domain: -
reverse(forward(x)) = x; - forward(reverse(y)) = y, where both
directions are intended to be defined.

Canonical reversibility is weaker: an input may round-trip to a stable
canonical form rather than byte-identically. These must be reported
separately.

### 8.2 Repository-reported measurements: do not merge variants

The current repository's `README.md` reports approximately: - 98.68%
exact-or-canonicalizable over arbitrary `[a-z]` input; - approximately
1.31% irreducible ambiguity floor; - a seed release that compiles with
GCC but still needs hardening for totality, O(n) behaviour, re-entrancy,
and WASM.

`tests/README.md` reports an exhaustive `[a-z]^1..4` sweep of 475,254
strings and gives: - exact round-trip: 2.34%; - normalized stable
canonical fixed point: 53.26%; - reversible-or-canonical: 55.60% for the
chintamani post-guard figure; - 98.68% for the 2003--04 "holy-grail"
kernel; - irreducible floor: 1.31%; - crash class: 0.005% for the
guarded result.

`docs/RUNBOOK.md` separately refers to the chintamani **pre-guard**
result as 55.6% with 4.05% crash, and points to a separate post-guard
result file.

`CONTINUITY.md` gives another chintamani post-guard figure of 67.62%
reversible-or-canonical and 2.70% crash.

These values are not interchangeable. They refer to different kernels,
guard states, test definitions, or snapshots. This document does not
resolve the discrepancy and does not rerun the tests. Any publication or
engineering report must name the exact source variant, guard state,
domain, and invariant measured.

### 8.3 What may be claimed now

Supported by source inspection: - Romenagri is algorithmic, not merely a
font. - It has an 84-entry table and context-sensitive parsing/rewrite
paths. - It explicitly distinguishes many phonological and orthographic
states. - It has a designed bidirectional architecture.

Not established merely by source inspection: - Universal bijection
across every possible byte or Unicode input. - Complete round-trip
preservation through every wrapper and script projection. - Full
phonological coverage of Sanskrit, Vedic Sanskrit, or every Indic
language. - Formal equivalence with the Aṣṭādhyāyī. - Correctness of
every table composite as an atomic parser production.

------------------------------------------------------------------------

## 9. Pāṇinian comparison: method and proposed correspondences

### 9.1 Four evidence levels

Every proposed relation must be labelled as one of: 1. Representational
correspondence. 2. Structural analogy. 3. Operational correspondence. 4.
Grammatical equivalence.

Do not label an encoding distinction as a sound-change rule. Do not
label a staged parser as a Pāṇinian rule-ordering engine unless its
actual conflict behaviour is demonstrated.

### 9.2 Proposed sūtra comparisons reviewed in the discussion

  -----------------------------------------------------------------------
  Sūtra                   Potential comparison    Current evidence level
  ----------------------- ----------------------- -----------------------
  1.1.7 *halo 'nantarāḥ   Explicit consonant      Structural comparison
  saṃyogaḥ*               sequences and           worth testing; not
                          halant-separated        every composite token
                          composite tokens        is automatically a
                                                  grammatical *saṃyoga*

  1.1.60 *adarśanaṃ       Empty mapping `^a` and  Analogy only; an empty
  lopaḥ*                  non-appearance          encoding value is not
                                                  proof of grammatical
                                                  *lopa*

  1.1.69 *aṇudit          Explicit sound-category Not a direct
  savarṇasya cāpratyayaḥ* distinctions            explanation of `_`
                                                  versus `^`

  1.1.71 *ādir antyena    Compact notation and    At most an abstract
  sahetā*                 technical markers       notation analogy; the
                                                  sūtra concerns
                                                  *pratyāhāra*
                                                  construction

  1.1.68 *svaṃ rūpaṃ      Punctuation/control     No direct
  śabdasyāśabdasaṃjñā*    pass-through            correspondence
                                                  established

  1.4.2 *vipratiṣedhe     Ordered parsing stages  No direct
  paraṃ kāryam*                                   correspondence
                                                  established without a
                                                  demonstrated
                                                  conflict-resolution
                                                  case

  8.2.1 *pūrvatrāsiddham* Scope/ordering in       No direct
                          parsing                 correspondence
                                                  established

  8.4.41 *ṣṭunā ṣṭuḥ*     Retroflex-related token Representational
                          distinctions            analogy only unless a
                                                  conditioned sound
                                                  transformation is shown
  -----------------------------------------------------------------------

### 9.3 Required evidence for a direct correspondence

For each candidate sūtra: - Give the precise input representation. -
Identify the exact source branch. - Trace every state transition. - Show
the output representation. - State the grammatical environment required
by the sūtra. - Show that the code performs the same transformation
under that environment. - Test a positive example and a negative/control
example. - Identify exceptions, ordering, or blocking behaviour. -
Record whether the claim is only structural or is operationally
equivalent.

The source must be judged by what it computes. The Pāṇinian relation
must be judged by rule-level evidence.

------------------------------------------------------------------------

## 10. Historical discussion: Pāṇini, writing, and Gandhāra

### 10.1 Was writing available?

The conversation distinguished: - writing being available in the
region; - Pāṇini personally using writing; - the grammar itself having
formal symbolic structure.

Pāṇini is commonly dated around the middle of the first millennium BCE,
with the precise date disputed. Gandhāra was connected to Achaemenid
imperial administration and Aramaic writing. The earliest securely
attested surviving Indian inscriptions are generally associated with
Aśoka in the third century BCE. No contemporary manuscript establishes
that Pāṇini personally wrote the Aṣṭādhyāyī.

A 2024 article by Vincenzo Vergiani argues that the introduction of
writing into Achaemenid Gandhāra may have enabled the composition of
Pāṇini's grammar. This is a serious hypothesis, not a settled fact. It
should not be used to attribute the grammar's conceptual foundations to
the empire merely because writing may have become available under
imperial rule.

### 10.2 The geographical argument that must be preserved

The user's point was not simply that Pāṇini's grammar should be
geographically expanded, nor that he borrowed from neighbouring
languages. The point was:

**There were linguistic commonalities westward, northward, and southward
towards Iran from Pāṇini's north-western location. Those commonalities
belong to the linguistic environment in which his work must be
understood.**

Do not recast this as a borrowing claim. Shared features may be
inherited, areal, or otherwise historically related; the user did not
assert one language borrowed from another.

### 10.3 Avestan and Vedic Sanskrit

The discussion compared Avestan with the Sanskrit tradition Pāṇini
described, using Vedic Sanskrit as the relevant comparison rather than
Classical Sanskrit alone.

Examples discussed: - Vedic *sapta* and Avestan *hapta*; - Vedic *soma*
and Avestan *haoma*; - Sanskrit *asura* and Avestan *ahura*; - Sanskrit
*Mitra* and Avestan *Miθra*.

These illustrate systematic sound correspondences. The broader
comparison includes extensive shared Indo-Iranian vocabulary, nominal
inflection, case systems, dual number, and inherited verbal morphology,
alongside differences in sibilants, aspirated stops, retroflexion,
lexicon, morphology, and syntax.

Old Avestan is generally older than Pāṇini's conventional period; Young
Avestan represents a later stage with a broad and disputed chronology.
The surviving written transmission is later than the linguistic periods
represented. Thus the historical comparison concerns reconstructed
language stages, not one precisely dated "Avestan of Pāṇini's day."

------------------------------------------------------------------------

## 11. Sanskrit, Prakrit, cultivation, and substrate hypotheses

### 11.1 The user's distinction

The user argued that *saṃskṛta* means cultivated or refined language and
raised the possibility that a substrate or broader set of pre-existing
spoken forms contributed linguistic material to the cultivated, highly
formalised language.

The contrast invoked was: - *Prakṛti* / *Prākṛta*: natural or ordinary
linguistic forms; - *Saṃskṛti* / *Saṃskṛta*: cultivation, refinement, or
systematisation.

This is a conceptual framing for a historical hypothesis. The
etymological contrast alone does not prove a particular substrate or the
exact process of Sanskrit's formation.

### 11.2 Spoken use and lingua-franca status are separate claims

The conversation asked what evidence supports the claim that Sanskrit
was a spoken language or lingua franca.

Relevant evidence types discussed: - Pāṇini's distinction between
*bhāṣā* and *chandas*; - later testimony in Patañjali's *Mahābhāṣya*; -
grammatical forms that may reflect a learned or semi-colloquial
register; - inscriptions, including Aśokan Prakrit inscriptions; - later
Sanskrit's transregional role in learned and political contexts.

These sources do not establish the same proposition. Evidence of
Sanskrit spoken in particular settings is not equivalent to proof that
the exact grammatical standard Pāṇini codified was the universal
vernacular or a subcontinental lingua franca in his lifetime.
Conversely, lack of proof of a universal lingua franca does not prove
Sanskrit was never spoken.

### 11.3 Sanskrit as an evolving system

The user's final clarification was: **Sanskrit evolved, like versions of
a programming language.**

The analogy distinguishes: 1. The evolving spoken linguistic system. 2.
A formal grammatical specification. 3. The historically realised
standard in teaching, transmission, writing, and use.

A grammatical specification may formalise an existing cultivated
register, preserve older forms, choose among variants, and regulate
usage. Later grammarians and speakers can interpret, extend, and realise
the standard in different ways. The specification and actual usage need
not be identical at every historical stage.

This analogy is useful for Pushkalāvatī as well: the corpus, formal
grammar, executable rule engine, and attested-form corpus should remain
distinct artefacts with explicit versions and evidence.

------------------------------------------------------------------------

## 12. Consolidated conclusions

1.  Romenagri is an algorithmic conversion and representation system,
    not a font trick.
2.  Its 84-entry table mixes phonological distinctions, orthographic
    states, composites, punctuation, escape, and control conventions.
3.  `_` is a disambiguating namespace and parser dispatch mechanism.
4.  `^` selects dependent-form processing and participates in halant and
    contextual state transitions.
5.  Unmarked `ta`/`da` are retroflex in this convention; `_ta`/`_da` are
    dental.
6.  The forward converter uses stack-based rewriting, especially for
    caret-prefixed forms and the `^z`/nukta-related path.
7.  The reverse converter uses staged recursive parsing for consonants,
    aspirates, vowels, halant transitions, special tokens, and literal
    fallback.
8.  Table membership does not prove that a composite is parsed
    atomically.
9.  The `j_yna` key maps compositionally to `ja` + halant + `_yna` =
    ज्ञ. The adjacent `correct to g_yna` comment concerns `acii2hin`;
    it is not a demonstrated Romenagri mapping defect.
10. The empty `^a` entry reflects the fact that Devanagari has no
    dependent-vowel sign for अ. Its parser behaviour must be understood
    in context; the empty table value alone does not establish a defect.
11. Round-trip claims must identify the exact kernel, wrapper, domain,
    and invariant. Repository metrics for the 2003--04 kernel and
    chintamani variants conflict and must not be merged.
12. A Pāṇinian correlation must be made operation by operation,
    distinguishing representation, structural analogy, operational
    correspondence, and grammatical equivalence.
13. Pāṇini's Gandhāran setting must be understood within a wider
    linguistic environment that includes commonalities west, north, and
    south towards Iran. This is not the user's claim that one language
    borrowed from another.
14. Avestan and Vedic Sanskrit exhibit extensive shared Indo-Iranian
    inheritance and systematic divergence.
15. The relationship among natural speech, substrate contributions,
    cultivated Sanskrit, formal codification, and later standardisation
    remains a historical question to investigate.
16. Evidence of spoken Sanskrit must not be conflated with proof of a
    universal lingua franca.
17. Sanskrit's evolution is usefully analysed by separating the changing
    linguistic system, the grammatical specification, and the
    historically realised standard.
18. The Devanagari trace shows that independent अ maps through `_a`,
    while dependent vowel signs such as ा and ि are represented by
    replacing the inherent final `a` in `ka` with `aa` or `i`; there is
    no separate Devanagari matra for अ.
19. The `j_yna` composite corresponds to ज् + ञ = ज्ञ. Its `correct to
    g_yna` comment is a note for `acii2hin`, not a demonstrated
    Romenagri defect.
20. No build or tests were run for this document.

------------------------------------------------------------------------

## 13. Source register

### Primary Romenagri source

-   [`project-ilm/romenagri`](https://github.com/project-ilm/romenagri)
-   [`src/acii.h`](https://github.com/project-ilm/romenagri/blob/main/src/acii.h)
-   [`src/acii2rmn.c`](https://github.com/project-ilm/romenagri/blob/main/src/acii2rmn.c)
-   [`src/rmn2acii.c`](https://github.com/project-ilm/romenagri/blob/main/src/rmn2acii.c)
-   [`src/stack.c`](https://github.com/project-ilm/romenagri/blob/main/src/stack.c)
-   [`src/uni2acii.c`](https://github.com/project-ilm/romenagri/blob/main/src/uni2acii.c)
-   [`src/acii2uni.c`](https://github.com/project-ilm/romenagri/blob/main/src/acii2uni.c)
-   [`src/unicode.h`](https://github.com/project-ilm/romenagri/blob/main/src/unicode.h)
-   [`tables/canonical_basis.json`](https://github.com/project-ilm/romenagri/blob/main/tables/canonical_basis.json)
-   [`tests/README.md`](https://github.com/project-ilm/romenagri/blob/main/tests/README.md)
-   [`docs/RUNBOOK.md`](https://github.com/project-ilm/romenagri/blob/main/docs/RUNBOOK.md)
-   [`CONTINUITY.md`](https://github.com/project-ilm/romenagri/blob/main/CONTINUITY.md)

### Historical lineage

-   [`hindawiai/chintamani/Romenagri`](https://github.com/hindawiai/chintamani/tree/master/Romenagri)

### Pāṇini and the historical setting

-   S. D. Joshi, ["Background of the
    Aṣṭādhyāyī"](https://sanskrit.uohyd.ac.in/Symposium/papers/joshi.pdf).
-   Vincenzo Vergiani, ["The Introduction of Writing into Achaemenid
    Gandhāra and the Origin of Pāṇini's Grammar"
    (2024)](https://journals.sagepub.com/doi/10.1177/09719458241226574).
-   Brendan S. Gillon, ["Pāṇini's Aṣṭādhyāyī and Linguistic
    Theory"](https://doi.org/10.1007/s10781-007-9027-3).

------------------------------------------------------------------------

## 14. Follow-on work (not performed here)

The next work package should be a source-driven conformance matrix, not
a build:

1.  Validate each of the 84 table entries against the parser path.
2.  Separate token keys from composite sequences and establish which are
    atomic productions versus compositional outputs.
3.  Establish a canonical sound inventory with precise phonological
    labels, especially for `_yna`, `_nna`, `_na`, `_nza`, `sha`, `xa`,
    `_ha`, and `_jza`.
4.  Trace all caret transitions and document every stack pop/push
    sequence.
5.  Enumerate each positive and negative context for the `^z` rewrite.
6.  Document empty, duplicate, many-to-one, and pass-through mappings
    in their actual parser context; distinguish intentional orthographic
    conventions from demonstrated loss of information.
7.  Preserve the provenance note that `correct to g_yna` concerns
    `acii2hin`; do not treat it as a Romenagri mapping anomaly.
8.  Reconcile repository-reported kernel measurements by source revision
    and test definition without conflating them. No measurement was
    repeated for this document.
9.  Only then build the Pāṇinian correlation matrix, with direct-sūtra
    claims reserved for operations with explicit condition/output
    evidence.
10. Keep this analysis separate from Grok's active Pushkalāvatī
    iterations.

### Revision record — 14 October 2026

This revision completes the Unicode/legacy-byte/Romenagri trace for
independent अ, क, का, कि, कु, क्, and ज्ञ; clarifies that the `^` prefix
classifies dependent-form table entries but is not normally emitted in
the final Romenagri spelling; corrects the interpretation of the
`j_yna` comment; and withdraws the earlier classification of `^a` as a
proven technical defect. The historical comment remains documented as
source provenance. No code was changed and no build or test was run.



------------------------------------------------------------------------

## 15. Correlation with Grok's BUILD-0014 archive

### 15.1 Archive identity and evidence boundary

The uploaded archive identifies itself as **BUILD-0014**, dated 13 October
2026, based on BUILD-0013, with the stated change “benchmark harness with
shared cases and adapters.” Its SHA-256 is:

`780e9c13eb86090adfc38d5d695ab3d009eda9ad68c2fcd124000faa3dfd0b84`

This section is a static inspection of the ZIP's source and pre-existing
reports. The ZIP is not a Git checkout. No command in the archive was run
for this review; the report files below are historical artifacts shipped
inside the archive, not fresh results.

### 15.2 What the Romenagri integration actually is

BUILD-0014 retains the bridge in
`tools/pushkalavati-compiler/src/romenagri.js` and the transcribed table in
`tools/pushkalavati-compiler/data/romenagri/acii-table.json`.

The archive's table metadata says `source_table_length: 84` and contains
83 `entries`. This matches the original inventory: 84 source table entries
including the index-zero control/sentinel row, while the JSON omits that
sentinel from its `entries` array and records the declared source length
separately.

The bridge's contract is deliberately narrower than the legacy converter:

- It tokenizes a canonical Sanskrit sound-token string using longest-match
  tokenization after NFC normalization.
- It maps an individual sound token to an audited legacy Romenagri table
  **key**, where an explicit mapping exists.
- It returns `UNRESOLVED` for a token without a declared exact table key.
- It labels each mapped item `table_key_only: true` and explicitly warns
  that keys are not to be concatenated to encode a word.
- Its rule operations work on canonical sound-token arrays; they do not
  execute the original C parser's stack, halant, matra, or contextual
  rewrite logic.

Therefore, this is a sound-token substrate and per-token key audit—not a
port of `rmn2acii.c`/`acii2rmn.c`, not byte-level C compatibility, and not
yet a full Devanagari ↔ ACII ↔ Romenagri adapter. The source lineage and
scope statements in `vendor/romenagri/README.md` and `INTEGRATION.md`
agree with this boundary.

The manifest explicitly records that the upstream network clone was not
completed in the build environment and that native Romenagri compilation
and execution of the upstream filter were not verified. The archive has a
text marker at `lang/hindawi/upstream/ROMENAGRI-SHA` (`ef57fa4cdc7be00dac877498da9b2204577965cd`),
but a marker is not the missing source tree or proof that the corresponding
checkout is present. The actual upstream C source, its `Makefile`, and the
original `fltr_ur_hi` filter are not bundled under the integration's
`vendor/romenagri/upstream/` path. The vendoring/build scripts are a
reproducible bootstrap path, not evidence that vendoring or building has
already succeeded.

### 15.3 Correlation with the 84-entry inventory and Devanagari trace

| Topic | Original source trace | BUILD-0014 representation | Correlation |
|---|---|---|---|
| Table count | 84 entries including sentinel | `source_table_length` 84; JSON `entries` 83 | Consistent; the omitted row is the sentinel |
| Independent अ | `_a` maps to the independent vowel | `a → _a` | Same key for per-sound audit; not word encoding |
| Dependent ा / ि / ु | `^aa` / `^i` / `^u` participate in context-sensitive matra conversion | `ā` / `i` / `u` map to `_aa` / `_i` / `_u` in the per-sound map | These are not equivalent word-level encodings: the adapter deliberately maps individual vowel tokens to keys, while the C converter selects dependent signs according to consonant state |
| Inherent अ | No separate Devanagari matra; `^a` has an empty table value | JSON and `auditRomenagriCoverage()` call it a “known legacy hazard” | Wording is stronger than the evidence established here; preserve source comment, but do not call it a confirmed defect without a failing case |
| Halant / virāma | `^` maps to the legacy halant byte; parser inserts/consumes it contextually | Canonical sound-token inventory has no independent virāma token; word-level key concatenation is expressly disallowed | No word-level halant parity is implemented |
| ज्ञ | `j_yna` = `ja` + halant + `_yna` = ज् + ञ | Individual map has `j → ja` and `ñ → _yna`; no `j_yna` production in the sound-token map | The adapter does not encode the conjunct as an atomic Romenagri unit; no contradiction with the legacy table |
| Retroflex/dental series | Unmarked `ta/tha/da/dha` are retroflex; underscored forms are dental in this convention | `ṭ/ṭh/ḍ/ḍh` map to `_ta/_tha/_da/_dha`; `t/th/d/dh` map to unmarked keys | The adapter preserves the table's convention in its per-sound key audit |
| Long vocalic sounds | Source table does not provide defensible exact keys for all Sanskrit sounds | `ṝ`, `ḷ`, `ḹ` listed as unsupported | Consistent for those three tokens |
| Additional declared token | Source inventory distinguishes `chha` as a table key | `chh` appears in `SANSKRIT_SOUND_TOKENS` but has no `romanToRomenagriKey` entry; the audit's hard-coded unsupported list omits it | Coverage-report gap unless `chh` is deliberately an accepted alias that should not be encoded. The canonical input convention must decide; do not silently invent a mapping |

The `^a` point is important: the source trace does not erase the historical
comment. It separates the existence of that comment from a demonstrated
runtime failure. BUILD-0014 has not supplied a failing example that changes
that conclusion. In addition, the JSON row's `meaning` label,
`"inherent short-a matra"`, should be reviewed: it risks confusing an
internal inherent-a/parser convention with an actual Devanagari dependent
vowel sign, which does not exist for अ.

### 15.4 Other script boundaries in BUILD-0014

BUILD-0014 contains two separate Devanagari-related paths. They must not be
mistaken for the Romenagri C conversion path.

1. `tools/pushkalavati-compiler/src/text.js` provides a small
   Devanagari-to-IAST-like helper for text/padaccheda handling. Static
   inspection shows it explicitly skips U+094D virāma, U+0903 visarga,
   and U+0902 anusvāra. Virāma is used to suppress inherent `a` in its
   consonant path, but standalone visarga and anusvāra are dropped rather
   than represented as `ḥ` and `ṃ`. This helper is therefore not a
   lossless general Devanagari transliterator and must not be described as
   one. This observation is about this helper, not the Romenagri C core.
2. `src/inverse-reduction.js` works directly on normalized native
   Devanagari grapheme clusters using `Intl.Segmenter`. It detects a
   longest-match prādaya prefix and inspects a dependent vowel sign at the
   prefix boundary. It does not call `romenagri.js`, use ACII bytes, or
   preserve original pre-normalization offsets. It is an independent
   orthographic inverse-reduction prototype, not the inverse of the
   Romenagri encoder.

### 15.5 Inverse-reduction benchmark: what “pass” means

The shipped `benchmarks/out/benchmark-report.json` contains two local
inverse-analysis rows:

- `उपेन्द्रो`: prefix `उप`, candidates `इन्द्रो` and `ईन्द्रो`, rule 6.1.87;
  status remains `UNRESOLVED`, because suffix reduction and full lexical/
  morphological validation are not implemented.
- `किताब`: `NO_MATCH`, correctly avoiding an invented prādaya prefix.

Both rows are marked `pass: true` because their narrow fixture expectations
are satisfied. That is a fixture pass, not proof that the surface form has
been fully analysed or derived. The report says there are three analysis
fixtures, but the local inverse runner filters to `job === "inverse"` and
runs only two; the `चैव` sandhi-split fixture is not run by this inverse
runner. The report's single-run elapsed times are not a statistically
meaningful performance benchmark.

A separate artifact, `benchmarks/results/latest.json`, records the shared
cross-system fixture harness. In that shipped artifact:

- Pushkalāvatī's three sandhi cases (6.1.77, 6.1.87, 8.3.15) are recorded
  as matching their expected outputs.
- Pushkalāvatī generation and morphology-analysis cases are correctly marked
  `not_applicable` because this project does not claim a word generator or
  morphological analyzer.
- Vidyut's `BU` generation case is recorded as passing, while its `gam`
  case records expected `gacCati` versus obtained `gati` and is marked
  failing.
- `sanskrit_parser` is recorded as unavailable in that environment; the
  external analyzer systems are not run.

These are two different harnesses and two different job scopes. Their
outputs must not be merged into one score, and none was rerun for this
documentation update.

### 15.6 Rule-status counts: BUILD-0014 has internal documentation drift

The generated artifacts in the ZIP agree with one another:

- `out/progress.json`: 3,983 records and 15 `executable_tested`.
- `out/generated-rules.json`: 15 executable-tested operations, 3
  derivable-untested, and 3,912 unresolved records (the latter combines
  `needs_semantic_annotation` and `blocked_unresolved_class`).

The 15 operation IDs listed by the generated ledger are:
`6.1.45`, `6.1.77`, `6.1.78`, `6.1.87`, `6.1.88`, `6.1.94`,
`6.1.101`, `6.1.109`, `6.1.131`, `6.4.81`, `6.4.110`, `7.1.86`,
`8.3.15`, `8.3.34`, and `8.4.40`.

However, prose files in the same ZIP disagree:

- The compiler `README.md` and `PROJECT_OVERVIEW.md` still say 12.
- `IMPLEMENTATION_STATUS.md` says 20.
- The generated `progress.json` and `generated-rules.json` say 15.

The archive's `BUILD-NUMBER.txt` names the benchmark harness as the build
change, but the archive contains generated status data with 15 operations.
This dossier records the internal inconsistency; it does not decide which
prose snapshot should be overwritten, and it does not treat an archive
claim as freshly verified execution.

### 15.7 Correlation outcome

BUILD-0014 advances the integration architecture and makes the intended
boundaries more explicit: canonical sound tokens feed the rule executor;
legacy Romenagri keys are audited per token; native Devanagari inverse
reduction is a separate analysis path; and benchmarks distinguish
generation, sandhi, and inverse analysis.

It does **not** establish:

- that the original Romenagri C source was vendored or compiled;
- byte-for-byte parity between the JavaScript adapter and the C converter;
- lossless general Devanagari ↔ IAST conversion through `text.js`;
- complete morphological analysis of `उपेन्द्रो`;
- a statistically valid speed comparison across systems;
- a reconciled executable-rule count in the prose documentation.

The next useful work is documentation/specification reconciliation and
a declared-input coverage audit, followed later—when explicitly
authorized—by differential tests against the actual upstream Romenagri
implementation. This review did not modify BUILD-0014 or run any code
from it.


### Revision record — BUILD-0014 correlation (14 October 2026)

Correlated the Romenagri dossier with `BUILD-0014__pushkalavati-hindawi-ilm-2026-10-13.zip`. Added the archive's declared provenance, integration boundary, table-count reconciliation, adapter-vs-parser distinction, native-Devanagari helper limitations, inverse-reduction fixture semantics, benchmark artifact separation, and executable-status documentation drift. Identified the `chh` token/key coverage gap for specification review. No build, test, benchmark, or repository modification was performed.


**End of dossier.**


------------------------------------------------------------------------

## 16. Correlation with Grok's BUILD-0015 and combined BUILD-0016

### 16.1 Archive identity and scope of the added subsystem

BUILD-0015 is dated 14 October 2026 and identifies BUILD-0014 as its base. Its SHA-256 is:

`99a6ef9d11628a8e131f6d7c8884abee0e82a24ce9559a4972743347f5e640ef`

Compared with BUILD-0014, the archive adds 134 files, removes `.github/workflows/pages.yml`, and modifies the build-number file and canonical narrative. The substantive addition is `tools/transliteration/`: a Rahnuma 1.3.0 chapter-17-derived word encoder/decoder, Python adapters over the vendored MIT `indic_transliteration` package, a comparison harness, and result JSON. It also vendors `sanscript.js` (MIT) and documents Vidyut-lipi. The current Python harness uses `indic_transliteration`; it does not call the vendored `sanscript.js` or Vidyut-lipi implementations.

The missing Pages workflow is restored in the combined BUILD-0016 tree because the existing static-page test explicitly requires it and BUILD-0014 supplies the workflow. Required shell-script executable bits are restored in the combined tree because the ZIP extraction omitted them and the test runner uses executable checks.

### 16.2 Three Romenagri-related layers: do not collapse them

| Layer | File(s) | Contract | What it does not establish |
|---|---|---|---|
| Legacy converter | upstream `acii.h`, `acii2rmn.c`, `rmn2acii.c`, `unicode.h`, wrappers/filters | 84-row table plus contextual parser, stack rewriting, Unicode/ACII conversions | Universal bijection or full grammar implementation |
| BUILD-0014 compiler bridge | `tools/pushkalavati-compiler/src/romenagri.js` and `data/romenagri/acii-table.json` | Canonical sound tokens map to audited individual table keys; `table_key_only: true` | Word encoding, dependent-mātrā parser state, or byte-level compatibility |
| BUILD-0015/0016 word-level abstraction | `tools/transliteration/romenagri.py` and `tools/transliteration/__init__.py` | Rahnuma-derived Devanagari↔Romenagri spelling, contextual vowel signs and longest-match decoding | Exact parity with the legacy C converter or the BUILD-0014 sound-token mapping |

The source table cardinality remains consistent: 84 source rows including the sentinel, versus 83 JSON `entries` plus `source_table_length: 84`. This count does not mean the word-level Python implementation covers all 84 rows.

### 16.3 Cross-layer discrepancies retained as open issues

- **Vowel keys:** the compiler bridge maps `e → _ae` and `ai → _aee`; the Rahnuma-derived Python word encoder maps Devanagari `ए → _aee` and `ऐ → _ai`. The source inventory deliberately avoids assigning confident phonetic labels to every legacy vowel key. This is an unresolved cross-layer mapping discrepancy; no silent rewrite or compatibility claim is made.
- **Chandrabindu:** the Python spelling layer uses `_am`, while the inherited legacy table includes `_na` associated in the Unicode table with U+0901. These spellings must not be assumed equivalent without a direct source trace and differential vector.
- **Unsupported `chh`:** the compiler sound inventory declared `chh`, but the exact sound-to-table-key map had no entry and the unsupported report omitted it. BUILD-0016 now reports `chh` explicitly as unsupported. No key is invented.
- **Extended vowels and modifiers:** the bridge does not map `ṝ`, `ḷ`, or `ḹ`; the word-level layer also does not provide independent-vowel entries for every extended vocalic form. Nukta-bearing and extended legacy tokens such as `_rda`, `_rdha`, `^za`, `_jza`, and `_nza` are not claimed as covered by the Rahnuma-derived word layer.
- **`^a`:** the JSON description no longer calls the empty value a proven “legacy hazard.” The source table's historical comment is retained as provenance. Devanagari has no dependent sign for inherent अ; the empty value alone does not demonstrate a runtime defect.
- **Punctuation:** BUILD-0016's word layer now maps avagraha `ऽ ↔ _3` and danda `। ↔ |`; these are tested at the Python abstraction level, not against the absent upstream C filter.

The detailed 84-row correlation is in `Romenagri_84_Token_Inventory_BUILD-0016_CORRELATED_2026-10-14.csv`. The extended seven-case trace matrix is in `Romenagri_Devanagari_ACII_Romenagri_Trace_Matrix_BUILD-0016_2026-10-14.csv`.

### 16.4 Fresh transliteration fixture results

The BUILD-0016 comparison harness ran with the vendored Python package and a narrow local `tomllib`-backed read shim. The harness matched all 13 named Romenagri output spellings. Exact round-trip identity on the fixed 13-item fixture was:

| Scheme | Exact round trips | Non-identical cases in the fixture |
|---|---:|---|
| Romenagri | 12/13 | `ज्ञाान → j_ynaana → ज्ञान` |
| IAST | 11/13 | The doubled-mātrā `ज्ञाान` fixture and `क्ह` resolving to `ख` |
| Harvard-Kyoto | 11/13 | The same two source/ambiguity cases |
| SLP1 | 12/13 | The doubled-mātrā `ज्ञाान` fixture |
| ITRANS | 11/13 | The doubled-mātrā fixture and `क्ह`/`ख` ambiguity |
| Velthuis | 11/13 | The doubled-mātrā fixture and `क्ह`/`ख` ambiguity |

These counts describe a small fixed spelling fixture. They are not a measurement of phonetic fidelity or a general accuracy ranking. The `ज्ञाान` fixture contains a doubled long-a sign while its expected Romenagri spelling retains one; that normalization is preserved and called out rather than silently counted as a perfect round trip.

BUILD-0016 corrected the separate Rahnuma-derived Python word-level reconstruction so a bare consonant stem decodes as a terminal virāma (`क् → k → क्`). This is not a claim that the inherited legacy C decoder had that defect: the project owner confirms the 2004 decoder already handled terminal virāma correctly. BUILD-0017 directly retested the four examples quoted in Grok’s report against the current Python encoder/decoder; all four round-trip exactly. The original 2,000-word corpus and per-row report are not present in the supplied archive, so Grok’s aggregate failure counts remain unreproduced.

### 16.5 Compiler status and integrated test boundary

Fresh `npm run compile:rules` reports 20 `executable_tested` operations, 3 `derivable_untested`, 30 `definition_resolved`, 23 `meta_rule`, 473 `blocked_unresolved_class`, and 3,434 `needs_semantic_annotation` across 3,983 records. This supersedes stale 12-operation status snapshots in older README/handoff documents, which have been updated where they state current status. The count of 20 is still rule-local execution, not full Aṣṭādhyāyī derivation.

The complete test runner also checks the Sūtram/Javascript paths, C backend/runtime, compiler and inverse reduction, Python parity, Shaili Robot static runner, and Pages/browser smoke tests. The one legacy external-data experiment test remains skipped because the external Cologne MW lexicon and prior RV artifacts are not bundled. Rust compilation is skipped where `rustc` is unavailable. The full command and outcome are recorded in `BUILD-0016_CORRELATION_AND_TEST_REPORT.md`.

Native upstream Romenagri C compilation, execution of the original `fltr_ur_hi` filter, and differential tests against the C implementation were **not** performed: the original source/filter are not present in the archive's vendor path. No claim of byte-for-byte legacy compatibility is made.

### Revision record — BUILD-0016 correlation (14 October 2026)

The combined version corrects documentation and coverage reporting, fixes terminal-virāma round-trip loss in the Rahnuma-derived Python decoder, adds punctuation/sign regressions, restores the missing Pages workflow and script modes, and regenerates the Pushkalāvatī status artifacts. Cross-layer vowel-key semantics and native C parity remain open. See the audit CSV and test report in this directory.


## 17. BUILD-0017: Grok report audit and front-end extension

The BUILD-0017 audit keeps three questions separate: base Romenagri inventory coverage, exact Unicode document round-trip, and permitted normalization. The current base word encoder maps avagraha U+093D to `_3`, and all four terminal-virāma examples supplied by Grok round-trip exactly. The other listed punctuation/extended characters remain outside the strict base encoder. An opt-in document wrapper now preserves them using explicit `~{HEX}` Unicode-scalar escapes; this is a Pushkalāvatī transport extension, not a claim about the inherited Romenagri convention or legacy C filters.

The decoder now precomputes its longest-match token table once. On the same benchmark harness, median Romenagri round-trip time decreased from approximately 146.1 µs/record before caching to 37.2 µs/record after caching; the synthetic 2,000-record lossless wrapper workload decreased from approximately 295.0 to 49.5 µs/record. These are local microbenchmark results, not Grok-corpus comparisons.

The focused lossless-wrapper test module reaches 100% statement and branch coverage (107 statements, 44 branches). This is not 100% coverage of the entire repository, the legacy C implementation, or the Unicode standard. See `BUILD-0017_GROK_REPORT_AUDIT.md`, `BUILD-0017_TEST_REPORT.md`, and the CSV matrices in this directory.
