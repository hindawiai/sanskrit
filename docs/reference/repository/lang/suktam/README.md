# Sanchalan Suktam frontend

Source: Choudhary, A. (2026). *Sanchalan Suktam* (Version V1.0). AyeAI. https://doi.org/10.5281/zenodo.23277242

The source itself states that V1.0 is not guaranteed to be the final executable version. This directory therefore implements a conservative lexical/parser front end and code-generation report, not an inferred OS runtime.

## Grammar and parser

`grammar.json` specifies the productions and rule IDs:

- `SUK-001`: program / numbered verse framing.
- `SUK-002`: verse body terminated by `॥N॥`.
- `SUK-003`: ASCII or Devanagari verse number.
- `SUK-004`: longest-first technical lexicon.
- `SUK-005`: preserve unmatched spans as residuals.
- `SUK-006`: lexical status is not grammatical validity.

The parser records term, ID, role, proposed operation code, code-point source span, and rule IDs. It reports duplicate/gapped verse numbers. It does not delete residual material or infer a missing lexical mapping.

## Code generation

```sh
node lang/suktam/suktam.js
gcc -std=c11 -Wall -Wextra -Werror lang/suktam/out/sanchalan.c -o /tmp/sanchalan
/tmp/sanchalan
```

The generated C/Rust programs report the lexical IR per verse. They do **not** execute process creation, pipes, terminal I/O, PID allocation, memory protection, virtual memory, signals, or any other OS operations. Those require an independently reviewed semantic specification, typed IR, and runtime.

The test compiles and executes generated C, validates all 22 verse boundaries, verifies residual preservation, and structurally checks generated Rust. Native Rust compilation is conditional on `rustc`; it was not run in the current environment because `rustc` is unavailable.

Current snapshot metrics: 22 verses, 134 recognized lexicon nodes, 828 residual code points. These are inventory metrics, not accuracy or completeness claims.
