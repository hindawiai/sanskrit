#!/usr/bin/env node
"use strict";

/**
 * Conservative reverse frontend for an explicitly tiny C/Rust subset.
 * Rejects control flow, pointers, heap management, and unsupported statements.
 */
function clean(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/^\s*#include[^\n]*$/gm, "")
    .trim();
}
function makeSutram(ops, name = "main") {
  if (!ops.length) throw new Error("no supported operations found");
  const lines = [`adhyaya uttara:`, `pada mula:`, `adhikara ${name}():`];
  for (const op of ops) {
    if (op.kind === "init") lines.push(`  karta: ${op.value}`);
    else if (op.kind === "add") lines.push(`  yoga ${op.value}`);
    else if (op.kind === "sub") lines.push(`  viyoga ${op.value}`);
    else if (op.kind === "double") lines.push("  dviguna");
    else if (op.kind === "print") lines.push("  likh");
    else if (op.kind === "return") lines.push("  phala");
  }
  if (!ops.some(x => x.kind === "return")) lines.push("  phala");
  lines.push("iti", "iti", "iti");
  return lines.join("\n") + "\n";
}
function raiseC(source) {
  const s = clean(source);
  if (!/\bint\s+main\s*\(\s*(?:void)?\s*\)/.test(s)) throw new Error("C raiser supports int main(void) only");
  if (/\b(if|for|while|switch|malloc|free|fork|exec|pipe|wait|struct|goto)\b/.test(s)) throw new Error("C contains unsupported control flow, OS calls, or data structures");
  const body = s.match(/\bint\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/);
  if (!body) throw new Error("cannot locate C main body");
  let text = body[1].replace(/\breturn\s+\(?int\)?\s+[^;]+;/g, " return; ");
  const ops = [];
  const statements = text.split(";").map(x => x.trim()).filter(Boolean);
  for (const st of statements) {
    let m;
    if ((m = st.match(/^(?:int|int64_t|long|long long)\s+(?:mut\s+)?karta\s*=\s*(-?\d+)\s*$/))) ops.push({kind:"init",value:m[1]});
    else if ((m = st.match(/^karta\s*\+=\s*(-?\d+)\s*$/))) ops.push({kind:"add",value:m[1]});
    else if ((m = st.match(/^karta\s*-=\s*(-?\d+)\s*$/))) ops.push({kind:"sub",value:m[1]});
    else if (/^karta\s*\*=\s*2$/.test(st)) ops.push({kind:"double"});
    else if (/^(?:printf|fprintf)\s*\(/.test(st)) ops.push({kind:"print"});
    else if (/^return\s+karta$/.test(st)) ops.push({kind:"return"});
    else if (/^return\s+0$/.test(st)) continue;
    else if (/^(?:\(void\)[^ ]+\s*)$/.test(st)) continue;
    else if (/^$/.test(st)) continue;
    else throw new Error(`unsupported C statement: ${st}`);
  }
  return makeSutram(ops);
}
function raiseRust(source) {
  const s = clean(source);
  if (!/\bfn\s+main\s*\(\s*\)/.test(s)) throw new Error("Rust raiser supports fn main() only");
  if (/\b(if|for|while|loop|match|unsafe|extern|spawn|std::process)\b/.test(s)) throw new Error("Rust contains unsupported control flow or APIs");
  const body = s.match(/\bfn\s+main\s*\(\s*\)\s*\{([\s\S]*)\}\s*$/);
  if (!body) throw new Error("cannot locate Rust main body");
  const statements = body[1].split(";").map(x => x.trim()).filter(Boolean);
  const ops = [];
  for (const st of statements) {
    let m;
    if ((m = st.match(/^let\s+mut\s+karta\s*:\s*(?:i\d+|isize)\s*=\s*(-?\d+)\s*$/)) ||
        (m = st.match(/^let\s+mut\s+karta\s*=\s*(-?\d+)\s*$/))) ops.push({kind:"init",value:m[1]});
    else if ((m = st.match(/^karta\s*\+=\s*(-?\d+)\s*$/))) ops.push({kind:"add",value:m[1]});
    else if ((m = st.match(/^karta\s*-=\s*(-?\d+)\s*$/))) ops.push({kind:"sub",value:m[1]});
    else if (/^karta\s*\*=\s*2$/.test(st)) ops.push({kind:"double"});
    else if (/^println!\s*\(/.test(st)) ops.push({kind:"print"});
    else if (/^return(?:\s+[^;]+)?$/.test(st)) ops.push({kind:"return"});
    else if (/^let\s+result\s*=/.test(st) || /^eprintln!\s*\(/.test(st) || /^use\s+/.test(st)) continue;
    else throw new Error(`unsupported Rust statement: ${st}`);
  }
  return makeSutram(ops);
}
module.exports = { raiseC, raiseRust };
