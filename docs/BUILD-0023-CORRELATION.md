# BUILD-0023 correlation against BUILD-0017

**Audit date:** 2026-10-14  
**Compared archives:**

- BUILD-0017 SHA-256: `af32a335d8056f06ad4fb73e21113f2fad0e688a8aac9f623c560d2bcb4676eb`
- BUILD-0023 SHA-256: `6bcdcf6a3b4df7e6e0566ca2016d6b5fdcd4cd0159f9495880f2a55d130964a7`

The BUILD-0023 ZIP contains 1,537 regular-file entries. BUILD-0017 contained 1,245. Content-hash comparison found **293 added files, 7 changed files, and 1 removed file**. In addition, **14 unchanged-content files lost executable mode** (0755 → 0644). All paths, content hashes, and modes are recorded in `BUILD-0024_FILE_CHANGE_MANIFEST.csv`.

## Additions

| Path family | Added files | What changed |
|---|---:|---|
| `third_party/vidyut-prakriya/` | 206 | Full Vidyut Prakriya source/data/test snapshot, replacing reliance on a small documentation snapshot for source inspection. |
| `third_party/chintamani-romenagri/` | 63 | Native Romenagri C sources, table, lex specifications, filters, corpora and test inputs. |
| `third_party/wikipedia-corpus/` | 15 | Sanskrit Wikipedia corpus samples and attribution/readme material. |
| `tools/transliteration/` | 4 | Collision suite, numeral comparison, and two generated result files. |
| Registry/docs | 5 | `tools/registry.py`, `data/implementation-registry.json`, `docs/REGISTRY.md`, `docs/CONJUNCTS.md`, `docs/COLLISIONS.md`. |

The four transliteration additions are `tools/transliteration/collision_tests.py`, `tools/transliteration/numeral_compare.py`, `tools/transliteration/results/collisions.json`, and `tools/transliteration/results/numerals.json`.

## Changed files

1. `BUILD-NUMBER.txt` — replaced full metadata with the single string `BUILD-0023`.
2. `IMPLEMENTATION_STATUS.md` — executable count increased from 20 to 24 and now lists four new rules.
3. `docs/CANONICAL-NARRATIVE.md` — adds entries for BUILD-0018 through BUILD-0023.
4. `tools/pushkalavati-compiler/data/operations.json` — adds operations 8.2.66, 8.3.17, 6.1.107 and 8.2.39.
5. `tools/pushkalavati-compiler/python/execute.py` — adds handlers and test vectors for those four operations.
6. `tools/pushkalavati-compiler/src/execute.js` — adds matching JavaScript handlers.
7. `tools/transliteration/romenagri.py` — adds ASCII/Devanagari digit pass-through/normalization behavior.

## Removed file

`/.github/workflows/pages.yml` was present in BUILD-0017 but absent from BUILD-0023. BUILD-0024 restores it, because it was part of the previously integrated release path.

## Important BUILD-0023 defects or omissions found in review

- `BUILD-0017-MANIFEST.csv` was carried into BUILD-0023 unchanged. It identifies itself as BUILD-0017 and does not enumerate the BUILD-0023 additions.
- `BUILD-NUMBER.txt` contains no parent, date, change summary or source identity.
- `docs/COMBINED-MERGE-MANIFEST.md` still describes the earlier 2026-10-13 merge and does not inventory the later Vidyut/Romenagri source additions.
- `docs/THIRD-PARTY.md` still says the project's executor has 20 executable rules even though BUILD-0023 reports 24.
- `tools/registry.py` and `data/implementation-registry.json` point to `third_party/vidyut/vidyut-prakriya`, a reference snapshot path, rather than the actual vendored source at `third_party/vidyut-prakriya/`.
- `tools/pushkalavati-compiler/tests/compiler.test.js` still asserts an executable count of 20. The four new operations make the generated count 24; BUILD-0024 updates this stale assertion.
- The documented `python3 tools/transliteration/collision_tests.py` command fails in a clean environment because the script imports `toml` before adding the vendored package path, and the import is unused. The original suite also counted two rejected `None` outputs as a collision for the mixed-Latin case. BUILD-0024 removes the unused dependency, makes paths self-contained, and separates rejections from collisions.
- The original collision suite measured only output collisions on 13 cases. It did not perform reverse round trips, exact-codepoint checks, or downstream normalization/case-folding tests. BUILD-0024 expands it to 36 curated cases and 12 schemes, and adds a 309-code-point diagnostic sweep.
- Fourteen files with unchanged contents lost executable mode (0755 → 0644), including the integrated test runner, Romenagri wrappers, build scripts and several vendored Rust scripts. This caused `./scripts/test_all.sh` to fail immediately with permission denied and nested executable checks to fail. BUILD-0024 restores the executable bits in the release archive.
- The vendored Romenagri C source has no immutable upstream commit identifier in `VENDORED.txt`. The Vidyut Cargo metadata declares MIT and names its repository, but the vendored root has no standalone license file or immutable commit marker. The file-change manifest hashes the included files but cannot substitute for upstream commit provenance.

## Native Romenagri result

The native C core builds with GCC. Full `make all` stops when it reaches `flex`, which is not installed in the execution environment. Direct probes show that `acii2rmn` renders a consonant+halant byte sequence as a bare stem, while `rmn2acii` interprets a bare stem as the inherent-vowel form; an explicit `^` is needed on reverse-parser input to express halant. Also, ACII byte `0xEB` decodes to `_3`, while the reverse parser currently turns input `_3` into `3`. This directional asymmetry is documented in `docs/COLLISIONS.md`; it must not be misreported as the 2004 decoder simply stripping terminal virāma.

## BUILD-0024 release inventory

After adding the current dossier, documentation mirrors, expanded collision results, tests, timings and manifests, BUILD-0024 contains **1,579 regular files**. Relative to the supplied BUILD-0023 archive, it has **40 added non-manifest files, 29 content-modified files, no removed files, and 17 mode-only changes**; the two self-referential manifest files are recorded with their own hashes omitted. The complete row-level record is `BUILD-0024_FILE_CHANGE_MANIFEST.csv`, whose SHA-256 is recorded in `BUILD-0024-MANIFEST.csv`.

## What BUILD-0024 corrects

- Restores the Pages workflow.
- Adds the full change manifest with file hashes and statuses.
- Fixes stale rule-count and registry path metadata.
- Makes the collision suite runnable without external `PYTHONPATH` setup or the unused `toml` import.
- Separates true output collisions, input rejections, canonical-equivalence merges, and downstream transform collisions.
- Adds the native C profile probes and the broader Unicode/scheme sweep.
- Preserves executable permissions in the release archive.
