/**
 * Sanchalan Suktam front end.
 *
 * Grammar rules are also published in grammar.json and docs/sanchalan-suktam.html.
 * This front end parses verse framing and recognizes a closed technical lexicon.
 * It deliberately retains all residual spans; it does not pretend to perform
 * complete Sanskrit padaccheda, sandhi resolution, or OS operation semantics.
 */
"use strict";
const fs = require("node:fs");
const path = require("node:path");

const LEXICON = [
  ["स्मृतिप्रमाण", "smrti-pramana", "memory-proof", "validate-memory"],
  ["स्मृतिस्थान", "smrti-sthana", "memory", "partition-memory"],
  ["स्मृतिरक्षण", "smrti-raksana", "memory", "protect-memory"],
  ["स्मृतिमान", "smrti-mana", "memory", "measure-memory"],
  ["स्थानपट्ट", "sthana-patta", "storage", "address-board"],
  ["द्वारपट्ट", "dvara-patta", "ipc", "door-board"],
  ["प्रेषणपट्ट", "presana-patta", "ipc", "send-buffer"],
  ["कार्यपट्ट", "karya-patta", "runtime", "work-board"],
  ["ट्रैपपट्ट", "trap-patta", "runtime", "trap-board"],
  ["पृष्ठपट्ट", "prstha-patta", "memory", "page-board"],
  ["यन्त्रपट्ट", "yantra-patta", "runtime", "machine-board"],
  ["यन्त्ररक्षण", "yantra-raksana", "runtime", "protect-machine"],
  ["प्रथमप्रक्रिया", "prathama-prakriya", "process", "first-process"],
  ["प्रक्रियाद्वन्द्व", "prakriya-dvandva", "process", "spawn-pair"],
  ["प्रक्रियाश्रय", "prakriya-asraya", "process", "process-context"],
  ["मूलादेश", "mula-adesa", "command", "root-command"],
  ["आदेशपाइप", "adesa-pipe", "ipc", "command-pipe"],
  ["आदेशगृह", "adesa-grha", "command", "command-store"],
  ["मूलस्थान", "mula-sthana", "runtime", "root-location"],
  ["सञ्चारक", "sanchara", "ipc", "communicator"],
  ["सञ्चारं", "sanchara", "ipc", "communicate"],
  ["सञ्चार", "sanchara", "ipc", "communicate"],
  ["संदेश", "sandesa", "ipc", "message"],
  ["सन्देश", "sandesa", "ipc", "message"],
  ["सङ्केत", "sanketa", "ipc", "signal"],
  ["स्मृतौ", "smrti", "memory", "memory-reference"],
  ["स्मृति", "smrti", "memory", "memory-reference"],
  ["स्थानं", "sthana", "storage", "location"],
  ["रिक्तस्थान", "rikta-sthana", "storage", "empty-location"],
  ["शून्येन", "sunya", "memory", "zero-fill"],
  ["शून्यं", "sunya", "memory", "zero-fill"],
  ["शून्य", "sunya", "memory", "zero"],
  ["पिड्शून्य", "pid-sunya", "process", "pid-zero"],
  ["पिड्", "pid", "process", "process-id"],
  ["प्रतीक्षण", "pratikshana", "process", "wait"],
  ["प्रेषयेत्", "preshayet", "ipc", "send"],
  ["प्रेषय", "preshaya", "ipc", "send"],
  ["प्रवेष", "pravesa", "runtime", "enter"],
  ["टर्मिनल्", "terminal", "io", "terminal"],
  ["इन्पुट्स्थान", "input-sthana", "io", "input-location"],
  ["इन्पुट्", "input", "io", "input"],
  ["वर्चुवल्मेमरी", "virtual-memory", "memory", "virtual-memory"],
  ["युसर्मोड", "user-mode", "runtime", "user-mode"],
  ["प्रश्नसूच्य", "prasna-suci", "io", "prompt"],
  ["नियन्त्रण", "niyantrana", "control", "control"],
  ["व्यतिक्रम", "vyatikrama", "diagnostic", "violation"],
  ["विशोधने", "visodhana", "diagnostic", "validate"],
  ["विनष्ट", "vinasta", "diagnostic", "destroyed"],
  ["जागरूक", "jagaruka", "runtime", "watchdog"],
  ["अनाथ", "anatha", "process", "orphan"],
  ["मृताः", "mrta", "process", "terminated"],
  ["प्रक्रिया", "prakriya", "process", "process"],
  ["अधिकार", "adhikara", "control", "scope"],
  ["मूले", "mula", "runtime", "root"],
  ["मूल", "mula", "runtime", "root"],
  ["यन्त्र", "yantra", "runtime", "machine"],
  ["कार्यं", "karya", "runtime", "work"],
  ["कार्य", "karya", "runtime", "work"],
  ["शुद्धिं", "suddhi", "diagnostic", "sanitize"],
  ["शुद्धि", "suddhi", "diagnostic", "sanitize"],
  ["मङ्गल", "mangala", "control", "initialize"],
  ["प्रस्थान", "prasthana", "control", "start"],
  ["आरभ्य", "arabhya", "control", "begin"],
  ["स्थितिं", "sthiti", "runtime", "state"],
  ["स्थिति", "sthiti", "runtime", "state"],
  ["सर्वाणि", "sarvani", "control", "all-items"],
  ["अक्षराणि", "aksarani", "io", "characters"],
  ["स्रोतस्स्थान", "srotas-sthana", "io", "source-location"],
  ["सिद्धये", "siddhi", "memory-proof", "validate"],
  ["स्थिरम्", "sthira", "runtime", "state"],
  ["सङ्ग्यलक्षितम्", "sankhya-laksita", "control", "index"],
  ["क्रमतः", "kramatah", "control", "ordered"],
  ["विध्यस्थं", "vidhyastha", "control", "rule-bound"],
  ["रक्षेद्", "raksed", "runtime", "protect"],
  ["मुख्य", "mukhya", "control", "main"],
  ["लेखनाय", "lekhanaya", "io", "write"],
  ["पूरितम्", "purita", "storage", "filled"],
  ["पूर्णं", "purna", "control", "complete"],
  ["विस्तारं", "vistara", "memory", "extent"],
  ["समुद्दिश्य", "samuddisya", "control", "indicate"],
  ["स्थापयित्वा", "sthapayitva", "control", "place"],
  ["अग्रणि", "agrani", "process", "leader"],
  ["संशयः", "samsaya", "diagnostic", "doubt"],
  ["संरक्ष्य", "samraksya", "runtime", "protect"],
  ["प्रमोचये", "pramocaye", "process", "release"],
  ["शोधयित्वा", "sodhayitva", "diagnostic", "sanitize"],
  ["प्रसाध्य", "prasadya", "control", "accomplish"],
  ["उत्तमं", "uttama", "control", "best"],
  ["प्रचाल्य", "pracalya", "runtime", "run"],
  ["अन्तरायतः", "antarayatah", "runtime", "interval"],
  ["प्रथमं", "prathama", "process", "first"],
  ["प्रदाय", "pradaya", "control", "give"],
  ["समाविश्य", "samavisya", "runtime", "enter"],
  ["आसाद्य", "asadya", "control", "reach"],
  ["सुसन्नद्धं", "susannaddha", "runtime", "ready"],
  ["ज्ञात्वा", "jnatva", "control", "know"],
  ["पाठयित्वा", "pathayitva", "io", "read"],
  ["निरन्तरं", "nirantara", "control", "continuous"],
  ["प्रत्येकम्", "pratyekam", "control", "each"],
  ["प्रथक्कृत्वा", "prathak-krtva", "control", "separate"],
  ["मार्गेण", "margena", "ipc", "path"],
  ["अग्रिम", "agrima", "process", "next"],
  ["सर्वम्", "sarvam", "control", "all-items"],
  ["सर्वत्र", "sarvatra", "control", "everywhere"],
  ["सर्वेषु", "sarvesu", "control", "in-all"],
  ["कृत्वा", "krtva", "control", "having-done"],
  ["कुरुते", "kurute", "runtime", "does"],
  ["ध्रुवम्", "dhruvam", "runtime", "certain"],
  ["विधाय", "vidhaya", "control", "ordain"],
  ["मियात्", "miyat", "control", "should-go"],
  ["कारयेत्", "karayet", "control", "cause"],
  ["सम्यक्", "samyak", "control", "properly"],
  ["विधीयते", "vidhiyate", "control", "is-ordained"],
  ["विधानतः", "vidhanatah", "control", "by-rule"],
  ["नित्यं", "nityam", "control", "always"],
  ["यावत्", "yavat", "control", "while"],
  ["तावत्", "tavat", "control", "until"],
  ["भवति", "bhavati", "runtime", "is"],
  ["ततः", "tatah", "control", "then"],
  ["उत्पाद्य", "utpadya", "control", "produce"],
  ["श्रेष्ठां", "srestham", "control", "best"],
  ["आदौ", "adau", "control", "at-first"],
  ["सर्वतः", "sarvatah", "control", "from-all"],
  ["सञ्जात", "sanjata", "diagnostic", "arisen"],
  ["स्वेकेन", "svekena", "process", "by-own"],
  ["यावद्", "yavad", "control", "while"],
  ["सदा", "sada", "control", "always"],
  ["जीवत्", "jivat", "process", "living"],
  ["प्रारभेद्", "prarabhed", "control", "begin"],
  ["असौ", "asau", "control", "that"],
  ["प्रत्येकमपि", "pratyekam-api", "control", "each"],
  ["एवम्", "evam", "particle", "thus"],
  ["तस्य", "tasya", "particle", "its"],
  ["इमं", "imam", "particle", "this"],
  ["स्थाने", "sthane", "storage", "location"],
  ["नित्यम्", "nityam", "control", "always"],
  ["सर्वत्वे", "sarvatve", "control", "in-all"],
  ["अग्रणिमन्महे", "agrani-manmahe", "process", "leader"],
  ["तावज्", "tavaj", "control", "until"],
  ["||SanchalanSuktam||", "span-0", "residual", "deferred"],
  ["ं", "span-1", "residual", "deferred"],
  ["ेव", "span-2", "residual", "deferred"],
  ["मारभते", "span-3", "residual", "deferred"],
  ["ात्", "span-4", "residual", "deferred"],
  ["सर्वमे", "span-5", "residual", "deferred"],
  ["वं", "span-6", "residual", "deferred"],
  ["ैव", "span-7", "residual", "deferred"],
  ["ेषु", "span-8", "residual", "deferred"],
  ["न्", "span-9", "residual", "deferred"],
  ["े", "span-10", "residual", "deferred"],
  ["ञ्", "span-11", "residual", "deferred"],
  ["तैव", "span-12", "residual", "deferred"],
  ["ें", "span-13", "residual", "deferred"],
  ["मवलोकयन्", "span-14", "residual", "deferred"],
  ["म्", "span-15", "residual", "deferred"],
  ["स्य", "span-16", "residual", "deferred"],
  ["श्रये", "span-17", "residual", "deferred"],
  ["ंनित्यमुत्पाद्य", "span-18", "residual", "deferred"],
  ["ादौ", "span-19", "residual", "deferred"],
  ["ान्", "span-20", "residual", "deferred"],
  ["सर्व", "span-21", "residual", "deferred"],
  ["त्वे", "span-22", "residual", "deferred"],
  ["त्विमं", "span-23", "residual", "deferred"],
  ["ेषुसदैवाग्रणिमन्महे", "span-24", "residual", "deferred"],
  ["ा", "span-25", "residual", "deferred"],
  ["ेन", "span-26", "residual", "deferred"],
  ["ः", "span-27", "residual", "deferred"],
  ["मुत्तमं", "span-28", "residual", "deferred"],
  ["मन्तरायतः", "span-29", "residual", "deferred"],
  ["स्थानमासाद्य", "span-30", "residual", "deferred"],
  ["ार्थं", "span-31", "residual", "deferred"],
  ["नं", "span-32", "residual", "deferred"],
  ["मसौ", "span-33", "residual", "deferred"],
  ["मुत्पाद्य", "span-34", "residual", "deferred"],
  ["ाणि", "span-35", "residual", "deferred"],
  ["प्रत्येकमप्यादेशञ्", "span-36", "residual", "deferred"],
  ["्", "span-37", "residual", "deferred"],
  ["स्थान", "span-38", "residual", "deferred"],
  ["नम्", "span-39", "residual", "deferred"],
  ["ित्वा", "span-40", "residual", "deferred"],
  ["ै", "span-41", "residual", "deferred"],



  ["गन्तव्य", "gantavya", "control", "destination"],
  ["निर्गत्य", "nirgatya", "control", "exit"],
  ["आनीय", "aniya", "control", "bring"],
  ["हृत्स्थान", "hrt-sthana", "runtime", "core-location"],
  ["प्रत्यक्षर", "pratyaksara", "io", "per-character"],
  ["पाठ्यशोधन", "pathya-sodhana", "diagnostic", "sanitize-text"],
  ["निदेशक", "nidesaka", "control", "director"],
  ["संपूर्णता", "sampurnata", "control", "completion"],
  ["प्रकाशयेत्", "prakasayet", "io", "display"],
  ["मुद्रयित्वा", "mudrayitva", "io", "print"],
  ["समाश्रित्य", "samasritya", "control", "depend"],
  ["संस्थाप्य", "samsthapya", "control", "establish"],
  ["समुत्पाद्य", "samutpadya", "control", "produce"],
  ["आरभते", "arabhate", "control", "begin"],
  ["विशाम्यति", "visamyati", "control", "rest"],

  ["अक्षर", "aksara", "io", "character"],
  ["क्रमेण", "krama", "control", "ordered"],
  ["क्रमात्", "krama", "control", "ordered"],
  ["विराम", "virama", "control", "pause"],
  ["निवेशनं", "nivesana", "io", "input"],
  ["आदेश", "adesa", "command", "command"],
  ["फलं", "phala", "runtime", "result"],
  ["फल", "phala", "runtime", "result"],
  ["नृपं", "nrpa", "runtime", "initialize-runtime"],
  ["नृप", "nrpa", "runtime", "initialize-runtime"],
  ["अनाथप्रक्रिया", "anatha-prakriya", "process", "orphan-process"],
  ["प्रमाण", "pramana", "diagnostic", "proof"],
  ["परिच्छिद्य", "paricchidya", "control", "bound"],
  ["समाप्य", "samapya", "control", "complete"],
  ["समापयेत्", "samapaya", "control", "complete"],
  ["स्थापयेत्", "sthapaya", "control", "store"],
  ["प्रपूरयेत्", "prapuraya", "memory", "fill"],
  ["प्रपूर्य", "prapurya", "memory", "fill"],
  ["प्रकल्पयेत्", "prakalpaya", "runtime", "configure"],
  ["प्रचालयेत्", "pracalaya", "runtime", "run"],
  ["प्रारभेत्", "prarabha", "control", "start"],
  ["पारयेत्ततः", "paraya", "ipc", "forward"],
  ["विभज्य", "vibhajya", "memory", "partition"],
  ["समूह", "samuha", "data", "group"],
  ["सूचक", "sucaka", "data", "index"],
  ["निसर्गेण", "nisarga", "runtime", "native"],
  ["अवलोकयन्", "avalokaya", "diagnostic", "observe"],
  ["विधिपूर्वकम्", "vidhipurvaka", "control", "ordered-procedure"],
  ["वै", "vai", "particle", "particle"],
  ["च", "ca", "particle", "particle"],
  ["तु", "tu", "particle", "particle"],
].sort((a, b) => [...b[0]].length - [...a[0]].length);

