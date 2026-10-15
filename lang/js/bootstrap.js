/**
 * Self-hosting cycle for a Paninian rule set.
 *
 * Question this file answers: if each sutra is mapped 1:1 into a record,
 * does running a cycle produce the operational rules? A flat map of the
 * surface string does not. The cycle below is the missing mechanism.
 *
 * T-diagram (compiler self-hosting, applied to the Ashtadhyayi):
 *
 *   stage 0  human translation of EACH sutra's own words
 *            (the parser cannot do this; see HANDOFF REQ-1.1)
 *                 |
 *   stage 1  meta-rules, themselves Engine Rule objects, run to fixpoint
 *            over that 1:1 map: anuvrtti pull, adhikara propagation,
 *            ekadesha-paribhasha propagation, samjna/pratyahara expansion,
 *            atidesha stamp
 *                 |
 *   stage 2  the emitted operational rules, same Engine.run, applied to
 *            a pada / a karaka context
 *
 * Stage 1 is the self-hosted part: the expander is not a separate
 * interpreter, it is the rule-rewrite engine running on a state whose
 * value is the rule list. 1.4.2 is both an input sutra and the license
 * for Engine.step's tie-break, so the conflict rule that runs the engine
 * is one of the rules the engine expands.
 *
 * What is deliberately not claimed: this does not parse raw sutra
 * Sanskrit. Translations of the karyam are hand-written, checked against
 * the verbatim sutra / padaccheda / anuvrtti / gloss fields in
 * data/sutras.json. Adhikara detection is part of that translation, not
 * an automatic classifier over all 3,983 sutras.
 */

const fs = require("fs");
const path = require("path");
const { Engine } = require("./engine");
const { pratyahara } = require("./shivasutras");

const SUTRA_PATH = path.join(__dirname, "..", "..", "data", "sutras.json");

/** Hand translation of the karyam this sutra itself introduces.
 *  Inherited material is NOT written here; the cycle must recover it.
 *  `continues` marks a term later sutras still need (oracle is the
 *  anuvrtti field or the gloss, checked in the test, not fed back in). */
