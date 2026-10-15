const DEV = {
  "\u0905": "a", "\u0906": "\u0101", "\u0907": "i", "\u0908": "\u012b", "\u0909": "u", "\u090a": "\u016b",
  "\u090b": "\u1e5b", "\u0960": "\u1e5d", "\u090c": "\u1e37", "\u090f": "e", "\u0910": "ai", "\u0913": "o", "\u0914": "au",
  "\u0915": "k", "\u0916": "kh", "\u0917": "g", "\u0918": "gh", "\u0919": "\u1e45",
  "\u091a": "c", "\u091b": "ch", "\u091c": "j", "\u091d": "jh", "\u091e": "\u00f1",
  "\u091f": "\u1e6d", "\u0920": "\u1e6dh", "\u0921": "\u1e0d", "\u0922": "\u1e0dh", "\u0923": "\u1e47",
  "\u0924": "t", "\u0925": "th", "\u0926": "d", "\u0927": "dh", "\u0928": "n",
  "\u092a": "p", "\u092b": "ph", "\u092c": "b", "\u092d": "bh", "\u092e": "m",
  "\u092f": "y", "\u0930": "r", "\u0932": "l", "\u0935": "v",
  "\u0936": "\u015b", "\u0937": "\u1e63", "\u0938": "s", "\u0939": "h",
};
const SIGN = {
  "\u093e": "\u0101", "\u093f": "i", "\u0940": "\u012b", "\u0941": "u", "\u0942": "\u016b",
  "\u0943": "\u1e5b", "\u0947": "e", "\u0948": "ai", "\u094b": "o", "\u094c": "au",
};
const DIGIT = Object.fromEntries([..."\u0966\u0967\u0968\u0969\u096a\u096b\u096c\u096d\u096e\u096f"].map((d, i) => [d, String(i)]));

export function devanagariToIast(s) {
  let out = "";
  const chars = [...s.normalize("NFC")];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "\u094d" || ch === "\u0903" || ch === "\u0902") continue;
    if (DIGIT[ch]) { out += DIGIT[ch]; continue; }
    if (ch === "-") { out += "-"; continue; }
    const base = DEV[ch];
    if (!base) continue;
    const next = chars[i + 1];
    if (SIGN[next] && base.endsWith("a")) {
      out += base.slice(0, -1) + SIGN[next];
      i++;
    } else if (next === "\u094d") out += base.endsWith("a") ? base.slice(0, -1) : base;
    else out += base;
  }
  return out;
}

export function parsePadas(text) {
  if (!text) return [];
  const out = [];
  for (const match of text.matchAll(/(\S+)\s+([\u0966-\u096f]+)\/([\u0966-\u096f]+)/g)) {
    out.push({
      term: match[1],
      iast: devanagariToIast(match[1]),
      vibhakti: Number(DIGIT[match[2]]),
      vacana: Number(DIGIT[match[3]]),
      source: "padaccheda",
    });
  }
  return out;
}