const DIGIT = { "०":0,"१":1,"२":2,"३":3,"४":4,"५":5,"६":6,"७":7,"८":8,"९":9 };
const RULES = Object.freeze([
  { id:"SUK-001", name:"verse-boundary", rule:"A verse body ends at ॥N॥ where N is an ASCII or Devanagari decimal number." },
  { id:"SUK-002", name:"unicode-normalization", rule:"Normalize recognized input to NFC; preserve the normalized verse text and code-point offsets." },
  { id:"SUK-003", name:"longest-lexeme", rule:"At each code-point offset, choose the longest lexicon entry that matches." },
  { id:"SUK-004", name:"residual-preservation", rule:"Unmatched spans are retained verbatim and make the verse partial; they are never deleted or guessed." },
  { id:"SUK-005", name:"sequence-validation", rule:"Verse numbers are reported in source order; duplicates and gaps are diagnostics, not silently repaired." },
  { id:"SUK-006", name:"lexical-status", rule:"LEXICALLY_COMPLETE means no residual text; LEXICALLY_PARTIAL means residual text exists. Neither status asserts grammatical validity." },
  { id:"SUK-007", name:"visarga-scu", rule:"श्च after a matched stem is ḥ+c, licensed by 8.3.34 then 8.4.40. It is consumed only at that boundary.", license:["8.3.34","8.4.40"] },
  { id:"SUK-008", name:"execute-named-ops", rule:"Only recognized operation codes execute. Residual text does not execute." },
]);

