#include "../lib/sanchalan.h"
#include <assert.h>
#include <stdio.h>

int main(void) {
    Sanchalan state;
    sanchalan_init(&state);
    assert(state.pid == -1 && state.memory_pages == 0 && state.pipes == 0);
    assert(sanchalan_call(&state, "pid-zero") == 0 && state.pid == 0);
    assert(sanchalan_call(&state, "partition-memory") == 0 && state.memory_pages == 1);
    assert(sanchalan_call(&state, "command-pipe") == 0 && state.pipes == 1);
    assert(sanchalan_call(&state, "send") == 0 && state.sends == 1);
    assert(sanchalan_call(&state, "measure-memory") == 0 && state.deferred == 1);
    assert(sanchalan_call(&state, "not-a-runtime-operation") != 0);
    assert(state.steps == 5);
    puts("Sanchalan runtime dispatch tests passed");
    return 0;
}
