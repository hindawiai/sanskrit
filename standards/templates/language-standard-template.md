# {{Localized language name}} — {{base language and edition}}

- Profile ID: `{{profile_id}}`
- Language/region: `{{language_region}}`
- Script(s): `{{scripts}}`
- Base language/version: `{{base_standard}}`
- Hindawi/ILM frontend: `{{frontend}}`
- Backend/compiler/runtime: `{{backend}}`
- Status: `DRAFT`
- Version/date: `0.1.0 / {{date}}`
- Maintainer/authority: `{{maintainer_or_proposed_authority}}`

## 1. Scope and conformance language
Define normative terms (MUST, MUST NOT, SHOULD, MAY) and identify whether this document is a language profile, implementation specification, or adoption proposal.

## 2. Source and provenance
List exact source repositories, commits, release artifacts, hashes, licenses, and provenance of every localized lexicon/filter.

## 3. Language identity and orthography
Define language separately from script. List supported script profiles, Unicode version, normalization form, grapheme/code-point handling, punctuation, numerals, and known unsupported characters.

## 4. Lexical and transliteration contract
Use original-source keyword tables. Specify native-script → canonical internal representation → target source pathway, source maps, reversibility guarantees, collisions, and unmapped-character policy. Preserve original input.

## 5. Grammar and semantics
Specify lexical grammar, syntax, types, literals, identifiers, operators, declarations, control flow, functions/procedures, modules, errors, and compatibility with the pinned base language. Link a machine-readable grammar and test fixtures.

## 6. Backend and execution contract
Pin target standard edition, compiler/runtime, flags, ABI/platform assumptions, generated intermediate/source format, build commands, and reproducibility requirements.

## 7. Diagnostics and source mapping
Define stable diagnostic IDs, localized messages, original-source spans, canonical-source spans, and generated-target spans.

## 8. Conformance suite
Provide positive/negative tests, differential tests against the base language, Unicode/script tests, round-trip tests where promised, security tests, and exact commands/results.

## 9. Security, privacy, and licensing
Define prohibited secret/personal-data classes, scanning/review process, license inventory, third-party attribution, and release gate.

## 10. Compatibility and versioning
Define semantic versioning for the profile, breaking-change policy, deprecation policy, and backward-compatibility tests.

## 11. Adoption record
Record proposed/adopting authority, public consultation, version, date, resolution/link, and maintenance body. If none exists, state “proposal; not adopted.”

## Annexes
A. Keyword/lexicon table. B. Grammar. C. Filter pipeline. D. Test inventory. E. Known gaps. F. References.