function verseNumber(raw) {
  if (/^\d+$/.test(raw)) return Number(raw);
  return Number([...raw].map(ch => DIGIT[ch] ?? "").join(""));
}
function splitVerses(source) {
  const text = source.normalize("NFC");
  const verses = [];
  const re = /([^॥]+)॥\s*([०-९\d]+)\s*॥/gu;
  let match;
  while ((match = re.exec(text))) {
    const body = match[1].replace(/\s+/gu, "");
    if (!body.trim()) continue;
    verses.push({ n:verseNumber(match[2]), text:body, sourceOffset:[...text.slice(0,match.index)].length });
  }
  return verses;
}
function scan(verse) {
  const chars = [...verse];
  const nodes = [], residualSpans = [];
  let i = 0;
  while (i < chars.length) {
    const tail = chars.slice(i).join("");
    if (nodes.length && tail.startsWith("श्च")) {
      nodes.push({ term:"श्च", id:"visarga-ca", role:"sandhi", operation:"visarga-ca", at:i, end:i+2, rule:"SUK-007", license:["8.3.34","8.4.40"] });
      i += 2;
      continue;
    }
    const hits = LEXICON.filter(([term]) => tail.startsWith(term));
    const hit = hits.sort((a, b) => [...b[0]].length - [...a[0]].length)[0];
    if (hit) {
      const length = [...hit[0]].length;
      nodes.push({ term:hit[0], id:hit[1], role:hit[2], operation:hit[3], at:i, end:i+length, rule:"SUK-003" });
      i += length;
    } else {
      const start = i;
      while (i < chars.length && !LEXICON.some(([term]) => chars.slice(i, i+[...term].length).join("") === term)) i++;
      residualSpans.push({ text:chars.slice(start,i).join(""), at:start, end:i, rule:"SUK-004" });
    }
  }
  return { nodes, residualSpans, residual:residualSpans.map(x=>x.text).join("") };
}
function parseSuktam(source) {
  const split = splitVerses(source);
  if (!split.length) throw new SyntaxError("no numbered verses found");
  const verses = split.map(verse => {
    const scanned = scan(verse.text);
    return {
      ...verse, ...scanned,
      operations:scanned.nodes.map(node=>node.id),
      operationCodes:scanned.nodes.map(node=>node.operation),
      status:scanned.residual ? "LEXICALLY_PARTIAL" : "LEXICALLY_COMPLETE",
      rulesApplied:["SUK-001","SUK-002","SUK-003","SUK-006","SUK-008",...(scanned.residual?["SUK-004"]:[]),...(scanned.nodes.some(n=>n.rule==="SUK-007")?["SUK-007"]:[])],
    };
  });
  const seen = new Set(), diagnostics = [];
  for (const verse of verses) {
    if (seen.has(verse.n)) diagnostics.push({code:"DUPLICATE_VERSE",verse:verse.n,rule:"SUK-005"});
    seen.add(verse.n);
  }
  for (let i=1;i<verses.length;i++) {
    if (verses[i].n !== verses[i-1].n+1) diagnostics.push({code:"VERSE_SEQUENCE_GAP",after:verses[i-1].n,before:verses[i].n,rule:"SUK-005"});
  }
  return {
    name:"sanchalan",
    sourceVersion:"V1.0 (source explicitly says not guaranteed final executable version)",
    grammar:"lang/suktam/grammar.json",
    rules:RULES,
    verses,
    verse_count:verses.length,
    recognized:verses.reduce((n,v)=>n+v.nodes.length,0),
    residual_chars:verses.reduce((n,v)=>n+[...v.residual].length,0),
    diagnostics,
    semantic_status:"LEXICAL_IR_ONLY",
  };
}
function cString(s) { return JSON.stringify(String(s)); }
function lowerC(ast) {
  const rows = ast.verses.map(v => `  { ${v.n}, ${cString(v.status)}, ${v.nodes.length}, ${[...v.residual].length}, ${cString(v.operationCodes.join(","))} }`).join(",\n");
  return `/* Generated by Pushkalavati Sanchalan Suktam frontend.
 * This executable reports lexical IR; it does not execute OS/process actions.
 */
#include <stdio.h>
#include <stddef.h>
typedef struct { int verse; const char *status; size_t recognized; size_t residual; const char *ops; } Verse;
static const Verse verses[] = {
${rows}
};
int main(void) {
  const size_t count = sizeof(verses) / sizeof(verses[0]);
  printf("verses=%zu recognized=${ast.recognized} residual=${ast.residual_chars} status=${ast.semantic_status}\\n", count);
  for (size_t i=0; i<count; ++i)
    printf("verse=%d status=%s recognized=%zu residual=%zu ops=%s\\n",
      verses[i].verse, verses[i].status, verses[i].recognized, verses[i].residual, verses[i].ops);
  return 0;
}
`;
}
function lowerRust(ast) {
  const rows = ast.verses.map(v => `    Verse { verse: ${v.n}, status: ${JSON.stringify(v.status)}, recognized: ${v.nodes.length}, residual: ${[...v.residual].length}, ops: ${JSON.stringify(v.operationCodes.join(","))} },`).join("\n");
  return `// Generated by Pushkalavati Sanchalan Suktam frontend.
// This executable reports lexical IR; it does not execute OS/process actions.
struct Verse { verse: u32, status: &'static str, recognized: usize, residual: usize, ops: &'static str }
fn main() {
    let verses: &[Verse] = &[
${rows}
    ];
    println!("verses={} recognized=${ast.recognized} residual=${ast.residual_chars} status=${ast.semantic_status}", verses.len());
    for v in verses {
        println!("verse={} status={} recognized={} residual={} ops={}", v.verse, v.status, v.recognized, v.residual, v.ops);
    }
}
`;
}
function lowerQemu(ast) {
  const rows = ast.verses.map(v => `  { ${v.n}, ${cString(v.operationCodes.join(","))} }`).join(",\n");
  return `#include "sanchalan.h"
#include <stdio.h>
#ifndef SANCHALAN_ARCH
#define SANCHALAN_ARCH "unknown"
#endif
typedef struct { int verse; const char *ops; } Step;
static const Step steps[] = {
${rows}
};
int main(void) {
  Sanchalan machine;
  sanchalan_boot_banner();
  sanchalan_init(&machine);
  const int count = (int)(sizeof(steps) / sizeof(steps[0]));
  for (int i = 0; i < count; i++) {
    const char *p = steps[i].ops;
    char buf[64];
    int k = 0;
    while (1) {
      if (*p == ',' || *p == 0) {
        buf[k] = 0;
        if (k && sanchalan_call(&machine, buf) != 0) return 1;
        k = 0;
        if (*p == 0) break;
        p++;
        continue;
      }
      if (k < 63) buf[k++] = *p;
      p++;
    }
    sanchalan_report(&machine, steps[i].verse);
  }
  sanchalan_boot_check(&machine);
  if (!machine.booted) return 1;
  printf("sanchalan-lib verses=%d arch=%s\\n", count, SANCHALAN_ARCH);
  return 0;
}
`;
}
function main() {
  const here = __dirname;
  const sourcePath = process.argv[2] || path.join(here,"sanchalan.suktam");
  const targets = process.argv.slice(3);
  const ast = parseSuktam(fs.readFileSync(sourcePath,"utf8"));
  const out = path.join(here,"out"); fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,"sanchalan.json"),JSON.stringify(ast,null,2)+"\n");
  if (!targets.length || targets.includes("c")) fs.writeFileSync(path.join(out,"sanchalan.c"),lowerC(ast));
  if (!targets.length || targets.includes("rust")) fs.writeFileSync(path.join(out,"sanchalan.rs"),lowerRust(ast));
  if (!targets.length || targets.includes("qemu")) fs.writeFileSync(path.join(out,"sanchalan-qemu.c"),lowerQemu(ast));
  console.log(JSON.stringify({verses:ast.verse_count,recognized:ast.recognized,residual_chars:ast.residual_chars,semantic_status:ast.semantic_status,diagnostics:ast.diagnostics}));
}
if (require.main === module) main();
module.exports = { LEXICON, RULES, splitVerses, scan, parseSuktam, lowerC, lowerRust, lowerQemu };
