# Release privacy and sensitive-content review — BUILD-0002

**Scope:** static scan of the supplied archive's extracted text/source files plus manual review of the highest-signal matches. This is a triage report, not a guarantee that every binary, encoded, or semantic disclosure has been found. No files were removed or modified as part of this audit.

## Items requiring owner review

1. **Contact address embedded in upstream source/license boilerplate.** The vendored Chintamani source includes an email-address field in copyright/license header templates. Matches occur in `lang/hindawi/upstream/chintamani/praatha/praathacc`, `b2h.uhin`, `h2b.uhin`, and similar headers in `shraeni/`, `shabda/`, and other upstream subtrees. Some appear to be generic or legacy upstream contact fields; confirm whether the actual address should remain in a public distribution. Preserve upstream provenance and license notices; do not bulk-delete without a rights/provenance decision.

2. **Postal address in upstream license boilerplate.** The same headers contain a Free Software Foundation postal address. This is public institutional boilerplate, not a project owner's private address; normally retain it when required by the upstream notice.

3. **Project attribution and publication references.** The archive contains project-owner attribution, publication DOI/URLs, and historical contact/lineage statements in documentation. These are not automatically secrets. Confirm each is intentionally public and factually current before release.

## Scan results

- The high-signal scan found no obvious cloud access-key pattern, GitHub token pattern, or PEM private-key marker in the scanned text files.
- A pattern scan is not proof of absence: binary files, obfuscated secrets, unrecognized token formats, and sensitive information not matching the patterns may remain.
- This archive contains vendored upstream source, generated binaries, caches/bytecode, and historical snapshot copies. Review distribution necessity and license obligations separately; this report does not delete any of them.

## Release gate recommendations

- Run a dedicated secret scanner against the unpacked tree and Git history before public release.
- Review every contact field, home-directory path, credential-like literal, personal identifier, and unpublished correspondence manually.
- Preserve required copyright/license headers. If a field is genuinely sensitive, replace only after checking license requirements and keeping a documented upstream patch.
- Re-run this audit on the exact final ZIP and record its SHA-256.
