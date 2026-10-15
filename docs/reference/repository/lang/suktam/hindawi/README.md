# Sanchalan runtime in Hindawi Guru

This directory integrates the Sanchalan C runtime with the **existing** Hindawi Guru shaili in [hindawiai/chintamani](https://github.com/hindawiai/chintamani). It does not introduce a second keyword table, translator, or transliteration scheme.

## Scope and ABI

- `lang/suktam/lib/sanchalan.c` and `sanchalan.h` remain the canonical, reviewable C implementation.
- `build.sh` invokes upstream `c2h` to produce the `.uhin` sources and upstream `h2c` to lower those sources back to C for compilation.
- Public C identifiers (`Sanchalan`, `sanchalan_init`, `sanchalan_call`, and `sanchalan_report`) are intentionally preserved as API/ABI names unless the upstream mapping explicitly maps them. The runtime semantics are not rewritten by this integration.
- Generated artifacts live in `lang/suktam/hindawi/build/`; they are reproducible outputs and should not be edited by hand.
- The C runtime is a small operation-dispatch/state-report library. It is not an OS kernel. Deferred operation names are counted as deferred, and unknown names emit a diagnostic and return nonzero.

## Dependencies

Use the upstream source tree and toolchain; do not replace these tools with a new transliterator:

- Chintamani: <https://github.com/hindawiai/chintamani>
- Romenagri filters: `uni2acii`, `acii2uni` (the upstream Guru Makefile also uses `acii2cf` when building the translator executables)
- Hindawi Guru shaili: `c2h`, `h2c`
- GNU `make`, `gcc`, `flex`, `libfl`, and `iconv`

The upstream Guru Makefile builds `h2c` and `c2h` from `h2c.uhin` and `c2h.uhin` by running `iconv -f utf-8 -t utf-16 | uni2acii | acii2cf`, then `flex`, then `gcc`. Romenagri's Makefile provides the filters. Keep these upstream sources and mappings authoritative.

The verified runtime path is `c2h | acii2cf | h2c`. `gurucc`'s `acii2uni | iconv | h2c` path was tested and rejected: the built scanner matches romanized tokens, not Devanagari. See `TOOLCHAIN.md` and `STATUS.md`.

## Build Chintamani tools

On Ubuntu/Debian, install the host build dependencies:

```sh
sudo apt-get update
sudo apt-get install -y build-essential flex libfl-dev gawk
```

`iconv` is normally provided by the system's libc; if your distribution has no `iconv` package, do not treat that package name as a requirement. Verify with `command -v iconv`.

Clone the upstream repository and build the filters/translators:

```sh
git clone https://github.com/hindawiai/chintamani.git
cd chintamani
make -C Romenagri
export PATH="$PWD/Romenagri:$PWD/Hindawi/guru:$PATH"
make -C Hindawi/guru
```

Check that the expected executables were created:

```sh
find "$PWD/Romenagri" -maxdepth 1 -type f -executable -printf '%f\n' | sort
find "$PWD/Hindawi/guru" -maxdepth 1 -type f -executable \( -name h2c -o -name c2h \) -printf '%f\n'
```

The historical Makefiles use generated binaries in their source directories and may have old assumptions about the host environment. Inspect the build output; do not assume `make` succeeded merely because the command returned to the prompt.

## Build this runtime

From the Pushkalavati repository root:

```sh
export CHINTAMANI_ROOT="$HOME/src/chintamani"
export ROMENAGRI_BIN="$CHINTAMANI_ROOT/Romenagri"
export GURU_BIN="$CHINTAMANI_ROOT/Hindawi/guru"
bash lang/suktam/hindawi/build.sh
```

The script will:

1. convert the canonical C implementation into Hindawi source through upstream `c2h`;
2. save UTF-8 review copies as `sanchalan.c.uhin` and `sanchalan.h.uhin`;
3. round-trip each `.uhin` source through the existing `uni2acii` and `acii2uni` filters, then UTF-16/UTF-8 conversion, matching the upstream `gurucc` input path before lowering it with `h2c`;
4. compile the lowered implementation with strict C warnings;
5. link and execute a smoke program against the compiled library.

If a tool is not on `PATH`, the script looks in the selected upstream directories. Set `CHINTAMANI_ROOT`, `ROMENAGRI_BIN`, or `GURU_BIN` to match your checkout. It exits nonzero when a required tool is missing or compilation/linking fails.

## Verification boundary

A successful build proves that this particular runtime source survives the installed Hindawi conversion pipeline and compiles/links with the host C compiler. It does not prove that every Hindawi construct is supported, that the library implements real process/memory/pipe operations, or that a RISC-V/QEMU run occurred. Architecture execution remains a separate test performed by `lang/suktam/run-qemu.sh` with an appropriate cross compiler and QEMU user emulator.
