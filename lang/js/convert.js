/**
 * Automated structural conversion. Stage 0 is not a hand translation of
 * each karyam. Input is the sutra record: id, type, padaccheda, anuvrtti
 * field, gloss. The meta-rules are the paribhashas themselves.
 *
 * What is converted automatically, and the license in data/sutras.json:
 *   1.1.49 षष्ठी स्थानेयोगा          genitive pada -> sthana
 *   1.1.66 तस्मिन्निति निर्दिष्टे पूर्वस्य   locative pada -> condition on the preceding
 *   1.1.67 तस्मादित्युत्तरस्य        ablative pada -> condition on the following
 *   1.1.71 आदिरन्त्येन सहेता        pratyahara name -> Shiva-sutra span
 *   1.4.2  विप्रतिषेधे परं कार्यम्   later competing vidhi wins (execution, not conversion)
 *   locative-only sutra             adhikara, scope until the next locative-only sutra
 *
 * Anuvrtti field entries are source annotations, copied with that status.
 * They are not re-inferred. A gloss never decides inheritance. It only sets
 * verification_status. Execution uses a term only when that status is
 * source_annotation or gloss_confirms. Unconfirmed adhikara (1.4.54) is
 * reported and not applied.
 *
 * Still Stage 0, labeled: it-marker disambiguation, and the closeness table
 * that picks which guna/yan member is the substitute (1.1.50 states the
 * principle; the feature table is not in sutras.json).
 */

const fs = require("fs");
const path = require("path");
const { Engine } = require("./engine");
const { pratyahara } = require("./shivasutras");

