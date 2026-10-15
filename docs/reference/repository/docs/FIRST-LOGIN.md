# First login

This is the first prompt of a new system, the point at which a port to a processor presents a login line.

What runs: a freestanding RISC-V kernel, linked at `0x80000000`, started by QEMU system emulation of the `virt` machine with `-bios none`. It writes to the NS16550 UART at `0x10000000`. It prints a reset line, a UART line, a first-login line, then `login: `. It reads one line. It prints `sanchalan> first prompt ready`.

What this is not: a shell, a file system, a process manager, a page allocator, or a Shakti SoC boot. The prompt is the first login. Nothing after it exists yet.

Observed:

```text
sanchalan-boot: reset
sanchalan-boot: uart
sanchalan-boot: first login
login: sanchalan
sanchalan> first prompt ready
sanchalan> no shell, no filesystem
```

Run: `lang/suktam/kernel/run-first-login.sh`.
