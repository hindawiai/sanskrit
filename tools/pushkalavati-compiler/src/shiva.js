/** Traditional Śivasūtras. Public-domain pāṭha, not extracted from sutras.json. */
export const SHIVA = [
  { id: 1, sounds: ["a", "i", "u"], it: "ṇ" },
  { id: 2, sounds: ["ṛ", "ḷ"], it: "k" },
  { id: 3, sounds: ["e", "o"], it: "ṅ" },
  { id: 4, sounds: ["ai", "au"], it: "c" },
  { id: 5, sounds: ["h", "y", "v", "r"], it: "ṭ" },
  { id: 6, sounds: ["l"], it: "ṇ" },
  { id: 7, sounds: ["ñ", "m", "ṅ", "ṇ", "n"], it: "m" },
  { id: 8, sounds: ["jh", "bh"], it: "ñ" },
  { id: 9, sounds: ["gh", "ḍh", "dh"], it: "ṣ" },
  { id: 10, sounds: ["j", "b", "g", "ḍ", "d"], it: "ś" },
  { id: 11, sounds: ["kh", "ph", "ch", "ṭh", "th", "c", "ṭ", "t"], it: "v" },
  { id: 12, sounds: ["k", "p"], it: "y" },
  { id: 13, sounds: ["ś", "ṣ", "s"], it: "r" },
  { id: 14, sounds: ["h"], it: "l" },
];

const SEQUENCE = [];
for (const row of SHIVA) {
  for (const sound of row.sounds) SEQUENCE.push({ sound, it: null });
  SEQUENCE[SEQUENCE.length - 1].it = row.it;
}

const SAVARNA = {
  a: ["a", "ā"], i: ["i", "ī"], u: ["u", "ū"], ṛ: ["ṛ", "ṝ"], ḷ: ["ḷ", "ḹ"],
  e: ["e"], o: ["o"], ai: ["ai"], au: ["au"],
};

export function expandPratyahara(name) {
  const n = name.normalize("NFC").replace(/[ःंँ्]/g, "");
  if (n.length < 2) return null;
  const it = n.at(-1);
  const start = n.slice(0, -1);
  const startAt = SEQUENCE.findIndex((x) => x.sound === start);
  if (startAt < 0) return null;
  const out = [];
  for (let i = startAt; i < SEQUENCE.length; i++) {
    out.push(SEQUENCE[i].sound);
    if (SEQUENCE[i].it === it) return out;
  }
  return null;
}

export function withSavarna(sounds) {
  const out = new Set();
  for (const sound of sounds) for (const s of SAVARNA[sound] || [sound]) out.add(s);
  return [...out];
}

export const YAN_OF = { i: "y", ī: "y", u: "v", ū: "v", ṛ: "r", ṝ: "r", ḷ: "l" };
export const GUNA_OF = { i: "e", ī: "e", u: "o", ū: "o", ṛ: "ar", ṝ: "ar", ḷ: "al" };
export const VRDDHI_OF = { e: "ai", o: "au", ai: "ai", au: "au" };
export const DIRGHA_OF = { a: "ā", ā: "ā", i: "ī", ī: "ī", u: "ū", ū: "ū", ṛ: "ṝ", ṝ: "ṝ" };
export const TAPARA = { a: "a", ā: "ā", i: "i", ī: "ī", u: "u", ū: "ū", ṛ: "ṛ", ḷ: "ḷ" };
