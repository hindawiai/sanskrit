#!/bin/sh
# Builds the Sanchalan library and runs it under QEMU user-mode.
# x86_64 is the host target. riscv64 matches Shakti C-class RV64GC.
# This is user-mode execution of a library, not a Shakti SoC boot.
set -eu
root=$(CDPATH= cd -- "$(dirname "$0")/../.." && pwd)
lib="$root/lang/suktam/lib"
out="$root/lang/suktam/out"
node "$root/lang/suktam/suktam.js"

find_qemu() {
  name=$1
  var=$2
  eval "override=\${$var:-}"
  if [ -n "$override" ] && [ -x "$override" ]; then
    echo "$override"
    return
  fi
  if command -v "$name" >/dev/null 2>&1; then
    command -v "$name"
    return
  fi
  for candidate in \
    "/tmp/qemu-user/usr/bin/$name" \
    "/usr/bin/$name"
  do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return
    fi
  done
  echo ""
}

qemu_x86=$(find_qemu qemu-x86_64-static QEMU_X86_64)
qemu_rv=$(find_qemu qemu-riscv64-static QEMU_RISCV64)
if [ -z "$qemu_x86" ] || [ -z "$qemu_rv" ]; then
  echo "QEMU user-static not found. Set QEMU_X86_64 and QEMU_RISCV64, or install qemu-user-static." >&2
  exit 2
fi

gcc -std=c11 -Wall -Wextra -Werror -static -DSANCHALAN_ARCH='"x86_64"' \
  -I"$lib" -o "$out/sanchalan-x86" "$out/sanchalan-qemu.c" "$lib/sanchalan.c"
"$qemu_x86" "$out/sanchalan-x86" | tee "$out/qemu-x86.txt"

rv_gcc=${RISCV_GCC:-}
if [ -z "$rv_gcc" ]; then
  if [ -x /tmp/riscv64-linux-musl-cross/bin/riscv64-linux-musl-gcc ]; then
    rv_gcc=/tmp/riscv64-linux-musl-cross/bin/riscv64-linux-musl-gcc
  fi
fi
if [ -z "$rv_gcc" ]; then
  echo "RISC-V compiler not found. Set RISCV_GCC. x86 run completed." >&2
  exit 0
fi
# The musl.cc toolchain used here is a 32-bit host binary. Run it under qemu-i386 if needed.
run_rv=$rv_gcc
if ! "$rv_gcc" --version >/dev/null 2>&1; then
  qemu_i386=$(find_qemu qemu-i386-static QEMU_I386)
  if [ -z "$qemu_i386" ]; then
    echo "RISC-V compiler is not executable on this host and qemu-i386-static is missing." >&2
    exit 2
  fi
  run_rv="$qemu_i386 $rv_gcc"
fi
$run_rv -std=c11 -Wall -Wextra -Werror -static -march=rv64gc -mabi=lp64d \
  -DSANCHALAN_ARCH='"riscv64-rv64gc"' -I"$lib" \
  -o "$out/sanchalan-riscv64" "$out/sanchalan-qemu.c" "$lib/sanchalan.c"
"$qemu_rv" "$out/sanchalan-riscv64" | tee "$out/qemu-riscv64.txt"
grep '^verse=' "$out/qemu-x86.txt" > "$out/qemu-x86-verses.txt"
grep '^verse=' "$out/qemu-riscv64.txt" > "$out/qemu-riscv64-verses.txt"
cmp "$out/qemu-x86-verses.txt" "$out/qemu-riscv64-verses.txt"
echo "x86 and riscv64 verse traces match"
