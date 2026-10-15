import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { compileAll, progress } from "../src/compile.js";
import { expandToFixedPoint } from "../src/meta.js";
import { applyRule, applyMorphRule, applySandhiRule, inClass } from "../src/execute.js";
import { buildMetaCompilerCatalog, META_OPERATORS } from "../src/meta-compiler.js";
import { executeMetaRule, EXECUTABLE_META_RULES } from "../src/meta-runtime.js";
import { analyzeInverseReduction, tokenizeDevanagari, INVERSE_REDUCTION_RULE_FAMILIES } from "../src/inverse-reduction.js";
import { auditRomenagriCoverage, mapSoundsToRomenagriTableKeys, tokenizeSanskritSounds, executeOnRomenagriSubstrate } from "../src/romenagri.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ir = await compileAll(path.join(root, "data", "sutras.json"));
const byId = Object.fromEntries(ir.map((row) => [row.id, row]));

// Romenagri substrate: sound tokenization is separate from legacy display bytes.
const romenagriAudit = auditRomenagriCoverage();
assert.equal(romenagriAudit.declared_source_table_length, 84);
assert.ok(romenagriAudit.unsupported_sanskrit_sounds.includes("chh"), "declared but unmapped chh must be reported explicitly");
assert.ok(romenagriAudit.known_legacy_questions.some((x) => x.includes("no dependent sign for inherent अ")));
assert.equal(Object.hasOwn(romenagriAudit, "known_legacy_hazards"), false, "empty ^a alone is not a proven runtime defect");
assert.equal(romenagriAudit.mapping_status, "sound-token substrate plus per-sound table-key audit; not word encoding or byte-for-byte C compatibility");
assert.deepEqual(tokenizeSanskritSounds("pra").tokens, ["p", "r", "a"]);
assert.deepEqual(tokenizeSanskritSounds("ai").tokens, ["ai"], "diphthongs are atomic tokens");
assert.equal(mapSoundsToRomenagriTableKeys("pra").status, "APPLIED");
assert.equal(mapSoundsToRomenagriTableKeys("ṝ").status, "UNRESOLVED", "unsupported legacy-table phoneme must not be approximated");
assert.equal(tokenizeSanskritSounds("p🙂").status, "UNRESOLVED");
const substrateRule = executeOnRomenagriSubstrate("pra", "ejate", (left, right) => ({
  output_tokens: [...left.slice(0, -1), ...right], rule: "test", trace: "token splice"
}));
assert.equal(substrateRule.status, "APPLIED");
assert.equal(substrateRule.output, "prejate");
assert.equal(substrateRule.legacy_table_key_audit.status, "APPLIED");

assert.equal(ir.length, 3983);
assert.equal(new Set(ir.map((row) => row.id)).size, 3983);

// Meta-compiler phase: explicit corpus types are catalogued as candidates,
// never falsely promoted to executable semantics by their type alone.
const sourceRows = JSON.parse(await (await import("node:fs/promises")).readFile(path.join(root, "data", "sutras.json"), "utf8"));
const metaCatalog = buildMetaCompilerCatalog(sourceRows);
assert.equal(metaCatalog.source_record_count, 3983);
assert.equal(metaCatalog.candidate_count, 290);
assert.deepEqual(metaCatalog.candidate_counts_by_type, { samjna: 200, paribhasha: 23, atidesha: 67 });
assert.equal(metaCatalog.first_adhyaya_candidate_count, 222, "adhyaya 1 contains 222 explicitly typed meta candidates across its four padas");
assert.equal(metaCatalog.operators.length, 18);
assert.equal(META_OPERATORS.length, 18);
assert.ok(metaCatalog.records.every((r) => r.lifecycle === "CANDIDATE_REVIEW_REQUIRED" && r.executable === false));
assert.equal(metaCatalog.records.find((r) => r.id === "1.1.1").kind, "DEFINITION");
assert.equal(metaCatalog.records.find((r) => r.id === "1.1.3").kind, "INTERPRETATION_POLICY");
assert.equal(metaCatalog.records.find((r) => r.id === "1.1.56").kind, "PROPERTY_TRANSFER");
assert.throws(() => buildMetaCompilerCatalog([sourceRows[0], sourceRows[0]]), /Duplicate canonical source id/);

