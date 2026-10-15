# Handoff requirements — remaining work

How to use this document: each requirement below is self-contained. To
delegate one, copy its entire "Prompt for the executing AI" block to a
fresh AI session (it assumes zero prior context of this project beyond
what it's told to read). Do not hand over a whole section at once unless
the dependencies listed allow it — most requirements build on a specific
prior one.

**Non-negotiable project ethic, repeated in every prompt below on
purpose, not boilerplate:** this project's two biggest failures so far
were (1) presenting unsourced specifics as fact, and (2) building a
shallow pass across many things instead of one correct thing — both
cost real rework. Every requirement here inherits:
- Don't state a specific historical, linguistic, or grammatical fact
  (a sutra's exact text, a date, a technical claim) without a source;
  search and verify rather than recall from training data.
- Don't ship something that merely uses Sanskrit-derived names for
  ordinary mechanics. If a feature doesn't change how the system
  actually computes, it doesn't satisfy the requirement.
- Test what you build. "I wrote code that should do X" is not done;
  "I ran it and it produced X" is.
- If a requirement can't be fully completed, say exactly what's done
  and what isn't — do not imply completeness that isn't there.

Repo: `hindawiai/sanskrit` (per the project owner; not independently
confirmed to exist yet at time of writing — if it doesn't, create it
from the delivered `sanskrit-parser.zip`, which has full git history).

---

## Consolidated project context (read before delegating)

For the current corpus counts, compiler statuses, exact executable-operation inventory, Śivasūtra invariants, Nirgundi metrics discrepancy, known invalid implementation patterns, and Sūtram bootstrap boundary, read [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) and [`docs/GEMINI-HANDOFF-DATA.md`](docs/GEMINI-HANDOFF-DATA.md). These documents consolidate the major technical data into one handoff instead of requiring a recipient to assemble facts from many small files. They supplement—not replace—the acceptance criteria below.

## Part 1 — Sanskrit Parser core

### REQ-1.1: Morphological analyzer (real derivation/validation engine)

**Context:** `python/pipeline.py`'s `MorphAnalyzer.analyze()` is a stub
(raises `NotImplementedError`). `data/sutras.json` has all 3,983 sutras,
classified (`samjna`/`paribhasha`/`atidesha`/`vidhi`) with `anuvrtti` and
`padaccheda` where available. This is the actual hard problem of the
whole project — building derivation logic from the rule text.

**Requirement:** Implement `MorphAnalyzer.analyze(candidate) -> list[Token]`
such that, given a surface word, it returns every valid morphological
analysis (root/stem + grammatical features) derivable by applying
`vidhi` rules from `data/sutras.json`, respecting each rule's `anuvrtti`
context and the `para`/`apavada` conflict-resolution already specified
in `lang/js/engine.js`'s pattern (reuse that resolution model; don't
reinvent it).

**Prompt for the executing AI:**
> You're extending a Sanskrit computational-grammar project at
> `hindawiai/sanskrit`. Read `README.md` fully, then `python/rules.py`
> and `python/pipeline.py`. `data/sutras.json` has all 3,983 Ashtadhyayi
> sutras with fields `type`, `anuvrtti`, `padaccheda`. Your task: implement
> `MorphAnalyzer.analyze()` in `python/pipeline.py`, currently a stub, so
> it derives real morphological analyses by applying `vidhi`-type rules
> from the data file. Reuse the specificity/conflict-resolution model
> already implemented in `lang/js/engine.js` (apavada beats utsarga, para
> breaks ties) rather than designing new resolution logic. Start with a
> narrow, correct slice (e.g. one declension class) rather than a broad,
> unreliable one — state exactly which forms you handle. Every claim about
> what a specific sutra does must trace to its actual text in
> `data/sutras.json`, not to general knowledge of Sanskrit grammar. Test
> against real attested forms (cite your source for each) before claiming
> any coverage number. [Non-negotiable project ethic block — paste from
> HANDOFF.md's header.]

**Acceptance criteria:**
- [ ] `MorphAnalyzer.analyze()` no longer raises `NotImplementedError`
      for at least one declension or conjugation class
- [ ] Every rule the implementation applies is traceable to a specific
      `sutra_krama` in `data/sutras.json` (logged or documented, not
      just "grammar knowledge")
- [ ] A test suite checks output against attested forms from a cited
      source (e.g. a grammar textbook or `data/corpus_rv_1.1.json`-style
      corpus), not just that the code runs without error
- [ ] README.md's scope note states precisely which forms/classes are
      and are not covered
- [ ] `python/coverage.py` run against `data/corpus_rv_1.1.json` now
      reports at least one real `COVERED` or `NOT_COVERED` result
      (not 100% `CANNOT_CHECK`)

---

### REQ-1.2: Karaka parser (syntax/dependency layer)

**Context:** `KarakaParser.parse()` in `python/pipeline.py` is a stub.
Depends on REQ-1.1 (needs real `Token`s to work with).

**Requirement:** Given a sequence of morphologically-analyzed tokens
(from REQ-1.1's output), assign karaka relations (karta/karma/karana/
etc.) per the Adhyaya 1.4 and 2.3 rules in `data/sutras.json`.

**Prompt for the executing AI:**
> Same project as before (`hindawiai/sanskrit`) — read `README.md`,
> `python/pipeline.py`, and confirm `MorphAnalyzer` (REQ-1.1) is
> implemented before starting this; this depends on it. Implement
> `KarakaParser.parse()`: given a list of `Token`s, assign karaka
> relations using the Adhyaya 1.4 (karaka definitions) and 2.3 (karaka
> → case-ending mapping) rules in `data/sutras.json` — filter to those
> adhyaya/pada values and trace every assignment to the specific sutra
> that licenses it. Test against hand-analyzed sentences from a cited
> source (e.g. a published karaka-analysis example), not invented ones.
> [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] `KarakaParser.parse()` returns real `KarakaRelation` objects for
      at least simple transitive-sentence structures
- [ ] Each relation cites the sutra (Adhyaya 1.4/2.3) that licenses it
- [ ] Tested against at least 3 sentences from a cited external source,
      with expected vs. actual karaka assignments shown
- [ ] README updated with scope (which sentence structures work)

---

### REQ-1.3: Segmenter — consonant and visarga sandhi

**Context:** `python/sandhi.py`/`js/sandhi.js` handle vowel sandhi only
(documented explicitly as the scope limit in both files' docstrings).

**Requirement:** Add consonant sandhi and visarga sandhi rules to the
segmenter, sourced from Adhyaya 6 and 8 of `data/sutras.json`, keeping
Python and JS behavior-identical per `CONTRIBUTING.md`.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`. Read `README.md`, `python/sandhi.py`,
> `js/sandhi.js`, and `CONTRIBUTING.md`'s "keeping Python and JS in sync"
> section. Those two files implement vowel sandhi only, by design — the
> docstrings say so explicitly. Extend both (not just one) to cover
> consonant sandhi and visarga sandhi, sourcing the actual rules from
> `data/sutras.json` filtered to Adhyaya 6 and 8 (do not write sandhi
> rules from general knowledge — cite the sutra for each pattern you
> implement, the way the existing vowel-sandhi rules are commented with
> their sutra numbers once sourced). Port every change to both languages
> and confirm identical output, the same way the original vowel-sandhi
> implementation was verified (see git log for `sandhi.py`/`sandhi.js`
> commits as the pattern to follow). [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] Consonant sandhi and visarga sandhi both implemented in
      `python/sandhi.py` AND `js/sandhi.js`
- [ ] Each new rule traces to a specific sutra in `data/sutras.json`
- [ ] A script confirms byte-identical output between the two languages
      on a shared test-case list (same pattern as the existing
      `python3 python/pipeline.py` / `node js/pipeline.js` parity check)
- [ ] `Segmenter`'s docstring updated to reflect the new (not-yet-complete)
      scope honestly

---

### REQ-1.4: Expand the Vedic corpus

**Context:** `data/corpus_rv_1.1.json` is 5 verses (Rigveda 1.1 only),
explicitly a seed sample. The source (GRETIL padapatha) is much larger
but hit a per-fetch size ceiling when first retrieved (see conversation
history / git log around that commit).

**Requirement:** Expand the corpus toward full coverage of at least one
complete Mandala, maintaining the same padapatha (pre-segmented) format.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`. Read `README.md` and
> `data/corpus_rv_1.1.json` for the existing format. The source is
> GRETIL's Rigveda Padapatha (CC BY-NC-SA 4.0, Sansknet project) —
> search for the current URL rather than assuming the one in git history
> is still live. A single fetch previously hit a hard size ceiling after
> ~75 verses; if you hit the same wall, that's a tool limit, not a
> missing parameter — the working fix last time was asking a human to
> download the file directly and upload it for local processing, not
> retrying the fetch. Preserve the exact JSON schema (`ref`, `words`)
> already used. Extend `python/coverage.py` only if the corpus format
> changes; otherwise it should keep working unmodified. [Non-negotiable
> project ethic block.]

**Acceptance criteria:**
- [ ] At least one full Mandala added in the existing schema
- [ ] Source and licence documented in README the same way the existing
      5-verse sample is
- [ ] `python/coverage.py` runs against the expanded file without
      modification (or any needed modification is documented)

---

## Part 2 — Sūtram language

**Read `lang/SPEC.md` in full before any Part 2 requirement.** Note its
"Correction" section: `lang/lexer.py`, `parser.py`, `interpreter.py` are
the **deprecated first attempt** (imperative, superseded). The current
foundation is `lang/js/engine.js` (rule-rewrite core), `shivasutras.js`
(ISA layer), and `padartha.js` (type system). Build on those three, not
on the `.py` files.

### REQ-2.1: Self-hosting meta-grammar

**Context:** Named in `SPEC.md` as not started. The idea: Sūtram's own
grammar (what makes a valid `adhikara`, valid rule syntax, etc.) should
itself be expressible as Paninian-style rules (samjna/paribhasha/
adhikara), the way lex/yacc specify a grammar — but in Sūtram's own
style rather than BNF.

**Requirement:** Define Sūtram's concrete syntax as a set of samjna
(naming) and paribhasha (interpretation) rules within the `engine.js`
rule-rewrite model, such that parsing a `.su`-style program is itself
running those rules against the source text.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/` subdirectory. Read `lang/SPEC.md`
> completely, then `lang/js/engine.js` and `lang/js/demo.js` to see the
> rule-rewrite model in practice (not the deprecated `lang/*.py` files).
> Task: specify Sūtram's own grammar using that same rule model —
> samjna rules naming syntactic categories, paribhasha rules governing
> how they combine — rather than a conventional BNF/EBNF grammar file.
> This is explicitly the "lex/yacc, but Panini-style" requirement from
> the project owner. Prove it by using your resulting rule-set to
> actually parse `lang/examples/ganana.su` (or a new, more capable
> example), end to end. [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] Sūtram's grammar expressed as samjna/paribhasha rules runnable in
      `engine.js`, not as a separate conventional grammar file
- [ ] Demonstrated parsing a real `.su` example program using only this
      rule-set
- [ ] SPEC.md updated with the design rationale and what it reuses from
      the existing engine vs. what's new

---

### REQ-2.2: Object-oriented paradigm mapping

**Context:** `lang/js/padartha.js` (Vaisheshika type system) exists and
is tested. This requirement builds directly on it.

**Requirement:** Demonstrate OOP (encapsulation, inheritance, identity)
as a direct consequence of padartha's existing structure — samanya/
vishesha for class/instance, samavaya for composition — not a bolted-on
class keyword.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/js/padartha.js`. Read it fully —
> it implements Vaisheshika's 7 categories as a type system, already
> tested (`test_padartha.js`). Task: build an OOP layer on top of it
> (don't modify `padartha.js`'s core unless something is actually
> missing) where "class" = samanya, "instance" = a dravya carrying that
> samanya + a unique vishesha, "inheritance" = a samanya hierarchy
> (research whether Vaisheshika's own higher/lower samanya distinction,
> mentioned in sources during this project's earlier research, gives a
> real model for this rather than inventing one), and composition =
> samavaya. Write a non-trivial example (e.g. a small class hierarchy
> with at least one override) and test it. [Non-negotiable project
> ethic block.]

**Acceptance criteria:**
- [ ] Working example with at least 2 levels of class hierarchy and one
      overridden karma (method)
- [ ] Design doc explaining which Vaisheshika concept backs each OOP
      feature, with the mapping justified, not asserted
- [ ] Tested, output shown

---

### REQ-2.3: Functional paradigm mapping

**Requirement:** Demonstrate functional composition as a direct reading
of Paninian derivation (prakriya) — a word-form results from successive
rule applications, each taking the prior state as input, which is
function composition by another name. Show pure functions, composition,
and (if it fits naturally — don't force it) higher-order rules.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/js/engine.js`. Read `SPEC.md` and
> `engine.js`. Task: demonstrate a functional-programming layer where a
> prakriya (derivation) is explicitly function composition — each rule
> is a pure `state -> state` function (this is already true of
> `nigamana` in the existing `Rule` class; confirm that before adding
> anything), and compose several rule applications to build a value, the
> way you'd compose `f` and `g` in any functional language. Only add
> higher-order rules (rules that take/return rules) if you find a real
> Paninian parallel (e.g. an atidesha rule that extends another rule's
> applicability might be one — verify before claiming it) — don't
> manufacture one for coverage's sake. [Non-negotiable project ethic
> block.]

**Acceptance criteria:**
- [ ] Working example showing explicit composition of ≥3 rules as pure
      functions producing a traceable derivation chain
- [ ] If higher-order rules are included, the Paninian parallel used to
      justify them is named and sourced
- [ ] If no genuine parallel is found for higher-order rules, the doc
      says so explicitly rather than forcing a weak one in

---

### REQ-2.4: Imperative (C-style) paradigm mapping

**Context:** Explicitly requested ("C (imperative)") alongside OOP/
functional/declarative. Declarative is effectively already satisfied by
`engine.js` itself (rule-rewrite = declarative) — note this rather than
redoing it.

**Requirement:** Show how the rule-rewrite model can express ordinary
sequential/mutable-state imperative programs, and be explicit about
where that's a natural fit vs. a forced one.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/js/engine.js`. The project's first
> attempt at this language (`lang/*.py`, now deprecated — see SPEC.md's
> "Correction" section) WAS imperative, which turned out to be the wrong
> default model for Paninian rules specifically. This requirement is
> different: not "make the language imperative," but "show imperative
> programs are still expressible," using the existing rule-rewrite core
> rather than reverting to the deprecated interpreter. A single rule
> whose hetu always matches, applied in a loop to fixpoint, is already
> close to a `while` loop — build from that rather than from scratch.
> Be honest in the writeup about whether this feels natural in the
> rule-rewrite model or genuinely awkward — don't oversell it either way.
> [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] A working example of sequential, stateful computation (e.g. a
      counting loop, an accumulator) built on `engine.js`
- [ ] Explicit written assessment of fit (natural vs. forced), not just
      "it works"

---

### REQ-2.5: Vipratishedha (full conflict resolution)

**Context:** `engine.js`'s docstring names para (1.4.2, "vipratiṣedhe
paraṃ kāryam") as governing but notes it isn't sourced from
`data/sutras.json` beyond this project's own citation of it.

**Requirement:** Source 1.4.2 and related vipratishedha-governing sutras
properly from `data/sutras.json`, and confirm/correct the apavada/
utsarga + para model already implemented against them.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/js/engine.js`. Read the file's
> top-of-file comment on vipratishedha/para. Task: look up 1.4.2 and
> any other sutras governing rule-conflict resolution directly in
> `data/sutras.json` (don't rely on general knowledge of the rule — the
> project's established practice is to source every specific grammatical
> claim). Confirm whether the existing `specificity` + registration-order
> model in `Engine.step()` actually matches what those sutras specify,
> and fix it if not. Document the sutra numbers used in the code comment,
> replacing the current "not yet in our sourced data" caveat.
> [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] 1.4.2 (and any other directly relevant sutras) quoted from
      `data/sutras.json` with sutra number cited in `engine.js`
- [ ] `Engine.step()`'s conflict-resolution logic confirmed correct
      against that sourced text, or corrected if it wasn't
      (document which happened)
- [ ] Existing tests (`demo.js`'s "a" ambiguity case) still pass

---

### REQ-2.6: Aryabhata-style numeral literals

**Context:** Researched, documented in SPEC.md, not implemented. See
SPEC.md's "Completed" section for what was already verified (consonant
= digit value, vowel = power-of-ten).

**Requirement:** Add an alternate numeral-literal syntax alongside the
existing bhutasamkhya words (`lang/js` — bhutasamkhya isn't ported from
the deprecated `lexer.py` yet either; check before assuming it exists
in the current foundation).

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/SPEC.md`'s section on Aryabhata's
> numeral system (already researched and sourced — read it before
> re-researching). Implement it as a literal syntax: consonant carries
> digit value, paired vowel carries power-of-ten, per the sourced
> description. Verify your encoding table against the same kind of
> independent sourcing already used elsewhere in this project (the
> SPEC.md citations are a starting point, not necessarily sufficient on
> their own for an exact symbol table — check). Test round-trip
> (encode a number, decode it back) against worked examples from a
> cited source. [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] Encoding/decoding implemented and tested round-trip
- [ ] Symbol-to-value table cited to a source, not assumed from the
      SPEC.md summary alone
- [ ] At least 3 worked examples from an external source reproduced
      correctly

---

### REQ-2.7: Brahmagupta zero-arithmetic rules

**Context:** Researched (SPEC.md), not implemented. His division-by-zero
rule is explicitly flagged as not matching modern convention.

**Requirement:** Implement Brahmagupta's addition/subtraction/
multiplication-with-zero rules in the numeric handling (likely touching
`padartha.js`'s abhava/dravya numeric cases), with his division rule
available but clearly separated from default modern-convention division.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/SPEC.md`'s Brahmagupta section and
> `lang/js/padartha.js`. Implement his stated rules for zero in
> addition/subtraction/multiplication. For division, implement his rule
> as an explicitly separate, named option (e.g. a flag or separate
> function) rather than silently replacing standard division — the
> SPEC.md caveat exists because his rule doesn't match modern convention
> and conflating them would be a real correctness bug, not a style
> choice. Source the exact rules from Brahmasphutasiddhanta (verify via
> search; SPEC.md's summary may not have the precise verse-level rules).
> [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] Addition/subtraction/multiplication-with-zero rules implemented
      and tested against sourced examples
- [ ] Brahmagupta's division rule available but NOT the default; the
      distinction from modern division is explicit in both code and docs
- [ ] Each rule cited to the specific verse/section of
      Brahmasphutasiddhanta used

---

### REQ-2.8: Lower to a real backend

**Requirement:** Compile (not just interpret) a Sūtram program to
executable JS, so Sūtram source can run without `engine.js` present at
runtime.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/js/engine.js`. Currently Sūtram
> programs run BY the engine (interpretation). Build a compiler: Sūtram
> source in, standalone executable JS out, with no runtime dependency on
> `engine.js`. Reuse REQ-2.1's grammar work if it's been completed
> (check git log / REQ-2.1's status before starting — don't redo
> grammar work that already exists). Test by compiling
> `lang/examples/ganana.su` (or its REQ-2.1 equivalent) and confirming
> the compiled output produces identical results to interpreting it.
> [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] A compile step producing standalone JS with no `engine.js`
      runtime dependency
- [ ] Compiled output verified to match interpreted output exactly on
      at least 2 example programs
- [ ] Documented: what subset of Sūtram compiles vs. what still
      requires interpretation, if anything doesn't fully lower

---

### REQ-2.9: GitHub Pages delivery

**Context:** `engine.js`, `shivasutras.js`, `padartha.js` are already
dependency-free JS (confirmed in their own commits). This is the
lowest-risk remaining item — packaging, not new design.

**Requirement:** A static, GitHub-Pages-deployable page that runs
Sūtram examples in-browser (no build step required at serve time).

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `lang/js/` (engine.js, shivasutras.js,
> padartha.js, demo.js, test_padartha.js, test_shivasutras.js — all
> already dependency-free, confirm this still holds before starting).
> Build a single static HTML page (can reuse `tools/review-tool.html`'s
> styling conventions for consistency with the rest of the repo) that
> loads these modules and runs the existing demos interactively in the
> browser, with a way to edit and re-run example code. No build tooling
> required to serve it — it should work as plain files under GitHub
> Pages. [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] Single static page, no build step, runs `lang/js/*` in-browser
- [ ] At least the existing demo.js and padartha.js test cases runnable
      interactively from the page, with visible output
- [ ] Confirmed working when served as static files (not just opened
      locally as `file://` — test via a simple static server)
- [ ] `README.md` updated with the deployment URL once live

---

## Part 3 — Cross-cutting

### REQ-3.1: Review-tool persistence

**Context:** `tools/review-tool.html` is intentionally stateless
(client-side only) — see its generating script
`scripts/build_review_tool.py` and the project's earlier decision to
skip the `db` capability for a first version.

**Requirement:** Add shared, persistent "reviewed" state so multiple
people's progress accumulates across sessions, per the project's
original stated goal of batched, multi-contributor review.

**Prompt for the executing AI:**
> Project `hindawiai/sanskrit`, `tools/review-tool.html` and
> `scripts/build_review_tool.py`. The tool currently resets on reload.
> Add persistent, shared state (which sutras are marked reviewed, by
> whom) so progress accumulates across people and sessions rather than
> per-browser-tab. If deploying via Claude's Artifact publishing, use
> its `db` capability (check available capabilities before assuming
> the shape of that API — do not guess it). If deploying elsewhere
> (e.g. as part of REQ-2.9's GitHub Pages site), use an appropriate
> real backend and say which. [Non-negotiable project ethic block.]

**Acceptance criteria:**
- [ ] "Reviewed" state persists across a page reload
- [ ] State is shared (a second viewer/session sees prior reviewers'
      progress), not per-device-only
- [ ] Degrades gracefully (clear message, not silent failure) if the
      storage backend is unavailable

---

### REQ-3.2: Confirm and push to hindawiai/sanskrit

**Requirement:** Resolve whether `hindawiai/sanskrit` exists; create it
if not; push this project's actual git history to it (the zip delivered
earlier in this project already has that history — use it, don't
re-init).

**Prompt for the executing AI:**
> You have `sanskrit-parser.zip`, which unzips to a git repo with real
> commit history (confirm with `git log` after unzipping — don't run
> `git init` again, that discards the history). Confirm whether
> `hindawiai/sanskrit` exists on GitHub. If not, create it. Push the
> existing history to it as-is. Do not squash or rewrite the commits —
> they're the project's actual development record.

**Acceptance criteria:**
- [ ] `hindawiai/sanskrit` exists and is reachable
- [ ] Full existing commit history present (not squashed, not a fresh
      single commit)
- [ ] All files from the zip present and matching


---

## Part 4 — Curated native backends and Sanchalan Suktam (2026-10-12)

### REQ-4.1: Sūtram C/Rust backends

**Current implementation:** `lang/js/backend.js` lowers the canonical parsed Sūtram subset to standalone C and Rust source. `lang/js/raise.js` conservatively raises a tiny straight-line C/Rust subset to Sūtram. The browser equivalents are in `docs/sutram-compiler.js`.

**Supported subset:** integer/boolean-like literals (`laghu`, `guru`, `netra`, `veda`), `karta`, constant or parameter `yoga`/`viyoga`, `dviguna`, `likh`, `phala`, and non-recursive unary adhikara calls. Exactly one terminal `phala` is required by native backends. Conditional control flow, arrays, types beyond the numeric subset, and recursion are not implemented.

**Acceptance:** C output compiles under GCC C11 with `-Wall -Wextra -Werror` and the `ganana.su` executable matches interpreter stdout/result. Rust source is generated; a Rust compiler was not installed in the current environment, so compiling Rust remains open. The C/Rust raiser rejects unsupported syntax rather than guessing.

### REQ-4.2: Sanchalan Suktam parser and report backends

Source: Choudhary (2026), *Sanchalan Suktam* V1.0, DOI 10.5281/zenodo.23277242. The source explicitly notes it may not be the final executable version.

**Current implementation:** `lang/suktam/grammar.json`, `suktam.js`, tests, and generated C/Rust reports. It parses numbered verse boundaries and longest-first technical lexemes, preserves residual spans, reports numbering diagnostics, and emits a lexical IR. Snapshot: 22 verses, 134 lexical nodes, 828 residual code points.

**Not implemented:** full Sanskrit padaccheda/sandhi/morphology, semantic execution of process/IPC/memory operations, or a complete OS runtime. Do not claim those from lexicon matches.

### REQ-4.3: Static Pages and test documentation

`docs/` is the GitHub Pages root. `docs/tasks.html` is the task/feature register; `docs/tests.html` documents commands and assertions; `docs/sutram-compiler.html` and `docs/sanchalan-suktam.html` are browser labs; `docs/reference.html` exposes the project handoff documents. CI runs repository tests and validates the static pages on code changes.

**Release gates still open:** compile generated Rust with rustc; vendor and compile complete upstream Romenagri; run original Perso-Arabic `fltr_ur_hi` fixtures; perform C/Rust/native Romenagri differential tests; review Sanchalan semantic IR before implementing OS effects.
