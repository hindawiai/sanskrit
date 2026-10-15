#!/usr/bin/env bash
# Run Romenagri's upstream sed-based Urdu/Hindi (Perso-Arabic-family) filter.
# This intentionally discovers the canonical upstream filter instead of cloning
# or paraphrasing its transformation rules.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
UPSTREAM="$ROOT/tools/pushkalavati-compiler/vendor/romenagri/upstream"
if [ ! -d "$UPSTREAM" ]; then
  echo "ERROR: complete upstream source is not present." >&2
  echo "Run: ./scripts/vendor_romenagri.sh" >&2
  exit 2
fi
if [ "$#" -gt 1 ]; then
  echo "Usage: $0 [input-file]" >&2
  exit 64
fi
if [ "$#" -eq 1 ]; then
  INPUT="$1"
  [ -r "$INPUT" ] || { echo "ERROR: cannot read input: $INPUT" >&2; exit 66; }
  INPUT_ARGS=("$INPUT")
else
  INPUT_ARGS=()
fi

# Locate the original project filter by its documented canonical name.
mapfile -t FILTERS < <(find "$UPSTREAM" -type f \( -iname 'fltr_ur_hi' -o -iname 'fltr_ur_hi.sed' -o -iname '*fltr*ur*hi*.sed' \) -print | sort)
if [ "${#FILTERS[@]}" -ne 1 ]; then
  echo "ERROR: expected exactly one upstream fltr_ur_hi sed filter; found ${#FILTERS[@]}." >&2
  printf '%s\n' "${FILTERS[@]}" >&2
  echo "No substitute rules were generated; inspect the upstream data tree." >&2
  exit 3
fi
FILTER="${FILTERS[0]}"
if ! grep -Eq '(^|[[:space:]])s[/#|]' "$FILTER"; then
  echo "ERROR: located filter does not look like a sed substitution program: $FILTER" >&2
  exit 4
fi
exec sed -f "$FILTER" "${INPUT_ARGS[@]}"
