import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { expandPratyahara, withSavarna, TAPARA } from "./shiva.js";
import { parsePadas } from "./text.js";
import { expandToFixedPoint } from "./meta.js";
import { buildMetaCompilerCatalog } from "./meta-compiler.js";
import { classifyBatch, loadMetaGrammar } from "./classify.js";

function classOf(term) {
  const parts = term.split("-").map((part) => part.replace(/ḥ$/, ""));
  const members = [];
  for (const part of parts) {
    if (TAPARA[part.slice(0, -1)] && part.endsWith("t")) {
      members.push(TAPARA[part.slice(0, -1)]);
      continue;
    }
    const expanded = expandPratyahara(part);
    if (!expanded) return null;
    members.push(...withSavarna(expanded));
  }
  return { name: term.replace(/ḥ$/, ""), members: [...new Set(members)], license: "1.1.70/1.1.71+1.1.69" };
}

function idKey(id) {
  return id.split(".").map(Number);
}

export async function compileAll(input) {
  const rows = JSON.parse(await readFile(input, "utf8"));
  const grammarPath = path.join(path.dirname(input), "meta-grammar.json");
  const operationsPath = path.join(path.dirname(input), "operations.json");
  const metaGrammar = await loadMetaGrammar(grammarPath);
  const operations = JSON.parse(await readFile(operationsPath, "utf8"));
  const functionalClassification = classifyBatch(rows, metaGrammar);
  const categoryById = new Map(functionalClassification.records.map((r) => [r.id, r]));
  const metaExpansion = expandToFixedPoint(rows);
  const metaCompilerCatalog = buildMetaCompilerCatalog(rows);
  const metaById = new Map(metaExpansion.records.map((r) => [r.id, r]));
  const ids = new Set(rows.map((r) => r.id));
  const heads = [];
  const parsed = rows.map((row) => {
    const padas = parsePadas(row.padaccheda);
    const head = padas.length === 1 && padas[0].vibhakti === 7 ? padas[0] : null;
    if (head) heads.push({ id: row.id, key: idKey(row.id), term: head.term });
    return { ...row, padas };
  });

  const ir = parsed.map((row) => {
    const inherited = [];
    for (const item of row.anuvrtti || []) {
      inherited.push({ term: item.term, from: item.from, via: "anuvrtti", status: "source_annotation", source_id_exists: ids.has(item.from) });
    }
    for (const head of heads) {
      if (idKey(head.id) < idKey(row.id)) {
        const next = heads.find((h) => idKey(h.id) > idKey(head.id));
        if (!next || idKey(row.id) < idKey(next.id)) {
          const stem = head.term.replace(/[ःमािुूेोौ]$/u, "");
          inherited.push({
            term: head.term,
            from: head.id,
            via: "adhikara",
            status: row.gloss && stem && row.gloss.includes(stem) ? "gloss_confirms" : "inferred_unconfirmed",
          });
        }
      }
    }
    const classes = {};
    for (const pada of row.padas) {
      const cls = classOf(pada.iast);
      if (cls) classes[pada.term] = cls;
    }
    const operation = compileOperation(row, classes, operations);
    const status = classify(row, operation);
    return {
      schema: "pushkalavati.rule-ir/2",
      id: row.id,
      type: row.type || null,
      sutra: row.sutra,
      padaccheda: row.padaccheda,
      gloss: row.gloss || null,
      padas: row.padas,
      inherited,
      meta_expansion: metaById.get(row.id),
      functional_classification: categoryById.get(row.id),
      classes,
      operation,
      status,
      provenance: { source: "data/sutras.json", source_id: row.id },
    };
  });
  ir.metaExpansion = metaExpansion;
  ir.metaCompilerCatalog = metaCompilerCatalog;
  ir.functionalClassification = functionalClassification;
  return ir;
}

