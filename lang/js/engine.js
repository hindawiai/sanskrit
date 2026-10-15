/**
 * Sūtram, corrected core: a RULE-REWRITE engine, not a sequential imperative
 * interpreter. The previous version (lang/interpreter.py) was imperative
 * statements wearing Sanskrit names -- karta didn't do anything a normal
 * variable doesn't already do. This is the actual fix, not an addition.
 *
 * A Paninian rule is a conditional rewrite: IF a pattern matches the current
 * state, TRANSFORM it. Which rule fires when several match is resolved by
 * 1.4.2, quoted from data/sutras.json: "विप्रतिषेधे परं कार्यम्"
 * (padaccheda "विप्रतिषेधे ७/१ परम् १/१ कार्यम् १/१"). Among matching rules,
 * the more specific one wins; among equally specific rules, the later
 * registered one wins. That later-wins reading is this project's operational
 * reading of 1.4.2, not a claim that the paribhasha tradition has no further
 * constraints (1.4.1 एका संज्ञा is a different conflict, and is not what
 * Engine.step implements). Execution is: repeatedly fire the winning matching
 * rule until none match (fixpoint).
 * That loop -- not a sequence of statements -- is what a Sutram program runs.
 *
 * The rule-validity requirement is new and comes from a different source:
 * Nyaya's pancavayava (five-membered syllogism -- pratijna, hetu, udaharana,
 * upanaya, nigamana; verified against Britannica and independent academic
 * sources, "fire on the hill because smoke, as in a kitchen..." example).
 * Udaharana is not decoration there -- a general claim (vyapti) is only
 * admissible with a concrete supporting instance. So here: a rule is not
 * valid syntax without a worked example, and the engine runs that example
 * against the rule's own nigamana at definition time and REJECTS the rule
 * if it doesn't reproduce the stated output. Rules are self-certifying or
 * they don't load.
 */

class Rule {
  constructor({ name, adhikara, hetu, nigamana, specificity = 0, sutraKrama = null, udaharana }) {
    this.name = name;
    this.adhikara = adhikara;
    this.hetu = hetu;           // (state) => bool -- the matching condition
    this.nigamana = nigamana;   // (state) => state -- the transform
    this.specificity = specificity; // project-level precedence metadata; not inferred from the sutra corpus
    this.sutraKrama = Number.isInteger(sutraKrama) ? sutraKrama : null;
    this.registrationOrder = null;
    this.udaharana = udaharana; // { input, output } -- mandatory worked example

    if (!udaharana) {
      throw new Error(`rule '${name}': no udaharana -- a rule without a worked example isn't valid syntax here`);
    }
    const got = nigamana(udaharana.input);
    if (JSON.stringify(got) !== JSON.stringify(udaharana.output)) {
      throw new Error(`rule '${name}': udaharana failed self-test -- expected ${JSON.stringify(udaharana.output)}, got ${JSON.stringify(got)}`);
    }
  }
}

class Engine {
  constructor() { this.rules = []; }

  define(ruleSpec) {
    const rule = new Rule(ruleSpec); // throws if the udaharana doesn't hold
    rule.registrationOrder = this.rules.length;
    this.rules.push(rule);
    return this;
  }

  // One step: project-defined specificity is a heuristic precedence layer.
  // For equal specificity, prefer explicit traditional order (sutraKrama)
  // when both candidates have it; otherwise preserve registration order.
  // The data record for 1.4.2 is "विप्रतिषेधे परं कार्यम्" (data/sutras.json),
  // but that rule alone does NOT establish that this numeric heuristic fully
  // models Paninian vipratishedha. The engine exposes the policy; grammar
  // implementations must source/justify specificity and applicable contexts.
  // Returns null if no rule matches (fixpoint).
  step(state, adhikara) {
    const matching = this.rules.filter(r => r.adhikara === adhikara && r.hetu(state));
    if (matching.length === 0) return null;
    matching.sort((a, b) => {
      if (a.specificity !== b.specificity) return b.specificity - a.specificity;
      if (a.sutraKrama !== null && b.sutraKrama !== null && a.sutraKrama !== b.sutraKrama) return b.sutraKrama - a.sutraKrama;
      return b.registrationOrder - a.registrationOrder;
    });
    const winner = matching[0];
    return { rule: winner.name, state: winner.nigamana(state) };
  }

  run(initialState, adhikara, maxSteps = 100) {
    let state = initialState;
    const trace = [];
    for (let i = 0; i < maxSteps; i++) {
      const result = this.step(state, adhikara);
      if (result === null) return { state, trace };
      trace.push({ rule: result.rule, before: state, after: result.state });
      state = result.state;
    }
    throw new Error(`no fixpoint after ${maxSteps} steps -- likely two rules rewriting each other`);
  }
}

if (typeof module !== "undefined" && module.exports) module.exports = { Engine, Rule };
if (typeof globalThis !== "undefined") globalThis.SutramEngine = { Engine, Rule };
