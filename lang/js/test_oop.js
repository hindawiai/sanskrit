const assert = require('node:assert/strict');
const { SamanyaRegistry } = require('./padartha');
const types = new SamanyaRegistry()
  .define('vehicle', { karmas: { describe: self => `${self.value} moves` } })
  .define('car', { parent: 'vehicle', karmas: { describe: self => `${self.value} drives` } })
  .define('electric-car', { parent: 'car', karmas: { range: self => self.gunas.get('km') } , gunas: { km: 420 } });
const a = types.instantiate('electric-car', 'EV');
const b = types.instantiate('electric-car', 'EV');
assert.equal(a.invoke('describe'), 'EV drives');
assert.equal(a.invoke('range'), 420);
assert.deepEqual(a.samanyaLineage, ['vehicle', 'car', 'electric-car']);
assert.notEqual(a.vishesha, b.vishesha);
console.log('OOP mapping PASS: 3-level inheritance, override, composition, distinct identity');
