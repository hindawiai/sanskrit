/**
 * Real content, not a toy example: 1.1.1 and 1.1.2 from this project's own
 * verified data/sutras.json, encoded as Sutram rules, classifying a vowel.
 *   1.1.1 वृद्धिरादैच् -- vrddhi = the pratyahara "aiC" off "a" = {a, ai, au}
 *   1.1.2 अदेङ् गुणः   -- guna  = the pratyahara "eN" off "a"  = {a, e, o}
 * (padaccheda for both verified against two independent sources earlier
 * in this project -- see data/cross_source_diffs.json, where these two
 * entries have zero disagreement between sources.)
 */
const { Engine } = require("./engine");

const engine = new Engine();

engine.define({
  name: "1.1.1 vrddhi-samjna",
  adhikara: "classify",
  hetu: (v) => ["a", "ai", "au"].includes(v),
  nigamana: (v) => ({ vowel: v, class: "vrddhi" }),
  specificity: 1, // apavada: fires before the catch-all below
  udaharana: { input: "ai", output: { vowel: "ai", class: "vrddhi" } },
});

engine.define({
  name: "1.1.2 guna-samjna",
  adhikara: "classify",
  hetu: (v) => ["a", "e", "o"].includes(v),
  nigamana: (v) => ({ vowel: v, class: "guna" }),
  specificity: 1,
  udaharana: { input: "e", output: { vowel: "e", class: "guna" } },
});

engine.define({
  name: "neither (utsarga / general case)",
  adhikara: "classify",
  hetu: (v) => typeof v === "string",
  nigamana: (v) => ({ vowel: v, class: "neither" }),
  specificity: 0, // utsarga: only fires when no apavada above matched
  udaharana: { input: "i", output: { vowel: "i", class: "neither" } },
});

for (const v of ["ai", "e", "i", "a"]) {
  const { state } = engine.run(v, "classify");
  console.log(`${v} -> ${state.class}`);
}
// "a" is in BOTH 1.1.1's set and 1.1.2's set -- real ambiguity Panini
// resolves elsewhere (1.1.1 is cited as overriding for exactly this
// overlap). Both rules here share specificity 1, so para (later-registered
// wins) decides -- worth knowing which rule actually fired:
console.log('"a" resolved via:', engine.step("a", "classify").rule);

// Prove the udaharana check is real, not decorative: this must throw.
try {
  engine.define({
    name: "broken rule",
    adhikara: "classify",
    hetu: () => true,
    nigamana: (v) => ({ vowel: v, class: "WRONG" }),
    udaharana: { input: "x", output: { vowel: "x", class: "RIGHT" } },
  });
  console.log("FAIL: bad rule was accepted");
} catch (e) {
  console.log("Correctly rejected a rule whose own example fails:", e.message);
}
