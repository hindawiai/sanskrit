# BUILD-0024 source identity note

BUILD-0024 is a correlation and test expansion of the supplied BUILD-0023 archive, not an independently checked-out Git commit.

- BUILD-0023 archive SHA-256: `6bcdcf6a3b4df7e6e0566ca2016d6b5fdcd4cd0159f9495880f2a55d130964a7`
- BUILD-0017 comparison archive SHA-256: `af32a335d8056f06ad4fb73e21113f2fad0e688a8aac9f623c560d2bcb4676eb`
- BUILD-0024 source additions and edits are recorded in `BUILD-0024_FILE_CHANGE_MANIFEST.csv` with per-file hashes wherever a non-circular hash can be recorded.
- `.github/workflows/pages.yml` was restored from BUILD-0017 after confirming it was missing from BUILD-0023.
- The vendored Chintamani/Romenagri source identifies its origin in `third_party/chintamani-romenagri/VENDORED.txt`, but does not pin an upstream commit.
- The vendored Vidyut Prakriya source declares MIT in `Cargo.toml` and names `ambuda-org/vidyut`, but this archive does not include an immutable source commit marker or standalone license file at the vendored root.
- BUILD-0024's SHA-256 is published in the external `BUILD-0024-SHA256.txt`; it is not stored inside the ZIP because a ZIP cannot contain its own final digest without a circular dependency.
