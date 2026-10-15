#!/usr/bin/env bash
# Hindawi integration. Stages are separate.
# Verified path: c2h -> acii2cf -> h2c.
# gurucc's acii2uni | iconv | h2c path was tested and does not match the built scanner.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SRC="$ROOT/lang/suktam/lib"
OUT="$ROOT/lang/suktam/hindawi/build"
FIXTURES="$ROOT/lang/suktam/hindawi/fixtures"
STAGE="${1:-all}"
: "${CHINTAMANI_ROOT:?Set CHINTAMANI_ROOT to the Chintamani checkout}"
ROMENAGRI_BIN="${ROMENAGRI_BIN:-$CHINTAMANI_ROOT/Romenagri}"
GURU_BIN="${GURU_BIN:-$CHINTAMANI_ROOT/Hindawi/guru}"
mkdir -p "$OUT" "$FIXTURES"

find_tool() {
  if command -v "$1" >/dev/null 2>&1; then command -v "$1"; return; fi
  if [ -x "$2/$1" ]; then printf '%s\n' "$2/$1"; return; fi
  echo "Missing $1. Build the upstream tool first." >&2
  exit 127
}

check_deps() {
  command -v iconv >/dev/null || { echo "Missing iconv" >&2; exit 127; }
  command -v gcc >/dev/null || { echo "Missing gcc" >&2; exit 127; }
  C2H="$(find_tool c2h "$GURU_BIN")"
  H2C="$(find_tool h2c "$GURU_BIN")"
  ACII2CF="$(find_tool acii2cf "$ROMENAGRI_BIN")"
  ACII2UNI="$(find_tool acii2uni "$ROMENAGRI_BIN")"
  export C2H H2C ACII2CF ACII2UNI
  printf 'deps ok\n'
}

translate() {
  check_deps
  for file in sanchalan.c sanchalan.h; do
    "$C2H" < "$SRC/$file" > "$OUT/$file.uhin.acii"
    test -s "$OUT/$file.uhin.acii"
    "$ACII2UNI" < "$OUT/$file.uhin.acii" | iconv -f UTF-16 -t UTF-8 > "$OUT/$file.uhin"
    test -s "$OUT/$file.uhin"
    "$ACII2CF" < "$OUT/$file.uhin.acii" | "$H2C" > "$OUT/$file"
    test -s "$OUT/$file"
  done
  printf 'translate ok\n'
}

compile_stage() {
  translate
  gcc -std=c11 -Wall -Wextra -Werror -I"$OUT" -c "$OUT/sanchalan.c" -o "$OUT/sanchalan.o"
  cat > "$OUT/link-smoke.c" <<'SMOKE'
#include "sanchalan.h"
int main(void) { Sanchalan state; sanchalan_init(&state); return sanchalan_call(&state, "pid-zero"); }
SMOKE
  gcc -std=c11 -Wall -Wextra -Werror -I"$OUT" "$OUT/link-smoke.c" "$OUT/sanchalan.o" -o "$OUT/link-smoke"
  printf 'compile ok\n'
}

test_stage() {
  compile_stage
  "$OUT/link-smoke"
  printf '%s\n' 'int main(void){return 0;}' > "$FIXTURES/tiny.c"
  "$C2H" < "$FIXTURES/tiny.c" | "$ACII2CF" | "$H2C" > "$OUT/tiny.c"
  grep -q 'int main' "$OUT/tiny.c"
  cat > "$OUT/unknown.c" <<'EOF'
#include "sanchalan.h"
int main(void) { Sanchalan m; sanchalan_init(&m); return sanchalan_call(&m, "not-a-rule"); }
EOF
  gcc -std=c11 -Wall -Wextra -Werror -I"$OUT" "$OUT/unknown.c" "$OUT/sanchalan.o" -o "$OUT/unknown"
  set +e
  "$OUT/unknown" >"$OUT/unknown.out" 2>"$OUT/unknown.err"
  status=$?
  set -e
  test "$status" -ne 0
  grep -q "unknown operation" "$OUT/unknown.err"
  printf 'test ok\n'
}

clean_stage() {
  rm -rf "$OUT"
  printf 'clean ok\n'
}

case "$STAGE" in
  check-deps) check_deps ;;
  translate) translate ;;
  compile) compile_stage ;;
  test) test_stage ;;
  clean) clean_stage ;;
  all) test_stage ;;
  *) echo "usage: build.sh [check-deps|translate|compile|test|clean]" >&2; exit 2 ;;
esac
