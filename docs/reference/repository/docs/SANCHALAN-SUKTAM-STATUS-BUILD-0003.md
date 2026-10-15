# Sanchalan Suktam, BUILD-0003

Source: `lang/suktam/sanchalan.suktam`. Parser: `lang/suktam/suktam.js`.

## Direct answers

- All 22 verse boundaries are recognized.
- All 22 verses are written into the generated C report. That report is lexical IR. It is not an operating system.
- 0 of 22 verses are lexically complete. 22 of 22 remain partial.
- Recognized lexicon nodes: 159. Residual code points: 655. BUILD-0002 had 141 and 814.
- The whole verse string is scanned. Unmatched text is kept.
- Chanda-viccheda is not implemented. General sandhi-viccheda is not implemented. The one sandhi split in the parser is `श्च`, licensed by 8.3.34 then 8.4.40.
- Keywords are recognized only when they are in the closed lexicon. Residual text is not guessed.

## Rule converter

`executable_tested` is 16 of 3983. The new one is 6.1.66, lopa of `v` or `y` before a val consonant. The other 3967 are not executable. The ones that run are phonological substitutions over a closed sound inventory. Rules that name roots, need morphology, need kāraka machinery, or need deletion/insertion beyond the current operation kinds are not done.

## Sensitive fields, not removed

Vendored Hindawi `.uhin` files contain the historical contact `choudhary@indicybers.net` in their modification headers. Left in place.
