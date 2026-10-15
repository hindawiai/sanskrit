# Sanchalan Suktam: source stages from the supplied archive

This bundle extracts source files verbatim from `pushkalavati-hindawi-shaili-logo-history-2026-10-13.zip`.

## What is actually present

1. `SANSKRIT_INPUT.suktam` — original Sanskrit Sanchalan Suktam input. This is not Sanskrit-lowered C.
2. `HINDI_HINDAWI_C.c.uhin` — Hindawi C-port source with Hindi keyword spellings, e.g. `#समावेश`, `पूर्णांक`, `अगर`, `वापस`, `पूर्ण`.
3. `FINAL_C_BEFORE_COMPILATION.c` and header — ASCII C output stored by the Hindawi build pipeline, intended for compilation.
4. `LEXICAL_IR_GENERATED_C.c` and `RESULT_JSON.json` — a different output path: generated C that prints lexical-IR recognition/residual counts for the Sanskrit source. It is not the same program as the Sanchalan library C port.
5. `BUILD_PIPELINE.sh` — pipeline commands and compile/link smoke tests.

## Important limitation

There is no distinct Sanskrit-keyword C source file in the supplied archive. The header explicitly says `Sanskrit conversion comes later`. We therefore do not fabricate a Sanskrit C version. To provide one faithfully, the Sanskrit Hindawi port/keyword table and its exact converter output must be added and tested.

## Reproduction

The build script requires an external Chintamani checkout and the Hindawi/Romenagri binaries. The script documents `c2h -> acii2cf -> h2c` as the verified path. It compiles the resulting C with `gcc -std=c11 -Wall -Wextra -Werror` and links a smoke test. This is a library compile/link test, not proof that all 22 Suktam verses execute as OS semantics.
