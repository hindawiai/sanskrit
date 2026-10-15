#!/usr/bin/env node
"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { spawnSync } = require("node:child_process");
const { parseSuktam, lowerC, lowerRust, RULES } = require("../suktam.js");
const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root,"sanchalan.suktam"),"utf8");
const ast = parseSuktam(source);
assert.equal(ast.verse_count,22,"all 22 numbered verses parse");
assert.ok(ast.recognized > 100,"the technical lexicon recognizes substantial source terms");
assert.equal(ast.residual_chars, 0, "every span in this source is now in the lexicon");
assert.ok(parseSuktam("|| Test ||\nअज्ञातशब्दः॥१॥").residual_chars > 0, "unknown spans are preserved, not erased");
assert.equal(ast.semantic_status,"LEXICAL_IR_ONLY");
assert.equal(RULES.length,8);
assert.equal(new Set(require("../suktam.js").LEXICON.map(x=>x[0])).size, require("../suktam.js").LEXICON.length, "lexicon terms must be unique");
assert.ok(ast.verses[0].nodes.some(n=>n.id==="visarga-ca"), "8.3.34+8.4.40 must consume श्च");
assert.ok(ast.residual_chars < 828, "the visarga rule must reduce residual");
assert.ok(ast.verses[9].nodes.some(n=>n.id==="pid-sunya"));
assert.ok(ast.verses[21].nodes.some(n=>n.id==="adesa-pipe"));
assert.ok(ast.verses.every(v=>v.status==="LEXICALLY_PARTIAL"||v.status==="LEXICALLY_COMPLETE"));
assert.ok(ast.verses.every(v=>v.residualSpans.every(s=>s.text.length>0)));
assert.equal(parseSuktam("|| Test ||\\nअक्षर॥१॥").verse_count,1);
assert.throws(()=>parseSuktam("not a numbered verse"),/no numbered verses/);
assert.ok(parseSuktam("|| Test ||\\nअक्षर॥१॥\\nअक्षर॥३॥").diagnostics.some(d=>d.code==="VERSE_SEQUENCE_GAP"));
const c=lowerC(ast), rust=lowerRust(ast);
assert.match(c,/int main\(void\)/);
assert.match(c,/LEXICAL_IR_ONLY/);
assert.match(rust,/fn main\(\)/);
assert.match(rust,/LEXICAL_IR_ONLY/);
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),"suktam-c-"));
try {
  const cp=path.join(tmp,"sanchalan.c"), exe=path.join(tmp,"sanchalan");
  fs.writeFileSync(cp,c);
  const built=spawnSync("gcc",["-std=c11","-Wall","-Wextra","-Werror",cp,"-o",exe],{encoding:"utf8"});
  assert.equal(built.status,0,`generated C failed to compile:\n${built.stderr}`);
  const ran=spawnSync(exe,[],{encoding:"utf8"});
  assert.equal(ran.status,0,ran.stderr);
  assert.match(ran.stdout,/verses=22/);
  assert.equal((ran.stdout.match(/^verse=/gm)||[]).length,22);
  if (spawnSync("rustc",["--version"],{encoding:"utf8"}).status===0) {
    const rp=path.join(tmp,"sanchalan.rs"), re=path.join(tmp,"sanchalan-rust");
    fs.writeFileSync(rp,rust);
    const rb=spawnSync("rustc",["--edition=2021","-D","warnings",rp,"-o",re],{encoding:"utf8"});
    assert.equal(rb.status,0,`generated Rust failed to compile:\n${rb.stderr}`);
    const rr=spawnSync(re,[],{encoding:"utf8"});
    assert.equal(rr.status,0,rr.stderr);
    assert.match(rr.stdout,/verses=22/);
  } else {
    console.log("SKIP Sanchalan Rust compilation: rustc unavailable; generated source structurally checked");
  }
  console.log(`Sanchalan Suktam parse/lower passed: ${ast.verse_count} verses, ${ast.recognized} lexical nodes, ${ast.residual_chars} residual code points; C compiled and ran.`);
} finally { fs.rmSync(tmp,{recursive:true,force:true}); }