function compileOperation(row, classes, operationTables) {
  if (row.type === "samjna" && row.term) {
    const definition = Object.entries(classes).find(([term]) => !term.startsWith(row.term))?.[1] || Object.values(classes)[0];
    return definition
      ? { kind: "definition", term: row.term, class: definition, status: "resolved" }
      : { kind: "definition", term: row.term, status: "needs_semantic_annotation" };
  }
  if (row.type === "paribhasha") return { kind: "meta_rule", status: "interpreter_policy_not_a_rewrite" };
  if (row.type === "atidesha") return { kind: "transfer", status: "needs_semantic_annotation" };
  if (row.type !== "vidhi") return { kind: "unclassified", status: "needs_semantic_annotation" };

  const sandhiAttested = operationTables.SANDHI_ATTESTED[row.id];
  if (sandhiAttested) {
    return { ...sandhiAttested, status: "executable_tested", licenses: [row.id], note: "Context-bearing vowel sandhi; source-linked vectors and negative applicability tests." };
  }

  const morphAttested = operationTables.MORPH_ATTESTED[row.id];
  if (morphAttested) {
    return {
      ...morphAttested,
      status: "executable_tested",
      licenses: [row.id],
      note: "Context-bearing morphological operation; tested against published derivation examples.",
    };
  }

  const attested = operationTables.ATTESTED[row.id];
  if (attested) {
    return {
      kind: "substitution",
      status: "executable_tested",
      mode: attested.mode,
      map: attested.map === "YAN_OF" ? operationTables.maps.YAN_OF : attested.map === "GUNA_OF" ? operationTables.maps.GUNA_OF : attested.map === "VRDDHI_OF" ? operationTables.maps.VRDDHI_OF : attested.map === "DIRGHA_OF" ? operationTables.maps.DIRGHA_OF : attested.map,
      left: attested.left || null,
      examples: attested.examples,
      licenses: ["1.1.49", "1.1.50", "1.1.66", "1.1.67", "1.1.71"],
      note: "Attested operation. Not inferred from padaccheda alone.",
    };
  }

  const target = row.padas.find((p) => p.vibhakti === 6);
  const substitute = row.padas.find((p) => p.vibhakti === 1);
  const locative = row.padas.find((p) => p.vibhakti === 7);
  const ablative = row.padas.find((p) => p.vibhakti === 5);
  if (!target || !substitute) return { kind: "vidhi", status: "needs_semantic_annotation", reason: "not a genitive-nominative substitution" };
  const targetClass = classes[target.term];
  const substituteClass = classes[substitute.term];
  if (!targetClass || !substituteClass) {
    return { kind: "substitution_candidate", status: "blocked_unresolved_class", target: target.term, substitute: substitute.term };
  }
  return {
    kind: "substitution_candidate",
    status: "derivable_untested",
    target: targetClass,
    substitute: substituteClass,
    condition: { locative: locative ? classes[locative.term] || locative.term : null, ablative: ablative ? classes[ablative.term] || ablative.term : null },
    licenses: ["1.1.49", "1.1.66", "1.1.67", "1.1.71"],
    note: "Slots resolved. No substitute map and no attested example, so not executable.",
  };
}

function classify(row, operation) {
  if (!operation) return "needs_semantic_annotation";
  if (operation.status === "executable_tested") return "executable_tested";
  if (operation.status === "resolved") return "definition_resolved";
  if (operation.status === "derivable_untested") return "derivable_untested";
  if (operation.status === "blocked_unresolved_class") return "blocked_unresolved_class";
  if (operation.kind === "meta_rule") return "meta_rule";
  return "needs_semantic_annotation";
}

export function progress(ir) {
  const counts = {};
  for (const row of ir) counts[row.status] = (counts[row.status] || 0) + 1;
  return {
    records: ir.length,
    counts,
    note: "executable_tested is the only status that ran against an attested example. Serialization is not execution.",
  };
}