const TRANSLATIONS = [
  {
    id: "1.1.1",
    section: "1.1 samjna",
    introduces: [
      { term: "वृद्धिः", role: "samjna", continues: false },
      { term: "आत्", role: "members", continues: false },
      { term: "ऐच्", role: "members", continues: false },
    ],
    note: "Names aa, ai, au as vrddhi. Padaccheda is आत्-ऐच्, long a, not short a.",
  },
  {
    id: "1.1.2",
    section: "1.1 samjna",
    introduces: [
      { term: "गुणः", role: "samjna", continues: false },
      { term: "अत्", role: "members", continues: false },
      { term: "एङ्", role: "members", continues: false },
    ],
    note: "Names a, e, o as guna.",
  },
  {
    id: "1.1.3",
    section: "1.1 paribhasha",
    introduces: [
      { term: "इकः", role: "sthana", continues: false },
    ],
    note: "Surface is only ikah + gunavrddhi. Guna and vrddhi arrive by anuvrtti from 1.1.1 and 1.1.2.",
  },
  {
    id: "1.1.56",
    section: "1.1 atidesha",
    introduces: [
      { term: "स्थानिवत्", role: "atidesha", continues: true },
      { term: "आदेशः", role: "target", continues: true },
      { term: "अनल्विधौ", role: "exception", continues: true },
    ],
    note: "A substitute is treated like the original, except in a rule whose condition is a sound.",
  },
  {
    id: "1.1.71",
    section: "1.1 samjna",
    introduces: [
      { term: "आदिः", role: "pratyahara-start", continues: false },
      { term: "इता", role: "pratyahara-end", continues: false },
    ],
    note: "A pratyahara is the span from an initial sound up to a closing it-marker. This is what lets guna/ik/ac be sets rather than names.",
  },
  {
    id: "1.4.2",
    section: "1.4 paribhasha",
    introduces: [
      { term: "विप्रतिषेधे", role: "condition", continues: false },
      { term: "परम्", role: "winner", continues: false },
      { term: "कार्यम्", role: "karya", continues: false },
    ],
    note: "In a conflict, the later operation. This is the rule Engine.step already implements as its tie-break.",
  },
  {
    id: "1.4.23",
    section: "1.4 adhikara",
    adhikara: { term: "कारके", scopeUntil: "1.4.56" },
    introduces: [
      { term: "कारके", role: "adhikara", continues: true },
    ],
    note: "Locative heading. Data anuvrtti of 1.4.24 is empty; the gloss still contains karakam. Propagation is the cycle, not the field.",
  },
  {
    id: "1.4.24",
    section: "1.4 samjna",
    introduces: [
      { term: "ध्रुवम्", role: "defined", continues: false },
      { term: "अपाये", role: "condition", continues: false },
      { term: "अपादानम्", role: "samjna", continues: false },
    ],
    note: "Fixed point of departure is apadana. Karaka is not in this sutra's own words.",
  },
  {
    id: "1.4.54",
    section: "1.4 samjna",
    introduces: [
      { term: "स्वतन्त्रः", role: "defined", continues: false },
      { term: "कर्ता", role: "samjna", continues: false },
    ],
    note: "The independent participant is karta. Same karake heading as 1.4.24; this file's gloss is null, so the attachment is not gloss-confirmed.",
  },
  {
    id: "2.3.2",
    section: "2.3 vidhi",
    introduces: [
      { term: "कर्मणि", role: "condition", continues: false },
      { term: "द्वितीया", role: "vibhakti", continues: false },
    ],
    note: "Karma is expressed by the second triplet. anuvrtti and gloss are both empty here, so the cycle must not invent anabhihite.",
  },
  {
    id: "3.1.1",
    section: "3.1 adhikara",
    adhikara: { term: "प्रत्ययः", scopeUntil: "5.4.161" },
    introduces: [
      { term: "प्रत्ययः", role: "adhikara", continues: true },
    ],
    note: "Heading. Kashika reads it as adhikara through the end of adhyaya 5.",
  },
  {
    id: "3.1.2",
    section: "3.1 paribhasha",
    adhikara: { term: "परः", scopeUntil: "5.4.161" },
    introduces: [
      { term: "परः", role: "placement", continues: true },
    ],
    note: "Surface is parash ca. Treated as a heading over the same span as 3.1.1: Kashika carries pratyayah, and Vasu/NPTEL carry parah, through the end of adhyaya 5. The gloss is pratyayah parash ca; pratyayah is not in the anuvrtti field.",
  },
  {
    id: "4.1.1",
    section: "4.1 adhikara",
    adhikara: { term: "ङ्याप्प्रातिपदिकात्", scopeUntil: "5.4.161" },
    introduces: [
      { term: "ङ्याप्प्रातिपदिकात्", role: "adhikara", continues: true },
    ],
    note: "Heading for suffixes after a nyap or a pratipadika. Gloss of 4.1.2 contains this word; anuvrtti field of 4.1.2 is empty.",
  },
  {
    id: "4.1.2",
    section: "4.1 vidhi",
    introduces: [
      { term: "सुप्", role: "pratyaya-list", continues: false },
    ],
    suffixFromPadaccheda: true,
    note: "The 21 sup endings. Base and 'it is a pratyaya placed after' are not in this sutra's own words.",
  },
  {
    id: "6.1.77",
    section: "6.1 vidhi",
    introduces: [
      { term: "इकः", role: "sthana", continues: true },
      { term: "यण्", role: "adesha", continues: false },
      { term: "अचि", role: "right-context", continues: true },
    ],
    note: "ik becomes yan before ac. aci continues; 6.1.87's anuvrtti field records that.",
  },
  {
    id: "6.1.84",
    section: "6.1 paribhasha",
    governs: { kind: "ekadesha", scopeUntil: "6.1.112" },
    introduces: [
      { term: "एकः", role: "ekadesha", continues: true },
      { term: "पूर्वपरयोः", role: "ekadesha", continues: true },
    ],
    note: "One substitute in place of the preceding and the following. 6.1.87 and 6.1.101 glosses contain this phrase; their anuvrtti arrays do not.",
  },
  {
    id: "6.1.87",
    section: "6.1 vidhi",
    introduces: [
      { term: "आत्", role: "left", continues: false },
      { term: "गुणः", role: "adesha", continues: false },
    ],
    note: "Surface is aad gunah only. Needs aci (anuvrtti field) and ekah purvaparayoh (not in the field).",
  },
  {
    id: "6.1.101",
    section: "6.1 vidhi",
    introduces: [
      { term: "अकः", role: "left", continues: false },
      { term: "सवर्णे", role: "right-context", continues: false },
      { term: "दीर्घः", role: "adesha", continues: false },
    ],
    note: "ak followed by a savarna ac becomes one long vowel. Gloss has ekah purvaparayoh; anuvrtti field has only aci.",
  },
  {
    id: "7.3.82",
    section: "7.3 vidhi",
    introduces: [
      { term: "मिदेः", role: "sthana", continues: false },
      { term: "गुणः", role: "adesha", continues: true },
    ],
    note: "Included because 7.3.84's anuvrtti field names guna as coming from here. The guna of mid itself is not the rule under test.",
  },
  {
    id: "7.3.84",
    section: "7.3 vidhi",
    introduces: [
      { term: "सार्वधातुक-आर्धधातुकयोः", role: "right-context", continues: false },
    ],
    note: "Surface has only the right context. Guna is anuvrtta from 7.3.82. Gloss also has angasya, whose source (6.4.1) is outside this slice, so the cycle must not invent it.",
  },
  {
    id: "8.3.14",
    section: "8.3 vidhi",
    introduces: [
      { term: "रः", role: "sthana", continues: true },
      { term: "रि", role: "right-context", continues: false },
    ],
    note: "Source of rah for 8.3.15. Its own anuvrtti (lopah from 8.3.13) is outside this slice.",
  },
  {
    id: "8.3.15",
    section: "8.3 vidhi",
    introduces: [
      { term: "खर्-अवसानयोः", role: "right-context", continues: false },
      { term: "विसर्जनीयः", role: "adesha", continues: false },
    ],
    note: "Surface has no rah. anuvrtti field supplies rah from 8.3.14. Gloss also has padasya and samhitaayaam, sources outside this slice.",
  },
];

