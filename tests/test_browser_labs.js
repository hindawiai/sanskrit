#!/usr/bin/env node
"use strict";
const assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path"),os=require("node:os"),cp=require("node:child_process");
const root=path.resolve(__dirname,"..");
const src=fs.readFileSync(path.join(root,"lang/examples/ganana.su"),"utf8");
const els={};
for(const id of ["source","result","generated","c-source","rust-source","raise-result","parse","to-c","to-rust","run","raise-c","raise-rust","ir","c","rust"]) els[id]={value:"",textContent:"",handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}};
const win={};
vm.runInNewContext(fs.readFileSync(path.join(root,"docs/sutram-compiler.js"),"utf8"),{window:win,Error,Object,Set,Map,Number,JSON});
const compiled=win.SutramCompiler.lower(src,"c");
assert.match(compiled,/sutram_mula/);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"browser-compiler-"));
try {
 const c=path.join(tmp,"x.c"),exe=path.join(tmp,"x");fs.writeFileSync(c,compiled);
 let r=cp.spawnSync("gcc",["-std=c11","-Wall","-Wextra","-Werror",c,"-o",exe],{encoding:"utf8"});
 assert.equal(r.status,0,r.stderr);r=cp.spawnSync(exe,[],{encoding:"utf8"});assert.equal(r.stdout.trim(),"12");assert.match(r.stderr,/result=13/);
 if(cp.spawnSync("rustc",["--version"],{encoding:"utf8"}).status===0) {
  const rs=path.join(tmp,"x.rs"), rex=path.join(tmp,"x-rs");fs.writeFileSync(rs,win.SutramCompiler.lower(src,"rust"));
  let rb=cp.spawnSync("rustc",["--edition=2021","-D","warnings",rs,"-o",rex],{encoding:"utf8"});assert.equal(rb.status,0,rb.stderr);
  let rr=cp.spawnSync(rex,[],{encoding:"utf8"});assert.equal(rr.stdout.trim(),"12");assert.match(rr.stderr,/result=13/);
 }
 const raised=win.SutramCompiler.raiseC('int main(void) { int karta = 5; karta += 7; printf("%d", karta); return 0; }');
 assert.match(raised,/karta: 5/);assert.match(raised,/yoga 7/);assert.match(raised,/likh/);
 assert.throws(()=>win.SutramCompiler.raiseC("int main(void) { while(1){} return 0; }"),/unsupported/);
} finally {fs.rmSync(tmp,{recursive:true,force:true});}

const ids=["source","result","ir","c","rust","parse","to-c","to-rust"];
const elems={}; for(const id of ids) elems[id]={value:"",textContent:"",handlers:{},addEventListener(k,fn){this.handlers[k]=fn;}};
const window2={};
const lexicon=JSON.parse(fs.readFileSync(path.join(root,"docs/sanchalan-lexicon.json"),"utf8"));
const poem=fs.readFileSync(path.join(root,"lang/suktam/sanchalan.suktam"),"utf8");
const fetch=async url=>({ok:true,json:async()=>lexicon,text:async()=>poem});
vm.runInNewContext(fs.readFileSync(path.join(root,"docs/sanchalan-browser.js"),"utf8"),{window:window2,document:{getElementById:id=>elems[id]},fetch,JSON,Error,Set,Map,Number,Promise});
(async()=>{
 await new Promise(resolve=>setImmediate(resolve));
 const ast=window2.SanchalanLab.parse(poem);
 assert.equal(ast.verse_count,22);assert.equal(ast.recognized,134);assert.equal(ast.residual_chars,828);
 const generated=window2.SanchalanLab.lowerC(ast);
 const c=path.join(os.tmpdir(),"browser-sanchalan.c"),exe=path.join(os.tmpdir(),"browser-sanchalan");
 fs.writeFileSync(c,generated);
 let r=cp.spawnSync("gcc",["-std=c11","-Wall","-Wextra","-Werror",c,"-o",exe],{encoding:"utf8"});
 assert.equal(r.status,0,r.stderr);r=cp.spawnSync(exe,[],{encoding:"utf8"});
 assert.equal(r.status,0,r.stderr);assert.match(r.stdout,/verses=22/);
 fs.rmSync(c,{force:true});fs.rmSync(exe,{force:true});
 console.log("Browser lab regression tests passed: Sūtram→C compiled/executed; C→Sūtram raised; Sanchalan browser parser and generated C compiled/executed.");
})().catch(e=>{console.error(e);process.exitCode=1;});
