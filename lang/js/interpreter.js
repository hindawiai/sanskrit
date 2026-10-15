/**
 * Sūtram source interpreter (rule-rewrite execution model).
 *
 * The source front end parses the current .su concrete syntax. Each operation
 * is lowered to a state-transition Rule in Engine; execution is the Engine's
 * winning-rule/fixpoint loop, not the deprecated Python imperative evaluator.
 *
 * Supported first-version subset:
 *   adhyaya/pada/adhikara scopes; positional parameters; karta; yoga,
 *   viyoga, dviguna, likh, phala; unary calls to another adhikara;
 *   integer, laghu/guru, netra/veda literals and parameter references.
 * This is a language subset, not a claim to interpret Panini's 3,983 rules.
 */
"use strict";

const { Engine } = require("./engine");

const LITERALS = Object.freeze({
  laghu: false,
  guru: true,
  netra: 2,
  veda: 4,
});

function parseExpr(raw, lineNo) {
  const s = raw.trim();
  if (/^-?\d+$/.test(s)) return { kind: "literal", value: Number(s) };
  if (Object.prototype.hasOwnProperty.call(LITERALS, s)) {
    return { kind: "literal", value: LITERALS[s] };
  }
  if (/^[\p{L}_][\p{L}\p{N}_]*$/u.test(s)) return { kind: "name", value: s };
  throw new SyntaxError(`line ${lineNo}: unsupported expression ${JSON.stringify(s)}`);
}

function parse(source) {
  const program = { adhyaya: [], adhikaras: Object.create(null) };
  const scopes = [];
  let current = null;
  const lines = source.split(/\r?\n/);

  for (let ix = 0; ix < lines.length; ix++) {
    const lineNo = ix + 1;
    const raw = lines[ix].replace(/#.*/, "").trim();
    if (!raw) continue;

    let m;
    if ((m = raw.match(/^adhyaya\s+([\p{L}_][\p{L}\p{N}_]*):$/u))) {
      scopes.push({ kind: "adhyaya", name: m[1] });
    } else if ((m = raw.match(/^pada\s+([\p{L}_][\p{L}\p{N}_]*):$/u))) {
      if (!scopes.some(s => s.kind === "adhyaya")) throw new SyntaxError(`line ${lineNo}: pada outside adhyaya`);
      scopes.push({ kind: "pada", name: m[1] });
    } else if ((m = raw.match(/^adhikara\s+([\p{L}_][\p{L}\p{N}_]*)\s*\(([^)]*)\):$/u))) {
      if (!scopes.some(s => s.kind === "pada")) throw new SyntaxError(`line ${lineNo}: adhikara outside pada`);
      const name = m[1];
      if (program.adhikaras[name]) throw new SyntaxError(`line ${lineNo}: duplicate adhikara ${name}`);
      const params = m[2].trim() ? m[2].split(",").map(x => x.trim()) : [];
      if (params.some(x => !/^[\p{L}_][\p{L}\p{N}_]*$/u.test(x)) || new Set(params).size !== params.length) {
        throw new SyntaxError(`line ${lineNo}: invalid or duplicate parameter in ${name}`);
      }
      current = { name, params, body: [], line: lineNo };
      program.adhikaras[name] = current;
      scopes.push({ kind: "adhikara", name });
    } else if (raw === "iti") {
      if (!scopes.length) throw new SyntaxError(`line ${lineNo}: unmatched iti`);
      const scope = scopes.pop();
      if (scope.kind === "adhikara") current = null;
    } else {
      if (!current) throw new SyntaxError(`line ${lineNo}: statement outside adhikara`);
      if ((m = raw.match(/^karta:\s*(.+)$/u))) {
        current.body.push({ op: "karta", arg: parseExpr(m[1], lineNo), line: lineNo });
      } else if ((m = raw.match(/^(yoga|viyoga)\s+(.+)$/u))) {
        current.body.push({ op: m[1], arg: parseExpr(m[2], lineNo), line: lineNo });
      } else if ((m = raw.match(/^(dviguna|likh|phala)$/u))) {
        current.body.push({ op: m[1], arg: null, line: lineNo });
      } else if ((m = raw.match(/^([\p{L}_][\p{L}\p{N}_]*)$/u))) {
        current.body.push({ op: "call", arg: m[1], line: lineNo });
      } else {
        throw new SyntaxError(`line ${lineNo}: unrecognized statement ${JSON.stringify(raw)}`);
      }
    }
  }

  if (scopes.length) throw new SyntaxError(`unclosed ${scopes[scopes.length - 1].kind} scope`);
  for (const fn of Object.values(program.adhikaras)) {
    if (!fn.body.length) throw new SyntaxError(`adhikara ${fn.name} has an empty body`);
    if (!fn.body.some(x => x.op === "phala")) throw new SyntaxError(`adhikara ${fn.name} has no phala`);
    for (const inst of fn.body) {
      if (inst.op === "call" && !program.adhikaras[inst.arg]) {
        throw new SyntaxError(`line ${inst.line}: unknown adhikara ${inst.arg}`);
      }
    }
  }
  return program;
}

