# Pushkalāvatī / Nirgundi — integrated architecture

## Principle

The system keeps the grammatical rules in data tables and the category system / generic operations in the meta-grammar and interpreter. Functional categories overlap; they are not a waterfall. A sūtra can define, constrain, substitute, scope, or perform more than one function. The compiler must not turn a category label into an invented executable operation.

## Layers

1. **Source corpus:** `data/sutras.json` is the 3,983-record source index. Original records remain intact and separate from derived artifacts.
2. **Observed-form bootstrap:** `scripts/nirgundi/observed_form_bootstrap.py` extracts literal forms from `term`, `padaccheda`, `gloss`, and `anuvrtti[].term`, then applies deterministic longest-first literal substitution to each `sutra`. It emits inventory, stable IDs, per-sūtra substitution ledger, residuals, metrics, and hashes. This is a cross-representation experiment, not grammatical analysis.
3. **Functional meta-grammar:** `tools/pushkalavati-compiler/data/meta-grammar.json` defines overlapping functional categories and table-driven predicates. `src/classify.js` applies them across all records and preserves unclassified records.
4. **Rule operation tables:** `tools/pushkalavati-compiler/data/operations.json` stores source-grounded operation shapes, maps, context requirements, and attested vectors. Generic handlers live in `src/execute.js`; Python parity is in `python/execute.py`.
5. **Structural expansion:** `src/meta.js` propagates source-annotated anuvṛtti facts to a fixed point, keeping provenance. It does not infer an adhikāra from a locative form alone, nor invent operation semantics from inherited terms.
6. **Canonical rule IR and generated ledgers:** `out/rules-ir.json`, `out/functional-classification.json`, `out/meta-expansion.json`, `out/generated-rules.json`, and `out/progress.json` are reproducible derived artifacts.
7. **Sūtram language front end:** `lang/lexer.py`, `lang/parser.py`, `lang/interpreter.py` and their JavaScript counterparts parse and run `.su` programs. The JavaScript rewrite engine, Śivasūtra primitives, Vaiśeṣika padārtha model, conversion prototype, and OOP/functional/imperative examples are included. This language prototype is not the same as a complete Sanskrit derivation engine.
8. **Sanskrit analysis API:** `python/` and `js/` expose segmentation, lexicon, and pipeline slices. Their implementation status is recorded separately; the morphology and kāraka layers are not represented as complete.

## Functional category set

`combine`, `split`, `substitute`, `insert`, `delete`, `affix`, `transform`, `derive`, `relate`, `constrain`, `define`, `scope_inherit`, `override`, `transfer`, `interpret`. These are labels with semantics and predicates in the meta-grammar, not mandatory execution stages.

## Data contract

Every derived fact should carry source record ID, source field or rule, inference mechanism, and verification status. Missing annotation is not a negative fact. Literal matching is not semantic understanding. Category classification is not executable semantics. An operation becomes `executable_tested` only after a sourced example and negative applicability tests pass in both JavaScript and Python.

## Current boundaries

- 3,983 source records are inventoried; they are not all executable.
- 15 functional categories are present in the classifier. The assignments are preliminary pattern/evidence-based hypotheses and need review.
- 11 rule-local operations are executable-tested. The remainder are categorized as definition-resolved, meta-rule, derivable-untested, blocked, or requiring semantic annotation.
- The Sūtram self-hosting cycle remains a 22-sūtra / 8-section prototype fixture, not full-corpus self-hosting.
- The observed-form bootstrap's generated metrics must be interpreted under its own explicitly declared tokenization. They must not be conflated with prior reported metrics from a different extraction variant.
- No external repository push is performed by this build.