const SUTRA_PATH = path.join(__dirname, "..", "..", "data", "sutras.json");
const DIGIT = { "०": 0, "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9 };

const PRATYAHARA = {
  "ऐच्": ["ai", "C"],
  "एङ्": ["e", "N2"],
  "इकः": ["i", "K"],
  "इक्": ["i", "K"],
  "यण्": ["y", "N3"],
  "अचि": ["a", "C"],
  "अक्": ["a", "K"],
  "अकः": ["a", "K"],
  "खर्": ["kh", "R2"],
};

// Stage 0. 1.1.50 says the closest substitute; this table is not in the data file.
const CLOSENESS = {
  license: "1.1.50",
  status: "stage0_table_not_in_sutras_json",
  yan: { i: "y", ii: "y", u: "v", uu: "v", R: "r", RR: "r", L: "l", LL: "l" },
  guna: { a: "a", aa: "a", i: "e", ii: "e", u: "o", uu: "o", R: "ar", RR: "ar" },
  dirgha: { a: "aa", aa: "aa", i: "ii", ii: "ii", u: "uu", uu: "uu", R: "RR", RR: "RR" },
};

function parsePadaccheda(padaccheda) {
  if (!padaccheda) return [];
  const out = [];
  const re = /(\S+)\s+([०-९]+)\/([०-९]+)/g;
  let m;
  while ((m = re.exec(padaccheda))) {
    out.push({
      term: m[1],
      vibhakti: DIGIT[m[2]],
      vacana: DIGIT[m[3]],
    });
  }
  return out;
}

function idLess(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (pa[i] !== pb[i]) return pa[i] < pb[i];
  return false;
}

function stemOf(term) {
  return term.replace(/[ःम्ेािुू]$/u, "").replace(/े$/, "");
}

function loadAll(sutraPath = SUTRA_PATH) {
  return JSON.parse(fs.readFileSync(sutraPath, "utf8"));
}

function locativeHeadings(all) {
  const heads = [];
  for (const row of all) {
    const padas = parsePadaccheda(row.padaccheda);
    if (padas.length === 1 && padas[0].vibhakti === 7) heads.push(row.id);
  }
  return heads;
}

function nextHeading(heads, id) {
  return heads.find((h) => idLess(id, h)) || "9.9.999";
}

function roleFor(vibhakti) {
  if (vibhakti === 6) return { role: "sthana", license: "1.1.49", sutra: "षष्ठी स्थानेयोगा" };
  if (vibhakti === 7) return { role: "on_preceding", license: "1.1.66", sutra: "तस्मिन्निति निर्दिष्टे पूर्वस्य" };
  if (vibhakti === 5) return { role: "on_following", license: "1.1.67", sutra: "तस्मादित्युत्तरस्य" };
  if (vibhakti === 1) return { role: "nominative_unresolved", license: null, sutra: null };
  if (vibhakti === 0) return { role: "particle", license: null, sutra: null };
  return { role: "unassigned", license: null, sutra: null };
}

function executable(term) {
  return term.verification === "source_annotation" || term.verification === "gloss_confirms" || term.verification === "own_pada";
}

function convertSlice(ids, sutraPath = SUTRA_PATH) {
  const all = loadAll(sutraPath);
  const byId = new Map(all.map((s) => [s.id, s]));
  for (const id of ["1.1.49", "1.1.66", "1.1.67", "1.4.2", "1.1.71"]) {
    if (!byId.has(id)) throw new Error(`license sutra ${id} missing from data/sutras.json`);
  }
  const heads = locativeHeadings(all);
  const records = ids.map((id) => {
    const row = byId.get(id);
    if (!row) throw new Error(`missing ${id}`);
    const padas = parsePadaccheda(row.padaccheda).map((p) => ({
      ...p,
      ...roleFor(p.vibhakti),
      verification: "own_pada",
      from: id,
      via: "padaccheda",
    }));
    const adhikara = padas.length === 1 && padas[0].vibhakti === 7
      ? { term: padas[0].term, scopeUntil: nextHeading(heads, id), detection: "single_locative_pada" }
      : null;
    return {
      id: row.id,
      type: row.type,
      term: row.term,
      sutra: row.sutra,
      padaccheda: row.padaccheda,
      anuvrtti_field: row.anuvrtti || [],
      gloss: row.gloss,
      sutra_krama: row.sutra_krama,
      padas,
      inherited: [],
      resolved: [],
      adhikara,
    };
  });

  const engine = buildMetaEngine();
  const initial = { phase: "expand", i: 0, sutras: records };
  const run = engine.run(initial, "meta", 800);
  if (run.state.phase !== "done") throw new Error("converter did not finish");
  return { sutras: run.state.sutras, steps: run.trace.length, fires: countFires(run.trace), licenses: {
    "1.1.49": byId.get("1.1.49").sutra,
    "1.1.66": byId.get("1.1.66").sutra,
    "1.1.67": byId.get("1.1.67").sutra,
    "1.4.2": byId.get("1.4.2").sutra,
    "1.1.71": byId.get("1.1.71").sutra,
  } };
}

function countFires(trace) {
  return trace.reduce((m, t) => (m[t.rule] = (m[t.rule] || 0) + 1, m), {});
}

function clone(s) { return JSON.parse(JSON.stringify(s)); }

function pullAnuvrtti(state) {
  const next = clone(state);
  const rec = next.sutras[next.i];
  const pending = rec.anuvrtti_field.find((a) => !rec.inherited.some((h) => h.term === a.term && h.via === "anuvrtti"));
  const source = next.sutras.find((s) => s.id === pending.from);
  const sourceHas = source
    ? source.padas.some((p) => p.term === pending.term) || source.inherited.some((h) => h.term === pending.term)
    : false;
  rec.inherited.push({
    term: pending.term,
    from: pending.from,
    via: "anuvrtti",
    verification: "source_annotation",
    source_has_term: sourceHas,
    executable: true,
  });
  return next;
}

function pullAdhikara(state) {
  const next = clone(state);
  const rec = next.sutras[next.i];
  const open = next.sutras.find((s) =>
    s.adhikara && idLess(s.id, rec.id) && idLess(rec.id, s.adhikara.scopeUntil) &&
    !rec.inherited.some((h) => h.term === s.adhikara.term && h.via === "adhikara")
  );
  const stem = stemOf(open.adhikara.term);
  const confirmed = !!(rec.gloss && rec.gloss.includes(stem));
  rec.inherited.push({
    term: open.adhikara.term,
    from: open.id,
    via: "adhikara",
    verification: confirmed ? "gloss_confirms" : "unconfirmed",
    executable: confirmed,
    detection: open.adhikara.detection,
  });
  return next;
}

function pullEkadesha(state) {
  const next = clone(state);
  const rec = next.sutras[next.i];
  const gov = next.sutras.find((s) => s.id === "6.1.84");
  for (const term of ["एकः", "पूर्वपरयोः"]) {
    const confirmed = !!(rec.gloss && (rec.gloss.includes("एक") || rec.gloss.includes("पूर्वपर")));
    rec.inherited.push({
      term,
      from: gov.id,
      via: "ekadesha_proposal",
      verification: confirmed ? "gloss_confirms" : "unconfirmed",
      executable: confirmed,
    });
  }
  return next;
}

function pullSamjna(state) {
  const next = clone(state);
  const rec = next.sutras[next.i];
  const terms = [...rec.padas, ...rec.inherited.filter((h) => h.executable)];
  for (const item of terms) {
    for (const key of item.term.split("-")) {
      if (PRATYAHARA[key] && !rec.resolved.some((r) => r.term === key)) {
        const [start, it] = PRATYAHARA[key];
        rec.resolved.push({
          term: key,
          via: "1.1.71",
          it_marker_disambiguation: "stage0_convention",
          value: pratyahara(start, it),
        });
      }
    }
  }
  return next;
}

function advance(state) {
  const next = clone(state);
  next.i += 1;
  if (next.i >= next.sutras.length) next.phase = "done";
  return next;
}

function anuvrttiPending(rec) {
  return (rec.anuvrtti_field || []).some((a) => !rec.inherited.some((h) => h.term === a.term && h.via === "anuvrtti"));
}
function adhikaraPending(rec, sutras) {
  return sutras.some((s) =>
    s.adhikara && idLess(s.id, rec.id) && idLess(rec.id, s.adhikara.scopeUntil) &&
    !rec.inherited.some((h) => h.term === s.adhikara.term && h.via === "adhikara")
  );
}
function ekadeshaPending(rec, sutras) {
  if (rec.type !== "vidhi") return false;
  if (!sutras.some((s) => s.id === "6.1.84") || !idLess("6.1.84", rec.id) || !rec.id.startsWith("6.1.")) return false;
  if (!rec.padas.some((p) => p.role === "nominative_unresolved")) return false;
  return !rec.inherited.some((h) => h.via === "ekadesha_proposal");
}
function samjnaPending(rec) {
  const terms = [...rec.padas, ...rec.inherited.filter((h) => h.executable)];
  return terms.some((item) => item.term.split("-").some((key) => PRATYAHARA[key] && !rec.resolved.some((r) => r.term === key)));
}

function buildMetaEngine() {
  const engine = new Engine();
  const bare = (id, extra = {}) => ({ id, padas: [], inherited: [], anuvrtti_field: [], resolved: [], gloss: null, type: null, adhikara: null, ...extra });
  engine.define({
    name: "1.1.49-66-67-role-already-on-pada",
    adhikara: "meta",
    specificity: 0,
    hetu: () => false,
    nigamana: (s) => s,
    udaharana: { input: { x: 1 }, output: { x: 1 } },
  });
  engine.define({
    name: "anuvrtti-copy-source-annotation",
    adhikara: "meta",
    specificity: 5,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && anuvrttiPending(s.sutras[s.i]),
    nigamana: pullAnuvrtti,
    udaharana: {
      input: { phase: "expand", i: 1, sutras: [bare("1.1.1", { padas: [{ term: "वृद्धिः" }] }), bare("1.1.3", { anuvrtti_field: [{ term: "वृद्धिः", from: "1.1.1" }] })] },
      output: { phase: "expand", i: 1, sutras: [bare("1.1.1", { padas: [{ term: "वृद्धिः" }] }), bare("1.1.3", { anuvrtti_field: [{ term: "वृद्धिः", from: "1.1.1" }], inherited: [{ term: "वृद्धिः", from: "1.1.1", via: "anuvrtti", verification: "source_annotation", source_has_term: true, executable: true }] })] },
    },
  });
  engine.define({
    name: "adhikara-locative-propagate",
    adhikara: "meta",
    specificity: 4,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && adhikaraPending(s.sutras[s.i], s.sutras),
    nigamana: pullAdhikara,
    udaharana: {
      input: { phase: "expand", i: 1, sutras: [bare("1.4.23", { adhikara: { term: "कारके", scopeUntil: "1.4.85", detection: "single_locative_pada" } }), bare("1.4.24", { gloss: "अपाये ध्रुवम् कारकम् अपादानम्" })] },
      output: { phase: "expand", i: 1, sutras: [bare("1.4.23", { adhikara: { term: "कारके", scopeUntil: "1.4.85", detection: "single_locative_pada" } }), bare("1.4.24", { gloss: "अपाये ध्रुवम् कारकम् अपादानम्", inherited: [{ term: "कारके", from: "1.4.23", via: "adhikara", verification: "gloss_confirms", executable: true, detection: "single_locative_pada" }] })] },
    },
  });
  engine.define({
    name: "ekadesha-propose-gate-on-gloss",
    adhikara: "meta",
    specificity: 3,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && ekadeshaPending(s.sutras[s.i], s.sutras),
    nigamana: pullEkadesha,
    udaharana: {
      input: { phase: "expand", i: 1, sutras: [bare("6.1.84"), bare("6.1.87", { type: "vidhi", padas: [{ role: "nominative_unresolved" }], gloss: "आद् अचि पूर्वपरयोः एकः गुणः" })] },
      output: { phase: "expand", i: 1, sutras: [bare("6.1.84"), bare("6.1.87", { type: "vidhi", padas: [{ role: "nominative_unresolved" }], gloss: "आद् अचि पूर्वपरयोः एकः गुणः", inherited: [{ term: "एकः", from: "6.1.84", via: "ekadesha_proposal", verification: "gloss_confirms", executable: true }, { term: "पूर्वपरयोः", from: "6.1.84", via: "ekadesha_proposal", verification: "gloss_confirms", executable: true }] })] },
    },
  });
  engine.define({
    name: "1.1.71-pratyahara-expand",
    adhikara: "meta",
    specificity: 2,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && samjnaPending(s.sutras[s.i]),
    nigamana: pullSamjna,
    udaharana: {
      input: { phase: "expand", i: 0, sutras: [bare("6.1.77", { padas: [{ term: "यण्" }] })] },
      output: { phase: "expand", i: 0, sutras: [bare("6.1.77", { padas: [{ term: "यण्" }], resolved: [{ term: "यण्", via: "1.1.71", it_marker_disambiguation: "stage0_convention", value: ["y", "v", "r", "l"] }] })] },
    },
  });
  engine.define({
    name: "advance",
    adhikara: "meta",
    specificity: 0,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length,
    nigamana: advance,
    udaharana: {
      input: { phase: "expand", i: 0, sutras: [bare("x")] },
      output: { phase: "done", i: 1, sutras: [bare("x")] },
    },
  });
  return engine;
}

function lastVowel(s) {
  const keys = ["aa", "ii", "uu", "ai", "au", "RR", "LL", "a", "i", "u", "e", "o", "R", "L"];
  return keys.find((k) => s.endsWith(k)) || null;
}
function firstVowel(s) {
  const keys = ["aa", "ii", "uu", "ai", "au", "RR", "LL", "a", "i", "u", "e", "o", "R", "L"];
  return keys.find((k) => s.startsWith(k)) || null;
}
function isAc(v) { return ["a", "aa", "i", "ii", "u", "uu", "R", "RR", "L", "LL", "e", "o", "ai", "au"].includes(v); }
function isIk(v) { return ["i", "ii", "u", "uu", "R", "RR", "L", "LL"].includes(v); }
function isAk(v) { return ["a", "aa", "i", "ii", "u", "uu", "R", "RR", "L", "LL"].includes(v); }

function buildOperational(converted) {
  const byId = new Map(converted.map((s) => [s.id, s]));
  const engine = new Engine();
  const r77 = byId.get("6.1.77");
  const r87 = byId.get("6.1.87");
  const r101 = byId.get("6.1.101");
  if (!r77 || !r87 || !r101) throw new Error("operational slice needs 6.1.77, 6.1.87, 6.1.101");
  const ekadesha = (rec) => rec.inherited.some((h) => h.term === "एकः" && h.executable);
  if (!ekadesha(r87)) throw new Error("6.1.87 ekadesha not verified — refusing to treat the label as understanding");
  if (!ekadesha(r101)) throw new Error("6.1.101 ekadesha not verified");

  engine.define({
    name: "6.1.101",
    adhikara: "sandhi",
    specificity: 3,
    hetu: (s) => {
      const lv = lastVowel(s.left), rv = firstVowel(s.right);
      return s.pending && isAk(lv) && rv && CLOSENESS.dirgha[lv] === CLOSENESS.dirgha[rv];
    },
    nigamana: (s) => {
      const lv = lastVowel(s.left), rv = firstVowel(s.right);
      return { left: s.left.slice(0, -lv.length) + CLOSENESS.dirgha[lv], right: s.right.slice(rv.length), pending: false, rule: "6.1.101" };
    },
    udaharana: {
      input: { left: "vidyaa", right: "aalaya", pending: true },
      output: { left: "vidyaa", right: "laya", pending: false, rule: "6.1.101" },
    },
  });
  engine.define({
    name: "6.1.87",
    adhikara: "sandhi",
    specificity: 2,
    hetu: (s) => {
      const lv = lastVowel(s.left), rv = firstVowel(s.right);
      return s.pending && (lv === "a" || lv === "aa") && rv && isAc(rv) && CLOSENESS.guna[rv];
    },
    nigamana: (s) => {
      const lv = lastVowel(s.left), rv = firstVowel(s.right);
      return { left: s.left.slice(0, -lv.length) + CLOSENESS.guna[rv], right: s.right.slice(rv.length), pending: false, rule: "6.1.87" };
    },
    udaharana: {
      input: { left: "upa", right: "indra", pending: true },
      output: { left: "upe", right: "ndra", pending: false, rule: "6.1.87" },
    },
  });
  engine.define({
    name: "6.1.77",
    adhikara: "sandhi",
    specificity: 2,
    hetu: (s) => {
      const lv = lastVowel(s.left), rv = firstVowel(s.right);
      return s.pending && isIk(lv) && rv && isAc(rv);
    },
    nigamana: (s) => {
      const lv = lastVowel(s.left);
      return { left: s.left.slice(0, -lv.length) + CLOSENESS.yan[lv] + s.right, right: "", pending: false, rule: "6.1.77" };
    },
    udaharana: {
      input: { left: "nadii", right: "aa", pending: true },
      output: { left: "nadyaa", right: "", pending: false, rule: "6.1.77" },
    },
  });
  return engine;
}

function join(engine, left, right) {
  const result = engine.run({ left, right, pending: true }, "sandhi", 4);
  return { form: result.state.left + result.state.right, rule: result.state.rule };
}

const FIXTURE = [
  "1.1.1", "1.1.2", "1.1.3", "1.1.49", "1.1.66", "1.1.67", "1.1.71",
  "1.4.2", "1.4.23", "1.4.24", "1.4.54", "2.3.2",
  "3.1.1", "3.1.2", "4.1.1", "4.1.2",
  "6.1.77", "6.1.84", "6.1.87", "6.1.101", "6.1.107",
  "7.3.82", "7.3.84", "8.3.14", "8.3.15",
];

module.exports = {
  parsePadaccheda, convertSlice, buildOperational, join, FIXTURE, CLOSENESS, executable, stemOf,
};
