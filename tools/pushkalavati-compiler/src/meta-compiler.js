/**
 * Pushkalāvatī meta-compiler inventory and dispatch contract.
 *
 * This module does not infer grammatical semantics from Sanskrit text. It
 * converts explicit corpus type annotations into typed meta-rule candidates,
 * then assigns each candidate a conservative interpreter contract. Only
 * source-annotated facts are operationalized; semantic candidates remain
 * review-gated until their conditions and effects are explicitly specified.
 */

export const META_TYPES = Object.freeze({
  samjna: {
    kind: "DEFINITION",
    effect: "declare_term_candidate",
    executable: false,
    requirement: "explicit_definition_binding",
  },
  paribhasha: {
    kind: "INTERPRETATION_POLICY",
    effect: "register_policy_candidate",
    executable: false,
    requirement: "formal_policy_and_scope",
  },
  atidesha: {
    kind: "PROPERTY_TRANSFER",
    effect: "register_transfer_candidate",
    executable: false,
    requirement: "typed_source_target_and_context",
  },
});

export const META_OPERATORS = Object.freeze([
  { id: "MC001", name: "SOURCE_RECORD", contract: "Preserve canonical source ID, text, type, and gloss without rewriting them." },
  { id: "MC002", name: "TYPE_DISPATCH", contract: "Dispatch only on explicit corpus type values; unknown or absent types remain unresolved." },
  { id: "MC003", name: "DEFINE_TERM_CANDIDATE", contract: "Represent saṃjñā as a definition candidate; do not guess a definiens from token order." },
  { id: "MC004", name: "REGISTER_POLICY_CANDIDATE", contract: "Represent paribhāṣā as interpreter policy, not as a string rewrite." },
  { id: "MC005", name: "REGISTER_TRANSFER_CANDIDATE", contract: "Represent atideśa as a typed transfer candidate; never apply without source, target, and context." },
  { id: "MC006", name: "SOURCE_ANUVRTTI", contract: "Import only anuvṛtti edges explicitly annotated in the source record." },
  { id: "MC007", name: "FIXED_POINT_INHERITANCE", contract: "Propagate explicit anuvṛtti facts monotonically, preserving origin and derivation chain." },
  { id: "MC008", name: "ADHIKARA_CANDIDATE", contract: "Expose inferred scope boundaries for review; do not activate them from locative morphology alone." },
  { id: "MC009", name: "PRATYAHARA_EXPANSION", contract: "Use the position-aware Śivasūtra stream and exclude it-markers from members." },
  { id: "MC010", name: "SAVARNA_EXPANSION", contract: "Expand savarṇa only where the consuming rule licenses it; keep phoneme identity distinct." },
  { id: "MC011", name: "RULE_APPLICABILITY", contract: "Evaluate explicit preconditions before evaluating an operation." },
  { id: "MC012", name: "RULE_EFFECT", contract: "Apply only a fully specified operation; missing maps or semantics yield UNRESOLVED." },
  { id: "MC013", name: "RULE_CONFLICT", contract: "Do not impose global later-rule-wins; require explicit domain, applicability, and conflict relation." },
  { id: "MC014", name: "PROVENANCE", contract: "Every derived fact and applied operation retains source IDs and derivation evidence." },
  { id: "MC015", name: "STATUS_GATING", contract: "Keep candidates distinct from executable-tested rules; serialization never counts as execution." },
  { id: "MC016", name: "DIAGNOSTIC_RESULT", contract: "Return APPLIED, NOT_APPLICABLE, UNRESOLVED, or ERROR; never silently substitute a default." },
  { id: "MC017", name: "DETERMINISTIC_ORDER", contract: "Use canonical source order and explicit ordering constraints, never arbitrary set iteration." },
  { id: "MC018", name: "ROUND_TERMINATION", contract: "Stop fixed-point expansion when a round adds no new provenance-distinct facts, or report limit exhaustion." },
]);

function numericId(id) { return String(id).split(".").map((x) => Number.parseInt(x, 10)); }
function compareIds(a, b) {
  const aa = numericId(a), bb = numericId(b);
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
    const d = (aa[i] ?? 0) - (bb[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

export function buildMetaCompilerCatalog(rows) {
  const seen = new Set();
  for (const row of rows) {
    if (!row || typeof row.id !== "string" || !row.id) throw new Error("Every source record requires a non-empty canonical id");
    if (seen.has(row.id)) throw new Error(`Duplicate canonical source id: ${row.id}`);
    seen.add(row.id);
  }

  const records = rows
    .filter((row) => Object.hasOwn(META_TYPES, row.type))
    .slice()
    .sort((a, b) => compareIds(a.id, b.id))
    .map((row) => {
      const spec = META_TYPES[row.type];
      return {
        id: row.id,
        source_type: row.type,
        kind: spec.kind,
        proposed_effect: spec.effect,
        source: {
          term: row.term ?? null,
          sutra: row.sutra ?? null,
          padaccheda: row.padaccheda ?? null,
          gloss: row.gloss ?? null,
          anuvrtti: (row.anuvrtti ?? []).map((edge) => ({ term: edge.term, from: edge.from })),
        },
        lifecycle: "CANDIDATE_REVIEW_REQUIRED",
        executable: false,
        missing_requirements: [spec.requirement],
        provenance: { dataset: "data/sutras.json", source_id: row.id, source_type_is_explicit: true },
      };
    });

  const byType = {};
  for (const record of records) byType[record.source_type] = (byType[record.source_type] || 0) + 1;
  const byChapter = {};
  for (const record of records) {
    const chapter = record.id.split(".")[0];
    byChapter[chapter] = (byChapter[chapter] || 0) + 1;
  }
  const firstFourAdhyayas = records.filter((record) => Number(record.id.split(".")[0]) === 1);

  return {
    schema: "pushkalavati.meta-compiler-catalog/1",
    source_record_count: rows.length,
    candidate_count: records.length,
    candidate_counts_by_type: byType,
    candidate_counts_by_adhyaya: byChapter,
    first_adhyaya_candidate_count: firstFourAdhyayas.length,
    operators: META_OPERATORS,
    lifecycle_contract: {
      candidate: "Source has an explicit meta-type; its semantics have not thereby been implemented.",
      executable: "Only a formally specified operation with positive and negative attested tests may be promoted.",
      forbidden: ["infer semantics from gloss alone", "promote by serialization", "silent fallback", "unproven adhikara inheritance"],
    },
    records,
  };
}
