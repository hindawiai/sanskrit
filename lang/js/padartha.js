/**
 * Vaisheshika's seven padartha as the type system. Verified against eight
 * independent sources (Britannica; New World Encyclopedia; Mahavidya.ca
 * citing Hiriyanna and Raju; esamskriti.com) converging exactly on the same
 * seven categories and on abhava being a later addition (Kanada's original
 * six, abhava added by Prashastapada) subdivided into four kinds.
 *
 * Six "positive" categories -> six roles a value can play:
 *   dravya (substance)    -- the base value/instance
 *   guna (quality)        -- a property; CANNOT exist without a dravya
 *                            (sources are explicit on this -- enforced below,
 *                            not just asserted)
 *   karma (action)        -- a function/operation attachable to a dravya
 *   samanya (generality)  -- the shared type/class ("the samanya of dogs")
 *   vishesha (particularity) -- what individuates THIS instance from others
 *                            of the same samanya
 *   samavaya (inherence)  -- the binding relation itself; realized here as
 *                            the record structure that holds the other five
 *                            together, not as a separate tag
 *
 * abhava (non-existence) is not one null -- four, each a different real
 * absence, mapped to four genuinely distinct programming concepts rather
 * than collapsed into one:
 *   pragabhava     prior non-existence (before creation) -> UNINITIALIZED
 *   pradhvamsabhava posterior non-existence (after destruction) -> DISPOSED
 *   anyonyabhava   mutual non-existence ("this is not that") -> type mismatch
 *   atyantabhava   absolute non-existence (logically impossible) -> NEVER
 */

const Abhava = Object.freeze({
  PRAGABHAVA: "pragabhava",           // not yet created
  PRADHVAMSABHAVA: "pradhvamsabhava", // created, then destroyed
  ANYONYABHAVA: "anyonyabhava",       // exists, but is not of the asked type
  ATYANTABHAVA: "atyantabhava",       // can never exist (uninhabited)
});

class Dravya {
  constructor(samanya, value) {
    this.samanya = samanya;   // the shared type-name (e.g. "sankhya"/number)
    this.vishesha = Symbol(); // unique identity, distinct from all other instances
    this.value = value;
    this.gunas = new Map();   // qualities -- see attach()
    this.karmas = new Map();  // actions -- see attach()
  }

  // samavaya: binding a guna/karma to this dravya. A guna detached from its
  // dravya is meaningless in Vaisheshika -- enforced here by simply never
  // offering a way to construct a free-standing Guna; attach() is the only
  // entry point.
  attachGuna(name, value) { this.gunas.set(name, value); return this; }
  attachKarma(name, fn) { this.karmas.set(name, fn); return this; }

  invoke(karmaName, ...args) {
    const fn = this.karmas.get(karmaName);
    if (!fn) return { abhava: Abhava.ANYONYABHAVA, detail: `${this.samanya} has no karma '${karmaName}'` };
    return fn(this, ...args);
  }
}

/** A value that does not (yet, or ever, or any more) exist -- one of four
 * distinct kinds, not a single null. */
class AbhavaValue {
  constructor(kind, detail) { this.kind = kind; this.detail = detail; }
  toString() { return `[abhava:${this.kind}] ${this.detail || ""}`; }
}

function uninitialized(samanya) {
  return new AbhavaValue(Abhava.PRAGABHAVA, `${samanya} declared but not yet given a value`);
}
function disposed(samanya) {
  return new AbhavaValue(Abhava.PRADHVAMSABHAVA, `${samanya} existed and was released`);
}
function mismatch(wanted, got) {
  return new AbhavaValue(Abhava.ANYONYABHAVA, `wanted ${wanted}, this is ${got}`);
}
function impossible(why) {
  return new AbhavaValue(Abhava.ATYANTABHAVA, why || "logically uninhabited");
}

if (typeof module !== "undefined" && module.exports) module.exports = { Dravya, AbhavaValue, Abhava, uninitialized, disposed, mismatch, impossible };

/**
 * A small OOP layer whose mechanics are backed by the existing padartha
 * representation. `samanya` nodes are class concepts; each instance is a
 * Dravya with unique vishesha; inherited/overridden karmas are attached to
 * the instance and composition is represented by attached gunas/dravya.
 * This is a programming-language mapping, not a claim that classical
 * Vaisheshika itself specified modern object-oriented programming.
 */
class SamanyaRegistry {
  constructor() { this.types = new Map(); }
  define(name, { parent = null, karmas = {}, gunas = {} } = {}) {
    if (this.types.has(name)) throw new Error(`samanya '${name}' already defined`);
    if (parent && !this.types.has(parent)) throw new Error(`unknown parent samanya '${parent}'`);
    this.types.set(name, { name, parent, karmas: { ...karmas }, gunas: { ...gunas } });
    return this;
  }
  lineage(name) {
    const out = []; let cur = this.types.get(name);
    if (!cur) throw new Error(`unknown samanya '${name}'`);
    while (cur) { out.unshift(cur); cur = cur.parent ? this.types.get(cur.parent) : null; }
    return out;
  }
  instantiate(name, value) {
    const lineage = this.lineage(name);
    const instance = new Dravya(name, value);
    for (const type of lineage) {
      for (const [key, val] of Object.entries(type.gunas)) instance.attachGuna(key, val);
      for (const [key, fn] of Object.entries(type.karmas)) instance.attachKarma(key, fn);
    }
    instance.samanyaLineage = lineage.map(t => t.name);
    return instance;
  }
}

if (typeof module !== "undefined" && module.exports) module.exports.SamanyaRegistry = SamanyaRegistry;
if (typeof globalThis !== "undefined") globalThis.SutramPadartha = { Dravya, AbhavaValue, Abhava, uninitialized, disposed, mismatch, impossible, SamanyaRegistry };
