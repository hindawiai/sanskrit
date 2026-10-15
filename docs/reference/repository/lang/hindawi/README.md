# Hindawi language and script integration

This directory is an adapter and verification layer for the existing Hindawi/HPS/Romenagri architecture. It is not a replacement translator.

The canonical data lives in the Romenagri source tree:

- `langspec/data/language_registry.csv` — language/script profiles
- `langspec/data/lang_<code>.csv` — native keyword vocabulary and Romenagri spellings
- `langspec/data/keyword_ontology.csv` — shared construct identities
- `tables/*_to_deva.tsv` — script projection tables
- `langspec/generator/` — existing profile/keyword generation tools

The integration deliberately uses CSV for new inventories and reports. It does not introduce JSON keyword packs or a generic token translator. Existing upstream formats are left untouched.

## Audit the real upstream source

```sh
./scripts/vendor_romenagri.sh
# Provide the Chintamani checkout separately for its original fltr_* filters.
python3 scripts/hindawi_language_port_audit.py \
  --romenagri-root tools/pushkalavati-compiler/vendor/romenagri/upstream \
  --chintamani-root /path/to/chintamani \
  --output build/hindawi-language-port-audit.csv
```

The vendoring step needs network access. If the canonical source is absent, no language port is silently fabricated.

## Status semantics

- `prototype-keywords-pending`: at least one keyword explicitly marks its Romenagri spelling as pending.
- `blocked-empty-script-projection`: script table has no mapping rows.
- `filter-chain-present-table-still-required`: the canonical Hindi/Urdu filter pair exists, but a language-specific orthographic overlay and differential tests remain necessary.
- `keyword-spec-present-needs-compiler-conformance`: keyword data is present, but this is not a claim of working compiler/debugger integration.
- `blocked-*`: missing, malformed or ambiguous upstream inputs.

Hindi-to-Hebrew remains a separate, manually reviewable transliteration prototype. It must not be used as a compiler input path.
