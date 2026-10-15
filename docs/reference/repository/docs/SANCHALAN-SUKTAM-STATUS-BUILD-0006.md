# Sanchalan Suktam, BUILD-0006

Source: `lang/suktam/sanchalan.suktam`. Parser: `lang/suktam/suktam.js`.

## Direct answers

- All 22 verse boundaries are recognized.
- All 22 verses are written into the generated C report. That report is lexical IR. It is not an operating system.
- 0 of 22 verses are lexically complete. 22 of 22 remain partial.
- Recognized lexicon nodes: 215. Residual code points: 256. BUILD-0005 had 212 and 271.
- The whole verse string is scanned. Unmatched text is kept.
- Chanda-viccheda is not implemented. General sandhi-viccheda is not implemented. The one sandhi split in the parser is `श्च`, licensed by 8.3.34 then 8.4.40.
- Keywords are recognized only when they are in the closed lexicon. Residual text is not guessed. The remaining residual is mostly sandhi fragments and inflected endings, not missing OS nouns.

## Rule converter

`executable_tested` is 19 of 3983. The new one is 8.4.58: anusvara becomes the class nasal of the following stop. The class nasal is supplied in context. The other 3964 are not executable.

## Sensitive fields, not removed

Vendored Hindawi `.uhin` files contain the historical contact `choudhary@indicybers.net` in their modification headers. Left in place.
