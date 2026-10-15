# Third party

`third_party/vidyut-prakriya/` is a vendored copy of Ambuda's Vidyut Prakriya, MIT. Retain its attribution and license obligations when redistributing. Do not treat it as this project's code.

It is a word generator. It implements rules by calling them by id (`"6.1.78"` and the like) inside a fixed derivation order. 2153 distinct Ashtadhyayi ids appear in its `src/`. All 2153 match our 3983.

| type | in Vidyut | of |
|---|---|---|
| vidhi | 2015 | 3629 |
| samjna | 86 | 200 |
| atidesha | 35 | 67 |
| adhikara | 15 | 64 |
| paribhasha | 2 | 23 |

`vidyut_implemented` on a row in `data/sutra-categories.jsonl` means the id appears in that source. It does not mean this project's executor runs it. As of BUILD-0023/0024, this project's own `executable_tested` count is 24; those 24 are not the 2,153 Vidyut source matches.


## Provenance and native-build limits (BUILD-0024 audit)

- `third_party/chintamani-romenagri/VENDORED.txt` identifies `hindawiai/chintamani` and the GPL family, and the tree includes `LEGAL`/`copying`. It does not pin an immutable upstream commit or source-tree digest. BUILD-0024 records per-file SHA-256 values in its file-change manifest; those hashes identify this archive's bytes, not the upstream commit.
- `third_party/vidyut-prakriya/Cargo.toml` declares MIT and identifies `ambuda-org/vidyut`, but the vendored root has no standalone LICENSE file or immutable commit marker. The current archive therefore records the declared license and source URL but does not claim commit-level provenance.
- The Romenagri C core (`rmn2acii.c`, `acii2rmn.c`, `stack.c`) compiles with GCC and has direct-function probes. `make all` still cannot build the filter executables here because `flex` is unavailable.
- The active source tree is `third_party/vidyut-prakriya/`. The older `third_party/vidyut/vidyut-prakriya/` is a reference-document snapshot and must not be used as the active source path.
