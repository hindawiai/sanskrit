(() => {
  const $=id=>document.getElementById(id);
  let lexicon=[];
  const digits={"०":0,"१":1,"२":2,"३":3,"४":4,"५":5,"६":6,"७":7,"८":8,"९":9};
  function split(text) {
    const out=[], re=/([^॥]+)॥\s*([०-९\d]+)\s*॥/gu; let m;
    text=text.normalize("NFC");
    while((m=re.exec(text))) {
      const body=m[1].replace(/\s+/gu,"");
      const n=/^\d+$/.test(m[2])?Number(m[2]):Number([...m[2]].map(c=>digits[c]??"").join(""));
      if(body) out.push({n,text:body,sourceOffset:[...text.slice(0,m.index)].length});
    } return out;
  }
  function scan(text) {
    const chars=[...text], nodes=[], residual=[]; let i=0;
    while(i<chars.length) {
      const tail=chars.slice(i).join("");
      const hit=lexicon.find(x=>tail.startsWith(x[0]));
      if(hit){const len=[...hit[0]].length;nodes.push({term:hit[0],id:hit[1],role:hit[2],operation:hit[3],at:i,end:i+len});i+=len;}
      else {const start=i;i++;while(i<chars.length&&!lexicon.some(x=>chars.slice(i,i+[...x[0]].length).join("")===x[0]))i++;residual.push({text:chars.slice(start,i).join(""),at:start,end:i});}
    }
    return {nodes,residualSpans:residual,residual:residual.map(x=>x.text).join("")};
  }
  function parse(text) {
    const parts=split(text); if(!parts.length) throw Error("no numbered verses found");
    const verses=parts.map(v=>{const s=scan(v.text);return {...v,...s,operations:s.nodes.map(n=>n.id),operationCodes:s.nodes.map(n=>n.operation),status:s.residual?"LEXICALLY_PARTIAL":"LEXICALLY_COMPLETE",rulesApplied:["SUK-001","SUK-002","SUK-003","SUK-006",...(s.residual?["SUK-004"]:[])]};});
    const diagnostics=[]; for(let i=1;i<verses.length;i++) if(verses[i].n!==verses[i-1].n+1) diagnostics.push({code:"VERSE_SEQUENCE_GAP",after:verses[i-1].n,before:verses[i].n,rule:"SUK-005"}); const seen=new Set(); for(const v of verses){if(seen.has(v.n))diagnostics.push({code:"DUPLICATE_VERSE",verse:v.n,rule:"SUK-005"});seen.add(v.n);} return {name:"sanchalan",verse_count:verses.length,recognized:verses.reduce((n,v)=>n+v.nodes.length,0),residual_chars:verses.reduce((n,v)=>n+[...v.residual].length,0),semantic_status:"LEXICAL_IR_ONLY",rules:["SUK-001","SUK-002","SUK-003","SUK-004","SUK-005","SUK-006"],diagnostics,verses};
  }
  const q=s=>JSON.stringify(s);
  function lowerC(ast) {
    const rows=ast.verses.map(v=>`  { ${v.n}, ${q(v.status)}, ${v.nodes.length}, ${[...v.residual].length}, ${q(v.operationCodes.join(","))} }`).join(",\n");
    return `#include <stdio.h>\n#include <stddef.h>\ntypedef struct { int verse; const char *status; size_t recognized; size_t residual; const char *ops; } Verse;\nstatic const Verse verses[] = {\n${rows}\n};\nint main(void) {\n const size_t count=sizeof(verses)/sizeof(verses[0]);\n printf("verses=%zu recognized=${ast.recognized} residual=${ast.residual_chars} status=LEXICAL_IR_ONLY\\n",count);\n for(size_t i=0;i<count;i++) printf("verse=%d status=%s recognized=%zu residual=%zu ops=%s\\n",verses[i].verse,verses[i].status,verses[i].recognized,verses[i].residual,verses[i].ops);\n return 0;\n}`;
  }
  function lowerRust(ast) {
    const rows=ast.verses.map(v=>` Verse{verse:${v.n},status:${q(v.status)},recognized:${v.nodes.length},residual:${[...v.residual].length},ops:${q(v.operationCodes.join(","))}},`).join("\n");
    return `struct Verse{verse:u32,status:&'static str,recognized:usize,residual:usize,ops:&'static str}\nfn main(){\n let verses:&[Verse]=&[\n${rows}\n ];\n println!("verses={} recognized=${ast.recognized} residual=${ast.residual_chars} status=LEXICAL_IR_ONLY",verses.len());\n for v in verses { println!("verse={} status={} recognized={} residual={} ops={}",v.verse,v.status,v.recognized,v.residual,v.ops); }\n}`;
  }
  async function init() {
    try {
      const [lx,src]=await Promise.all([fetch("sanchalan-lexicon.json"),fetch("sanchalan-source.suktam")]);
      if(!lx.ok||!src.ok)throw Error("could not load lexicon/source assets");
      lexicon=await lx.json(); $("source").value=await src.text(); $("result").textContent="Ready.";
    } catch(e){$("result").textContent="ERROR: "+e.message;}
  }
  function execute() {
    const ast=parse($("source").value);
    $("result").textContent=JSON.stringify({verse_count:ast.verse_count,recognized:ast.recognized,residual_chars:ast.residual_chars,semantic_status:ast.semantic_status,verses:ast.verses.map(v=>({n:v.n,status:v.status,nodes:v.nodes.length,residual:v.residual}))},null,2);
    $("ir").value=JSON.stringify(ast,null,2);
    $("c").value=lowerC(ast); $("rust").value=lowerRust(ast);
  }
  window.SanchalanLab={parse,lowerC,lowerRust};
  $("parse").addEventListener("click",()=>{try{execute();}catch(e){$("result").textContent="ERROR: "+e.message;}});
  $("to-c").addEventListener("click",()=>{try{execute();$("result").textContent="C source generated; this page cannot compile native C."; }catch(e){$("result").textContent="ERROR: "+e.message;}});
  $("to-rust").addEventListener("click",()=>{try{execute();$("result").textContent="Rust source generated; this page cannot compile native Rust."; }catch(e){$("result").textContent="ERROR: "+e.message;}});
  init().then(()=>{try{execute();}catch(e){$("result").textContent="ERROR: "+e.message;}});
})();