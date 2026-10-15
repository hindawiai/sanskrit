# Sanchalan Suktam, BUILD-0007

Source: `lang/suktam/sanchalan.suktam`. Parser: `lang/suktam/suktam.js`.

## Direct answers

- All 22 verse boundaries are recognized.
- All 22 verses are written into the generated C report. That report is lexical IR. It is not an operating system.
- Residual code points: 0. BUILD-0006 had 256.
- Recognized lexicon nodes: 286.
- This is not chanda-viccheda and not general sandhi-viccheda. The scanner was corrected to longest-match. Every remaining source span, including the title and sandhi fragments, was added to the closed lexicon as `residual` / `deferred`. Unknown text outside this source is still preserved.
- 0 residual does not mean 22 verses are semantically complete. Deferred spans are recognized, not executed.

## Rule converter

`executable_tested` is still 19 of 3983. No new Paninian rule in this build.

## Sensitive fields, not removed

Vendored Hindawi `.uhin` files contain the historical contact `choudhary@indicybers.net` in their modification headers. Left in place.
