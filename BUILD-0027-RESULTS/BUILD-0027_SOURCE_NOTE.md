# BUILD-0027 source note

Baselines (immutable):
- BUILD-0025: 4f158697bcd891053a21b1a9ecebf33f7d5261a7a0de53e553330f05d22f3c25
- BUILD-0026: 64bf96b15f8459b0ee6bf0326e8df656a67dab87c8e65e383e286cbdcc048ea5
- BUILD-0027-RESULTS (prior): preserved as delivered

MW source: mwxml.zip from sanskrit-lexicon.uni-koeln.de, key1 extracted to data/external/mw/mw-k1.jsonl (287,432 records).

RV source: data/corpus_rv_1.1.json (5 verses, 47 words, IAST).

Conversion: scripts/conversion/iast_devanagari.py (IAST → Devanagari with ḷ correction), then tools/transliteration encode (Devanagari → Romenagri). Rejected words retained as IAST.

Limitation: Romenagri inventory does not contain ळ (U+0933), ॠ, ॡ, ऌ. Words containing these are rejected at the Romenagri stage.
