import { readFile } from "node:fs/promises";

/** Data-driven functional classification. Rules and category meanings live in data/meta-grammar.json. */
export function classifyBatch(rows, grammar) {
  const categoryIds = new Set(grammar.categories.map((c) => c.id));
  const classified = rows.map((row) => {
    const labels = new Map();
    for (const rule of grammar.classification_rules) {
      if (!matches(row, rule.when || {})) continue;
      if (!categoryIds.has(rule.category)) throw new Error(`Unknown category ${rule.category} in ${rule.id}`);
      if (!labels.has(rule.category)) labels.set(rule.category, []);
      labels.get(rule.category).push({
        rule_id: rule.id,
        evidence: rule.evidence,
        confidence: rule.confidence,
      });
    }
    const functionalCategories = [...labels.keys()];
    const status = functionalCategories.length === 0 ? "unclassified"
      : functionalCategories.length > 1 ? "multi_classified" : "classified";
    return {
      id: row.id,
      functional_categories: functionalCategories,
      status,
      evidence: Object.fromEntries(labels),
      note: "Table-driven candidate classification; lexical matches are hypotheses, not validated grammatical semantics.",
    };
  });
  const counts = Object.fromEntries(grammar.categories.map((c) => [c.id, 0]));
  for (const row of classified) for (const category of row.functional_categories) counts[category]++;
  return {
    schema: "pushkalavati.functional-classification/1",
    method: "data-driven matching against meta-grammar.json; multi-label; non-exclusive; no execution ordering implied",
    source_records: rows.length,
    classified_records: classified.filter((r) => r.status === "classified").length,
    multi_classified_records: classified.filter((r) => r.status === "multi_classified").length,
    unclassified_records: classified.filter((r) => r.status === "unclassified").length,
    category_counts: counts,
    rule_count: grammar.classification_rules.length,
    records: classified,
  };
}

function matches(row, when) {
  if (when.type && !when.type.includes(row.type)) return false;
  if (when.sutraContains && !when.sutraContains.some((x) => (row.sutra || "").includes(x))) return false;
  if (when.glossContains && !when.glossContains.some((x) => (row.gloss || "").includes(x))) return false;
  if (when.padacchedaVibhakti && !(row.padaccheda || "").match(/(\S+)\s+([०-९]+)\/([०-९]+)/)) return false;
  if (when.padacchedaVibhakti) {
    const matches = [...(row.padaccheda || "").matchAll(/(\S+)\s+([०-९]+)\/([०-९]+)/g)];
    if (!matches.some((m) => when.padacchedaVibhakti.includes(Number(m[2].replace(/[०-९]/g, d => "०१२३४५६७८९".indexOf(d)))))) return false;
  }
  if (when.hasAnuvrtti === true && !(row.anuvrtti || []).length) return false;
  return true;
}

export async function loadMetaGrammar(path) {
  return JSON.parse(await readFile(path, "utf8"));
}
