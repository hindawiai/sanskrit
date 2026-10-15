#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/tools/pushkalavati-compiler/vendor/romenagri/upstream"
URL="https://github.com/project-ilm/romenagri.git"
REF="${ROMENAGRI_REF:-master}"

if ! command -v git >/dev/null 2>&1; then
  echo "ERROR: git is required to vendor the complete Romenagri source." >&2
  exit 2
fi
if [ -d "$DEST/.git" ]; then
  git -C "$DEST" fetch --depth 1 origin "$REF"
  git -C "$DEST" checkout --detach FETCH_HEAD
else
  mkdir -p "$(dirname "$DEST")"
  git clone --depth 1 --branch "$REF" "$URL" "$DEST"
fi

test -f "$DEST/LICENSE" || { echo "ERROR: upstream LICENSE missing" >&2; exit 3; }
test -f "$DEST/src/acii.h" || { echo "ERROR: upstream src/acii.h missing" >&2; exit 3; }
test -f "$DEST/src/rmn2acii.c" || { echo "ERROR: upstream src/rmn2acii.c missing" >&2; exit 3; }
test -f "$DEST/src/acii2rmn.c" || { echo "ERROR: upstream src/acii2rmn.c missing" >&2; exit 3; }

mkdir -p "$ROOT/tools/pushkalavati-compiler/vendor/romenagri"
git -C "$DEST" rev-parse HEAD > "$ROOT/tools/pushkalavati-compiler/vendor/romenagri/UPSTREAM_COMMIT"
printf 'Vendored Romenagri at %s\n' "$(cat "$ROOT/tools/pushkalavati-compiler/vendor/romenagri/UPSTREAM_COMMIT")"
echo "Full source and data are now available under $DEST"
