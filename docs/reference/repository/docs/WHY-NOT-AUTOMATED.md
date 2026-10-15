# Why the remaining rules are not automated

All 3983 sutras are already converted structurally. That conversion copies roles, anuvrtti, and locative scope into an IR. It does not execute them.

Execution means a handler, an attested input, and an attested output. Twenty rules have that. The other 3963 do not, and they do not fail for one reason.

1. Roots. Many rules name a root or a class of roots. The Dhatupatha is not ingested. A handler cannot know which forms the rule applies to.
2. Morphology. Nominal and verbal endings are not built. A rule that says "after a stem, before this suffix" has no stem and no suffix to attach to.
3. Karaka and samjna. Rules that depend on agent, object, or a technical name have no machinery that assigns those names.
4. Operation kind. The executor knows substitution over a closed sound inventory. It does not know general deletion, insertion, or optional application. A rule that is not a substitution cannot be compiled by repeating the current step.
5. Context. Even a phonological rule is not free. 8.4.55 in this build is closed to final g before k. The sutra is wider than that. Widening it without the sound classes and the ordering rules would be a guess.

An automated pass that emitted a handler for every remaining sutra would raise the count and lower the truth. The structural IR is the automated part. The executable part stops where the attested example stops.
