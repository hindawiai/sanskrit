(() => {
  const $=id=>document.getElementById(id);
  function run(source) {
    const p=SutramCompiler.parse(source), fns=p.functions, names=Object.keys(fns), output=[]; let steps=0;
    const lits={laghu:0,guru:1,netra:2,veda:4};
    function call(name,args=[],depth=0) {
      if(depth>64) throw Error("call depth limit");
      const fn=fns[name]; if(!fn) throw Error("unknown adhikara "+name);
      if(args.length!==fn.params.length) throw Error(`${name} expects ${fn.params.length} args`);
      const env=Object.fromEntries(fn.params.map((p,i)=>[p,args[i]])); let karta,has=false,result;
      const value=x=>Object.hasOwn(lits,x)?lits[x]:/^-?\d+$/.test(x)?Number(x):Object.hasOwn(env,x)?env[x]:(()=>{throw Error("unbound "+x)})();
      for(const st of fn.body) { steps++;
        if(st.op==="karta"){karta=value(st.arg);has=true;}
        else if(st.op==="yoga"||st.op==="viyoga"){if(!has)throw Error("karta uninitialized");const v=value(st.arg);karta=st.op==="yoga"?karta+v:karta-v;}
        else if(st.op==="dviguna"){if(!has)throw Error("karta uninitialized");karta*=2;}
        else if(st.op==="likh"){if(!has)throw Error("karta uninitialized");output.push(karta);}
        else if(st.op==="phala")result=karta;
        else if(st.op==="call")karta=call(st.arg,has?[karta]:[],depth+1);
      } return result;
    }
    const entry=names.at(-1); const result=call(entry,[]);
    return {entry,result,output,steps,functions:names};
  }
  function show(target) {
    try { $("generated").value=SutramCompiler.lower($("source").value,target); $("result").textContent=`Generated ${target.toUpperCase()} source. Native compilation is not performed in this browser.`; }
    catch(e){$("result").textContent="ERROR: "+e.message;$("generated").value="";}
  }
  $("to-c").addEventListener("click",()=>show("c"));
  $("to-rust").addEventListener("click",()=>show("rust"));
  $("run").addEventListener("click",()=>{try{$("result").textContent=JSON.stringify(run($("source").value),null,2);}catch(e){$("result").textContent="ERROR: "+e.message;}});
  $("raise-c").addEventListener("click",()=>{try{$("raise-result").textContent=SutramCompiler.raiseC($("c-source").value);}catch(e){$("raise-result").textContent="ERROR: "+e.message;}});
  $("raise-rust").addEventListener("click",()=>{try{$("raise-result").textContent=SutramCompiler.raiseRust($("rust-source").value);}catch(e){$("raise-result").textContent="ERROR: "+e.message;}});
})();
