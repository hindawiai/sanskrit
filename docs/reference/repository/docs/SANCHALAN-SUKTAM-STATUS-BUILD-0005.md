# Sanchalan Suktam, BUILD-0005

Source: `lang/suktam/sanchalan.suktam`. Parser: `lang/suktam/suktam.js`.

## Direct answers

- All 22 verse boundaries are recognized.
- All 22 verses are written into the generated C report. That report is lexical IR. It is not an operating system.
- 0 of 22 verses are lexically complete. 22 of 22 remain partial.
- Recognized lexicon nodes: 212. Residual code points: 271. BUILD-0004 had 186 and 428.
- The whole verse string is scanned. Unmatched text is kept.
- Chanda-viccheda is not implemented. General sandhi-viccheda is not implemented. The one sandhi split in the parser is `श्च`, licensed by 8.3.34 then 8.4.40.
- Keywords are recognized only when they are in the closed lexicon. Residual text is not guessed.

## Rule converter

`executable_tested` is 18 of 3983. The new one is 8.3.23: final `m` becomes anusvara before a consonant. The other 3965 are not executable.

## Sensitive fields, not removed

Vendored Hindawi `.uhin` files contain the historical contact `choudhary@indicybers.net` in their modification headers. Left in place.
