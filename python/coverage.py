"""
Coverage-gap checker: run a corpus (pre-segmented Vedic text) against the
grammar engine and report, per word, one of three outcomes -- not two.

The crucial methodological point (see README.md): a failure to derive a
word is NOT evidence Panini's grammar doesn't cover it. It's only that
evidence once the engine checking it is itself known-complete. Right now
ours isn't (MorphAnalyzer is a stub), so this reports CANNOT_CHECK for
everything -- which is the honest, correct output at this stage, not a
bug to fix by making it report something more impressive.

Three outcomes, not two:
  COVERED      -- engine derived/validated the word
  NOT_COVERED  -- engine is complete enough that a real failure is meaningful
  CANNOT_CHECK -- engine isn't implemented for this yet (today: everything)
"""

import json
from dataclasses import dataclass
from pathlib import Path

from pipeline import SanskritParser
from rules import Sutra


@dataclass
class WordResult:
    word: str
    ref: str
    outcome: str  # COVERED | NOT_COVERED | CANNOT_CHECK
    detail: str = ""


def check_word(parser: SanskritParser, word: str, ref: str) -> WordResult:
    try:
        candidate_list = parser.morph.analyze(word)  # not implemented yet
        if candidate_list:
            return WordResult(word, ref, "COVERED")
        return WordResult(word, ref, "NOT_COVERED", "engine ran, found no analysis")
    except NotImplementedError as e:
        return WordResult(word, ref, "CANNOT_CHECK", str(e))


def check_corpus(parser: SanskritParser, corpus_path: str) -> list[WordResult]:
    verses = json.loads(Path(corpus_path).read_text(encoding="utf-8"))
    results = []
    for verse in verses:
        for word in verse["words"]:
            results.append(check_word(parser, word, verse["ref"]))
    return results


def summarize(results: list[WordResult]) -> dict:
    counts = {"COVERED": 0, "NOT_COVERED": 0, "CANNOT_CHECK": 0}
    for r in results:
        counts[r.outcome] += 1
    return counts


if __name__ == "__main__":
    parser = SanskritParser()
    results = check_corpus(parser, "data/corpus_rv_1.1.json")
    counts = summarize(results)

    print(f"Checked {len(results)} words from data/corpus_rv_1.1.json (Rigveda 1.1, 5 verses)")
    print(f"  COVERED:      {counts['COVERED']}")
    print(f"  NOT_COVERED:  {counts['NOT_COVERED']}")
    print(f"  CANNOT_CHECK: {counts['CANNOT_CHECK']}")
    print()
    print("CANNOT_CHECK dominating is expected and correct right now -- it means")
    print("'the engine isn't built yet', not 'Panini doesn't cover this'. See")
    print("README.md's note on this before treating any count here as a result.")
