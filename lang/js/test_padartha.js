const { Dravya, uninitialized, disposed, mismatch, impossible } = require("./padartha");

// A dravya of samanya "sankhya" (number), with a guna and a karma attached
// via samavaya (attachGuna/attachKarma -- there's no other way to make one).
const five = new Dravya("sankhya", 5);
five.attachGuna("parity", "odd");
five.attachKarma("dviguna", (self) => new Dravya("sankhya", self.value * 2));

const ten = five.invoke("dviguna");
console.log("dravya:", five.value, "guna:", five.gunas.get("parity"),
  "-> dviguna gives dravya:", ten.value);
console.log("vishesha distinguishes same-samanya instances:", five.vishesha !== ten.vishesha);

// All four abhava, each genuinely different:
console.log(uninitialized("sankhya").toString());
console.log(disposed("sankhya").toString());
console.log(mismatch("sankhya", "vakya").toString());
console.log(impossible("a number that is its own negation under addition and also > 0").toString());
console.log("\nanyonyabhava fires for real, not just as a label:",
  JSON.stringify(five.invoke("no_such_karma")));
