const $ = (id) => document.getElementById(id);
const sample = `adhyaya ganana:
pada mula:
adhikara ganana():
  karta: 5
  yoga 7
  likh
  yoga 1
  phala
iti
iti
iti`;

function runSutram(source) {
  const scopes = [];
  const functions = new Map();
  let current = null;
  const lines = source.split(/\r?\n/);
  for (let i=0;i<lines.length;i++) {
    const lineNo=i+1, line=lines[i].replace(/#.*/,"").trim();
    if(!line) continue;
    let m;
    if((m=line.match(/^adhyaya\s+([\p{L}_][\p{L}\p{N}_]*):$/u))) scopes.push("adhyaya");
    else if((m=line.match(/^pada\s+([\p{L}_][\p{L}\p{N}_]*):$/u))) {
      if(!scopes.includes("adhyaya")) throw Error(`line ${lineNo}: pada outside adhyaya`);
      scopes.push("pada");
    } else if((m=line.match(/^adhikara\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(([^)]*)\):$/u))) {
      if(!scopes.includes("pada")) throw Error(`line ${lineNo}: adhikara outside pada`);
      const name=m[1], params=m[2].trim()?m[2].split(",").map(x=>x.trim()):[];
      if(functions.has(name)) throw Error(`line ${lineNo}: duplicate adhikara ${name}`);
      current={name,params,body:[],line:lineNo}; functions.set(name,current); scopes.push("adhikara");
    } else if(line==="iti") {
      if(!scopes.length) throw Error(`line ${lineNo}: unmatched iti`);
      if(scopes.pop()==="adhikara") current=null;
    } else {
      if(!current) throw Error(`line ${lineNo}: statement outside adhikara`);
      if((m=line.match(/^karta:\s*(-?\d+|laghu|guru|netra|veda)$/u))) current.body.push(["karta",m[1],lineNo]);
      else if((m=line.match(/^(yoga|viyoga)\s+(-?\d+|laghu|guru|netra|veda)$/u))) current.body.push([m[1],m[2],lineNo]);
      else if(/^(dviguna|likh|phala)$/.test(line)) current.body.push([line,null,lineNo]);
      else if(/^[\p{L}_][\p{L}\p{N}_]*$/u.test(line)) current.body.push(["call",line,lineNo]);
      else throw Error(`line ${lineNo}: unsupported statement ${JSON.stringify(line)}`);
    }
  }
  if(scopes.length) throw Error(`unclosed ${scopes.at(-1)} scope`);
  for(const f of functions.values()) {
    if(!f.body.length) throw Error(`adhikara ${f.name} is empty`);
    if(!f.body.some(x=>x[0]==="phala")) throw Error(`adhikara ${f.name} has no phala`);
    for(const [op,arg,ln] of f.body) if(op==="call"&&!functions.has(arg)) throw Error(`line ${ln}: unknown adhikara ${arg}`);
  }
  const literals={laghu:false,guru:true,netra:2,veda:4}; const output=[]; let steps=0;
  function call(name,args,depth=0) {
    if(depth>64) throw Error("call depth exceeded (64)");
    const f=functions.get(name); if(!f) throw Error(`unknown adhikara ${name}`);
    if(args.length!==f.params.length) throw Error(`${name} expects ${f.params.length} args, got ${args.length}`);
    const env=Object.fromEntries(f.params.map((p,i)=>[p,args[i]])); let karta, result;
    const value=(v)=>/^-?\d+$/.test(v)?Number(v):Object.hasOwn(literals,v)?literals[v]:Object.hasOwn(env,v)?env[v]:(()=>{throw Error(`unbound name ${v}`)})();
    for(const [op,arg,ln] of f.body) {
      steps++;
      if(op==="karta") karta=value(arg);
      else if(op==="yoga"||op==="viyoga") { const n=value(arg);if(typeof karta!=="number"||typeof n!=="number")throw Error(`line ${ln}: arithmetic requires numbers`);karta=op==="yoga"?karta+n:karta-n; }
      else if(op==="dviguna") {if(typeof karta!=="number")throw Error(`line ${ln}: dviguna requires number`);karta*=2;}
      else if(op==="likh") output.push(String(karta));
      else if(op==="phala") result=karta;
      else if(op==="call") karta=call(arg,[karta],depth+1);
    }
    return result;
  }
  const entries=[...functions.keys()];
  if(!entries.length) throw Error("no adhikara defined");
  const entry=entries.at(-1);
  const result=call(entry,[]);
  return {entry,result,output,steps,functions:entries};
}