function idLess(a, b) {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] < pb[i];
  }
  return false;
}

function loadSlice(sutraPath = SUTRA_PATH) {
  const raw = JSON.parse(fs.readFileSync(sutraPath, "utf8"));
  const byId = new Map(raw.map((s) => [s.id, s]));
  return TRANSLATIONS.map((t) => {
    const row = byId.get(t.id);
    if (!row) throw new Error(`sutra ${t.id} missing from data/sutras.json`);
    const rec = {
      id: row.id,
      section: t.section,
      type: row.type,
      term: row.term,
      sutra: row.sutra,
      padaccheda: row.padaccheda,
      anuvrtti_field: row.anuvrtti || [],
      gloss: row.gloss,
      introduces: t.introduces.map((x) => ({ ...x })),
      adhikara: t.adhikara || null,
      governs: t.governs || null,
      note: t.note,
      inherited: [],
      resolved: [],
      atidesha: null,
      emitted: false,
    };
    if (t.suffixFromPadaccheda) {
      const list = row.padaccheda.split(" ")[0].split("-");
      rec.suffixes = list;
      if (list.length !== 21) {
        throw new Error(`4.1.2 padaccheda did not yield 21 suffixes, got ${list.length}: ${row.padaccheda}`);
      }
    }
    return rec;
  });
}

function hasTerm(rec, term) {
  return rec.introduces.some((x) => x.term === term) || rec.inherited.some((x) => x.term === term);
}

function cloneState(state) {
  return JSON.parse(JSON.stringify(state));
}

/** Meta-rule 1. Copy a term the data's anuvrtti field names, from the named source. */
function pullAnuvrtti(state) {
  const next = cloneState(state);
  const rec = next.sutras[next.i];
  const pending = rec.anuvrtti_field.find((a) => !rec.inherited.some((h) => h.term === a.term && h.via === "anuvrtti"));
  const source = next.sutras.find((s) => s.id === pending.from);
  rec.inherited.push({
    term: pending.term,
    from: pending.from,
    via: "anuvrtti",
    source_has_term: source ? hasTerm(source, pending.term) || (source.introduces || []).some((x) => pending.term.startsWith(x.term.replace(/ः$/, ""))) : false,
  });
  return next;
}

