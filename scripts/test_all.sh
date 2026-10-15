#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
echo '== JavaScript / Sūtram tests =='
node lang/js/test_shivasutras.js
node lang/js/test_padartha.js
node lang/js/demo.js
node lang/js/test_interpreter.js
node lang/js/test_bootstrap.js
node lang/js/test_convert.js
node lang/js/test_engine_precedence.js
node lang/js/test_oop.js
node lang/js/test_paradigms.js
node lang/js/test_backend.js
node lang/suktam/test/suktam.test.js
runtime_tmp="$(mktemp -d)"
trap 'rm -rf "$runtime_tmp"' EXIT
gcc -std=c11 -Wall -Wextra -Werror -Ilang/suktam/lib \
  lang/suktam/test/runtime.test.c lang/suktam/lib/sanchalan.c \
  -o "$runtime_tmp/sanchalan-runtime-test"
"$runtime_tmp/sanchalan-runtime-test"

echo '== Romenagri integration contract =='
./tests/test_romenagri_integration.sh
echo '== Vendored legacy Romenagri C profile probes =='
gcc -std=c11 -Wall -Wno-unused -Wno-sign-compare -Ithird_party/chintamani-romenagri \
  tests/test_legacy_romenagri.c third_party/chintamani-romenagri/rmn2acii.c \
  third_party/chintamani-romenagri/acii2rmn.c third_party/chintamani-romenagri/stack.c \
  -o "$runtime_tmp/legacy-romenagri-test"
"$runtime_tmp/legacy-romenagri-test"
echo '== Romenagri lossless front-end branch coverage =='
./scripts/test_romenagri_frontend_coverage.sh

echo '== Expanded transliteration collision and normalization audit =='
python3 tools/transliteration/collision_tests.py
python3 tools/transliteration/unicode_inventory_sweep.py
python3 tests/test_collision_audit.py -v
echo '== Transliteration abstraction and attested fixtures =='
PYTHONPATH=tools:third_party/indic_transliteration python3 tools/transliteration/compare.py

echo '== Hindawi C/C++ keyword-table integrity =='
python3 lang/hindawi/test_ports.py

echo '== Sanchalan against vendored Hindawi C ports =='
python3 lang/hindawi/test_sanchalan_ports.py

echo '== Regenerate Pushkalāvatī compiler artifacts =='
npm run compile:rules

echo '== Pushkalāvatī compiler and inverse-reduction tests =='
npm --prefix tools/pushkalavati-compiler test

echo '== Python tests =='
python3 -m unittest discover -s tests -p 'test_*.py' -v
(cd tools/pushkalavati-compiler && python3 python/execute.py)

echo '== Python Sūtram interpreter smoke test =='
PYTHONPATH="$ROOT/lang" python3 - <<'PY'
from pathlib import Path
from interpreter import run
root = Path.cwd()
src = (root / 'lang/examples/ganana.su').read_text(encoding='utf-8')
assert run(src, 'mula') == 13
print('Python Sūtram interpreter passed: ganana.su -> 13')
PY

echo '== Shaili Robot static runner tests =='
npm run test:logo-static

echo '== GitHub Pages / browser smoke tests =='
./tests/test_static_pages.sh

echo 'ALL AVAILABLE TESTS PASSED'
