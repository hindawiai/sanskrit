# Three layers

Lexical recognition is the Sūktam front end. It splits verses and matches a closed lexicon longest-first. Residual stays.

Grammatical derivation is the compiler. 8.3.15, 8.3.34 and 8.4.40 are separate operations. `agniḥ + ca` becomes `agnisca` under 8.3.34, then `agniśca` under 8.4.40. Both rule ids stay in the trace.

Runtime execution is `lang/suktam/lib`. The generated program calls that library. It is not a kernel. Unknown names fail closed. Deferred names are recognized and counted, not executed.

## Architectures

`lang/suktam/run-qemu.sh` builds the same library for x86_64 and for RV64GC. RV64GC is the Shakti C-class ISA. The run is QEMU user-mode, not a Shakti SoC boot.

Set `QEMU_X86_64`, `QEMU_RISCV64`, and `RISCV_GCC` if the tools are not on `PATH`.


## Hindawi Guru integration

`lang/suktam/hindawi/` contains the integration build script and instructions for converting the Sanchalan runtime through the existing Chintamani `c2h` and `h2c` tools. It deliberately does not bundle or replace the historical translators. Run `bash lang/suktam/hindawi/build.sh` after building Chintamani's Romenagri filters and Hindawi Guru shaili; see `lang/suktam/hindawi/README.md`.

The current audit environment lacks those executables and cannot fetch the upstream repository from the build container. The script and instructions are present, but end-to-end Hindawi conversion is **not yet verified here**. The ordinary C runtime compiles and its dispatch tests run locally; that is not evidence that the Hindawi conversion pipeline has compiled successfully.