// Executable meta-rule handlers are tracked separately from surface vidhi rules.
assert.deepEqual(EXECUTABLE_META_RULES.map((r) => r.id), ["1.1.7", "1.1.71"]);
assert.deepEqual(executeMetaRule("1.1.7", { text: "kṣetra" }).clusters, [["k", "ṣ"], ["t", "r"]]);
assert.equal(executeMetaRule("1.1.7", { text: "rama" }).hasSamyoga, false);
assert.equal(executeMetaRule("1.1.7", { text: "kṣetra" }).status, "APPLIED");
assert.equal(executeMetaRule("1.1.7", { text: "abc🙂" }).status, "UNRESOLVED");
assert.deepEqual(executeMetaRule("1.1.71", { name: "ik" }).members, ["i", "u", "ṛ", "ḷ"]);
assert.deepEqual(executeMetaRule("1.1.71", { name: "ac" }).members, ["a", "i", "u", "ṛ", "ḷ", "e", "o", "ai", "au"]);
assert.equal(executeMetaRule("1.1.71", { name: "zz" }).status, "UNRESOLVED");
assert.equal(executeMetaRule("1.1.49", {}).status, "UNRESOLVED", "unimplemented meta-rules must not silently fall back");

// Native-script inverse-reduction vertical slice. This is a candidate generator,
// not a claim that the full form or morphology has been resolved.
assert.equal(tokenizeDevanagari("उपेन्द्रो").status, "APPLIED");
assert.deepEqual(INVERSE_REDUCTION_RULE_FAMILIES.map((x) => x.rule), ["6.1.87", "6.1.88"]);
const upendro = analyzeInverseReduction("उपेन्द्रो");
assert.equal(upendro.status, "UNRESOLVED", "suffix morphology must not be silently fabricated");
assert.equal(upendro.prefix, "उप");
assert.deepEqual(upendro.candidates.map((x) => x.stem_surface_candidate), ["इन्द्रो", "ईन्द्रो"]);
assert.ok(upendro.trace.some((x) => x.step === "INVERSE_SANDHI" && x.rule === "6.1.87"));
assert.ok(upendro.trace.some((x) => x.step === "MORPHOLOGICAL_REDUCTION" && x.status === "UNRESOLVED"));
assert.equal(analyzeInverseReduction("किताब").status, "NO_MATCH", "no prefix fallback is permitted");
assert.equal(analyzeInverseReduction("उपकर्म").status, "UNRESOLVED", "unsupported boundary is explicit");
assert.equal(analyzeInverseReduction("उपैन्द्र").candidates[0]?.stem_surface_candidate, "एन्द्र");
assert.equal(analyzeInverseReduction("उपौषध").candidates[0]?.stem_surface_candidate, "ओषध");
assert.equal(analyzeInverseReduction("उपेन्द्रो", { lexicon: new Set(["इन्द्रो"]) }).candidates[0].lexical_status, "MATCH");
assert.equal(analyzeInverseReduction("उपेन्द्रो", { lexicon: new Set(["इन्द्र"]) }).candidates[0].lexical_status, "NO_MATCH", "the parser does not strip endings without a licensed morphology rule");

// Functional categories are loaded from data/meta-grammar.json, not hard-coded
// as a pipeline. Per-sūtra operation specs and vectors are loaded from data/operations.json.
assert.equal(ir.functionalClassification.source_records, 3983);
assert.equal(ir.functionalClassification.rule_count, JSON.parse(await (await import("node:fs/promises")).readFile(path.join(root, "data", "meta-grammar.json"), "utf8")).classification_rules.length);
assert.ok(ir.every((row) => Array.isArray(row.functional_classification.functional_categories)));
assert.ok(ir.functionalClassification.category_counts.define > 0);
assert.ok(ir.functionalClassification.category_counts.interpret > 0);
assert.ok(ir.functionalClassification.category_counts.transfer > 0);
assert.ok(ir.functionalClassification.multi_classified_records > 0, "categories overlap; they are not execution phases");
assert.ok(ir.functionalClassification.unclassified_records > 0, "uncertain records remain unclassified rather than forced into a category");

// Batch meta-cycle: source-annotated anuvṛtti is expanded to a fixed point.
const meta = ir.metaExpansion;
assert.equal(meta.converged, true, "meta-expansion must reach a fixed point");
assert.ok(meta.rounds > 1, "meta-expansion must iterate, not perform a single pass");
assert.ok(meta.total_expanded_facts > 10000, "the batch closure should expand across the corpus");
assert.ok(meta.records_with_non_surface_terms > 1000, "transitive terms should become visible in dependent sūtras");
assert.equal(meta.unresolved_edges.length, 0, "all source-annotated anuvṛtti references should resolve");
assert.ok(meta.adhikara_candidates.length > 0, "structural adhikāra candidates should be surfaced for review");
assert.equal(meta.records.find((r) => r.id === "1.1.4").facts.some((f) => f.term === "वृद्धिः" && f.origin === "1.1.1" && f.via === "transitive_anuvrtti_expansion"), true, "transitive source term must preserve origin and expansion path");
assert.equal(meta.records.find((r) => r.id === "1.1.4").facts.some((f) => f.via === "adhikara_scope_candidate"), false, "unconfirmed adhikāra candidates must not be silently applied");
const secondPass = expandToFixedPoint(JSON.parse(await (await import("node:fs/promises")).readFile(path.join(root, "data", "sutras.json"), "utf8")));
assert.equal(secondPass.converged, true);
assert.equal(secondPass.total_expanded_facts, meta.total_expanded_facts, "fixed-point output must be deterministic");