const sounds=["kh","gh","ṅ","ch","chh","jh","ñ","ṭh","ḍh","th","dh","ph","bh","ai","au","ā","ī","ū","ṛ","ṝ","ḷ","ḹ","ṃ","ḥ","k","g","c","j","ṭ","ḍ","t","d","ṇ","n","p","b","m","y","r","l","v","ś","ṣ","s","h","a","i","u","e","o","ऽ","|"].sort((a,b)=>b.length-a.length||a.localeCompare(b));
const keys={a:"_a",ā:"_aa",i:"_i",ī:"_ee",u:"_u",ū:"_oo",ṛ:"_ri",e:"_ae",ai:"_aee",o:"_oa",au:"_au",k:"ka",kh:"kha",g:"ga",gh:"gha","ṅ":"_nga",c:"cha",ch:"chha",j:"ja",jh:"jha","ñ":"_yna","ṭ":"_ta","ṭh":"_tha","ḍ":"_da","ḍh":"_dha","ṇ":"_nna",t:"ta",th:"tha",d:"da",dh:"dha",n:"na",p:"pa",ph:"pha",b:"ba",bh:"bha",m:"ma",y:"ya",r:"ra",l:"la",v:"wa","ś":"sha","ṣ":"xa",s:"sa",h:"_ha","ṃ":"_m","ḥ":"_hh","ऽ":"_3","|":"|"};
const tableKeys=new Set(["__","_a","^a","_aa","^aa","_i","^i","_ee","^ee","_u","^u","_oo","^oo","_ri","^_ri","_ae","^ae","_aee","^aee","_ai","^ai","_ow","^ow","_oa","^oa","_ou","^ou","_au","^au","_ao","^ao","ka","kha","ga","gha","_nga","cha","chha","ja","jha","_yna","ta","tha","da","dha","_nna","_ta","_tha","_da","_dha","na","pa","pha","ba","bha","ma","ya","ra","_rra","la","wa","lvra","sha","xa","sa","_ha","_m","_hh","_na","^za","|","^","_rda","_rdha","^ra","r","kxa","_tra","j_yna","shra","_jza","_nza","_3"]);
function tokenize(input) {
  if(!input) return {status:"ERROR",error:"Input is empty",tokens:[]};
  const text=input.normalize("NFC"), tokens=[];
  for(let i=0;i<text.length;) {const token=sounds.find(s=>text.startsWith(s,i));if(!token)return {status:"UNRESOLVED",error:`No Sanskrit sound token at offset ${i}: ${text.slice(i)}`,tokens};tokens.push(token);i+=token.length;}
  return {status:"APPLIED",tokens};
}
$("run-sutram").addEventListener("click",()=>{
 try {const r=runSutram($("sutram").value);$("sutram-output").textContent=JSON.stringify(r,null,2);}
 catch(e){$("sutram-output").textContent=`ERROR: ${e.message}`;}
});
$("load-sample").addEventListener("click",()=>{$("sutram").value=sample;$("sutram-output").textContent="Sample restored.";});
$("audit-sounds").addEventListener("click",()=>{
 const r=tokenize($("sound-input").value);
 if(r.status!=="APPLIED"){$("sound-output").textContent=JSON.stringify(r,null,2);return;}
 const audit=r.tokens.map(sound=>({sound,key:keys[sound]??null,legacy_table_key_present:!!keys[sound]&&tableKeys.has(keys[sound]),status:keys[sound]&&tableKeys.has(keys[sound])?"KEY_FOUND":"UNRESOLVED"}));
 $("sound-output").textContent=JSON.stringify({status:audit.every(x=>x.status==="KEY_FOUND")?"APPLIED":"PARTIAL",tokens:r.tokens,audit,note:"Key presence is not byte-level encoding. The legacy table is context-sensitive and mixes syllabic keys and control conventions."},null,2);
});
$("run-rule").addEventListener("click",()=>{
 const id=$("rule-choice").value,L=tokenize($("left").value),R=tokenize($("right").value);
 if(L.status!=="APPLIED"||R.status!=="APPLIED"){$("rule-output").textContent="UNRESOLVED: input contains an undeclared sound token.";return;}
 const l=[...L.tokens],r=[...R.tokens];let out=null,trace="";
 if(id==="6.1.77"){const map={i:"y",ī:"y",u:"v",ū:"v",ṛ:"r",ṝ:"r",ḷ:"l"};const end=l.at(-1);if(map[end]&&["a","ā","i","ī","u","ū","ṛ","ṝ","ḷ","ḹ","e","o","ai","au"].includes(r[0])){l[l.length-1]=map[end];out=[...l,...r];trace=`${end} → ${map[end]}`;}}
 if(id==="6.1.87"){const map={i:["e"],ī:["e"],u:["o"],ū:["o"],ṛ:["ar"],ṝ:["ar"],ḷ:["al"]};const end=l.at(-1),start=r[0];if(["a","ā"].includes(end)&&map[start]){out=[...l.slice(0,-1),...map[start],...r.slice(1)];trace=`${end}+${start} → ${map[start].join("")}`;}}
 if(id==="6.1.88"){const map={e:["ai"],o:["au"],ai:["ai"],au:["au"]};const end=l.at(-1),start=r[0];if(["a","ā"].includes(end)&&map[start]){out=[...l.slice(0,-1),...map[start],...r.slice(1)];trace=`${end}+${start} → ${map[start].join("")}`;}}
 if(id==="6.1.101"){const map={a:"ā",ā:"ā",i:"ī",ī:"ī",u:"ū",ū:"ū",ṛ:"ṝ",ṝ:"ṝ"};const end=l.at(-1),start=r[0];if(map[end]&&map[start]===map[end]){out=[...l.slice(0,-1),map[end],...r.slice(1)];trace=`${end}+${start} → ${map[end]}`;}}
 $("rule-output").textContent=out?JSON.stringify({status:"APPLIED",rule:id,left:$("left").value,right:$("right").value,output:out.join(""),trace,tokens:out},null,2):JSON.stringify({status:"NOT_APPLICABLE",rule:id,left_tokens:l,right_tokens:r},null,2);
});
