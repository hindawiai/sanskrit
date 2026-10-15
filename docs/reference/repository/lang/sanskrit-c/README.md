# Sanskrit C — separate language/source profile

Sanskrit C is intended as a sibling of Hindi C over the existing Hindawi/HPS/Romenagri pipeline. It must not fork or replace the compiler, conversion representation, filters, or driver.

- Provisional vocabulary/review inventory: `../hindawi/keywords/sa/keywords.csv`
- Language/script profile inventory: `../hindawi/languages/registry.csv`
- Original-symbol debugging requirements: `../hindawi/debug/SOURCE-MAPS.md`
- Sample program: `examples/ganana.sa.c`

The CSV is a review inventory, not an executable grammar or completed port. The original Hindi keyword inventory and the upstream Hindawi implementation must be inspected before finalizing Sanskrit spellings. Integrate Sanskrit through the existing source-filter/compiler method, retain the original source, and prove compiler/debugger behaviour before marking this profile supported. Do not use preprocessor aliases or a parallel generic token translator as the architecture.
