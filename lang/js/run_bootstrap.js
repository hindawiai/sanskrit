#!/usr/bin/env node
// Reproducible JSON export for the current hand-translated cycle slice.
const fs = require('node:fs');
const path = require('node:path');
const { loadSlice, expand, buildSandhiEngine, join, paraSelfCheck } = require('./bootstrap');

const source = loadSlice();
const result = expand(source);
const byId = new Map(result.sutras.map((s) => [s.id, s]));
const examples = [
  ['nadii', 'aa'], ['upa', 'indra'], ['vidyaa', 'aalaya'], ['daNDa', 'agra'],
].map(([left, right]) => {
  try {
    const engine = buildSandhiEngine(result.sutras);
    return { left, right, ...join(engine, left, right) };
  } catch (error) {
    return { left, right, error: error.message };
  }
});
const gained = result.sutras.filter((s) => s.inherited.length || s.resolved.length || s.atidesha);
const out = {
  scope: 'selected hand-translated prototype slice; not full Aṣṭādhyāyī coverage',
  sutras: result.sutras.length,
  sections: [...new Set(result.sutras.map((s) => s.id.split('.').slice(0, 2).join('.')))],
  meta_steps: result.steps,
  meta_rule_fires: result.trace.reduce((acc, step) => {
    acc[step.rule] = (acc[step.rule] || 0) + 1;
    return acc;
  }, {}),
  gained_sutra_ids: gained.map((s) => s.id),
  para_self_check: paraSelfCheck(),
  operational_examples: examples,
  rows: result.sutras,
};
const destination = process.argv[2];
const serialized = JSON.stringify(out, null, 2) + '\n';
if (destination) fs.writeFileSync(path.resolve(destination), serialized);
else process.stdout.write(serialized);
