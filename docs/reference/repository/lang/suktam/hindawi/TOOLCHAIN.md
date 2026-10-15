# Hindawi toolchain contract

Source of truth: `hindawiai/chintamani` at `3ad87785a75dc2b18438a8b068807103cb920c81`.

## Verified path

```text
C source -> c2h -> ACII -> acii2cf -> h2c -> C
```

`c2h` emits ACII. `acii2cf` romanizes it. The built `h2c` matches that romanized form (`mukhya` becomes `main`). This was run.

## Rejected path

`gurucc` does `acii2uni | iconv UTF-16 to UTF-8 | h2c`. That produces Devanagari. The built `h2c` does not match Devanagari. A minimal program stayed Hindi and did not compile. Do not use that path.

## Stages

```text
build.sh check-deps
build.sh translate
build.sh compile
build.sh test
build.sh clean
```

Generated files stay in `lang/suktam/hindawi/build/`.

## Required tools

`iconv`, `gcc`, `flex`, `m4`, `libfl`, then upstream `make -C Romenagri` and `make -C Hindawi/guru`.
