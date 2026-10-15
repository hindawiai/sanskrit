#!/bin/sh
set -eu
cd "$(dirname "$0")"
GCC="${RISCV_GCC:-riscv64-linux-musl-gcc}"
QEMU="${QEMU_SYSTEM_RISCV64:-qemu-system-riscv64}"
"$GCC" -march=rv64gc -mabi=lp64d -mcmodel=medany -fno-pie -no-pie -ffreestanding -nostdlib -static -Wl,--no-dynamic-linker -T kernel.ld -o kernel.elf start.S kmain.c
printf 'sanchalan\n' | timeout 8 "$QEMU" -machine virt -bios none -nographic -kernel kernel.elf || true
