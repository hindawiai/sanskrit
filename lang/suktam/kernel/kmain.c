/* Freestanding first-prompt kernel.
   This is the first login: a UART banner and a prompt.
   It is not a shell, not a file system, and not a process manager. */

#define UART 0x10000000

static void putc(char c) {
    *(volatile unsigned char *)UART = (unsigned char)c;
}

static void puts(const char *s) {
    while (*s) {
        if (*s == '\n') putc('\r');
        putc(*s++);
    }
}

static int getc(void) {
    volatile unsigned char *lsr = (volatile unsigned char *)(UART + 5);
    while ((*lsr & 0x01) == 0) {}
    return *(volatile unsigned char *)UART;
}

void kmain(void) {
    char name[32];
    int n = 0;
    puts("sanchalan-boot: reset\n");
    puts("sanchalan-boot: uart\n");
    puts("sanchalan-boot: first login\n");
    puts("login: ");
    while (n < 31) {
        int c = getc();
        if (c == '\r' || c == '\n') break;
        putc((char)c);
        name[n++] = (char)c;
    }
    name[n] = 0;
    puts("\n");
    puts("sanchalan> first prompt ready\n");
    puts("sanchalan> no shell, no filesystem\n");
    (void)name;
}
