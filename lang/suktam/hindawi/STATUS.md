# Hindawi integration status

Chintamani commit: `3ad87785a75dc2b18438a8b068807103cb920c81`.

## Passed

- Upstream `Romenagri` built with its Makefile after `flex`, `m4`, and `libfl` were present.
- Upstream `Hindawi/guru` built `h2c` and `c2h`.
- Verified conversion path is `c2h | acii2cf | h2c`. A tiny `int main(void){return 0;}` came back as C.
- Integration script stages: check-deps, translate, compile, test, clean.
- Generated Sanchalan C compiled and linked.
- Unknown operation returned nonzero.

## Rejected

- `gurucc`'s `acii2uni | iconv | h2c` path. The built scanner matches romanized tokens, not Devanagari. The minimal Hindi program did not compile through that path.

## Not claimed

- QEMU. Excluded from this pass.
- Equivalence of every generated Sanchalan line with the original C beyond compile and the tiny fixture.
- A substitute translator. None was written.
