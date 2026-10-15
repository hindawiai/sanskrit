/* Shaili Robot static-page demonstrator.
 * A documented browser subset, not a claim of exact historical Shaili Robot parity.
 * No network, server, eval, or external dependencies.
 */
(() => {
  const $ = id => document.getElementById(id);
  const source = $('logo-source'), output = $('logo-output'), canvas = $('logo-canvas');
  const ns = 'http://www.w3.org/2000/svg';
  const state = { x: 300, y: 210, heading: 0, pen: true, color: '#163f65', lines: [], segments: [], steps: 0 };
  const aliases = {
    FORWARD:'FORWARD', FD:'FORWARD', BACK:'BACK', BK:'BACK',
    RIGHT:'RIGHT', RT:'RIGHT', LEFT:'LEFT', LT:'LEFT',
    PENUP:'PENUP', PU:'PENUP', PENDOWN:'PENDOWN', PD:'PENDOWN',
    HOME:'HOME', CLEARSCREEN:'CLEARSCREEN', CS:'CLEARSCREEN',
    SETHEADING:'SETHEADING', SETPENCOLOR:'SETPENCOLOR', REPEAT:'REPEAT'
  };
  function tokenize(s) {
    return s.replace(/;.*$/gm, '').replace(/\[/g, ' [ ').replace(/\]/g, ' ] ')
      .split(/\s+/).filter(Boolean);
  }
  function parse(tokens) {
    let i = 0;
    function block(stopAtBracket=false) {
      const out = [];
      while (i < tokens.length) {
        const t = tokens[i++];
        if (t === ']') { if (stopAtBracket) return out; throw Error('Unexpected ]'); }
        if (t === '[') throw Error('A command was expected before [');
        const cmd = aliases[t.toUpperCase()];
        if (!cmd) throw Error(`Unknown command "${t}". This demonstrator accepts the documented canonical command set.`);
        if (cmd === 'REPEAT') {
          const n = Number(tokens[i++]);
          if (!Number.isInteger(n) || n < 0 || n > 1000) throw Error('REPEAT count must be an integer from 0 to 1000.');
          if (tokens[i++] !== '[') throw Error('REPEAT requires a bracketed command block: REPEAT n [ ... ]');
          out.push({cmd, n, body:block(true)});
        } else if (cmd === 'PENUP' || cmd === 'PENDOWN' || cmd === 'HOME' || cmd === 'CLEARSCREEN') out.push({cmd});
        else {
          const raw = tokens[i++];
          if (raw === undefined) throw Error(`${cmd} requires an argument.`);
          if (cmd === 'SETPENCOLOR') { out.push({cmd, value:raw}); continue; }
          const value = Number(raw);
          if (!Number.isFinite(value)) throw Error(`${cmd} requires a numeric argument.`);
          out.push({cmd, value});
        }
      }
      if (stopAtBracket) throw Error('Missing closing ] in command block.');
      return out;
    }
    return block();
  }
  function render() {
    canvas.replaceChildren();
    const bg = document.createElementNS(ns,'rect');
    bg.setAttribute('width','600'); bg.setAttribute('height','420'); bg.setAttribute('fill','#fff');
    canvas.appendChild(bg);
    for (const s of state.segments) {
      const line = document.createElementNS(ns,'line');
      for (const [k,v] of Object.entries({x1:s.x1,y1:s.y1,x2:s.x2,y2:s.y2,stroke:s.color,'stroke-width':2,'stroke-linecap':'round'})) line.setAttribute(k,v);
      canvas.appendChild(line);
    }
    const turtle = document.createElementNS(ns,'path');
    turtle.setAttribute('d','M 0 -10 L 7 8 L 0 5 L -7 8 Z');
    turtle.setAttribute('fill','#d97706');
    turtle.setAttribute('transform',`translate(${state.x} ${state.y}) rotate(${state.heading})`);
    canvas.appendChild(turtle);
  }
  function execute(commands) {
    let budget = 20000;
    function run(list) {
      for (const c of list) {
        if (--budget < 0) throw Error('Execution step limit exceeded (20,000).');
        state.steps++;
        if (c.cmd === 'REPEAT') { for(let j=0;j<c.n;j++) run(c.body); continue; }
        if (c.cmd === 'CLEARSCREEN') { state.segments=[]; state.x=300; state.y=210; state.heading=0; continue; }
        if (c.cmd === 'HOME') { state.x=300; state.y=210; state.heading=0; continue; }
        if (c.cmd === 'PENUP') { state.pen=false; continue; }
        if (c.cmd === 'PENDOWN') { state.pen=true; continue; }
        if (c.cmd === 'SETPENCOLOR') {
          const colors={BLACK:'#000000',BLUE:'#1769aa',RED:'#c62828',GREEN:'#2e7d32',ORANGE:'#ef6c00',PURPLE:'#6a1b9a'};
          const key=String(c.value).toUpperCase();
          const val=colors[key] || (/^#[0-9a-f]{6}$/i.test(key) ? key : null);
          if(!val) throw Error('SETPENCOLOR accepts BLACK, BLUE, RED, GREEN, ORANGE, PURPLE, or #RRGGBB.');
          state.color=val; continue;
        }
        if(c.cmd==='SETHEADING') { state.heading=((c.value%360)+360)%360; continue; }
        if(c.cmd==='RIGHT') { state.heading=(state.heading+c.value)%360; continue; }
        if(c.cmd==='LEFT') { state.heading=(state.heading-c.value)%360; continue; }
        const distance=c.cmd==='BACK' ? -c.value : c.value;
        const rad=state.heading*Math.PI/180, nx=state.x+Math.sin(rad)*distance, ny=state.y-Math.cos(rad)*distance;
        if(state.pen) state.segments.push({x1:state.x,y1:state.y,x2:nx,y2:ny,color:state.color});
        state.x=nx; state.y=ny;
      }
    }
    run(commands);
  }
  function runSource() {
    try {
      state.x=300;state.y=210;state.heading=0;state.pen=true;state.color='#163f65';state.segments=[];state.steps=0;
      execute(parse(tokenize(source.value)));
      render();
      output.textContent=`Completed successfully.\nCommands executed: ${state.steps}\nSegments drawn: ${state.segments.length}\nTurtle: (${state.x.toFixed(2)}, ${state.y.toFixed(2)}) heading ${state.heading}°`;
      output.dataset.status='pass';
    } catch(e) {
      render(); output.textContent=`Program stopped: ${e.message}\nNo unsupported command was guessed.`; output.dataset.status='error';
    }
  }
  $('logo-run').addEventListener('click', runSource);
  $('logo-clear').addEventListener('click', () => { source.value='CLEARSCREEN'; runSource(); });
  $('logo-square').addEventListener('click', () => { source.value='REPEAT 4 [ FORWARD 100 RIGHT 90 ]'; runSource(); });
  $('logo-star').addEventListener('click', () => { source.value='REPEAT 36 [ FORWARD 140 RIGHT 170 ]'; runSource(); });
  render();
})();