assert.deepEqual(byId["1.1.1"].operation.class.members.sort(), ["ai", "au", "ā"]);
assert.equal(inClass("ā", byId["1.1.1"]), true);
assert.equal(inClass("a", byId["1.1.1"]), false);
assert.deepEqual(byId["1.1.2"].operation.class.members.sort(), ["a", "e", "o"]);
// Regression guard: ā-t is resolved as the t-it vowel name ā, not pratyāhāra at.
assert.deepEqual(byId["6.1.45"].classes["आत्"].members, ["ā"]);

for (const row of ir.filter((r) => r.status === "executable_tested")) {
  const op = row.operation;
  assert.ok(Array.isArray(op.examples) && op.examples.length > 0, `${row.id} needs test vectors`);
  assert.ok(op.source || op.note?.includes("Attested"), `${row.id} needs provenance metadata`);
}

// Regression guard informed by the Gemini audit: these are separate rules,
// with distinct input classes and output maps. Do not collapse 6.1.77 into 6.1.78.
assert.deepEqual(byId["6.1.77"].operation.map, {
  i: "y", "ī": "y", u: "v", "ū": "v", "ṛ": "r", "ṝ": "r", "ḷ": "l",
});
assert.equal(byId["6.1.77"].operation.mode, "replace_left");
assert.equal(byId["6.1.78"].operation.mode, "ec_to_ayavayav_before_vowel");
assert.deepEqual(byId["6.1.78"].operation.examples.map((x) => x.expected), [
  "cayanam", "lavanam", "cāyaka", "lāvaka",
]);
assert.equal(byId["6.1.78"].operation.map, undefined,
  "6.1.78 uses its context-bearing executor, not the 6.1.77 replacement map");

for (const id of ["6.1.77", "6.1.87", "6.1.88", "6.1.101"]) {
  const rule = byId[id];
  assert.equal(rule.status, "executable_tested");
  for (const [left, right, expected] of rule.operation.examples) {
    const result = applyRule(left, right, rule);
    assert.equal(result?.output, expected, `${id} ${left}+${right}`);
  }
}

