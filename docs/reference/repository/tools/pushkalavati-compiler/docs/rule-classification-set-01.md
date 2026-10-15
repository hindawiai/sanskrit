# Rule Classification Set 01 — Functional operations

**Status:** specification / first classification set. This document defines the first batch-level contract. It does not claim that every sūtra has already been classified or that the listed categories are all mutually exclusive.

## Contract

Every conversion rule in this set is expressed as **Precondition → Rule → Postcondition**. The same contract applies to a batch, not only to a single sūtra.

### Set-level rule: classify before execution

**Precondition**

- The source inventory is available with stable sūtra identifiers and source text.
- Source-grounded annotations may include padaccheda, anuvṛtti, glosses, and references; missing or uncertain annotations remain explicitly missing or uncertain.
- The batch may contain rules whose semantics are incomplete, inherited, ambiguous, or dependent on other rules.

**Rule**

For each source record, determine one or more functional categories describing what the sūtra does. Preserve three distinct layers:

1. **Source interpretation:** what the source text and evidence support.
2. **Functional classification:** the operation or role performed by the sūtra.
3. **Executable semantics:** operands, context, constraints, precedence, and a formal operation suitable for execution.

Do not infer executable semantics from a category label alone. Categories can overlap. Classification must not overwrite source text or silently resolve uncertainty. After classification, expand inherited context (including anuvṛtti and adhikāra candidates), normalize rule representations, and only then attempt execution and validation.

**Postcondition**

- Every processed record has a classification status: classified, multi-classified, ambiguous, or unclassified.
- Each assigned category has provenance and a confidence/evidence note.
- Unresolved details remain explicit.
- No record becomes executable merely because it has a category.
- The batch report distinguishes classified records from semantically resolved and executable-tested records.

## Functional categories — first set

Each category below is a classification rule. These are functional labels, not claims that each corresponding Sanskrit term is interchangeable with every other term.

### C01 — Combine / Sandhi (सन्धि)

**Precondition:** The sūtra conditions a joining or coalescence of adjacent sounds, morphemes, or forms.

**Rule:** Classify as `combine` / `sandhi`; record the left and right operands, boundary type, phonological environment, and any exceptions when supported by the source.

**Postcondition:** The record identifies a conditional combination operation. A concrete rewrite is executable only when its operands and context predicates are resolved.

### C02 — Expand or split / Viccheda, Padaccheda (विच्छेद, पदच्छेद)

**Precondition:** The task is to analyze a surface sequence into constituent units or recover candidate underlying forms.

**Rule:** Classify the analysis operation as `split` / `viccheda`. Permit multiple candidate segmentations when the evidence allows them; do not assume this is a deterministic inverse of sandhi.

**Postcondition:** The output is one or more candidate analyses with boundaries, evidence, and constraints. Ambiguity is retained rather than silently discarded.

### C03 — Substitute / Ādeśa (आदेश)

**Precondition:** A rule prescribes that a source element or class be represented by a replacement element or class.

**Rule:** Classify as `substitute` / `adesha`; identify the target, replacement, triggering environment, and scope if attested.

**Postcondition:** A substitution relation is represented. It is executable only when source class, replacement, and applicability conditions are sufficiently resolved.

### C04 — Insert / Āgama (आगम)

**Precondition:** A rule introduces an additional segment, marker, affix, or other grammatical element.

**Rule:** Classify as `insert` / `agama`; preserve insertion site, inserted material, conditions, and ordering dependencies.

**Postcondition:** The representation states what is inserted and where, without conflating insertion with replacement.

### C05 — Delete / Lopa (लोप)

**Precondition:** A rule removes or suppresses an element in a defined grammatical environment.

**Rule:** Classify as `delete` / `lopa`; record the target, triggering conditions, and whether deletion is phonological, morphological, or representational when the evidence supports that distinction.

**Postcondition:** A deletion operation is represented with its scope and conditions; no deletion is inferred solely from absence in a surface form.

### C06 — Affixation and derivation / Pratyaya and Vidhi (प्रत्यय, विधि)

**Precondition:** A rule prescribes an affix or participates in constructing a derived, inflected, or otherwise grammatically formed expression.

**Rule:** Classify as `affix` and/or `derive`; distinguish affix selection, attachment, and subsequent transformations when possible.

**Postcondition:** The derivational role and dependencies are recorded. The category does not imply that the complete derivation chain is implemented.

### C07 — Transform / Vikāra or other internal transformation

