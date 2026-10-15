(() => {
  "use strict";
  const LITERALS = { laghu:0, guru:1, netra:2, veda:4 };
  function parse(source) {
    const functions = Object.create(null), scopes = [];
    let current = null;
    const lines = source.split(/\r?\n/);
    for (let i=0;i<lines.length;i++) {
      const n=i+1, line=lines[i].replace(/#.*/,"").trim();
      if (!line) continue;
      let m;
      if ((m=line.match(/^adhyaya\s+([\p{L}_][\p{L}\p{N}_]*):$/u))) scopes.push("adhyaya");
      else if ((m=line.match(/^pada\s+([\p{L}_][\p{L}\p{N}_]*):$/u))) {
        if (!scopes.includes("adhyaya")) throw Error(`line ${n}: pada outside adhyaya`);
        scopes.push("pada");
      } else if ((m=line.match(/^adhikara\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(([^)]*)\):$/u))) {
        if (!scopes.includes("pada")) throw Error(`line ${n}: adhikara outside pada`);
        const params=m[2].trim()?m[2].split(",").map(x=>x.trim()):[];
        if (functions[m[1]]) throw Error(`line ${n}: duplicate adhikara ${m[1]}`);
        if (params.length>1) throw Error(`line ${n}: browser native-code demo supports at most one parameter`);
        current={name:m[1],params,body:[],line:n}; functions[m[1]]=current; scopes.push("adhikara");
      } else if (line==="iti") {
        if (!scopes.length) throw Error(`line ${n}: unmatched iti`);
        if (scopes.pop()==="adhikara") current=null;
      } else {
        if (!current) throw Error(`line ${n}: statement outside adhikara`);
        if ((m=line.match(/^karta:\s*(-?\d+|laghu|guru|netra|veda|[\p{L}_][\p{L}\p{N}_]*)$/u))) current.body.push({op:"karta",arg:m[1],line:n});
        else if ((m=line.match(/^(yoga|viyoga)\s+(-?\d+|laghu|guru|netra|veda|[\p{L}_][\p{L}\p{N}_]*)$/u))) current.body.push({op:m[1],arg:m[2],line:n});
        else if (/^(dviguna|likh|phala)$/.test(line)) current.body.push({op:line,arg:null,line:n});
        else if (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(line)) current.body.push({op:"call",arg:line,line:n});
        else throw Error(`line ${n}: unsupported statement ${line}`);
      }
    }
    if (scopes.length) throw Error(`unclosed ${scopes.at(-1)} scope`);
    for (const fn of Object.values(functions)) {
      if (!fn.body.length || fn.body[0].op!=="karta") throw Error(`${fn.name}: native backend requires karta as first statement`);
      if (fn.body.at(-1).op!=="phala" || fn.body.filter(x=>x.op==="phala").length!==1) throw Error(`${fn.name}: exactly one terminal phala required`);
      for (const st of fn.body) {
        if (st.op==="call" && !functions[st.arg]) throw Error(`line ${st.line}: unknown adhikara ${st.arg}`);
        if (["karta","yoga","viyoga"].includes(st.op) && !Object.hasOwn(LITERALS,st.arg) && !/^-?\d+$/.test(st.arg) && !fn.params.includes(st.arg))
          throw Error(`line ${st.line}: unbound name ${st.arg}`);
      }
    }
    if (!Object.keys(functions).length) throw Error("no adhikara defined");
    const visiting=new Set(), visited=new Set();
    function visit(name) {
      if(visiting.has(name)) throw Error(`recursive call cycle at ${name} is not supported`);
      if(visited.has(name)) return; visiting.add(name);
      for(const st of functions[name].body) if(st.op==="call") visit(st.arg);
      visiting.delete(name);visited.add(name);
    }
    Object.keys(functions).forEach(visit);
    return {functions};
  }
  function num(v) { return Object.hasOwn(LITERALS,v)?LITERALS[v]:Number.isFinite(Number(v))?Number(v):null; }
  function safe(v) { return v.replace(/[^A-Za-z0-9_]/g,"_"); }
  function lower(source,target) {
    const p=parse(source), fs=Object.values(p.functions), entry=fs.at(-1).name;
    const cname=n=>`sutram_${n.replace(/[^A-Za-z0-9_]/g,ch=>`_u${ch.codePointAt(0).toString(16)}_`)}`;
    function value(fn,arg) {
      if(Object.hasOwn(LITERALS,arg)) return String(LITERALS[arg]);
      if(/^-?\d+$/.test(arg)) return String(Number(arg));
      if(fn.params.includes(arg)) return `env_${cname(arg)}`;
      throw Error(`${fn.name}: unbound ${arg}`);
    }
    if(target==="c") {
      const out=["/* Generated Sūtram subset: integer karta, arithmetic, unary calls, likh, phala. */","#include <stdint.h>","#include <stdio.h>","#include <inttypes.h>",""];
      fs.forEach(f=>out.push(`static int64_t ${cname(f.name)}(int64_t input);`));
      for(const f of fs) {
        out.push(`static int64_t ${cname(f.name)}(int64_t input) {`);
        if(f.params.length) out.push(`  int64_t env_${cname(f.params[0])}=input;`,`  (void)env_${cname(f.params[0])};`);
        else out.push("  (void)input;");
        out.push(`  int64_t karta=${value(f,f.body[0].arg)};`);
        for(const st of f.body.slice(1)) {
          if(st.op==="karta") out.push(`  karta=${value(f,st.arg)};`);
          if(st.op==="yoga") out.push(`  karta+=${value(f,st.arg)};`);
          if(st.op==="viyoga") out.push(`  karta-=${value(f,st.arg)};`);
          if(st.op==="dviguna") out.push("  karta*=2;");
          if(st.op==="likh") out.push('  printf("%" PRId64 "\\n",karta);');
          if(st.op==="call") out.push(`  karta=${cname(st.arg)}(karta);`);
          if(st.op==="phala") out.push("  return karta;");
        }
        out.push("}","");
      }
      out.push("int main(void) {",`  int64_t result=${cname(entry)}(0);`,`  fprintf(stderr,"entry=${entry} result=%" PRId64 "\\n",result);`,"  return 0;","}");
      return out.join("\n");
    }
    if(target==="rust") {
      const out=["// Generated Sūtram subset. Native compilation requires rustc.",""];
      for(const f of fs) {
        out.push(`fn ${cname(f.name)}(input: i64) -> i64 {`);
        if(f.params.length) out.push(`    let env_${cname(f.params[0])}: i64=input;`,`    let _=env_${cname(f.params[0])};`);
        else out.push("    let _=input;");
        out.push(`    let mut karta: i64=${value(f,f.body[0].arg)};`);
        for(const st of f.body.slice(1)) {
          if(st.op==="karta") out.push(`    karta=${value(f,st.arg)};`);
          if(st.op==="yoga") out.push(`    karta+=${value(f,st.arg)};`);
          if(st.op==="viyoga") out.push(`    karta-=${value(f,st.arg)};`);
          if(st.op==="dviguna") out.push("    karta*=2;");
          if(st.op==="likh") out.push('    println!("{}",karta);');
          if(st.op==="call") out.push(`    karta=${cname(st.arg)}(karta);`);
          if(st.op==="phala") out.push("    return karta;");
        }
        out.push("}","");
      }
      out.push("fn main() {",`    let result=${cname(entry)}(0);`,`    eprintln!("entry=${entry} result={}",result);`,"}");
      return out.join("\n");
    }
    throw Error("target must be c or rust");
  }
  function raised(ops) {
    const lines=["adhyaya uttara:","pada mula:","adhikara main():"];
    for(const op of ops) lines.push(op==="print"?"  likh":op==="double"?"  dviguna":op==="return"?"  phala":op[0]==="karta"?`  karta: ${op[1]}`:`  ${op[0]} ${op[1]}`);
    if(!ops.some(x=>x==="return")) lines.push("  phala");
    lines.push("iti","iti","iti"); return lines.join("\n");
  }
  function raiseC(source) {
    const s=source.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"").replace(/^\s*#include[^\n]*$/gm,"");
    const m=s.match(/\bint\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}\s*$/);
    if(!m) throw Error("C raiser supports int main(void) only");
    if(/\b(if|for|while|switch|malloc|free|fork|exec|pipe|wait|struct|goto)\b/.test(m[1])) throw Error("unsupported C construct");
    const ops=[];
    for(const st of m[1].split(";").map(x=>x.trim()).filter(Boolean)) {
      let q;
      if((q=st.match(/^(?:int|int64_t|long|long long)\s+karta\s*=\s*(-?\d+)$/))) ops.push(["karta",q[1]]);
      else if((q=st.match(/^karta\s*\+=\s*(-?\d+)$/))) ops.push(["yoga",q[1]]);
      else if((q=st.match(/^karta\s*-=\s*(-?\d+)$/))) ops.push(["viyoga",q[1]]);
      else if(/^karta\s*\*=\s*2$/.test(st)) ops.push("double");
      else if(/^(?:printf|fprintf)\s*\(/.test(st)) ops.push("print");
      else if(/^return\s+karta$/.test(st)) ops.push("return");
      else if(/^return\s+0$/.test(st)) continue;
      else throw Error("unsupported C statement: "+st);
    }
    return raised(ops);
  }
  function raiseRust(source) {
    const cleaned=source.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"");
    const m=cleaned.match(/\bfn\s+main\s*\(\s*\)\s*\{([\s\S]*)\}\s*$/);
    if(!m) throw Error("Rust raiser supports fn main() only");
    if(/\b(if|for|while|loop|match|unsafe|extern)\b/.test(m[1])) throw Error("unsupported Rust construct");
    const ops=[];
    for(const st of m[1].split(";").map(x=>x.trim()).filter(Boolean)) {
      let q;
      if((q=st.match(/^let\s+mut\s+karta(?:\s*:\s*(?:i\d+|isize))?\s*=\s*(-?\d+)$/))) ops.push(["karta",q[1]]);
      else if((q=st.match(/^karta\s*\+=\s*(-?\d+)$/))) ops.push(["yoga",q[1]]);
      else if((q=st.match(/^karta\s*-=\s*(-?\d+)$/))) ops.push(["viyoga",q[1]]);
      else if(/^karta\s*\*=\s*2$/.test(st)) ops.push("double");
      else if(/^println!\s*\(/.test(st)) ops.push("print");
      else if(/^return(?:\s+karta)?$/.test(st)) ops.push("return");
      else throw Error("unsupported Rust statement: "+st);
    }
    return raised(ops);
  }
  window.SutramCompiler={parse,lower,raiseC,raiseRust};
})();