function anuvrttiPending(rec) {
  return (rec.anuvrtti_field || []).some((a) => !rec.inherited.some((h) => h.term === a.term && h.via === "anuvrtti"));
}

/** Meta-rule 2. A heading sutra propagates its term up to scopeUntil. */
function pullAdhikara(state) {
  const next = cloneState(state);
  const rec = next.sutras[next.i];
  const open = next.sutras.find((s) =>
    s.adhikara &&
    idLess(s.id, rec.id) &&
    idLess(rec.id, s.adhikara.scopeUntil) &&
    !rec.inherited.some((h) => h.term === s.adhikara.term && h.via === "adhikara")
  );
  rec.inherited.push({ term: open.adhikara.term, from: open.id, via: "adhikara" });
  return next;
}

function adhikaraPending(rec, sutras) {
  return sutras.some((s) =>
    s.adhikara &&
    idLess(s.id, rec.id) &&
    idLess(rec.id, s.adhikara.scopeUntil) &&
    !rec.inherited.some((h) => h.term === s.adhikara.term && h.via === "adhikara")
  );
}

/** Meta-rule 3. 6.1.84-style ekadesha paribhasha propagates onto later substitution vidhi. */
function pullEkadesha(state) {
  const next = cloneState(state);
  const rec = next.sutras[next.i];
  const gov = next.sutras.find((s) => s.governs && s.governs.kind === "ekadesha" && idLess(s.id, rec.id) && idLess(rec.id, s.governs.scopeUntil));
  for (const term of ["एकः", "पूर्वपरयोः"]) {
    if (!rec.inherited.some((h) => h.term === term && h.via === "ekadesha")) {
      rec.inherited.push({ term, from: gov.id, via: "ekadesha" });
    }
  }
  return next;
}

function ekadeshaPending(rec, sutras) {
  if (rec.type !== "vidhi") return false;
  const teachesSubstitute = rec.introduces.some((x) => x.role === "adesha");
  if (!teachesSubstitute) return false;
  const gov = sutras.find((s) => s.governs && s.governs.kind === "ekadesha" && idLess(s.id, rec.id) && idLess(rec.id, s.governs.scopeUntil));
  if (!gov) return false;
  return !rec.inherited.some((h) => h.term === "एकः" && h.via === "ekadesha");
}

