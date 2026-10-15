const assert = require('node:assert/strict');
const {
  loadSlice, expand, buildSandhiEngine, join, paraSelfCheck,
} = require('./bootstrap');

const source = loadSlice();
assert.equal(source.length, 22, 'the current fixture is a 22-sutra slice');
const expanded = expand(source);
assert.equal(expanded.steps, 56, 'fixture meta-step count changed; inspect before updating');
const byId = new Map(expanded.sutras.map((s) => [s.id, s]));
assert.ok(byId.get('1.1.3').inherited.some((x) => x.term === 'वृद्धिः'));
assert.ok(byId.get('1.1.3').inherited.some((x) => x.term === 'गुणः'));
assert.ok(byId.get('6.1.87').inherited.some((x) => x.term === 'अचि'));
assert.ok(byId.get('6.1.87').inherited.some((x) => x.term === 'एकः'));
assert.ok(byId.get('6.1.87').inherited.some((x) => x.term === 'एकः' && x.from === '6.1.84'));

// Negative evidence: no source row for anuvrtti term means provenance must not
// be marked verified. This directly guards the former `|| true` bug.
const one = source.find((s) => s.id === '1.1.71');
const inherited = byId.get('1.1.71').inherited.find((x) => x.term === 'स्वम्');
assert.ok(inherited, 'expected declared anuvrtti term');
assert.equal(inherited.source_has_term, false);

const engine = buildSandhiEngine(expanded.sutras);
assert.equal(join(engine, 'nadii', 'aa').form, 'nadyaa');
assert.equal(join(engine, 'upa', 'indra').form, 'upendra');
assert.equal(join(engine, 'vidyaa', 'aalaya').form, 'vidyaalaya');
assert.equal(join(engine, 'daNDa', 'agra').form, 'daNDaagra');
assert.equal(paraSelfCheck(), 'later');

assert.throws(() => buildSandhiEngine(source), /missing/,
  'operational engine must reject the unexpanded slice');
console.log('Self-hosting cycle slice PASS: 22 sutras, 56 steps, provenance guard, four examples, refusal before expansion.');
console.log('Scope: prototype fixture only; this does not establish full Aṣṭādhyāyī self-hosting.');
