#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const { lowerC, lowerRust } = require("./backend.js");
const { raiseC, raiseRust } = require("./raise.js");
const { parse, run } = require("./interpreter.js");

const root = path.resolve(__dirname, "../..");
const sample = fs.readFileSync(path.join(root, "lang/examples/ganana.su"), "utf8");
const interpreted = run(sample, "mula");
assert.equal(interpreted.result, 13);
assert.deepEqual(interpreted.output, [12]);

const c = lowerC(sample, "mula");
assert.match(c, /#include <stdint.h>/);
assert.match(c, /sutram_mula/);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sutram-backend-"));
try {
  const cPath = path.join(tmp, "sample.c"), exePath = path.join(tmp, "sample");
  fs.writeFileSync(cPath, c);
  const built = spawnSync("gcc", ["-std=c11", "-Wall", "-Wextra", "-Werror", cPath, "-o", exePath], {encoding:"utf8"});
  assert.equal(built.status, 0, `C compile failed:\n${built.stderr}`);
  const ran = spawnSync(exePath, [], {encoding:"utf8"});
  assert.equal(ran.status, 0, ran.stderr);
  assert.equal(ran.stdout.trim(), "12");
  assert.match(ran.stderr, /"result":13/);

  const rust = lowerRust(sample, "mula");
  assert.match(rust, /fn main\(\)/);
  assert.match(rust, /sutram_dviguna_karoti/);
  assert.match(rust, /println!\("\{\}", karta\)/);
  if (spawnSync("rustc", ["--version"], {encoding:"utf8"}).status === 0) {
    const rsPath = path.join(tmp,"sample.rs"), rsExe = path.join(tmp,"sample-rs");
    fs.writeFileSync(rsPath,rust);
    const rb = spawnSync("rustc", ["--edition=2021", "-D", "warnings", rsPath, "-o", rsExe], {encoding:"utf8"});
    assert.equal(rb.status,0,`Rust compile failed:\n${rb.stderr}`);
    const rr=spawnSync(rsExe,[],{encoding:"utf8"});
    assert.equal(rr.stdout.trim(),"12");
    assert.match(rr.stderr,/result=13/);
  } else {
    console.log("SKIP rustc compile: rustc is not installed in this environment; generated Rust is structurally checked only");
  }

  const raisedC = raiseC(`#include <stdio.h>\nint main(void) { int karta = 5; karta += 7; printf("%d\\\\n", karta); return 0; }`);
  assert.match(raisedC, /karta: 5/);
  assert.match(raisedC, /yoga 7/);
  assert.match(raisedC, /likh/);
  const raisedCRun = run(raisedC, "main");
  assert.equal(raisedCRun.result, 12);
  assert.deepEqual(raisedCRun.output, [12]);
  const raisedRust = raiseRust(`fn main() { let mut karta: i64 = 5; karta += 7; println!("{}", karta); }`);
  assert.match(raisedRust, /karta: 5/);
  assert.match(raisedRust, /yoga 7/);
  assert.match(raisedRust, /likh/);
  const raisedRustRun = run(raisedRust, "main");
  assert.equal(raisedRustRun.result, 12);
  assert.deepEqual(raisedRustRun.output, [12]);
  assert.doesNotMatch(rust, /^fn sutram_[^(]+\([^\n]+\);$/m, "Rust must not emit illegal C-style prototypes");
  assert.throws(() => raiseC("int main(void) { while(1) {} return 0; }"), /unsupported/);
  console.log("Sūtram C/Rust lower/raise tests passed; C compiled and executed.");
} finally {
  fs.rmSync(tmp, {recursive:true,force:true});
}
