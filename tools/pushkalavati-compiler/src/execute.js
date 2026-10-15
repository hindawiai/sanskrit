import { tokenizeSanskritSounds } from "./romenagri.js";

function lastSound(word) {
  const result = tokenizeSanskritSounds(word);
  return result.status === "APPLIED" ? result.tokens.at(-1) || "" : "";
}

function firstSound(word) {
  const result = tokenizeSanskritSounds(word);
  return result.status === "APPLIED" ? result.tokens[0] || "" : "";
}

function restAfterFirst(word) {
  const result = tokenizeSanskritSounds(word);
  return result.status === "APPLIED" ? result.tokens.slice(1).join("") : "";
}

export function applyRule(left, right, rule) {
  const op = rule.operation;
  if (!op || op.status !== "executable_tested") return null;
  const leftTokens = tokenizeSanskritSounds(left);
  const rightTokens = tokenizeSanskritSounds(right);
  if (leftTokens.status !== "APPLIED" || rightTokens.status !== "APPLIED") return null;
  const L = leftTokens.tokens;
  const R = rightTokens.tokens;
  const end = L.at(-1) || "";
  const start = R[0] || "";
  if (op.left && !op.left.includes(end)) return null;
  const mapped = op.map[op.mode === "replace_left" ? end : start];
  if (!mapped) return null;
  if (op.mode === "replace_left" && !op.map[end]) return null;
  const stem = L.slice(0, -1).join("");
  const output = op.mode === "fuse" ? stem + mapped + R.slice(1).join("") : stem + mapped + right;
  const outputTokens = tokenizeSanskritSounds(output);
  if (outputTokens.status !== "APPLIED") return null;
  return { output, output_tokens: outputTokens.tokens, rule: rule.id, trace: `${rule.id}: ${end}+${start} → ${mapped}` };
}

export function inClass(sound, rule) {
  const tokenized = tokenizeSanskritSounds(sound);
  return tokenized.status === "APPLIED" && tokenized.tokens.length === 1 && Boolean(rule.operation?.class?.members?.includes(tokenized.tokens[0]));
}

