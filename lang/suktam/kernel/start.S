.section .text
.global _start
.option push
.option norelax
_start:
    la sp, stack_top
    call kmain
1:
    wfi
    j 1b
.option pop

.section .bss
.align 4
stack:
    .skip 4096
stack_top:
