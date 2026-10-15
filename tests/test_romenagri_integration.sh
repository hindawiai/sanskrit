#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
test -x "$ROOT/scripts/vendor_romenagri.sh"
test -x "$ROOT/scripts/romenagri_perso_arabic_filter.sh"
grep -q 'project-ilm/romenagri.git' "$ROOT/scripts/vendor_romenagri.sh"
grep -q 'fltr_ur_hi' "$ROOT/scripts/romenagri_perso_arabic_filter.sh"
grep -q 'exec sed -f' "$ROOT/scripts/romenagri_perso_arabic_filter.sh"
grep -q 'No substitute rules were generated' "$ROOT/scripts/romenagri_perso_arabic_filter.sh"
echo 'Romenagri vendoring and Perso-Arabic wrapper contract passed'