function evaluate(expr, env) {
  if (expr.kind === "literal") return expr.value;
  if (!Object.prototype.hasOwnProperty.call(env, expr.value)) {
    throw new ReferenceError(`unbound name ${expr.value}`);
  }
  return env[expr.value];
}

function transition(program, fn, index, state) {
  const inst = fn.body[index];
  const frame = state.frame;
  const next = {
    pc: state.pc + 1,
    frame: { name: frame.name, env: { ...frame.env }, karta: frame.karta },
    stack: state.stack.map(f => ({ name: f.name, env: { ...f.env }, karta: f.karta, returnPc: f.returnPc })),
    output: [...state.output],
    done: false,
    result: state.result,
  };
  const value = inst.arg && inst.arg.kind ? evaluate(inst.arg, frame.env) : undefined;

  switch (inst.op) {
    case "karta": next.frame.karta = value; break;
    case "yoga":
      if (typeof frame.karta !== "number" || typeof value !== "number") throw new TypeError(`line ${inst.line}: yoga requires numeric values`);
      next.frame.karta = frame.karta + value; break;
    case "viyoga":
      if (typeof frame.karta !== "number" || typeof value !== "number") throw new TypeError(`line ${inst.line}: viyoga requires numeric values`);
      next.frame.karta = frame.karta - value; break;
    case "dviguna":
      if (typeof frame.karta !== "number") throw new TypeError(`line ${inst.line}: dviguna requires a numeric karta`);
      next.frame.karta = frame.karta * 2; break;
    case "likh": next.output.push(frame.karta); break;
    case "call": {
      const callee = program.adhikaras[inst.arg];
      if (callee.params.length !== 1) throw new TypeError(`line ${inst.line}: unary call requires ${inst.arg} to have exactly one parameter`);
      next.stack.push({ name: frame.name, env: { ...frame.env }, karta: frame.karta, returnPc: state.pc + 1 });
      next.frame = { name: callee.name, env: { [callee.params[0]]: frame.karta }, karta: undefined };
      next.pc = 0;
      break;
    }
    case "phala": {
      const result = frame.karta;
      if (next.stack.length) {
        const caller = next.stack.pop();
        next.frame = { name: caller.name, env: caller.env, karta: result };
        next.pc = caller.returnPc;
      } else {
        next.done = true;
        next.result = result;
      }
      break;
    }
    default: throw new Error(`unsupported operation ${inst.op}`);
  }
  return next;
}

function createEngine(program) {
  const engine = new Engine();
  for (const fn of Object.values(program.adhikaras)) {
    fn.body.forEach((inst, index) => {
      const initial = {
        pc: index,
        frame: { name: fn.name, env: Object.fromEntries(fn.params.map(p => [p, 2])), karta: 2 },
        stack: [], output: [], done: false, result: null,
      };
      const expected = transition(program, fn, index, initial);
      engine.define({
        name: `${fn.name}:${index}:${inst.op}`,
        adhikara: "execute",
        hetu: state => !state.done && state.frame.name === fn.name && state.pc === index,
        nigamana: state => transition(program, fn, index, state),
        specificity: 0,
        udaharana: { input: initial, output: expected },
      });
    });
  }
  return engine;
}

function run(source, entry, args = [], options = {}) {
  const program = parse(source);
  const fn = program.adhikaras[entry];
  if (!fn) throw new ReferenceError(`no adhikara named ${entry}`);
  if (args.length !== fn.params.length) throw new TypeError(`${entry} expects ${fn.params.length} argument(s), got ${args.length}`);
  const engine = createEngine(program);
  const env = Object.fromEntries(fn.params.map((p, i) => [p, args[i]]));
  const initial = {
    pc: 0, frame: { name: entry, env, karta: undefined }, stack: [],
    output: [], done: false, result: null,
  };
  const { state, trace } = engine.run(initial, "execute", options.maxSteps || 10000);
  if (!state.done) throw new Error("program reached a fixpoint without returning a result");
  return { result: state.result, output: state.output, trace, program };
}

module.exports = { parse, run, LITERALS };
