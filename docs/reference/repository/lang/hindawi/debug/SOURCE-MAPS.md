# Original-symbol debugging contract

The original Hindawi source is authoritative. Do not overwrite it with transformed C and do not replace the existing filter/compiler path with a generic lexer.

Before claiming low-level source debugging works, verify the following against the real upstream compiler and debugger:

1. Keep original source files and exact source spellings as build inputs.
2. Preserve line boundaries wherever the existing conversion method permits; record any filter stage that changes line count or columns.
3. Retain every transformation table and the exact filter order/version used for the build. CSV is the canonical reviewable table format in this project.
4. Compare diagnostics and debug symbols from the original-source build path with the generated-C path.
5. Set breakpoints on original source lines, step through translated code, inspect locals, and verify that stack traces and diagnostics can be correlated to original symbols.
6. Test Unicode normalization, multi-code-point graphemes, comments, string literals, identifiers, macros and included files.
7. If the existing toolchain cannot provide source-level mapping, state the limitation explicitly; do not imply that a per-token map alone solves it.

No debugger-fidelity claim is made by the current multilingual prototype. The real upstream source and an actual debugger test are required.
