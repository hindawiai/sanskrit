# Benchmarks

Shared cases in `cases.json`. Run with:

```
cd benchmarks && python3 run.py
```

| adapter | what it runs | when |
|---|---|---|
| pushkalavati | the project's sandhi executor | always |
| vidyut | vendored generator example | if `cargo` can build `third_party/vidyut` |
| sanskrit_parser | sandhi join | if `pip install sanskrit_parser` |
| external | recorded, not run | Heritage, Samsaadhanii, SanskritShala, Dharmamitra |

A result with `ok` was checked against the expected string. `not_applicable` means the system is the wrong kind for that case: a generator is not scored on analysis, and an analyzer is not scored on generation. `external` means the system is real and licensed as noted, and is not installed here.

The cases are small on purpose. They are enough to show which system can answer which question. They are not a coverage claim.
