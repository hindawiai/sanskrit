const { pratyahara } = require("./shivasutras");

// Three cases explicitly confirmed in independent sources (NACLO 2020
// problem set): aC = all vowels, haL = all consonants, yaN = y v r l.
const cases = [
  { name: "aC",  call: () => pratyahara("a", "C"),   expect: ["a","i","u","R","L","e","o","ai","au"] },
  { name: "haL", call: () => pratyahara("h", "L2"),  expect: ["h","y","v","r","l","Y","M1","NG","N4","n","jh","bh","gh","Dh","dh","j","b","g","D","d","kh","ph","ch","Th","th","c","T2","t","k","p","sh1","SH2","s","h2"] },
  { name: "yaN", call: () => pratyahara("y", "N3"),  expect: ["y","v","r","l"] },
];

let allPass = true;
for (const c of cases) {
  const got = c.call();
  const pass = JSON.stringify(got) === JSON.stringify(c.expect);
  allPass = allPass && pass;
  console.log(`${c.name}: ${pass ? "PASS" : "FAIL"}  (${got.length} phonemes)`);
  if (!pass) console.log("  got:", got, "\n  expected:", c.expect);
}
console.log(allPass ? "\nAll three confirmed pratyaharas reproduced correctly by the algorithm." : "\nFAILED");
