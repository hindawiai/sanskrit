"""
Sūtram lexer. See SPEC.md for the design rationale -- this file is just
the tokenizer: source text in, a flat list of Tokens out.
"""

import re
from dataclasses import dataclass

# Illustrative, explicitly non-exhaustive subset of bhutasamkhya (object
# numerals) -- see SPEC.md. Real texts show some regional/textual variation;
# this is not presented as a canonical table.
BHUTASAMKHYA = {
    "shunya": 0, "candra": 1, "indu": 1, "netra": 2, "akshi": 2,
    "agni": 3, "veda": 4, "rasa": 6, "ashva": 7, "vasu": 8,
}

KEYWORDS = {
    "adhyaya", "pada", "adhikara", "iti", "karta",
    "yoga", "viyoga", "dviguna", "likh", "phala",
    "laghu", "guru",
}

TOKEN_SPEC = [
    ("COMMENT", r"#[^\n]*"),
    ("NEWLINE", r"\n"),
    ("WS", r"[ \t]+"),
    ("COLON", r":"),
    ("LPAREN", r"\("),
    ("RPAREN", r"\)"),
    ("COMMA", r","),
    ("NUMBER", r"\d+"),
    ("NAME", r"[A-Za-z_][A-Za-z0-9_]*"),
]
MASTER_RE = re.compile("|".join(f"(?P<{n}>{p})" for n, p in TOKEN_SPEC))


@dataclass
class Token:
    kind: str
    value: str
    line: int


def tokenize(src: str) -> list[Token]:
    tokens = []
    line = 1
    pos = 0
    while pos < len(src):
        m = MASTER_RE.match(src, pos)
        if not m:
            raise SyntaxError(f"line {line}: unexpected character {src[pos]!r}")
        kind = m.lastgroup
        text = m.group()
        if kind == "NEWLINE":
            line += 1
        elif kind not in ("WS", "COMMENT"):
            if kind == "NAME" and text in BHUTASAMKHYA:
                tokens.append(Token("NUMBER", str(BHUTASAMKHYA[text]), line))
            elif kind == "NAME" and text in ("laghu", "guru"):
                tokens.append(Token("BOOL", text, line))
            elif kind == "NAME" and text in KEYWORDS:
                tokens.append(Token(text.upper(), text, line))
            else:
                tokens.append(Token(kind, text, line))
        pos = m.end()
    tokens.append(Token("EOF", "", line))
    return tokens
