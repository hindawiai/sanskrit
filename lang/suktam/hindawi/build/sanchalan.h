#ifndef SANCHALAN_H
#define SANCHALAN_H

/* Small runtime library. The generated program calls these.
   This is not a kernel. Sanskrit conversion comes later. */

typedef struct {
    int pid;
    int memory_pages;
    int pipes;
    int sends;
    int steps;
    int deferred;
} Sanchalan;

void sanchalan_init(Sanchalan *m);
int sanchalan_call(Sanchalan *m, const char *op);
void sanchalan_report(const Sanchalan *m, int verse);

#endif
