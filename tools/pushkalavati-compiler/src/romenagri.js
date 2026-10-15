/**
 * Pushkalāvatī ↔ Romenagri substrate adapter.
 *
 * This module does not claim byte-for-byte emulation of the legacy C parser.
 * It exposes an explicit Sanskrit sound-token layer, anchored to audited
 * Romenagri ACII table keys, and refuses unsupported or ambiguous spellings.
 * Unicode/IAST are boundary formats; rule operations consume token arrays.
 */
import table from "../data/romenagri/acii-table.json" with { type: "json" };

export const ROMENAGRI_SOURCE = "https://github.com/project-ilm/romenagri/blob/master/src/acii.h";
export const ROMENAGRI_TABLE = table;

// Longest-match token inventory for Sanskrit phonological operations. Tokens
// preserve distinctions needed by the current rule IR; no schwa deletion occurs.
export const SANSKRIT_SOUND_TOKENS = Object.freeze([
  "kh", "gh", "ṅ", "ch", "chh", "jh", "ñ", "ṭh", "ḍh", "th", "dh", "ph", "bh",
  "ai", "au", "ā", "ī", "ū", "ṛ", "ṝ", "ḷ", "ḹ", "ṃ", "ḥ", "k", "g", "c", "j", "ṭ", "ḍ", "t", "d", "ṇ", "n", "p", "b", "m", "y", "r", "l", "v", "ś", "ṣ", "s", "h", "a", "i", "u", "e", "o", "ऽ", "|"
].sort((a, b) => b.length - a.length || a.localeCompare(b)));

const vowels = new Set(["a", "ā", "i", "ī", "u", "ū", "ṛ", "ṝ", "ḷ", "ḹ", "e", "o", "ai", "au"]);
const romanToRomenagriKey = Object.freeze({
  a: "_a", ā: "_aa", i: "_i", ī: "_ee", u: "_u", ū: "_oo", ṛ: "_ri",
  e: "_ae", ai: "_aee", o: "_oa", au: "_au",
  k: "ka", kh: "kha", g: "ga", gh: "gha", ṅ: "_nga",
  c: "cha", ch: "chha", j: "ja", jh: "jha", ñ: "_yna",
  ṭ: "_ta", ṭh: "_tha", ḍ: "_da", ḍh: "_dha", ṇ: "_nna",
  t: "ta", th: "tha", d: "da", dh: "dha", n: "na",
  p: "pa", ph: "pha", b: "ba", bh: "bha", m: "ma", y: "ya",
  r: "ra", l: "la", v: "wa", ś: "sha", ṣ: "xa", s: "sa", h: "_ha",
  ṃ: "_m", ḥ: "_hh", "ऽ": "_3", "|": "|"
});
const tableKeys = new Set(table.entries.map((entry) => entry.key));

export function tokenizeSanskritSounds(input) {
  if (typeof input !== "string" || !input.length) return { status: "ERROR", tokens: [], error: "Expected non-empty string" };
  const text = input.normalize("NFC");
  const tokens = [];
  for (let i = 0; i < text.length;) {
    const match = SANSKRIT_SOUND_TOKENS.find((token) => text.startsWith(token, i));
    if (!match) return { status: "UNRESOLVED", tokens, offset: i, remainder: text.slice(i), reason: "No declared Sanskrit sound token" };
    tokens.push(match);
    i += match.length;
  }
  return { status: "APPLIED", tokens };
}

export function mapSoundsToRomenagriTableKeys(input) {
  const tokenized = tokenizeSanskritSounds(input);
  if (tokenized.status !== "APPLIED") return { ...tokenized, keys: [] };
  const keys = [];
  for (const sound of tokenized.tokens) {
    const key = romanToRomenagriKey[sound];
    if (!key || !tableKeys.has(key)) {
      return { status: "UNRESOLVED", tokens: tokenized.tokens, keys, sound, reason: "Sound has no exact audited Romenagri ACII table key" };
    }
    // This is a per-sound table-key audit only, not word encoding: legacy keys
    // include inherent vowels and depend on parser state/stack context.
    keys.push({ sound, key, vowel: vowels.has(sound), table_key_only: true });
  }
  return { status: "APPLIED", tokens: tokenized.tokens, keys };
}

/** Apply a rule callback to canonical sound-token arrays and serialize the result. */
export function executeOnRomenagriSubstrate(left, right, ruleFn) {
  const l = tokenizeSanskritSounds(left);
  const r = tokenizeSanskritSounds(right);
  if (l.status !== "APPLIED" || r.status !== "APPLIED") {
    return { status: "UNRESOLVED", reason: "Input is outside the declared Sanskrit sound-token inventory", left: l, right: r };
  }
  const result = ruleFn([...l.tokens], [...r.tokens]);
  if (!result) return { status: "NOT_APPLICABLE", left_tokens: l.tokens, right_tokens: r.tokens };
  const output = Array.isArray(result.output_tokens) ? result.output_tokens.join("") : null;
  if (output === null) return { status: "ERROR", reason: "Rule callback must return output_tokens" };
  const outputTokenization = tokenizeSanskritSounds(output);
  if (outputTokenization.status !== "APPLIED") return { status: "UNRESOLVED", output, encoding: outputTokenization };
  const legacyKeys = mapSoundsToRomenagriTableKeys(output);
  return { status: "APPLIED", output, rule: result.rule, trace: result.trace, output_tokens: outputTokenization.tokens, legacy_table_key_audit: legacyKeys };
}

export function auditRomenagriCoverage() {
  const tested = Object.keys(romanToRomenagriKey);
  const mapped = tested.filter((sound) => tableKeys.has(romanToRomenagriKey[sound]));
  return {
    source: ROMENAGRI_SOURCE,
    declared_source_table_length: table.source_table_length,
    imported_entries_excluding_sentinel: table.entries.length,
    tested_sound_mappings: tested.length,
    mapped_sound_mappings: mapped.length,
    unsupported_sanskrit_sounds: ["chh", "ṝ", "ḷ", "ḹ"],
    coverage_reporting_note: "chh is declared in the token inventory but has no exact table-key mapping; it is reported unsupported rather than assigned an invented key",
    known_legacy_questions: ["^a has an empty table value; Devanagari has no dependent sign for inherent अ, so this is not by itself a proven defect", "Unicode conversion is UTF-16LE-like, not UTF-8", "legacy lookup may return NULL"],
    mapping_status: "sound-token substrate plus per-sound table-key audit; not word encoding or byte-for-byte C compatibility"
  };
}
