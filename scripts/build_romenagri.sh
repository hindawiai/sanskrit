#!/usr/bin/env bash
# Build the original upstream Romenagri project without rewriting its build.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPSTREAM="$ROOT/tools/pushkalavati-compiler/vendor/romenagri/upstream"
if [ ! -d "$UPSTREAM" ]; then
  echo "ERROR: upstream Romenagri source missing. Run ./scripts/vendor_romenagri.sh first." >&2
  exit 2
fi
mapfile -t MAKEFILES < <(find "$UPSTREAM" -type f \( -name Makefile -o -name makefile -o -name GNUmakefile \) -not -path '*/.git/*' -print | sort)
if [ "${#MAKEFILES[@]}" -eq 0 ]; then
  echo "ERROR: no upstream Makefile found; no replacement build system will be guessed." >&2
  exit 3
fi
# Build from the shallowest Makefile directory first; upstream owns target names.
BUILD_DIR="$(dirname "${MAKEFILES[0]}")"
echo "Building original Romenagri in: $BUILD_DIR"
make -C "$BUILD_DIR"
echo "Build command completed. Inspect upstream Makefile targets and outputs before declaring all utilities built."
