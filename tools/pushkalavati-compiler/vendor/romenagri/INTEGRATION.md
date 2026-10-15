# Complete Romenagri integration — Pushkalāvatī

This package retains the Pushkalāvatī rule-12 / 6.1.94 baseline and adds a
reproducible upstream-vendoring path for the complete Romenagri repository,
including the original Perso-Arabic-family data and the original sed-based
`fltr_ur_hi` filter.

## Setup

From the repository root:

```sh
./scripts/vendor_romenagri.sh
```

This clones the upstream repository to
`tools/pushkalavati-compiler/vendor/romenagri/upstream/` and records the exact
checked-out commit in `tools/pushkalavati-compiler/vendor/romenagri/UPSTREAM_COMMIT`.
Set `ROMENAGRI_REF` to a tag or commit-compatible ref to pin a different revision.
Default branch `master` is intentionally used only if no ref is specified.

## Run the original Urdu/Hindi sed filter

After vendoring:

```sh
./scripts/romenagri_perso_arabic_filter.sh input.txt > output.txt
cat input.txt | ./scripts/romenagri_perso_arabic_filter.sh > output.txt
```

The wrapper locates and invokes the upstream `fltr_ur_hi` sed program directly.
It does not rewrite or emulate the sed rules. If the upstream tree does not
contain exactly one matching filter, it fails loudly instead of silently
substituting a homemade implementation.

## Build/reference boundary

The full upstream source tree is preserved unmodified beneath `vendor/romenagri/upstream`.
This matters because Romenagri contains a C core, table-driven ACII mappings,
legacy Unicode converters, corpora, and data/filter components. Keep the native
Devanagari/IAST boundary adapters separate from the rule engine's canonical
sound-token IR. Do not treat ACII table bytes as Unicode phoneme IDs.

The repository's existing JavaScript sound-token adapter remains in place. This
packaging step does not claim byte-for-byte C/JS parity: run differential tests
against the upstream C implementation before enabling the C converter as the
authoritative runtime.

## Current execution limitation

The upstream GitHub repository could not be cloned in the build environment
because outbound DNS/network access was unavailable. Consequently this archive
contains a reproducible fetch-and-integrate bootstrap, not a fabricated copy of
unretrieved upstream source or sed rules. Run `vendor_romenagri.sh` in a networked
environment to materialize the complete upstream code and data.


## Native build

After `vendor_romenagri.sh`, run `./scripts/build_romenagri.sh`. This delegates to
an upstream Makefile and does not synthesize build targets. The script intentionally
fails when no Makefile is present. Inspect the exact built utilities and run
differential tests before marking native integration complete.

## Static Pages

The site is rooted at `docs/`. `.github/workflows/pages.yml` uploads that directory
as the GitHub Pages artifact and runs link, JavaScript syntax, and browser-smoke
checks. The browser app can execute its documented Sūtram subset and selected
sound/rule demonstrations. It does not run shell commands, native GCC, or sed;
those require a future verified WebAssembly port or a separately deployed service.
