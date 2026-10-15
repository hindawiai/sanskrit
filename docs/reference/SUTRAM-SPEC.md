# Sūtram — a language where code *is* sutras, not sutra-flavoured keywords

Epigraph — the classical definition of a sutra, verified against three
independent citations (an Advaita-Vedanta textual-studies archive, quoting
Madhva's commentary via the Skanda Purana):

> अल्पाक्षरम् असन्दिग्धं सारवत् विश्वतोमुखम् । अस्तोभम् अनवद्यं च सूत्रं सूत्रविदो विदुः ॥
> *alpākṣaram asandigdhaṃ sāravat viśvatomukham, astobham anavadyaṃ ca sūtraṃ
> sūtravido viduḥ* — "Minimal syllables, unambiguous, essence-bearing,
> comprehensive, without padding, faultless: that is what those who know
> sutras call a sutra."

Read as a language-design charter rather than a literary standard, that
verse is six real requirements: minimum tokens, unambiguous grammar, no
boilerplate, general composability, no syntactic filler, and well-defined
behaviour. Sūtram tries to hold to it literally, not decoratively.

## This is not keyword-substitution

Writing `yadi` instead of `if` is translation. It changes none of the
*mechanics* of the language. What actually makes Paninian sutras different
from an ordinary rule list is structural, and those structures have real
computational content:

| Sanskrit mechanism | What it actually does | What it becomes here |
|---|---|---|
| **anuvṛtti** (word carry-over between sutras) | A rule doesn't restate its subject if the prior rule already established it | The current "subject" (`karta`) persists across statements until reassigned — no repeated variable names for a chain of operations on one value |
| **adhikāra** (a governing header ruling a whole span of sutras) | One declaration scopes everything until the next adhikāra | Function/scope declaration |
| **pratyāhāra** (naming a whole class by its first+last member, e.g. `aC` = all vowels) | Range compression | Range/iteration syntax |
| **bhūtasaṃkhyā** (concrete nouns standing for their well-known count: *netra* "eyes" = 2, *veda* "Vedas" = 4) | A second, meaningful channel for numeric literals, used throughout Sanskrit astronomical texts | An alternate numeral-literal syntax |
| **laghu/guru** (Piṅgala's light/heavy syllable classification, *Chandaḥśāstra*, c. 2nd–3rd c. BCE) | A two-state system Piṅgala used to enumerate metres — cited in the literature as conceptually binary; his *prastāra* algorithm for generating all combinations is a documented precursor to binary enumeration, and *meru-prastāra* to Pascal's triangle | Boolean literals |
| **vipratiṣedha / para** (when two rules both apply, the later one wins, unless a more specific rule applies) | Conflict resolution between competing rules | (documented below; not yet implemented — see lexer.py's TODO) |

One more point worth keeping, not inventing: a University of Hyderabad
paper on algorithmic structure in the *Chandaḥśāstra* notes that Piṅgala's
mathematical sutras **also use anuvṛtti** — the carry-over mechanic isn't
unique to grammar, it's how terse Sanskrit technical writing works in
general. That's the actual license for building a language this way: the
mechanism was already general-purpose.

## Concrete syntax

```
adhyaya <name>:              # top-level module
  pada <name>:                # section within it
    adhikara <name>(<params>):  # function: governs every sutra until `iti`
      karta: <expr>              # establish the subject -- anuvrtti starts here
      <op> <expr>                # operates on the current karta; karta not restated
      <op>                       # unary op, still the same carried-over karta
      phala                      # yield current karta as this adhikara's result
    iti                        # closes the adhikara
  iti                          # closes the pada
iti                           # closes the adhyaya
```

Numeral literals: ordinary digits, OR a bhūtasaṃkhyā word (`netra` = 2,
`veda` = 4, ...) -- see `lexer.py`'s `BHUTASAMKHYA` table, a small,
explicitly non-exhaustive illustrative set (the convention has real
regional/textual variation; this isn't presented as canonical).

Boolean literals: `laghu` (light -- false/0) and `guru` (heavy -- true/1),
after Piṅgala.

Built-in ops in this first version: `yoga <v>` (add), `viyoga <v>`
(subtract), `dviguna` (double), `likh` (print current karta). A defined
`adhikara` can also be called as a unary op on the current karta.

## What's real here and what's a stretch

Real and sourced: the sutra-definition verse (three independent citations
converge on identical wording); Piṅgala's dates, laghu/guru system,
prastāra, and meru-prastāra (Wikipedia citing Plofker's *Mathematics in
India*, plus an independent University of Hyderabad paper); anuvṛtti and
adhikāra as genuine Paninian mechanisms (established throughout this
project's own sourced sutra data); bhūtasaṃkhyā as a real convention in
Sanskrit astronomical texts (well-attested generally; the specific
word-list here is a small illustrative sample, not a verified canonical
table).

A stretch, stated plainly: using these mechanisms as the *basis of a
programming language's execution model* is this project's own design,
not a historical claim. Nothing here asserts that Panini or Piṅgala built
anything like a programming language -- only that the structural devices
they used turn out to be expressive enough to build one from, which is a
genuinely different claim and the one actually worth testing.

## Correction: the core model was wrong, not just incomplete

The first version (lexer.py/parser.py/interpreter.py) was sequential
imperative statements with Sanskrit names -- `karta` didn't do anything a
normal variable doesn't. That's not what Paninian rules are. A sutra is a
conditional REWRITE: if a pattern matches the current state, transform it;
which rule fires when several match is resolved by specificity (apavada
beats utsarga) and, among ties, by registration order (para). A program
is the fixpoint loop that applies the winning rule repeatedly, not a
sequence of commands.

`lang/js/engine.js` implements that loop directly -- JS, so it can run
client-side later. `lang/js/demo.js` encodes 1.1.1 and 1.1.2 (verified
against two independent sources earlier in this project, zero
disagreement) as real rules, not a toy example, and resolves the genuine
a/a overlap between them via para.

Separately grounded addition: Nyaya's pancavayava (five-membered
syllogism -- verified against Britannica and independent academic
sources) treats a worked example (udaharana) as load-bearing, not
illustrative -- a general claim isn't admissible without one. So a Rule
here requires one and the engine runs it at definition time, rejecting
any rule whose own example fails. Proven in demo.js: a deliberately wrong
rule is refused, not silently accepted.

## Current implementation boundary (updated 2026-10-11)

The historical roadmap below has partly progressed since the initial specification. Current status is documented in `PROJECT_OVERVIEW.md` and `docs/GEMINI-HANDOFF-DATA.md`.

- **Padārtha / type system:** implemented as a tested prototype in `lang/js/padartha.js`.
- **Śivasūtra primitives:** implemented and tested in `lang/js/shivasutras.js`; marker-position and linguistic interpretation limits remain documented.
- **OOP and paradigm demonstrations:** prototypes and tests exist in `lang/js/test_oop.js` and `lang/js/test_paradigms.js`. They are demonstrations, not a claim of a production language or complete paradigm implementation.
- **Self-hosting meta-grammar:** still incomplete. `lang/js/cycle-result.json` records a selected 22-sūtra, eight-section fixture with 56 meta-steps. This is a bootstrap prototype, not a parser whose complete concrete grammar is defined and executed by Sūtram rules. The `.su` front end currently uses conventional parsing and lowers into the rewrite engine.
- **Browser / GitHub Pages delivery:** `lang/index.html` exists as a prototype; deployment/publication is not established by its presence.
- **Aryabhāṭa numerals and Brahmagupta arithmetic:** research/design notes only; not implemented as complete language features.

## Completed: ISA layer, type system, numeral-system research

**Shiva Sutras as ISA** (`lang/js/shivasutras.js`) -- the 14 sutras verified
against 4 independent sources, flattened to an ordered phoneme sequence,
with pratyahara(start, itMarker) as a real computed range (not a lookup
table). Tested against three independently-confirmed examples (aC = all
vowels, haL = all consonants, yaN = y/v/r/l) -- all three pass by
computation. Noted, not hidden: the IT-letters N, Y, M, h each repeat 2-3
times across the 14 sutras, a documented genuine ambiguity in the real
system; disambiguated here by suffix for lookup, not resolved linguistically.

**Vaisheshika padartha as the type system** (`lang/js/padartha.js`) -- the
seven categories (verified against 8 sources), six mapped to concrete
roles (dravya/guna/karma/samanya/vishesha/samavaya), abhava kept as FOUR
distinct absence-kinds rather than one null: pragabhava (uninitialized),
pradhvamsabhava (disposed), anyonyabhava (type mismatch), atyantabhava
(uninhabited/never). guna cannot be constructed detached from a dravya --
enforced by the API, not just asserted in prose. Tested.

**Aryabhata and Brahmagupta's codification** -- researched, not yet built
into the language. Aryabhata (Aryabhatiya, Daśagītikā, c. 499 CE) used his
own alphasyllabic system distinct from bhutasamkhya: consonants carry digit
value, the paired vowel carries the power-of-ten -- structurally a
mantissa+exponent encoding, same shape as scientific notation. Brahmagupta
(Brahmasphutasiddhanta, 628 CE) is the first text treating zero as a number
with explicit arithmetic rules; his division-by-zero rule does not match
modern convention, worth inheriting the addition/subtraction/multiplication
rules deliberately and flagging that one rather than silently picking
either his version or the modern one.

## Remaining work

Full self-hosting meta-grammar, complete numeral-system semantics, and verified browser deployment remain open. The repository contains prototypes for several of these areas; a prototype is not equivalent to satisfying the associated acceptance criteria.