/** Meta-rule 4. Expand pratyahara / samjna names using 1.1.71 + the Shiva-sutra span. */
const PRATYAHARA_OF = {
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

function expandNames(rec) {
  const out = [];
  const terms = [...rec.introduces, ...rec.inherited];
  for (const item of terms) {
    const key = item.term.split("-")[0];
    if (PRATYAHARA_OF[key] && !rec.resolved.some((r) => r.term === key)) {
      const [start, it] = PRATYAHARA_OF[key];
      out.push({ term: key, via: "1.1.71", value: pratyahara(start, it) });
    }
  }
  if (terms.some((t) => t.term === "आत्") && terms.some((t) => t.term === "ऐच्") && !rec.resolved.some((r) => r.term === "वृद्धिः")) {
    out.push({ term: "वृद्धिः", via: "1.1.1+1.1.71", value: ["aa", "ai", "au"] });
  }
  if (terms.some((t) => t.term === "अत्") && terms.some((t) => t.term === "एङ्") && !rec.resolved.some((r) => r.term === "गुणः")) {
    out.push({ term: "गुणः", via: "1.1.2+1.1.71", value: ["a", "e", "o"] });
  }
  return out;
}

function pullSamjna(state) {
  const next = cloneState(state);
  const rec = next.sutras[next.i];
  rec.resolved.push(...expandNames(rec));
  return next;
}

function samjnaPending(rec) {
  return expandNames(rec).length > 0;
}

/** Meta-rule 5. Stamp 1.1.56 onto any sutra that teaches an adesha. */
function stampAtidesha(state) {
  const next = cloneState(state);
  const rec = next.sutras[next.i];
  rec.atidesha = { rule: "1.1.56", treat_as: "sthanivat", except: "alvidhi" };
  return next;
}

function atideshaPending(rec, sutras) {
  if (rec.atidesha) return false;
  if (!sutras.some((s) => s.id === "1.1.56")) return false;
  if (rec.id === "1.1.56") return false;
  return rec.introduces.some((x) => x.role === "adesha") || rec.inherited.some((x) => x.role === "adesha");
}

function advance(state) {
  const next = cloneState(state);
  next.i += 1;
  if (next.i >= next.sutras.length) next.phase = "done";
  return next;
}

function buildMetaEngine() {
  const engine = new Engine();
  engine.define({
    name: "anuvrtti-pull",
    adhikara: "meta",
    specificity: 5,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && anuvrttiPending(s.sutras[s.i]),
    nigamana: pullAnuvrtti,
    udaharana: {
      input: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "1.1.1", introduces: [{ term: "वृद्धिः" }], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "1.1.3", introduces: [], inherited: [], anuvrtti_field: [{ term: "वृद्धिः", from: "1.1.1" }], resolved: [], atidesha: null },
        ],
      },
      output: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "1.1.1", introduces: [{ term: "वृद्धिः" }], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "1.1.3", introduces: [], inherited: [{ term: "वृद्धिः", from: "1.1.1", via: "anuvrtti", source_has_term: true }], anuvrtti_field: [{ term: "वृद्धिः", from: "1.1.1" }], resolved: [], atidesha: null },
        ],
      },
    },
  });
  engine.define({
    name: "adhikara-propagate",
    adhikara: "meta",
    specificity: 4,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && adhikaraPending(s.sutras[s.i], s.sutras),
    nigamana: pullAdhikara,
    udaharana: {
      input: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "1.4.23", adhikara: { term: "कारके", scopeUntil: "1.4.56" }, introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "1.4.24", introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
        ],
      },
      output: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "1.4.23", adhikara: { term: "कारके", scopeUntil: "1.4.56" }, introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "1.4.24", introduces: [], inherited: [{ term: "कारके", from: "1.4.23", via: "adhikara" }], anuvrtti_field: [], resolved: [], atidesha: null },
        ],
      },
    },
  });
  engine.define({
    name: "ekadesha-propagate",
    adhikara: "meta",
    specificity: 3,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && ekadeshaPending(s.sutras[s.i], s.sutras),
    nigamana: pullEkadesha,
    udaharana: {
      input: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "6.1.84", type: null, governs: { kind: "ekadesha", scopeUntil: "6.1.112" }, introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "6.1.87", type: "vidhi", introduces: [{ term: "गुणः", role: "adesha" }], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
        ],
      },
      output: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "6.1.84", type: null, governs: { kind: "ekadesha", scopeUntil: "6.1.112" }, introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "6.1.87", type: "vidhi", introduces: [{ term: "गुणः", role: "adesha" }], inherited: [{ term: "एकः", from: "6.1.84", via: "ekadesha" }, { term: "पूर्वपरयोः", from: "6.1.84", via: "ekadesha" }], anuvrtti_field: [], resolved: [], atidesha: null },
        ],
      },
    },
  });
  engine.define({
    name: "samjna-pratyahara-expand",
    adhikara: "meta",
    specificity: 2,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && samjnaPending(s.sutras[s.i]),
    nigamana: pullSamjna,
    udaharana: {
      input: {
        phase: "expand",
        i: 0,
        sutras: [
          { id: "1.1.1", introduces: [{ term: "आत्" }, { term: "ऐच्" }], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
        ],
      },
      output: {
        phase: "expand",
        i: 0,
        sutras: [
          { id: "1.1.1", introduces: [{ term: "आत्" }, { term: "ऐच्" }], inherited: [], anuvrtti_field: [], resolved: [{ term: "ऐच्", via: "1.1.71", value: ["ai", "au"] }, { term: "वृद्धिः", via: "1.1.1+1.1.71", value: ["aa", "ai", "au"] }], atidesha: null },
        ],
      },
    },
  });
  engine.define({
    name: "atidesha-stamp",
    adhikara: "meta",
    specificity: 1,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length && atideshaPending(s.sutras[s.i], s.sutras),
    nigamana: stampAtidesha,
    udaharana: {
      input: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "1.1.56", introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "6.1.77", introduces: [{ term: "यण्", role: "adesha" }], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
        ],
      },
      output: {
        phase: "expand",
        i: 1,
        sutras: [
          { id: "1.1.56", introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null },
          { id: "6.1.77", introduces: [{ term: "यण्", role: "adesha" }], inherited: [], anuvrtti_field: [], resolved: [], atidesha: { rule: "1.1.56", treat_as: "sthanivat", except: "alvidhi" } },
        ],
      },
    },
  });
  engine.define({
    name: "advance",
    adhikara: "meta",
    specificity: 0,
    hetu: (s) => s.phase === "expand" && s.i < s.sutras.length,
    nigamana: advance,
    udaharana: {
      input: { phase: "expand", i: 0, sutras: [{ id: "x", introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null }] },
      output: { phase: "done", i: 1, sutras: [{ id: "x", introduces: [], inherited: [], anuvrtti_field: [], resolved: [], atidesha: null }] },
    },
  });
  return engine;
}

