#include "sanchalan.h"
#include <stdio.h>
#ifndef SANCHALAN_ARCH
#define SANCHALAN_ARCH "unknown"
#endif
typedef struct { int verse; const char *ops; } Step;
static const Step steps[] = {
  { 1, "deferred,scope,visarga-ca,particle,root,particle,validate-memory,validate,address-board,deferred,complete,deferred,work,deferred,state" },
  { 2, "source-location,deferred,particle,exit,destination,deferred,index,bring,deferred,particle,deferred,store,ordered,memory-reference" },
  { 3, "empty-location,deferred,particle,everywhere,zero-fill,deferred,fill,sanitize,having-done,particle,its,deferred,initialize,deferred,does,certain" },
  { 4, "machine-board,deferred,in-all,state,work,configure,control,deferred,particle,rule-bound,protect,ordered-procedure" },
  { 5, "root-location,deferred,particle,destination,deferred,start,deferred,particle,ordain,particle,begin,deferred,main,deferred,particle,work,completion,should-go" },
  { 6, "scope,visarga-ca,particle,root,particle,door-board,deferred,depend,communicate,cause,properly,write,is-ordained" },
  { 7, "core-location,deferred,deferred,bound,communicator,deferred,by-rule,send,per-character,deferred,always,pause,deferred" },
  { 8, "while,send-buffer,deferred,deferred,location,is,filled,until,wait,deferred,having-done,signal,deferred,send,then" },
  { 9, "characters,particle,all-items,message,deferred,ordered,deferred,door-board,deferred,fill,deferred,work,complete,complete" },
  { 10, "scope,visarga-ca,particle,root,particle,first-process,deferred,pid-zero,deferred,state,best,configure" },
  { 11, "partition-memory,deferred,partition,deferred,extent,particle,deferred,from-all,work-board,deferred,indicate,index,deferred,store,ordered" },
  { 12, "deferred,process,root,deferred,place,deferred,initialize-runtime,protect-machine,work,deferred" },
  { 13, "orphan-process,visarga-ca,particle,deferred,terminated,arisen,doubt,by-own,deferred,pid-zero,deferred,protect,deferred,release" },
  { 14, "while,machine,deferred,always,living,until,watchdog,deferred,state,destroyed,process,visarga-ca,particle,deferred,sanitize,rest" },
  { 15, "scope,visarga-ca,particle,root,particle,trap-board,deferred,native,accomplish,deferred,violation,validate" },
  { 16, "page-board,deferred,produce,protect-memory,deferred,run,particle,virtual-memory,deferred" },
  { 17, "process-id,first,produce,partition-memory,deferred,give,particle,user-mode,deferred,enter,process,deferred,begin,particle" },
  { 18, "terminal,deferred,print,director,deferred,enter,deferred,ready,prompt,deferred,display" },
  { 19, "scope,visarga-ca,particle,root,particle,command-store,establish,root-command,group,deferred,is-ordained" },
  { 20, "input-location,deferred,know,read,continuous,spawn-pair,deferred,communicate,forward" },
  { 21, "sanitize-text,work,deferred,measure-memory,deferred,input,deferred,particle,separate,run" },
  { 22, "command-pipe,deferred,path,result,deferred,group,deferred,next,process,location,send,deferred,rest" }
};
int main(void) {
  Sanchalan machine;
  sanchalan_boot_banner();
  sanchalan_init(&machine);
  const int count = (int)(sizeof(steps) / sizeof(steps[0]));
  for (int i = 0; i < count; i++) {
    const char *p = steps[i].ops;
    char buf[64];
    int k = 0;
    while (1) {
      if (*p == ',' || *p == 0) {
        buf[k] = 0;
        if (k && sanchalan_call(&machine, buf) != 0) return 1;
        k = 0;
        if (*p == 0) break;
        p++;
        continue;
      }
      if (k < 63) buf[k++] = *p;
      p++;
    }
    sanchalan_report(&machine, steps[i].verse);
  }
  sanchalan_boot_check(&machine);
  if (!machine.booted) return 1;
  printf("sanchalan-lib verses=%d arch=%s\n", count, SANCHALAN_ARCH);
  return 0;
}