export async function writeOutputs(ir, outDir) {
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "rules-ir.json"), JSON.stringify(ir));
  const report = progress(ir);
  await writeFile(path.join(outDir, "progress.json"), JSON.stringify(report, null, 2));
  const meta = ir.metaExpansion;
  await writeFile(path.join(outDir, "meta-compiler-catalog.json"), JSON.stringify(ir.metaCompilerCatalog, null, 2));
  const classification = ir.functionalClassification;
  // The per-record payload is already embedded in rules-ir; emit a compact
  // dedicated meta report without duplicating all 3,983 record fact arrays.
  const full = meta.records;
  const summary = { schema: "pushkalavati.meta-expansion-summary/1", method: meta.method, converged: meta.converged, rounds: meta.rounds, round_log: meta.round_log, source_records: meta.source_records, adhikara_head_candidates: meta.adhikara_head_candidates, adhikara_scope_candidates: meta.adhikara_scope_candidates, unresolved_edges: meta.unresolved_edges, adhikara_candidates: meta.adhikara_candidates, total_expanded_facts: meta.total_expanded_facts, records_with_non_surface_terms: meta.records_with_non_surface_terms, caveat: meta.caveat, records: full };
  await writeFile(path.join(outDir, "meta-expansion.json"), JSON.stringify(summary, null, 2));
  const generatedRules = {
    schema: "pushkalavati.generated-rule-batch/1",
    source_records: ir.length,
    generation: "canonical IR generated for the full source inventory; fixed-point-expanded context retained per record",
    executable_rule_count: ir.filter((r) => r.status === "executable_tested").length,
    executable_rules: ir.filter((r) => r.status === "executable_tested").map((r) => ({ id: r.id, sutra: r.sutra, operation: r.operation, expanded_terms: r.meta_expansion.expanded_terms, provenance: r.provenance })),
    derivable_untested_count: ir.filter((r) => r.status === "derivable_untested").length,
    derivable_untested: ir.filter((r) => r.status === "derivable_untested").map((r) => ({ id: r.id, sutra: r.sutra, operation: r.operation, expanded_terms: r.meta_expansion.expanded_terms, provenance: r.provenance })),
    unresolved_count: ir.filter((r) => ["needs_semantic_annotation", "blocked_unresolved_class"].includes(r.status)).length,
    unresolved: ir.filter((r) => ["needs_semantic_annotation", "blocked_unresolved_class"].includes(r.status)).map((r) => ({ id: r.id, sutra: r.sutra, status: r.status, operation_kind: r.operation?.kind || null, reason: r.operation?.reason || r.operation?.status || "semantic annotation required", expanded_terms: r.meta_expansion.expanded_terms, provenance: r.provenance })),
    limitation: "Expanded context is not itself executable semantics. The 11 executable operations still require source-attested operation specifications and runtime tests; meta-expansion does not promote unresolved candidates automatically."
  };
  await writeFile(path.join(outDir, "generated-rules.json"), JSON.stringify(generatedRules, null, 2));
  await writeFile(path.join(outDir, "functional-classification.json"), JSON.stringify(classification, null, 2));
  report.generated_rules = { executable_tested: generatedRules.executable_rule_count, derivable_untested: generatedRules.derivable_untested_count, unresolved: generatedRules.unresolved_count };
  report.functional_classification = { source_records: classification.source_records, classified_records: classification.classified_records, multi_classified_records: classification.multi_classified_records, unclassified_records: classification.unclassified_records, category_counts: classification.category_counts, rule_count: classification.rule_count };
  report.meta_expansion = { converged: meta.converged, rounds: meta.rounds, total_expanded_facts: meta.total_expanded_facts, records_with_non_surface_terms: meta.records_with_non_surface_terms, adhikara_head_candidates: meta.adhikara_head_candidates, adhikara_scope_candidates: meta.adhikara_scope_candidates, unresolved_edges: meta.unresolved_edges.length };
  report.meta_compiler = { candidate_count: ir.metaCompilerCatalog.candidate_count, candidate_counts_by_type: ir.metaCompilerCatalog.candidate_counts_by_type, first_adhyaya_candidate_count: ir.metaCompilerCatalog.first_adhyaya_candidate_count, executable_candidates: 0, operators: ir.metaCompilerCatalog.operators.length };
  await writeFile(path.join(outDir, "progress.json"), JSON.stringify(report, null, 2));
  return report;
}