function expand(sutras) {
  const engine = buildMetaEngine();
  const initial = { phase: "expand", i: 0, sutras: JSON.parse(JSON.stringify(sutras)) };
  const { state, trace } = engine.run(initial, "meta", 500);
  if (state.phase !== "done") throw new Error("meta-cycle did not finish");
  return { sutras: state.sutras, trace, steps: trace.length };
}

function surfaceOnly(rec) {
  return rec.introduces.map((x) => x.term);
}

function expandedTerms(rec) {
  return [...rec.introduces.map((x) => x.term), ...rec.inherited.map((x) => `${x.term} <${x.via} ${x.from}>`)];
}

/** Stage 2: operational sandhi, same Engine, rules that exist only after the cycle. */
function gunaOf(vowel) {
  const map = { a: "a", aa: "a", i: "e", ii: "e", u: "o", uu: "o", R: "ar", RR: "ar", L: "al" };
  return map[vowel] || null;
}
function dirghaOf(vowel) {
  const map = { a: "aa", aa: "aa", i: "ii", ii: "ii", u: "uu", uu: "uu", R: "RR", RR: "RR", L: "LL" };
  return map[vowel] || null;
}
function isAc(v) { return ["a", "aa", "i", "ii", "u", "uu", "R", "RR", "L", "LL", "e", "o", "ai", "au"].includes(v); }
function isIk(v) { return ["i", "ii", "u", "uu", "R", "RR", "L", "LL"].includes(v); }
function isAk(v) { return ["a", "aa", "i", "ii", "u", "uu", "R", "RR", "L", "LL"].includes(v); }
function savarna(a, b) { return dirghaOf(a) && dirghaOf(a) === dirghaOf(b); }
function lastVowel(s) {
  const keys = ["aa", "ii", "uu", "ai", "au", "RR", "LL", "a", "i", "u", "e", "o", "R", "L"];
  return keys.find((k) => s.endsWith(k)) || null;
}
function stemOf(s, v) { return s.slice(0, s.length - v.length); }
function firstVowel(s) {
  const keys = ["aa", "ii", "uu", "ai", "au", "RR", "LL", "a", "i", "u", "e", "o", "R", "L"];
  return keys.find((k) => s.startsWith(k)) || null;
}

