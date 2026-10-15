# Hindi C++ — draft profile seed

- Profile ID: `hi-IN-CPP`
- Language/region: Hindi / hi
- Script profiles: Devanagari; Romenagri where supported
- Base standard: ISO C++ edition to be selected and pinned by project
- Frontend: Shraeni / Hindawi C++ frontend; verify exact original invocation
- Backend: C++ compiler backend, exact version/flags to be pinned
- Status: `DRAFT`
- Version: `0.1.0`
- Adoption: **proposal; not adopted**

## Purpose
Define a complete localized source-language profile that preserves the semantics of the pinned base language while using the relevant Hindawi/ILM language and script frontend. This file is a seed, not a claim that the full C/C++ language has already been translated or implemented.

## Source of localized forms
Use the original project lexicon, `.uhin` source, language registry, and canonical script-filter tables where available. Do not invent localized keywords. Record each form's source path, hash/commit, status, and test coverage. Where the original Bangla/Hindi data is absent or ambiguous, mark the entry `UNVERIFIED` rather than synthesizing a replacement.

## Required sections before a complete profile can be declared
1. Complete grammar and syntax for the pinned C/C++ edition, including preprocessing/directives as applicable.
2. Exact keyword/token inventory and identifier rules, with native-script and supported Romenagri spellings.
3. Literal, numeral, escape, operator, comment, whitespace, and source-encoding behavior.
4. Filter/normalization pipeline and source maps; for Perso-Arabic profiles, the specified project path first maps to Devanagari, then continues through the established Romenagri/backend path.
5. Type system, declarations, expressions, statements, functions, modules, diagnostics, and compatibility constraints.
6. Compiler/backend versions, invocation flags, ABI/platform assumptions, and reproducible build instructions.
7. Positive, negative, differential, Unicode, fuzz, and regression tests for every construct.
8. License/provenance inventory and release security/privacy review.
9. Conformance levels, known gaps, versioning, and maintenance/adoption process.

## Acceptance gate
Do not label this profile `TESTED` until the source lexicon/filter, generated target, and conformance suite pass on a clean checkout. Do not label it `ADOPTED` until an identifiable competent authority publishes an adoption record.