const sandhiCases = [
  ["6.1.78", "ce", "anam", { vowel_following: true, pada_final: false }, "cayanam"],
  ["6.1.78", "lo", "anam", { vowel_following: true, pada_final: false }, "lavanam"],
  ["6.1.78", "cai", "aka", { vowel_following: true, pada_final: false }, "cāyaka"],
  ["6.1.78", "lau", "aka", { vowel_following: true, pada_final: false }, "lāvaka"],
  ["6.1.109", "agne", "atra", { pada_final: true, following_short_a: true }, "agneऽtra"],
  ["6.1.109", "vāyo", "atra", { pada_final: true, following_short_a: true }, "vāyoऽtra"],
  ["6.1.94", "pra", "ejate", { upasarga: true, dhatu: true }, "prejate"],
  ["6.1.94", "parā", "ejate", { upasarga: true, dhatu: true }, "parejate"],
  ["6.1.94", "upa", "oṣati", { upasarga: true, dhatu: true }, "upoṣati"],
  ["6.1.94", "pra", "oṣati", { upasarga: true, dhatu: true }, "proṣati"],
  ["6.1.66", "kay", "ta", { val_following: true }, "kata"],
  ["8.3.15", "devar", "", { avasana_or_khar: true }, "devaḥ"],
  ["8.3.34", "agniḥ", "ca", { khar_following: true }, "agnis"],
  ["8.3.23", "ramam", "gacchati", { hal_following: true }, "ramaṃgacchati"],
  ["8.4.55", "vag", "ka", { khar_following: true }, "vakka"],
  ["8.4.58", "ramaṃ", "gacchati", { yay_following: true, class_nasal: "ṅ" }, "ramaṅgacchati"],
  ["8.4.40", "agnis", "ca", { scu_following: true }, "agniśca"],
  ["8.4.41", "agnis", "ṭa", { stu_following: true }, "agniṣṭa"],
];
for (const [id, left, right, context, expected] of sandhiCases) {
  const result = applySandhiRule(left, right, context, byId[id]);
  assert.equal(result?.output, expected, `${id} ${left}+${right}`);
}
assert.equal(applySandhiRule("hare", "atra", { vowel_following: true, pada_final: true, following_short_a: true }, byId["6.1.78"]), null, "6.1.109 must block 6.1.78 in its exception context");
assert.equal(applySandhiRule("hare", "atra", { pada_final: false, following_short_a: true }, byId["6.1.109"]), null, "6.1.109 requires pada-final e/o");
assert.equal(applySandhiRule("hare", "iti", { pada_final: true, following_short_a: false }, byId["6.1.109"]), null, "6.1.109 requires following short a");
assert.equal(applySandhiRule("ka", "tra", { vowel_following: true, pada_final: false }, byId["6.1.78"]), null, "6.1.78 must not replace non-ec endings");
assert.equal(applySandhiRule("pra", "ejate", { upasarga: false, dhatu: true }, byId["6.1.94"]), null, "6.1.94 requires an upasarga");
assert.equal(applySandhiRule("pra", "ejate", { upasarga: true, dhatu: false }, byId["6.1.94"]), null, "6.1.94 requires a following dhātu");
assert.equal(applySandhiRule("kā", "ejate", { upasarga: false, dhatu: true }, byId["6.1.94"]), null, "6.1.94 must not apply without licensed upasarga context");
assert.equal(applySandhiRule("pra", "ait", { upasarga: true, dhatu: true }, byId["6.1.94"]), null, "6.1.94 targets e/o-initial dhātus, not ai/au");
assert.equal(applySandhiRule("deva", "", { avasana_or_khar: true }, byId["8.3.15"]), null, "8.3.15 requires final r");
assert.equal(applySandhiRule("agniḥ", "a", { khar_following: false }, byId["8.3.34"]), null, "8.3.34 requires khar");
assert.equal(applySandhiRule("agniḥ", "ca", { scu_following: true }, byId["8.4.40"]), null, "8.4.40 does not accept visarga; 8.3.34 must run first");
const step34 = applySandhiRule("agniḥ", "ca", { khar_following: true }, byId["8.3.34"]);
const step40 = applySandhiRule(step34.output, "ca", { scu_following: true }, byId["8.4.40"]);
assert.equal(step34.output, "agnis");
assert.equal(step34.rule, "8.3.34");
assert.equal(step40.output, "agniśca");
assert.equal(step40.rule, "8.4.40");

const morphCases = [
  ["6.1.45", "glai", { upadesha_dhatu: true, following_affix_shit: false }, "glā"],
  ["6.1.45", "śo", { upadesha_dhatu: true, following_affix_shit: false }, "śā"],
  ["6.1.131", "div", { pada: true }, "diu"],
  ["6.4.81", "i", { root: "iṇ", vowel_initial_affix: true, affix: "anti" }, "yanti"],
  ["6.4.110", "vidāṅkaru", { root: "kṛ", u_pratyaya: true, sarvadhatuka: true, kṅit: true, affix: "tām" }, "vidāṅkurutām"],
  ["7.1.86", "supathin", { strong_case: true, sarvanamasthana: true }, "supathan"],
];
for (const [id, input, context, expected] of morphCases) {
  const result = applyMorphRule(input, context, byId[id]);
  assert.equal(result?.output, expected, `${id} ${input}`);
}
// Applicability must be tested, not merely successful happy paths.
assert.equal(applyMorphRule("glai", { upadesha_dhatu: true, following_affix_shit: true }, byId["6.1.45"]), null);
assert.equal(applyMorphRule("div", { pada: false }, byId["6.1.131"]), null);
assert.equal(applyMorphRule("i", { root: "iṇ", vowel_initial_affix: false, affix: "ta" }, byId["6.4.81"]), null);
assert.equal(applyMorphRule("vidāṅkaru", { root: "kṛ", u_pratyaya: true, sarvadhatuka: true, kṅit: false, affix: "tām" }, byId["6.4.110"]), null);
assert.equal(applyMorphRule("supathin", { strong_case: false, sarvanamasthana: true }, byId["7.1.86"]), null);

const report = progress(ir);
assert.equal(report.counts.executable_tested, 24);
assert.equal(report.counts.derivable_untested, 3);
assert.ok(report.counts.needs_semantic_annotation > 3000);
console.log(JSON.stringify(report, null, 2));
console.log("compiler tests passed");
