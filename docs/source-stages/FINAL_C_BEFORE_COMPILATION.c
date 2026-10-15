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
}

static int same(const char *a, const char *b) { return strcmp(a, b) == 0; }

static int is_deferred(const char *op) {
    static const char *names[] = {
        "address-board","all-items","begin","bound","characters","command-store",
        "communicator","complete","configure","control","destroyed","door-board",
        "empty-location","enter","fill","first-process","group","index","initialize",
        "initialize-runtime","input","input-location","location","machine","machine-board",
        "measure-memory","message","native","ordered","ordered-procedure","orphan-process",
        "page-board","particle","partition","pause","process","process-id","prompt",
        "protect-machine","result","root","root-command","root-location","run","sanitize",
        "scope","send-buffer","signal","start","state","store","terminal","terminated",
        "trap-board","user-mode","validate","validate-memory","violation","virtual-memory",
        "visarga-ca","wait","watchdog","work","work-board"
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
