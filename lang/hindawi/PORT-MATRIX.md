# Hindawi human-language × programming-language port matrix

## What is generated

`scripts/generate_hindawi_ports.py` derives CSV keyword tables from the vendored
Romenagri `langspec/data/lang_<profile>.csv` files and the shared
`keyword_ontology.csv`. It does not fabricate missing translations. The generated
files live under `ports/c/` and `ports/cpp/`; `ports/port_coverage.csv` records
missing constructs and native/transliteration collisions. `ports/language_x_programming_language.csv`
records the current cross-product and distinguishes keyword data from actual
compiler integration.

- C: 20 construct rows per each of the 68 profiles, including the legacy Hindi
  Hindawi vocabulary where its canonical profile is smaller.
- C++: 25 construct rows per profile. Collisions are retained as explicit review
  findings, not treated as reversible ports.
- The matrix also records Python, BASIC, Assembly, Java, Lex and Yacc. The vendored
  Chintamani adapters/samples are Hindi-specific; these rows are therefore marked
  `not-implemented-and-not-tested`, not as completed multilingual ports.

## Important boundaries

A generated table is **not** a compiler port. The generated C/C++ tables still need
adapter integration and per-profile end-to-end tests: forward translation,
reverse translation, compile/link, execution, diagnostics and original-symbol
debugging. C++ profiles with keyword collisions require language-level disambiguation
before they can be considered reversible. The shared ontology provides a common
semantic spine; it does not make distinct natural languages or script profiles
interchangeable.

## Reproduce

```sh
python3 scripts/generate_hindawi_ports.py
python3 lang/hindawi/test_ports.py
```

Both generated tables and coverage reports use CSV, as required by the repository
convention. Vendored upstream files are not modified by the generator.
