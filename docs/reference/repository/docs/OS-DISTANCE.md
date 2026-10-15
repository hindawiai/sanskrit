# Distance from a fundamental basic operating system

What exists is a userspace state machine that talks about an operating system, plus a freestanding first-prompt kernel. It is not an operating system that can load a shell and a file system.

## Where the work actually is

The Sanchalan Suktam is a 22-verse description of process, memory boards, pipes, traps, and user mode. The parser recognizes every span in that source. The generated C calls a small library. The library holds a handful of integers: a process id, a page count, a pipe count, a send count, a deferred count. Under QEMU user-mode it prints a banner and, if a process id exists and at least one page was counted, it prints ready.

That user-mode run is a static Linux executable. The host kernel loads it. There is no reset vector, no privilege mode, no trap handler, no page table, no device, and no disk.

BUILD-0009 adds a separate freestanding kernel. It boots under `qemu-system-riscv64 -machine virt -bios none`, prints on a UART, and reaches `login: `. That is the first prompt. It still has no shell, no file system, no page allocator, and no second process.

## What a fundamental basic OS actually needs

A system that can boot, load a shell, and mount a basic file system needs, at minimum:

1. Bare-metal entry. Done for the first prompt only.
2. Console. Done for the UART only.
3. Trap and timer. Not done.
4. Physical memory. A page allocator over a known RAM range, not a counter. Not done.
5. Address spaces. Not done.
6. A process. A control block, saved registers, and a context switch. Not done.
7. A syscall surface. Not done.
8. A loader. Not done.
9. A block device and a file system. Not done.
10. The shell itself. A separate userspace program. Not done.

## The distance

| Layer | Now | Needed for shell + FS |
|---|---|---|
| Execution | Freestanding reset to a prompt, plus a separate userspace library | Reset, traps, freestanding C, no host libc |
| Memory | Integer counter in the library | Page allocator, page tables |
| Process | One struct, no switch | PCB, context switch, user mode |
| I/O | UART for the first prompt; `printf` in the library | UART is done; disk is not |
| Storage | None | Block driver + minimal FS |
| Programs | One kernel image that prints a prompt | Loader + a separate shell binary |
| Boot test | `qemu-system-riscv64 -machine virt` reaches `login:` | Same, then a shell reads a command from a file |

Until that image boots and a shell reads a command from a file, this is not an operating system.
