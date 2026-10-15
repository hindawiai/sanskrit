# Implementation registry

`tools/registry.py` writes `data/implementation-registry.json`.

| layer | count | meaning |
|---|---|---|
| own executor | 24 | rules `execute.py` / `execute.js` can run |
| structural conversion | 3983 | padaccheda, roles, anuvrtti; not executable |
| categories | 3983 | Tajziya join (samjna, vidhi, atidesha, adhikara, paribhasha) |
| dhatupatha | 2259 | Vidyut's Dhātupāṭha, MIT, from the vendored source and summarized under `data/external/` |
| vidyut rule ids | 2153 | sutra ids that appear in vendored Vidyut source |

A sutra id in the Vidyut column means Vidyut's generator implements it. It does not mean this project's executor implements it.

The source path recorded in `data/implementation-registry.json` is `third_party/vidyut-prakriya/`; the older `third_party/vidyut/vidyut-prakriya/` path is a documentation/reference snapshot, not the active vendored source tree.
