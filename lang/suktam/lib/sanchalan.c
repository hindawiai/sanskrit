#include "sanchalan.h"
#include <stdio.h>
#include <string.h>

void sanchalan_init(Sanchalan *m) {
    m->pid = -1;
    m->memory_pages = 0;
    m->pipes = 0;
    m->sends = 0;
    m->steps = 0;
    m->deferred = 0;
    m->booted = 0;
}

void sanchalan_boot_banner(void) {
    printf("sanchalan-boot: init\n");
}

void sanchalan_boot_check(Sanchalan *m) {
    if (m->pid >= 0 && m->memory_pages > 0) {
        m->booted = 1;
        printf("sanchalan-boot: ready pid=%d mem=%d pipe=%d\n", m->pid, m->memory_pages, m->pipes);
    } else {
        fprintf(stderr, "sanchalan-boot: not ready pid=%d mem=%d\n", m->pid, m->memory_pages);
    }
}

static int same(const char *a, const char *b) { return strcmp(a, b) == 0; }

static int is_deferred(const char *op) {
    static const char *names[] = {
        "accomplish",
        "address-board",
        "all-items",
        "always",
        "arisen",
        "begin",
        "best",
        "bound",
        "bring",
        "by-own",
        "by-rule",
        "cause",
        "certain",
        "characters",
        "command-store",
        "communicator",
        "complete",
        "completion",
        "configure",
        "continuous",
        "control",
        "core-location",
        "deferred",
        "depend",
        "destination",
        "destroyed",
        "director",
        "display",
        "does",
        "door-board",
        "doubt",
        "empty-location",
        "enter",
        "establish",
        "everywhere",
        "exit",
        "extent",
        "fill",
        "filled",
        "first",
        "first-process",
        "from-all",
        "give",
        "group",
        "having-done",
        "in-all",
        "index",
        "indicate",
        "initialize",
        "initialize-runtime",
        "input",
        "input-location",
        "is",
        "is-ordained",
        "its",
        "know",
        "living",
        "location",
        "machine",
        "machine-board",
        "main",
        "measure-memory",
        "message",
        "native",
        "next",
        "ordain",
        "ordered",
        "ordered-procedure",
        "orphan-process",
        "page-board",
        "particle",
        "partition",
        "path",
        "pause",
        "per-character",
        "place",
        "print",
        "process",
        "process-id",
        "produce",
        "prompt",
        "properly",
        "protect",
        "protect-machine",
        "read",
        "ready",
        "release",
        "rest",
        "result",
        "root",
        "root-command",
        "root-location",
        "rule-bound",
        "run",
        "sanitize",
        "sanitize-text",
        "scope",
        "send-buffer",
        "separate",
        "should-go",
        "signal",
        "source-location",
        "start",
        "state",
        "store",
        "terminal",
        "terminated",
        "then",
        "trap-board",
        "until",
        "user-mode",
        "validate",
        "validate-memory",
        "violation",
        "virtual-memory",
        "visarga-ca",
        "wait",
        "watchdog",
        "while",
        "work",
        "work-board",
        "write"
    };
    for (size_t i = 0; i < sizeof(names)/sizeof(names[0]); i++) if (same(op, names[i])) return 1;
    return 0;
}

int sanchalan_call(Sanchalan *m, const char *op) {
    if (!op || !*op) return 0;
    if (same(op, "pid-zero") || same(op, "zero-fill")) {
        m->pid = 0;
    } else if (same(op, "partition-memory") || same(op, "memory-reference") || same(op, "protect-memory")) {
        m->memory_pages += 1;
    } else if (same(op, "command-pipe")) {
        m->pipes += 1;
    } else if (same(op, "send") || same(op, "communicate") || same(op, "forward")) {
        m->sends += 1;
    } else if (same(op, "spawn-pair")) {
        if (m->pid < 0) m->pid = 0;
        m->pid += 1;
    } else if (is_deferred(op)) {
        m->deferred += 1;
    } else {
        fprintf(stderr, "sanchalan: unknown operation '%s'\n", op);
        return 1;
    }
    m->steps += 1;
    return 0;
}

void sanchalan_report(const Sanchalan *m, int verse) {
    printf("verse=%d pid=%d mem=%d pipe=%d send=%d deferred=%d\n",
        verse, m->pid, m->memory_pages, m->pipes, m->sends, m->deferred);
}
