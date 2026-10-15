const assert = require("node:assert/strict");
const { convertSlice, buildOperational, join, FIXTURE, parsePadaccheda } = require("./convert");

const { sutras, steps, licenses } = convertSlice(FIXTURE);
const byId = new Map(sutras.map((s) => [s.id, s]));

assert.equal(licenses["1.1.49"], "षष्ठी स्थानेयोगा");
assert.equal(licenses["1.1.66"], "तस्मिन्निति निर्दिष्टे पूर्वस्य");
assert.equal(licenses["1.1.67"], "तस्मादित्युत्तरस्य");
assert.equal(licenses["1.4.2"], "विप्रतिषेधे परं कार्यम्");

const p77 = byId.get("6.1.77").padas;
assert.equal(p77.find((p) => p.term === "इकः").role, "sthana");
assert.equal(p77.find((p) => p.term === "इकः").license, "1.1.49");
assert.equal(p77.find((p) => p.term === "अचि").role, "on_preceding");
assert.equal(p77.find((p) => p.term === "अचि").license, "1.1.66");
assert.equal(p77.find((p) => p.term === "यण्").role, "nominative_unresolved");

const p87 = byId.get("6.1.87").padas;
assert.equal(p87.find((p) => p.term === "आत्").role, "on_following");
assert.equal(p87.find((p) => p.term === "आत्").license, "1.1.67");

assert.deepEqual(parsePadaccheda(byId.get("1.1.1").padaccheda).map((p) => p.term), ["वृद्धिः", "आत्-ऐच्"]);
assert.deepEqual(byId.get("1.1.1").resolved.find((r) => r.term === "ऐच्").value, ["ai", "au"]);
assert.deepEqual(byId.get("6.1.77").resolved.find((r) => r.term === "इकः").value, ["i", "u", "R", "L"]);

const k24 = byId.get("1.4.24").inherited.find((h) => h.term === "कारके");
assert.equal(k24.via, "adhikara");
assert.equal(k24.verification, "gloss_confirms");
assert.equal(k24.executable, true);
assert.equal(byId.get("1.4.24").anuvrtti_field.length, 0);

const k54 = byId.get("1.4.54").inherited.find((h) => h.term === "कारके");
assert.equal(k54.verification, "unconfirmed");
assert.equal(k54.executable, false);

assert.equal(byId.get("2.3.2").inherited.length, 0);
assert.equal(byId.get("3.1.2").inherited.some((h) => h.term === "प्रत्ययः"), false);

const g84 = byId.get("7.3.84").inherited.find((h) => h.term === "गुणः");
assert.equal(g84.via, "anuvrtti");
assert.equal(g84.verification, "source_annotation");
assert.equal(byId.get("7.3.84").inherited.some((h) => h.term === "अङ्गस्य"), false);

const svam = byId.get("1.1.71").inherited.find((h) => h.term === "स्वम्");
assert.equal(svam.source_has_term, false);
assert.equal(svam.verification, "source_annotation");

const e87 = byId.get("6.1.87").inherited.find((h) => h.term === "एकः");
assert.equal(e87.verification, "gloss_confirms");
assert.equal(e87.executable, true);
assert.equal(byId.get("6.1.87").anuvrtti_field.some((a) => a.term === "एकः"), false);

const engine = buildOperational(sutras);
assert.equal(join(engine, "nadii", "aa").form, "nadyaa");
assert.equal(join(engine, "upa", "indra").form, "upendra");
assert.equal(join(engine, "vidyaa", "aalaya").form, "vidyaalaya");
assert.equal(join(engine, "daNDa", "agra").rule, "6.1.101");

const blocked = sutras.map((s) => s.id === "6.1.87" ? { ...s, gloss: null, inherited: s.inherited.map((h) => h.via === "ekadesha_proposal" ? { ...h, verification: "unconfirmed", executable: false } : h) } : s);
assert.throws(() => buildOperational(blocked), /6\.1\.87 ekadesha not verified/);

console.log(JSON.stringify({
  sutras: sutras.length,
  steps,
  licenses,
  refused: ["3.1.2 pratyayah not propagated: nominative heading is not a structural adhikara", "1.4.54 karake unconfirmed", "7.3.84 angasya not invented", "2.3.2 unchanged"],
  applications: {
    nadyaa: join(engine, "nadii", "aa"),
    upendra: join(engine, "upa", "indra"),
    vidyalaya: join(engine, "vidyaa", "aalaya"),
  },
}, null, 2));
console.log("CONVERT PASS");
