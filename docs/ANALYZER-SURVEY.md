# Sanskrit morphological analyzers: a survey

This note records what the existing systems actually do, what they produce, how many rules they cover where that number is known, and under what license they are released. It is written so that a later decision about what can be used, and what cannot, is based on the record rather than on a name.

## The distinction that matters

A generator starts from a root and a set of features and walks forward to a string. An analyzer starts from a string and has to recover the root, the suffixes, and the boundaries. Most of the systems below are analyzers, or neural models trained to imitate analyzers. Only one of them implements a large number of Ashtadhyayi rules as rules, and that one is a generator.

## The systems

### Sanskrit Heritage Platform — Gérard Huet, Inria

A finite-state engine. It generates a lexicon of inflected forms from a structured dictionary, then recognizes input against that lexicon with reversible transducers. The Reader segments a sentence, undoes sandhi, and returns morphological tags: root, stem, and inflection. With the Samsaadhanii tools it can also produce a dependency parse.

It does not apply Ashtadhyayi rules one by one at analysis time. The morphology is precomputed. The number of rules is not the relevant measure; the size of the generated form bank is. The Zen toolkit underneath is LGPL. The platform itself is distributed from Inria’s Gitlab and is free software; the Python interface on PyPI is GPL-3.0. The Heritage dictionary and the generated form banks are separate from the code.

What it produces: a segmentation, a choice of analyses for each segment, and, with the companion tools, a dependency graph. Direction: analysis, by lookup in a generated lexicon.

### Samsaadhanii / Sanskrit Computational Linguistics Tools — Amba Kulkarni, University of Hyderabad

A suite: morphological analyzer, morphological generator, sandhi joiner, sandhi splitter, and a Sanskrit-Hindi translation system. The analyzer is lexicon-driven. A reported configuration used about 153,000 stems from Monier-Williams and other sources, 222 nominal paradigms, and produced about 3.7 million word forms, with roughly 95% coverage on unseen text. Coverage here means “the stem was in the lexicon,” not “the rule was applied.”

License: GPL, stated as GPL-2.0 on the public repository. Direction: analysis, with a generator component. What it produces: morphological analysis, and, in the full system, karaka analysis.

### sanskrit_parser — Karthik Madathil and others

A Python library with three levels. Level 0 is sandhi, implemented as reversible matching rules written with Paninian pratyaharas. Level 1 is morphological tagging, by lookup in form databases derived from Heritage and from the sanskrit_data project. Level 2 is sentence splitting by dynamic programming over those sandhi rules, keeping only splits whose pieces are valid forms. Level 3 builds a morpho-syntactic graph. A generator that would apply Ashtadhyayi rules from YAML is present in the tree and marked as not begun.

License: MIT. Direction: analysis, by search over sandhi splits constrained by a lexicon. What it produces: tags, a set of sandhi splits, and a dependency graph. It does not publish a count of Ashtadhyayi rules, because the sandhi layer is a rule table and the morphology is a lookup.

### Vidyut Prakriya — Ambuda

A word generator. It implements more than 2,000 rules of the Ashtadhyayi, about 500 of the Unadipatha, and about 50 of the Paniniya Linganushasanam, according to its authors. In this tree, 2,153 distinct Ashtadhyayi identifiers appear in its source. It takes a root and features and returns the derived string together with the list of rules that produced it. It is not an analyzer.

License: MIT. Direction: generation. What it produces: a word and a prakriya.

### SanskritShala — Sandhan and others

A neural toolkit: word segmentation, morphological tagging, dependency parsing, and compound-type identification, with a web interface. It is trained on annotated data. It does not apply rules.

License: Apache-2.0. Direction: analysis, statistical. What it produces: a segmentation, tags, a dependency parse, and a compound type.

### ByT5-Sanskrit / Dharmamitra — Nehrdich, Hellwig, Keutzer

A neural multitask model fine-tuned on the Digital Corpus of Sanskrit. It segments, lemmatizes, and assigns morphosyntactic tags. A separate model does dependency parsing for Vedic. The code in the Dharmamitra organization is released under permissive licenses; the training data come from the DCS and from other corpora with their own terms.

Direction: analysis, learned. What it produces: segmentation, lemma, tags, and, where supported, a dependency parse. No rule count, because there are no rules.

### Process-Sanskrit — Giacomo De Luca

A cascading analyzer. Simple cases are resolved by matching against inflection tables; harder cases fall through to statistical methods. It vendors a split-only portion of sanskrit_parser. The inflection tables are adjusted from CLS Inflect and are released under a Creative Commons Non-Commercial license. That restriction matters: non-commercial data cannot be redistributed inside a GPL package that permits commercial use.

Direction: analysis. What it produces: root, grammatical analysis, and dictionary entries.

### Others

The Lucene analyzer and the stemming data from the Buddhist Digital Resource Center are Apache-2.0. They normalize and index; they use Heritage forms; they are not morphological analyzers in the sense above. TueSan is research code for a segmentation and parsing shared task; its license is not stated in the repository. The UniMorph analyzer list includes Sanskrit among many languages and is not a Paninian system.

## What the survey shows

No analyzer in this list implements thousands of Ashtadhyayi rules as an analyzer. The systems that analyze do one of three things: they look up a pre-generated form, they search over sandhi splits constrained by a lexicon, or they predict tags from a model trained on annotated text. The system that implements thousands of rules is a generator, and it does not read a string and recover its structure.

The licenses divide cleanly. MIT and Apache-2.0 code can be used with few conditions. GPL code can be used inside a GPL project and carries its obligations outward. Non-commercial data cannot be placed in a GPL distribution without separating it. Generated form banks and dictionaries have their own terms and are not the same as the code that uses them.

## What this project is not

This project is not an analyzer of the kind above, and it is not yet a generator of the kind Vidyut is. It has a categorized list of 3,983 sutras, a vendored copy of Vidyut, a lexical scan of one text, and a first-prompt kernel. The survey is here so that the difference is on record before any of those systems is treated as a source of rules or of data.
