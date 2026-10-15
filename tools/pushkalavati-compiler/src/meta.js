/**
 * Pushkalāvatī fixed-point meta-expansion.
 *
 * This layer expands recorded anuvṛtti references and bounded adhikāra scopes.
 * It deliberately does not infer a sūtra's grammatical semantics from its gloss.
 * Each derived fact retains a source sūtra and an explicit derivation chain.
 */
import { parsePadas } from "./text.js";

const numericId = (id) => id.split(".").map(Number);
const compareId = (a, b) => {
  const aa = numericId(a), bb = numericId(b);
  for (let i = 0; i < Math.max(aa.length, bb.length); i++) {
    const d = (aa[i] || 0) - (bb[i] || 0);
    if (d) return d;
  }
  return 0;
};
const idBefore = (a, b) => compareId(a, b) < 0;
const keyOf = (f) => `${f.term}\u0000${f.origin}\u0000${f.via}\u0000${f.chain.join(">")}`;

function findAdhikaraHeads(rows) {
  return rows.map((row) => {
    const padas = parsePadas(row.padaccheda);
    const heads = padas.filter((p) => p.vibhakti === 7);
    // Only an unambiguous locative head is admitted. Ambiguous multi-locative
    // sūtras are not silently converted into scope declarations.
    if (heads.length !== 1) return null;
    return { id: row.id, term: heads[0].term, source: "padaccheda", confidence: "structural_candidate" };
  }).filter(Boolean);
}

function directFacts(rows) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const heads = findAdhikaraHeads(rows);
  const facts = new Map(rows.map((r) => [r.id, []]));
  const unresolved = [];
  const adhikaraCandidates = [];
  for (const row of rows) {
    for (const item of row.anuvrtti || []) {
      if (!byId.has(item.from)) {
        unresolved.push({ row: row.id, term: item.term, from: item.from, reason: "missing_source_record" });
        continue;
      }
      facts.get(row.id).push({
        term: item.term, origin: item.from, via: "anuvrtti_reference",
        confidence: "source_annotation", chain: [item.from, row.id],
      });
    }
  }
  // Each unambiguous locative head scopes forward to (but not including) the
  // next unambiguous locative head in the ordered source inventory.
  for (let i = 0; i < heads.length; i++) {
    const head = heads[i], next = heads[i + 1];
    for (const row of rows) {
      if (!idBefore(head.id, row.id) || (next && !idBefore(row.id, next.id))) continue;
      adhikaraCandidates.push({
        head_id: head.id, target_id: row.id, term: head.term,
        confidence: "structural_candidate_not_semantically_confirmed",
        note: "Not applied to executable inheritance without an explicit adhikāra annotation."
      });
    }
  }
  return { facts, heads, unresolved, adhikaraCandidates };
}

/** Run monotone rule expansion until no new provenance-distinct facts appear. */
export function expandToFixedPoint(rows, { maxRounds = 100 } = {}) {
  const { facts, heads, unresolved, adhikaraCandidates } = directFacts(rows);
  const byId = new Map(rows.map((r) => [r.id, r]));
  const known = new Map();
  for (const [id, list] of facts) known.set(id, new Set(list.map(keyOf)));
  const rounds = [];
  let converged = false;

  for (let round = 1; round <= maxRounds; round++) {
    const additions = [];
    // Snapshot semantics: every round reads the prior fixed-point frontier.
    const prior = new Map([...facts].map(([id, list]) => [id, list.slice()]));
    for (const row of rows) {
      const target = facts.get(row.id);
      for (const edge of row.anuvrtti || []) {
        if (!byId.has(edge.from)) continue;
        for (const upstream of prior.get(edge.from) || []) {
          // A provenance chain cannot revisit a record; this prevents cycles.
          if (upstream.chain.includes(row.id)) continue;
          const fact = {
            term: upstream.term,
            origin: upstream.origin,
            via: "transitive_anuvrtti_expansion",
            confidence: upstream.confidence,
            chain: [...upstream.chain, row.id],
            expanded_through: edge.from,
          };
          const key = keyOf(fact);
          if (!known.get(row.id).has(key)) {
            known.get(row.id).add(key); additions.push({ id: row.id, fact });
          }
        }
      }
    }
    for (const { id, fact } of additions) facts.get(id).push(fact);
    rounds.push({ round, additions: additions.length, records_changed: new Set(additions.map((x) => x.id)).size });
    if (additions.length === 0) { converged = true; break; }
  }

  const expanded = rows.map((row) => {
    const list = facts.get(row.id) || [];
    const byTerm = new Map();
    for (const f of list) {
      if (!byTerm.has(f.term)) byTerm.set(f.term, []);
      byTerm.get(f.term).push(f);
    }
    return {
      id: row.id,
      explicit_anuvrtti_count: (row.anuvrtti || []).length,
      expanded_fact_count: list.length,
      expanded_terms: [...byTerm.keys()],
      facts: list,
      newly_exposed_terms: [...byTerm.keys()].filter((term) => !(row.anuvrtti || []).some((a) => a.term === term)),
    };
  });
  const totalFacts = expanded.reduce((n, r) => n + r.expanded_fact_count, 0);
  const recordsWithExpandedTerms = expanded.filter((r) => r.newly_exposed_terms.length > 0).length;
  return {
    schema: "pushkalavati.meta-expansion/1",
    method: "monotone fixed-point closure over source-annotated anuvṛtti edges; bounded structural adhikāra scope candidates; provenance-preserving",
    converged,
    rounds: rounds.length,
    round_log: rounds,
    source_records: rows.length,
    adhikara_head_candidates: heads.length,
    adhikara_scope_candidates: adhikaraCandidates.length,
    unresolved_edges: unresolved,
    total_expanded_facts: totalFacts,
    records_with_non_surface_terms: recordsWithExpandedTerms,
    caveat: "This computes structural inheritance closure, not a complete interpretation of Paninian meta-rules. Adhikāra candidates remain unconfirmed unless independently validated; expanded terms are not automatically executable operations.",
    adhikara_candidates: adhikaraCandidates,
    records: expanded,
  };
}