**Precondition:** A rule changes the internal form or features of a unit without being adequately described by a simple boundary combination, insertion, deletion, or substitution alone.

**Rule:** Classify as `transform`; specify the changed representation or features and retain a more specific traditional label when source-supported.

**Postcondition:** The transformation is represented without forcing it into an unsuitable primitive operation. Multiple primitive effects may be recorded when justified.

### C08 — Select, scope, or inherit / Saṃjñā, Adhikāra, Anuvṛtti

**Precondition:** A rule defines a technical class, establishes a domain of applicability, or contributes material inherited by later rules.

**Rule:** Classify the relevant role as `define`, `scope`, or `inherit`. Keep explicit source annotations distinct from inferred relationships. Treat adhikāra boundaries as unresolved candidates unless supported by adequate evidence.

**Postcondition:** Definitions, scope candidates, and inheritance edges are available as typed relations with provenance. A guessed scope is not silently applied as fact.

### C09 — Override or resolve competition / Apavāda, Utsarga, Vipratiṣedha

**Precondition:** Two or more rules may apply to the same derivational state, or a specific rule limits a general rule.

**Rule:** Classify the relationship as `override`, `exception`, or `conflict_resolution` only when evidence supports it. Record the competing rules, relevant specificity, and the source of precedence.

**Postcondition:** A precedence relation or unresolved conflict is recorded. Rule order is not invented merely because one rule appears earlier in the source inventory.

### C10 — Extend or transfer / Atideśa (अतिदेश)

**Precondition:** A rule transfers a property, status, or operation from one grammatical context to another.

**Rule:** Classify as `transfer`; identify the source context, target context, and transferred property or behavior.

**Postcondition:** The transfer relation is explicit and traceable. It is not reduced to ordinary inheritance unless the source semantics justify that reduction.

### C11 — Interpret or constrain interpretation / Paribhāṣā (परिभाषा)

**Precondition:** A rule governs how grammatical rules are interpreted, prioritized, or applied rather than directly changing a word form.

**Rule:** Classify as `interpreter_policy` / `interpret`; represent the policy separately from ordinary rewrite operations.

**Postcondition:** The execution engine can consult the policy when resolving applicability or competition. A paribhāṣā is not automatically compiled into a surface-string rewrite.

### C12 — Relate constituents / Kāraka, Vibhakti, Anvaya

**Precondition:** A rule establishes or constrains relations among syntactic constituents, semantic roles, or case marking.

**Rule:** Classify as `relate`; record the participants, relation type, conditions, and links to source rules.

**Postcondition:** A syntactic/semantic relation is represented independently of phonological surface changes. A full parser is not implied by this classification.

### C13 — Constrain, license, or prohibit / Niyama, Pratiṣedha

**Precondition:** A rule restricts a class, licenses an otherwise limited operation, or prohibits a derivation in a context.

**Rule:** Classify as `constrain`, `license`, or `prohibit`, with the affected operation or class and the condition preserved.

**Postcondition:** The constraint can filter candidate rules or derivations. It does not create a positive transformation unless the source also prescribes one.

## Canonical record expected after classification

The first-set classifier should emit, or explicitly mark as unresolved, these fields:

- `sutra_id` and source text/reference;
- `source_interpretation` and evidence status;
- `functional_categories` (array; multiple values permitted);
- `operation_kind`;
- `operands` / target and result;
- `context_predicates`;
- `inherited_context` and its provenance;
- `constraints` / licensing / prohibitions;
- `dependencies`;
- `precedence` / exception relations;
- `execution_status` (`not_attempted`, `blocked`, `candidate`, `executable_untested`, `executable_tested`);
- unresolved questions and test vectors, where available.

Unknown fields must remain unknown or explicitly unresolved. Do not manufacture a substitute map, scope boundary, or precedence relation to make a record look complete.

## Batch postconditions and measures

A successful run of this first set reports at least:

1. total source records processed;
2. counts by functional category, including multi-label counts;
3. classified, ambiguous, and unclassified record counts;
4. source/evidence coverage;
5. unresolved semantic fields by type;
6. executable candidate and tested counts, separately;
7. provenance for every inferred classification or relationship.

The classification counts may overlap because categories may overlap. They must not be added together as if they partitioned the source inventory.

## Explicit scope boundary

This first set defines the classification contract and the functional taxonomy. It does **not** assert that the current compiler has already applied these classifications to all 3,983 records, nor that all categories have executable handlers. The next implementation step is to apply this contract across the inventory, emit a reviewable classification ledger, and test the batch results before promoting rules to executable status.
