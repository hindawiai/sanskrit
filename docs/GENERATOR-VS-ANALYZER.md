# Generation is a walk. Analysis is a search.

A word generator and a morphological analyzer look similar from the outside. Both deal with roots, suffixes, and sandhi. Both can be built from the same grammar. The difference is the direction of the computation, and that difference is large enough that one of them is a comfortable engineering problem and the other is not.

## What a generator does

A Paninian word generator starts with a known input. You give it a root from a closed list, a tense or mood, a person, a number, and a voice. It walks forward.

Take *bhavati*. The input is the root *bhū*, the present tense, the active voice, the third person, and the singular. The generator does not have to discover any of that. It already has it. It adds the present-tense marker, replaces it with the third-person singular ending, inserts the thematic vowel, applies *guṇa* to the root, and joins the resulting sounds. Each step is a local change to a term whose identity is already known. The order of the steps is fixed. Optional rules can be enumerated. At the end you have a string, and you can check it against an attested form.

This is why a generator of this kind can cover more than two thousand rules and still stay tractable. The rules are not being selected from a search. They are being applied, in an order the author wrote down, to an input the caller supplied. Partial results can be cached. The output is a string you can test. Failures are local: a wrong substitution produces a wrong string, and the test tells you so.

The Ashtadhyayi is written for this direction. It starts from an *upadeśa*, adds a *pratyaya*, and applies rules until a word comes out. A generator that follows that order is doing what the text describes.

## What an analyzer has to do

An analyzer starts from the other end. It is given a string. It has to recover the root, the suffixes, the boundaries, and the rules that produced the string.

The string does not contain that information. Sandhi has already collapsed the boundaries. *Dadhyatra* is one word on the page. It came from *dadhi* plus *atra*, but the *i* that would have told you so is gone, replaced by *y*. Deletion is worse. A sound that was present in the derivation is absent in the surface. Optional rules mean that more than one derivation can produce the same string, and more than one string can come from the same derivation. A surface form can be ambiguous: the same sequence of sounds can be two different words, or the same word from two different roots.

To recover the structure, the analyzer has to search. It has to try possible places to split the string. For each split it has to try possible roots from a list of more than two thousand. For each root it has to try possible suffixes. For each combination it has to check whether some sequence of rules, applied in reverse or guessed forward, produces the observed string. Most of those paths fail, and many of them fail late, after several rules have already been applied. The search space is the product of the segmentation choices, the root choices, and the rule choices. It is not a walk.

Some rules are not invertible. A substitution that maps several inputs to one output cannot be undone without guessing. A deletion cannot be undone without guessing what was deleted and where. Context that conditioned a rule may no longer be visible once the rule has applied. The analyzer has to hypothesize the context that the generator was given for free.

## Why the difference matters

A generator can be wrong in a way that is easy to see. It produces a string, you compare it to a known form, and you know. An analyzer can be wrong in a way that is harder to see. It can return a plausible root and a plausible suffix that happen to produce the right string by the wrong path. It can miss a real analysis because the search was pruned too early. It can return several analyses and have no principled way to rank them without more of the sentence than it was given.

This is also why a parser that builds a structure is not a small step beyond a generator. A generator emits a string. A parser has to commit to a tree: which morpheme is the root, which is the suffix, where the boundary was before sandhi, which rule licensed which change. That tree is what later stages need. A generator does not produce it, because it never had to recover it.

The converse is cheaper. If you have a parser that can build the tree, you can walk that tree forward and emit the string. Generation from a known structure is the easy direction. Analysis from a string is the hard one. This is ordinary compiler construction. The same asymmetry holds between parsing a program and pretty-printing one.

## What this does not say

It does not say that generation is trivial. Two thousand rules, with the right order, the right tags from *anubandha* removal, and the right handling of optional and exceptional cases, is a large piece of work. It does not say that analysis is impossible. Sanskrit morphological analyzers exist. It says that they are solving a search problem, and that the existence of a good generator does not hand them the solution.

It also does not say that the two are unrelated. A generator is a useful test oracle for an analyzer: if the analyzer claims that a string comes from a certain root and certain features, the generator can check whether that combination produces the string. That is a good use of a generator. It is not a substitute for the search.

## The practical consequence

If the goal is to produce Sanskrit words from roots and features, a generator is the right tool, and the path is clear. If the goal is to read a string and recover its structure — to split sandhi, to find the root, to build a tree that something else can compile or transform — then a generator, however complete, does not do that work. The rules it contains can be reused. The control flow cannot. One walks forward from a known input. The other searches backward from an observed string. Confusing the two produces a system that can decline a noun and cannot read a sentence.
