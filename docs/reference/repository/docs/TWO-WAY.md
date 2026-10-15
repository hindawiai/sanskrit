# Two-way grammar

The production is one operation. Forward applies it. Inverse recovers only the inputs that regenerate the surface under the same rule.

6.1.94 is the first closed pair. `pra + ejate` with upasarga and dhātu context generates `prejate`. Inverse on `prejate` under the same context recovers `pra + ejate`. Without the context, neither direction fires.

The Devanagari inverse slice in `src/inverse-reduction.js` remains the surface analyzer for prefix junctions. This module is the operation grammar those junctions have to meet.

```bash
node tests/two-way.test.js
```
