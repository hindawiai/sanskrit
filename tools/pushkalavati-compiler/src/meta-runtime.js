/**
 * Small, explicit runtime for meta-rules whose semantics are sufficiently
 * specified to execute without guessing from the source gloss.
 *
 * This is deliberately separate from vidhi-operation execution: a meta-rule
 * can be executable as an interpreter primitive without becoming a surface
 * rewrite rule in the 3,983-record corpus.
 */
import { expandPratyahara } from "./shiva.js";

const VOWELS = ["ai", "au", "ā", "ī", "ū", "ṝ", "ḹ", "ṛ", "ḷ", "a", "i", "u", "e", "o"];
const CONSONANTS = [
  "kh", "gh", "ch", "jh", "ṭh", "ḍh", "th", "dh", "ph", "bh",
  "ṅ", "ñ", "ṇ", "ś", "ṣ", "k", "g", "c", "j", "ṭ", "ḍ", "t", "d", "p", "b", "m", "n", "y", "r", "l", "v", "ś", "s", "h",
];
const TOKENS = [...new Set([...VOWELS, ...CONSONANTS])].sort((a, b) => b.length - a.length);

export function tokenizeIast(text) {
  if (typeof text !== "string" || !text.trim()) return { status: "ERROR", message: "Expected non-empty IAST text" };
  const input = text.normalize("NFC").toLowerCase();
  const tokens = [];
  for (let i = 0; i < input.length;) {
    const ch = input[i];
    if (/\s|[-'’ऽ|]/u.test(ch)) { i++; continue; }
    const token = TOKENS.find((candidate) => input.startsWith(candidate, i));
    if (!token) return { status: "UNRESOLVED", message: `Unrecognized IAST segment at offset ${i}`, offset: i, input };
    tokens.push(token);
    i += token.length;
  }
  return { status: "APPLIED", tokens };
}

/**
 * 1.1.7 halo'nantarāḥ saṃyogaḥ: recognize adjacent consonants in a tokenized
 * sequence. This reports clusters; it does not claim to syllabify a whole word.
 */
export function recognizeSamyoga(text) {
  const tokenized = tokenizeIast(text);
  if (tokenized.status !== "APPLIED") return tokenized;
  const tokens = tokenized.tokens;
  const clusters = [];
  let current = [];
  for (const token of tokens) {
    if (CONSONANTS.includes(token)) current.push(token);
    else {
      if (current.length >= 2) clusters.push(current);
      current = [];
    }
  }
  if (current.length >= 2) clusters.push(current);
  return { status: "APPLIED", rule: "1.1.7", clusters, hasSamyoga: clusters.length > 0, tokens };
}

/**
 * 1.1.71 ādir antyena sahetā: pratyāhāra membership delegates to the existing
 * position-aware Śivasūtra stream. Unknown or invalid pratyāhāras are explicit.
 */
export function evaluatePratyahara(name) {
  if (typeof name !== "string" || name.length < 2) {
    return { status: "ERROR", rule: "1.1.71", message: "Pratyāhāra must contain a start phoneme and it-marker" };
  }
  const members = expandPratyahara(name);
  if (!members) return { status: "UNRESOLVED", rule: "1.1.71", message: `Cannot resolve pratyāhāra '${name}'` };
  return { status: "APPLIED", rule: "1.1.71", name, members };
}

/** Execute only the meta-rules implemented above; no fallback semantics. */
export function executeMetaRule(ruleId, input) {
  switch (ruleId) {
    case "1.1.7": return recognizeSamyoga(input?.text);
    case "1.1.71": return evaluatePratyahara(input?.name);
    default: return { status: "UNRESOLVED", rule: ruleId, message: "Meta-rule has no executable handler" };
  }
}

export const EXECUTABLE_META_RULES = Object.freeze([
  { id: "1.1.7", name: "saṃyoga recognition", semantics: "two or more adjacent consonant tokens", test_scope: "IAST tokens; not full syllabification" },
  { id: "1.1.71", name: "pratyāhāra expansion", semantics: "start phoneme through positional it-marker", test_scope: "existing Śivasūtra stream; it-marker excluded" },
]);
