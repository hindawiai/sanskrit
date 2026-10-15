# Hindawi / ILM Language Standards Seed

**Build:** BUILD-0002. This directory seeds an adoptable, template-based standards programme; it does not claim that complete national or regional standards have already been written or adopted.

## Principle

A language/script profile specifies the localized source surface; a programming-language profile specifies the target language and version; the common Hindawi/ILM substrate specifies normalization, script filters, source mapping, diagnostics, and backend invocation. Localized keywords must come from the corresponding source lexicon/filter tables. This is not keyword-for-keyword replacement: the contract includes lexical boundaries, tokenization, syntax, literals, identifiers, operators, diagnostics, source maps, runtime/compiler compatibility, and conformance tests.

## Seeded profile documents

- `profiles/hi-IN-c.md` — Hindi C profile template instance.
- `profiles/bn-BD-c.md` — Bangla C profile template instance.
- `profiles/bn-BD-cpp.md` — Bangla C++ profile template instance.
- `profiles/hi-IN-cpp.md` — Hindi C++ profile template instance.
- `templates/language-standard-template.md` — reusable normative-document skeleton.
- `profiles/profile-schema.json` — machine-readable metadata contract.

Each seeded profile is a **draft framework**, not a complete translated C/C++ standard. The adopted base edition, localized terminology, source lexicon, exact backend, normative grammar, and conformance suite must be pinned and validated before claiming completeness. Do not copy a proprietary standards text; reference the applicable public standard identifiers and create original localization, explanatory material, and tests.

## Conformance states

`PROPOSED`, `DRAFT`, `PARTIAL`, `TESTED`, `ADOPTED`. A profile must never be marked `TESTED` based only on a document existing, or `ADOPTED` without a named adopting authority and published decision.
