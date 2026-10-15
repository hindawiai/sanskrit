# Vendored Hindawi and Romenagri files

These are pinned source snapshots used for the integration and language-port audit.

- `langs/*_c.tsv` from `project-ilm/romenagri` commit `ef57fa4cdc7be00dac877498da9b2204577965cd`: localized C keyword tables.
- `langspec/data/` and `tables/`: language inventories, canonical construct vocabulary, and script projections.
- `chintamani/`: Guru, Shabda, Praatha, Wyaaka, Soochee, Shraeni, and samples from `hindawiai/chintamani` commit `3ad87785a75dc2b18438a8b068807103cb920c81`.

## Two distinct tests

1. `python3 lang/hindawi/test_ports.py` checks generated C/C++ keyword-table shape, coverage metadata, duplicate tokens, and collision status. It is a table-integrity check, not proof of a compiler frontend.
2. `python3 lang/hindawi/test_sanchalan_ports.py` checks the Sanchalan C library's required keywords against the vendored upstream C tables and verifies reversible token substitution for tables containing those keywords. It reports missing keyword coverage as `INCOMPLETE`; it does not invent missing rows or treat an incomplete table as a complete port.

The actual Hindawi compiler integration is separately exercised by `bash lang/suktam/hindawi/build.sh test` in an environment with the pinned upstream tools built and configured. A passing table test does not imply that the compiler integration was run.
