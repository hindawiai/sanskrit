"""Nirgundi's deliberately simple baseline.

This module does not tokenize Sanskrit, reverse sandhi, analyze morphology,
expand compounds, or perform fuzzy matching. It applies the specified
longest-first sequential search-and-replace procedure and exposes the residual.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable
import re


@dataclass(frozen=True)
class Lexeme:
    source_id: str
    form: str
    integer_id: int


@dataclass(frozen=True)
class Occurrence:
    source_id: str
    form: str
    integer_id: int
    start: int
    end: int


@dataclass(frozen=True)
class RunResult:
    ordered_lexemes: tuple[Lexeme, ...]
    transformed: str
    occurrences: tuple[Occurrence, ...]
    residual: str
    unmatched_characters: int


def order_lexemes(forms: Iterable[tuple[str, str]]) -> tuple[Lexeme, ...]:
    """Order (source_id, form) pairs longest-first, stable for equal lengths.

    Integer IDs are assigned after sorting. Equal-length entries retain their
    input order, making the run deterministic when the source inventory is.
    """
    materialized = list(forms)
    if any(not source_id or not form for source_id, form in materialized):
        raise ValueError("each lexeme requires a non-empty source_id and form")
    seen = set()
    seen_forms = set()
    for source_id, form in materialized:
        key = (source_id, form)
        if key in seen:
            raise ValueError(f"duplicate lexeme record: {key!r}")
        if form in seen_forms:
            raise ValueError(
                f"duplicate surface form {form!r}; curate source precedence or run inventories separately"
            )
        seen.add(key)
        seen_forms.add(form)
    ordered = sorted(enumerate(materialized), key=lambda item: (-len(item[1][1]), item[0]))
    return tuple(Lexeme(source_id, form, i + 1)
                 for i, (_, (source_id, form)) in enumerate(ordered))


def run_baseline(text: str, forms: Iterable[tuple[str, str]]) -> RunResult:
    """Longest-first replacement. A lexeme matches a whole token, not a substring.

    Lexemes are sorted by descending code-point length and given ids after that
    sort. The corpus is walked token by token, splitting only on whitespace.
    At each token the ordered list is consulted and the first lexeme whose form
    is exactly that token is the match. A shorter form cannot match inside a
    longer token: evam does not match inside devam. Matched tokens are replaced
    by a marker that contains no lexeme text. Offsets are into the original text.
    """
    lexemes = order_lexemes(forms)
    by_form = {lex.form: lex for lex in lexemes}
    occurrences: list[Occurrence] = []
    out: list[str] = []
    i = 0
    n = len(text)
    while i < n:
        if text[i].isspace():
            out.append(text[i])
            i += 1
            continue
        j = i
        while j < n and not text[j].isspace():
            j += 1
        token = text[i:j]
        lexeme = by_form.get(token)
        if lexeme is None:
            out.append(token)
        else:
            marker = f"⟦NG{lexeme.integer_id:06d}⟧"
            out.append(marker)
            occurrences.append(Occurrence(lexeme.source_id, lexeme.form,
                                          lexeme.integer_id, i, j))
        i = j
    occurrences.sort(key=lambda o: (o.start, o.end, o.integer_id))
    transformed = "".join(out)
    residual = re.sub(r"⟦NG\d{6}⟧", "", transformed)
    return RunResult(lexemes, transformed, tuple(occurrences), residual, len(residual))