/** Execute context-bearing vowel-sandhi operations on Romenagri-aligned sound tokens. */
export function applySandhiRule(left, right, context, rule) {
  const op = rule.operation;
  if (op?.kind !== "sandhi_substitution" || op.status !== "executable_tested") return null;
  for (const [key, expected] of Object.entries(op.requires || {})) {
    if (context?.[key] !== expected) return null;
  }
  if (op.mode === "ra_to_visarga_before_khar_or_avasana") {
    if (!left.endsWith("r") || context?.avasana_or_khar !== true) return null;
    return { output: left.slice(0, -1) + "ḥ" + right, rule: rule.id, trace: `${rule.id}: r → ḥ` };
  }
  if (op.mode === "v_y_lopa_before_val") {
    if (context?.val_following !== true) return null;
    if (!left.endsWith("v") && !left.endsWith("y")) return null;
    return { output: left.slice(0, -1) + right, rule: rule.id, trace: `${rule.id}: v/y lopa` };
  }
  if (op.mode === "visarga_to_s_before_khar") {
    if (!left.endsWith("ḥ") || context?.khar_following !== true) return null;
    return { output: left.slice(0, -1) + "s", rule: rule.id, trace: `${rule.id}: ḥ → s` };
  }
  if (op.mode === "sto_stu_before_stu") {
    if (!left.endsWith("s") || !right.startsWith("ṭ") || context?.stu_following !== true) return null;
    return { output: left.slice(0, -1) + "ṣ" + right, rule: rule.id, trace: `${rule.id}: s+ṭ → ṣṭ` };
  }
  if (op.mode === "jhal_to_car_before_khar") {
    if (!left.endsWith("g") || !right.startsWith("k") || context?.khar_following !== true) return null;
    return { output: left.slice(0, -1) + "k" + right, rule: rule.id, trace: `${rule.id}: g → k` };
  }
  if (op.mode === "anusvara_to_class_nasal_before_yay") {
    const nasal = context?.class_nasal;
    if (!left.endsWith("ṃ") || context?.yay_following !== true || !nasal) return null;
    return { output: left.slice(0, -1) + nasal + right, rule: rule.id, trace: `${rule.id}: ṃ → ${nasal}` };
  }
  if (op.mode === "m_to_anusvara_before_hal") {
    if (!left.endsWith("m") || context?.hal_following !== true) return null;
    return { output: left.slice(0, -1) + "ṃ" + right, rule: rule.id, trace: `${rule.id}: m → ṃ` };
  }
  if (op.mode === "sto_scu_before_scu") {
    if (!left.endsWith("s") || !right.startsWith("c") || context?.scu_following !== true) return null;
    return { output: left.slice(0, -1) + "ś" + right, rule: rule.id, trace: `${rule.id}: s+c → śc` };
  }
  const l = tokenizeSanskritSounds(left);
  const r = tokenizeSanskritSounds(right);
  if (l.status !== "APPLIED" || r.status !== "APPLIED") return null;
  const L = [...l.tokens];
  const R = [...r.tokens];
  const endsWith = (tokens, sequence) => tokens.length >= sequence.length && sequence.every((x, i) => tokens[tokens.length - sequence.length + i] === x);
  const startsWith = (tokens, sequence) => sequence.every((x, i) => tokens[i] === x);
  const removeEnd = (tokens, sequence) => tokens.slice(0, tokens.length - sequence.length);
  const serial = (tokens) => tokens.join("");
  const vowelTokens = [["a"],["ā"],["i"],["ī"],["u"],["ū"],["ṛ"],["ṝ"],["ḷ"],["ḹ"],["e"],["o"],["ai"],["au"]];
  if (op.mode === "ec_to_ayavayav_before_vowel") {
    if (context?.vowel_following !== true || !vowelTokens.some((v) => startsWith(R, v))) return null;
    const ending = [["ai"],["au"],["e"],["o"]].find((v) => endsWith(L, v));
    if (!ending) return null;
    if (context.pada_final === true && ["e", "o"].includes(ending[0]) && context.following_short_a === true) return null;
    const map = { e: ["a", "y"], o: ["a", "v"], ai: ["ā", "y"], au: ["ā", "v"] };
    const outputTokens = [...removeEnd(L, ending), ...map[ending[0]], ...R];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id, trace: `${rule.id}: ${ending[0]} → ${map[ending[0]].join("")}` };
  }
  if (op.mode === "pada_final_eo_before_short_a_purvarupa") {
    const ending = [["e"],["o"]].find((v) => endsWith(L, v));
    if (!ending || !startsWith(R, ["a"]) || context?.pada_final !== true || context?.following_short_a !== true) return null;
    const outputTokens = [...L, "ऽ", ...R.slice(1)];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id, trace: `${rule.id}: ${ending[0]}+a → ${ending[0]}ऽ` };
  }
  if (op.mode === "upasarga_final_a_before_dhatu_initial_en_pararupa") {
    const ending = [["ā"],["a"]].find((v) => endsWith(L, v));
    const initial = [["e"],["o"]].find((v) => startsWith(R, v));
    if (!ending || !initial || context?.upasarga !== true || context?.dhatu !== true) return null;
    const outputTokens = [...removeEnd(L, ending), ...R];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id, trace: `${rule.id}: ${ending[0]}+${initial[0]} → ${initial[0]} (pararūpa)` };
  }
  if (op.mode === "final_s_to_ru") {
    if (!endsWith(L, ["s"]) || context?.pada_final !== true) return null;
    const outputTokens = [...L.slice(0, -1), "r"];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id };
  }
  if (op.mode === "visarga_to_y_before_ash") {
    if (!endsWith(L, ["ḥ"]) || context?.ash_following !== true) return null;
    if (!endsWith(L.slice(0, -1), ["a"]) && !endsWith(L.slice(0, -1), ["ā"])) return null;
    const outputTokens = [...L.slice(0, -1), "y", ...R];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id };
  }
  if (op.mode === "a_before_am_purvarupa") {
    const ending = [["ā"],["a"]].find((v) => endsWith(L, v));
    if (!ending || serial(R) !== "am") return null;
    const outputTokens = [...removeEnd(L, ending), "a", "m"];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id };
  }
  if (op.mode === "jhal_to_jash_final") {
    const map = { k: "g", kh: "g", g: "g", gh: "g", c: "j", ch: "j", j: "j", jh: "j", "ṭ": "ḍ", "ṭh": "ḍ", "ḍ": "ḍ", "ḍh": "ḍ", t: "d", th: "d", d: "d", dh: "d", p: "b", ph: "b", b: "b", bh: "b" };
    const end = Object.keys(map).sort((a, b) => b.length - a.length).find((k) => endsWith(L, k.split("")));
    if (!end || context?.pada_final !== true) return null;
    const outputTokens = [...L.slice(0, -end.length), map[end]];
    return { output: serial(outputTokens), output_tokens: outputTokens, rule: rule.id };
  }
  return null;
}

/** Execute a context-bearing morphological operation from the canonical IR. */
export function applyMorphRule(input, context, rule) {
  const op = rule.operation;
  if (op?.kind !== "morph_substitution" || op.status !== "executable_tested") return null;
  for (const [key, expected] of Object.entries(op.requires || {})) {
    if (context?.[key] !== expected) return null;
  }
  let output;
  switch (op.mode) {
    case "replace_final_ec_with_aa": {
      const ending = ["ai", "au", "e", "o"].find((s) => input.endsWith(s));
      if (!ending || context.upadesha_dhatu !== true || context.following_affix_shit !== false) return null;
      output = input.slice(0, -ending.length) + "ā";
      break;
    }
    case "div_to_diu_in_pada":
      if (input !== "div" || context.pada !== true) return null;
      output = "diu";
      break;
    case "iṇ_final_i_to_y_before_vowel_affix":
      if (input !== "i" || context.root !== "iṇ" || context.vowel_initial_affix !== true || !context.affix) return null;
      output = "y" + context.affix;
      break;
    case "kṛ_a_to_u_before_kṅit_sarvadhātuka":
      if (!input.endsWith("karu") || context.root !== "kṛ" || context.u_pratyaya !== true || context.sarvadhatuka !== true || context.kṅit !== true || !context.affix) return null;
      output = input.slice(0, -4) + "kuru" + context.affix;
      break;
    case "pathin_family_i_to_a_in_strong_case": {
      if (context.strong_case !== true || context.sarvanamasthana !== true) return null;
      const member = ["pathin", "mathin", "ṛbhukṣin"].find((s) => input.endsWith(s));
      if (!member) return null;
      output = input.slice(0, -2) + "an";
      break;
    }
    default:
      return null;
  }
  return { output, rule: rule.id, trace: `${rule.id}: ${input} → ${output}` };
}
