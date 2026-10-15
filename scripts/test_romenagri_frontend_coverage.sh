#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
if ! python3 -c 'import coverage' >/dev/null 2>&1; then
  echo "SKIP Romenagri front-end coverage: Python coverage.py is not installed"
  exit 0
fi
coverage_file="$(mktemp)"
trap 'rm -f "$coverage_file"' EXIT
COVERAGE_FILE="$coverage_file" PYTHONPATH="$ROOT/tools:$ROOT/third_party/indic_transliteration" \
  coverage run --branch -m unittest tests/test_romenagri_document.py
COVERAGE_FILE="$coverage_file" coverage report --fail-under=100 -m tools/transliteration/romenagri_document.py
