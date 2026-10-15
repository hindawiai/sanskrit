# Seed note: how this repository was made from the builds

© 1993–2026 Abhishek Choudhary. All rights reserved. AyeAI.

This repository is Project Pushkalāvatī / Nirgundi, the Sanskrit parser, seeded exactly as it was
delivered. Nothing in the builds was edited. Every original archive is in `releases/originals/`,
byte for byte, with its SHA-256:

```
b81e4c0472b935ac7f85406967dffb53ecf5efcc4d20e571b57726fe544bfda7  BUILD-0024__pushkalavati-hindawi-ilm-2026-10-14.zip
c76bd928c5a9a1c4a159f685690d6ce01b70f7b009baa753694a97f543213ddc  BUILD-0025-RESULTS.zip
4f158697bcd891053a21b1a9ecebf33f7d5261a7a0de53e553330f05d22f3c25  BUILD-0025__pushkalavati-hindawi-ilm-2026-10-14.zip
64bf96b15f8459b0ee6bf0326e8df656a67dab87c8e65e383e286cbdcc048ea5  BUILD-0026__pushkalavati-hindawi-ilm-2026-10-14.zip
15f6229f55f081e2fa0e52acc85fdb7fb7c50e1dd23b6a82db5382f61b61fd06  BUILD-0027-CORRECTION.zip
fa53c87b160a482f282dc9b0d646825365c2f1e686a30fda3efe522cab825958  BUILD-0027-RESULTS.zip
a1d7a78f0e1dd9ec656f1f60ec6697830fecf38d15709c641c990242a969acf1  CLAUDE_HANDOVER_HINDAWI_ROMENAGRI_TAJZIYA_2026-10-14.docx
82a220a35f8de4f54f33dd5ed755462270e74b2875f3441bb1084ea65073debd  CLAUDE_HANDOVER_HINDAWI_ROMENAGRI_TAJZIYA_2026-10-14.md
```

## History

| Tag | Commit content |
| --- | --- |
| `build-0024` | BUILD-0024 as delivered |
| `build-0025` | BUILD-0025 as delivered |
| `build-0026` | BUILD-0026 as delivered |
| `build-0027-results` | BUILD-0026 with BUILD-0027-RESULTS as delivered |
| `build-0027` | BUILD-0026 with the BUILD-0027 correction as delivered |

The commit after `build-0027` adds what no build carried, and nothing else:

- **Twenty files that BUILD-0025 and BUILD-0026 dropped, restored from BUILD-0024.** BUILD-0025's own
  change manifest records no removal, so they were lost in packaging, not taken out. They are
  listed in `ops/restore-dropped.txt`:
  - `.github/workflows/pages.yml`, which the build's own page test requires;
  - five files of `third_party/indic_transliteration`'s font converter;
  - the fourteen texts of `third_party/wikipedia-corpus/sa`.
- **Executable shell scripts.** The archives stored no file permissions, so `scripts/test_all.sh`
  stopped at its first `./tests/*.sh`. Every `*.sh` is executable again.
- **The handover:** `docs/handover/`, the ChatGPT handover in Markdown and Word, as delivered.
- **This note, `misty.json`, `CITATION.cff`, and the gate `ops/verify.sh`.**

## What the gate checks

`bash ops/verify.sh` checks that:
- every original archive matches its pin;
- the restored files are present;
- no secret pattern and no file over 95 MB is committed;
- the version is recorded the same everywhere;
- the build's own `scripts/test_all.sh` passes on a scratch copy of the tree.

It runs the tests on a copy because the script regenerates its documentation catalogue and
timing results in place. The tests need Node.js, gcc and the Python packages `regex`, `tqdm`,
`typer`, `toml` and `roman`; the gate installs those into `.verify/venv`. The build calls npm only to run
its own `package.json` scripts and declares no dependencies, so where npm is not installed the gate runs
those scripts itself, the way npm does, and says so.

## As found, recorded and not changed

- `BUILD-NUMBER.txt` in BUILD-0025 and BUILD-0026 still says BUILD-0024.
- `LICENSE` is MIT, in the name "Abhishek Chaudhary".
- `third_party/` keeps its own licences:
  - the vendored Chintamani Romenagri is GPL-2.0-or-later;
  - indic_transliteration and sanscript.js carry their own licence files;
  - the IKS pack records CC BY-SA;
  - the Sanskrit Wikipedia texts are under Wikipedia's licence.
- The build does not record a licence for the Cologne Monier-Williams data in
  `data/external/mw/`.
- The handover in `docs/handover/` lists the BUILD-0027 correction archive's own reproducibility gaps:
  - stale RV counts in the summary audit;
  - a "CSV" match ledger that is JSON Lines;
  - a checksum self-hash that does not match;
  - a regenerated corpus that the archive does not carry.

  They stand as recorded.
- The build's privacy audit (`docs/RELEASE-PRIVACY-AUDIT-BUILD-0002.md`) flags upstream licence
  boilerplate and attribution, not secrets. The gate's secret scan runs on every push.
