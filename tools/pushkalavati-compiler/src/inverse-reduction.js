/**
 * Native-Devanagari inverse-reduction prototype.
 *
 * This module performs a conservative, trace-producing prefix/junction analysis.
 * It does NOT claim to parse all morphology or all 3,983 sūtras. Inverse
 * transformations may be non-unique, so candidates are retained rather than
 * silently selecting one.
 */

const PRAADI = Object.freeze([
  "प्रति", "परि", "अभि", "अधि", "अनु", "अति", "अपि", "अव", "उप",
  "सम्", "सं", "सु", "वि", "नि", "निर्", "निः", "दुर्", "दुः",
  "अप", "प्र", "परा", "आ", "उत्",
].sort((a, b) => [...b].length - [...a].length));

// Devanagari dependent vowel signs at a prefix/stem junction. The inverse
// is intentionally a candidate generator: e.g. ए may derive from अ+इ or अ+ई.
const INVERSE_GUNA_MATRAS = Object.freeze({
  "े": { rule: "6.1.87", underlying: ["इ", "ई"], name: "guṇa: a/ā + i/ī → e" },
  "ो": { rule: "6.1.87", underlying: ["उ", "ऊ"], name: "guṇa: a/ā + u/ū → o" },
});
const INVERSE_VRDDHI_MATRAS = Object.freeze({
  "ै": { rule: "6.1.88", underlying: ["ए", "ऐ"], name: "vṛddhi: a/ā + e/ai → ai" },
  "ौ": { rule: "6.1.88", underlying: ["ओ", "औ"], name: "vṛddhi: a/ā + o/au → au" },
});
const VOWEL_SIGNS = new Set(["ा", "ि", "ी", "ु", "ू", "ृ", "ॄ", "ॅ", "े", "ै", "ॉ", "ो", "ौ", "ॢ", "ॣ"]);

/**
 * Segment input into Unicode grapheme clusters. These are orthographic
 * graphemes, not a claim that every grapheme equals a phonological akṣara.
 * NFC is applied; original offsets are not yet preserved by this prototype.
 */
export function tokenizeDevanagari(text) {
  if (typeof text !== "string" || !text.trim()) {
    return { status: "ERROR", message: "Expected non-empty Devanagari text" };
  }
  const normalized = text.normalize("NFC");
  if (typeof Intl.Segmenter !== "function") {
    return { status: "ERROR", message: "This runtime lacks Intl.Segmenter; native-script segmentation unavailable" };
  }
  const segmenter = new Intl.Segmenter("hi", { granularity: "grapheme" });
  const graphemes = [...segmenter.segment(normalized)].map((part) => part.segment);
  return { status: "APPLIED", normalized, graphemes };
}

function matchLongestPraadi(text) {
  return PRAADI.find((prefix) => text.startsWith(prefix)) ?? null;
}

function inverseAtBoundary(prefix, remainder) {
  // A dependent vowel sign at the start of the remainder is attached
  // orthographically to the final consonant of the matched prefix.
  const sign = [...remainder][0];
  const rest = remainder.slice(sign.length);
  const rule = INVERSE_GUNA_MATRAS[sign] ?? INVERSE_VRDDHI_MATRAS[sign];
  if (!rule) {
    return { status: "UNRESOLVED", reason: "No supported inverse vowel-junction sign at prefix boundary" };
  }
  return {
    status: "CANDIDATES",
    rule: rule.rule,
    operation: rule.name,
    candidates: rule.underlying.map((vowel) => ({
      stem_surface_candidate: vowel + rest,
      reconstructed_junction: `${prefix} + ${vowel}`,
      inverse_vowel: vowel,
      suffix_status: "NOT_ANALYZED",
      lexical_status: "NOT_CHECKED",
    })),
  };
}

/**
 * Analyze one surface form using longest prādaya anchoring and a local inverse
 * vowel-junction candidate. No suffix is deleted and no lexeme is hard-coded.
 */
export function analyzeInverseReduction(text, options = {}) {
  const tokenized = tokenizeDevanagari(text);
  if (tokenized.status !== "APPLIED") return tokenized;
  const input = tokenized.normalized;
  const trace = [{ step: "INPUT", input, status: "APPLIED" }];
  const prefix = matchLongestPraadi(input);
  if (!prefix) {
    return {
      status: "NO_MATCH",
      input,
      graphemes: tokenized.graphemes,
      candidates: [],
      trace: [...trace, { step: "PREFIX_ANCHOR", status: "NO_MATCH", message: "No prādaya prefix matched; no default prefix is assumed" }],
    };
  }
  trace.push({ step: "PREFIX_ANCHOR", prefix, status: "APPLIED", strategy: "longest-match" });
  const remainder = input.slice(prefix.length);
  trace.push({ step: "JUNCTION_INSPECTION", remainder, status: "APPLIED" });

  // A leading dependent vowel sign is only meaningful at this boundary when
  // attached to the final consonant in orthographic representation.
  const first = [...remainder][0] ?? "";
  if (!VOWEL_SIGNS.has(first)) {
    return {
      status: "UNRESOLVED",
      input,
      prefix,
      remainder,
      candidates: [],
      trace: [...trace, { step: "INVERSE_SANDHI", status: "UNRESOLVED", message: "No supported dependent-vowel junction at the anchored boundary" }],
    };
  }

  const inverse = inverseAtBoundary(prefix, remainder);
  trace.push({ step: "INVERSE_SANDHI", status: inverse.status, rule: inverse.rule, operation: inverse.operation, candidates: inverse.candidates });
  if (inverse.status !== "CANDIDATES") {
    return { status: "UNRESOLVED", input, prefix, remainder, candidates: [], trace };
  }

  // Lexical validation is opt-in and never inferred from visual familiarity.
  const lexicon = options.lexicon instanceof Set ? options.lexicon : null;
  const candidates = inverse.candidates.map((candidate) => {
    const stem = candidate.stem_surface_candidate;
    const hasLexiconEntry = lexicon ? lexicon.has(stem) : null;
    return {
      ...candidate,
      lexical_status: lexicon ? (hasLexiconEntry ? "MATCH" : "NO_MATCH") : "NOT_CHECKED",
      suffix_status: "NOT_ANALYZED",
    };
  });
  trace.push({ step: "MORPHOLOGICAL_REDUCTION", status: "UNRESOLVED", message: "No licensed subanta/tiṅanta suffix reduction is implemented; surface endings are preserved" });
  trace.push({ step: "LEXICAL_VALIDATION", status: lexicon ? "CHECKED" : "NOT_CHECKED", message: lexicon ? "Only the caller-supplied lexicon was consulted" : "No lexical inventory supplied" });
  return {
    status: "UNRESOLVED",
    input,
    prefix,
    remainder,
    candidates,
    trace,
    limitations: [
      "The prefix match is a structural hypothesis, not proof that the prefix is grammatically licensed in this word.",
      "Inverse vowel mappings can be ambiguous; all candidates are retained.",
      "Morphological suffix reduction and full lexical/semantic validation are not implemented.",
      "Unicode grapheme clusters are used as an orthographic layer; they are not encoded as fixed-width 32-bit phonological akṣara cells.",
    ],
  };
}

export const INVERSE_REDUCTION_RULE_FAMILIES = Object.freeze([
  { rule: "6.1.87", direction: "inverse", status: "implemented_candidate_generation", coverage: "dependent e/o matras at a matched prādaya boundary" },
  { rule: "6.1.88", direction: "inverse", status: "implemented_candidate_generation", coverage: "dependent ai/au matras at a matched prādaya boundary" },
]);