function buildSandhiEngine(expanded) {
  const byId = new Map(expanded.map((s) => [s.id, s]));
  const need = ["6.1.77", "6.1.87", "6.1.101"];
  for (const id of need) {
    const rec = byId.get(id);
    if (!rec) throw new Error(`missing ${id}`);
  }
  // Refuse to build the operational rule if the cycle failed to recover the context.
  const r87 = byId.get("6.1.87");
  if (!r87.inherited.some((h) => h.term === "अचि")) throw new Error("6.1.87 missing aci — cycle failed");
  if (!r87.inherited.some((h) => h.term === "एकः")) throw new Error("6.1.87 missing ekadesha — cycle failed");
  const r101 = byId.get("6.1.101");
  if (!r101.inherited.some((h) => h.term === "एकः")) throw new Error("6.1.101 missing ekadesha — cycle failed");

  const engine = new Engine();
  engine.define({
    name: "6.1.101 akah savarne dirghah",
    adhikara: "sandhi",
    specificity: 3, // apavada relative to 6.1.87: savarna is narrower than any ac
    hetu: (s) => {
      const lv = lastVowel(s.left);
      const rv = firstVowel(s.right);
      return s.pending && isAk(lv) && rv && savarna(lv, rv);
    },
    nigamana: (s) => {
      const lv = lastVowel(s.left);
      return { left: stemOf(s.left, lv) + dirghaOf(lv), right: s.right.slice(firstVowel(s.right).length), pending: false, rule: "6.1.101" };
    },
    udaharana: {
      input: { left: "vidyaa", right: "aalaya", pending: true },
      output: { left: "vidyaa", right: "laya", pending: false, rule: "6.1.101" },
    },
  });
  engine.define({
    name: "6.1.87 aad gunah",
    adhikara: "sandhi",
    specificity: 2,
    hetu: (s) => {
      const lv = lastVowel(s.left);
      const rv = firstVowel(s.right);
      return s.pending && (lv === "a" || lv === "aa") && rv && isAc(rv) && gunaOf(rv);
    },
    nigamana: (s) => {
      const lv = lastVowel(s.left);
      const rv = firstVowel(s.right);
      return { left: stemOf(s.left, lv) + gunaOf(rv), right: s.right.slice(rv.length), pending: false, rule: "6.1.87" };
    },
    udaharana: {
      input: { left: "upa", right: "indra", pending: true },
      output: { left: "upe", right: "ndra", pending: false, rule: "6.1.87" },
    },
  });
  engine.define({
    name: "6.1.77 iko yan aci",
    adhikara: "sandhi",
    specificity: 2,
    hetu: (s) => {
      const lv = lastVowel(s.left);
      const rv = firstVowel(s.right);
      return s.pending && isIk(lv) && rv && isAc(rv);
    },
    nigamana: (s) => {
      const lv = lastVowel(s.left);
      const yan = { i: "y", ii: "y", u: "v", uu: "v", R: "r", RR: "r", L: "l", LL: "l" }[lv];
      const rv = firstVowel(s.right);
      return { left: stemOf(s.left, lv) + yan + s.right, right: "", pending: false, rule: "6.1.77" };
    },
    udaharana: {
      input: { left: "nadii", right: "aa", pending: true },
      output: { left: "nadyaa", right: "", pending: false, rule: "6.1.77" },
    },
  });
  return engine;
}

function join(engine, left, right) {
  const result = engine.run({ left, right, pending: true }, "sandhi", 5);
  return { form: result.state.left + result.state.right, rule: result.state.rule, trace: result.trace.map((t) => t.rule) };
}

/** 1.4.2 as the engine's own tie-break: two equal-specificity rules, later registered wins. */
function paraSelfCheck() {
  const engine = new Engine();
  engine.define({
    name: "earlier-equal",
    adhikara: "para-demo",
    specificity: 1,
    hetu: (s) => s.winner === null,
    nigamana: (s) => ({ ...s, winner: "earlier" }),
    udaharana: { input: { winner: null }, output: { winner: "earlier" } },
  });
  engine.define({
    name: "later-equal",
    adhikara: "para-demo",
    specificity: 1,
    hetu: (s) => s.winner === null,
    nigamana: (s) => ({ ...s, winner: "later" }),
    udaharana: { input: { winner: null }, output: { winner: "later" } },
  });
  const result = engine.run({ winner: null }, "para-demo", 3);
  return result.state.winner;
}

module.exports = {
  TRANSLATIONS,
  loadSlice,
  expand,
  surfaceOnly,
  expandedTerms,
  buildSandhiEngine,
  join,
  paraSelfCheck,
  buildMetaEngine,
};
