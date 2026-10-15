"""Sūtram parser: Token list -> AST. See SPEC.md for grammar."""

from dataclasses import dataclass, field
from lexer import tokenize, Token


@dataclass
class Adhikara:
    name: str
    params: list
    body: list  # list of statement tuples


@dataclass
class Pada:
    name: str
    adhikaras: list


@dataclass
class Adhyaya:
    name: str
    padas: list


class Parser:
    def __init__(self, tokens: list[Token]):
        self.toks = [t for t in tokens if t.kind != "NEWLINE"]
        self.i = 0

    def peek(self) -> Token:
        return self.toks[self.i]

    def next(self) -> Token:
        t = self.toks[self.i]
        self.i += 1
        return t

    def expect(self, kind: str) -> Token:
        t = self.next()
        if t.kind != kind:
            raise SyntaxError(f"line {t.line}: expected {kind}, got {t.kind} {t.value!r}")
        return t

    def parse_program(self) -> list:
        out = []
        while self.peek().kind != "EOF":
            out.append(self.parse_adhyaya())
        return out

    def parse_adhyaya(self) -> Adhyaya:
        self.expect("ADHYAYA")
        name = self.expect("NAME").value
        self.expect("COLON")
        padas = []
        while self.peek().kind == "PADA":
            padas.append(self.parse_pada())
        self.expect("ITI")
        return Adhyaya(name, padas)

    def parse_pada(self) -> Pada:
        self.expect("PADA")
        name = self.expect("NAME").value
        self.expect("COLON")
        adhikaras = []
        while self.peek().kind == "ADHIKARA":
            adhikaras.append(self.parse_adhikara())
        self.expect("ITI")
        return Pada(name, adhikaras)

    def parse_adhikara(self) -> Adhikara:
        self.expect("ADHIKARA")
        name = self.expect("NAME").value
        params = []
        if self.peek().kind == "LPAREN":
            self.next()
            if self.peek().kind != "RPAREN":
                params.append(self.expect("NAME").value)
                while self.peek().kind == "COMMA":
                    self.next()
                    params.append(self.expect("NAME").value)
            self.expect("RPAREN")
        self.expect("COLON")
        body = []
        while self.peek().kind != "ITI":
            body.append(self.parse_stmt())
        self.expect("ITI")
        return Adhikara(name, params, body)

    def parse_expr(self):
        t = self.next()
        if t.kind == "NUMBER":
            return ("num", int(t.value))
        if t.kind == "BOOL":
            return ("bool", t.value == "guru")
        if t.kind == "NAME":
            return ("name", t.value)
        raise SyntaxError(f"line {t.line}: expected a value, got {t.kind} {t.value!r}")

    def parse_stmt(self):
        t = self.peek()
        if t.kind == "KARTA":
            self.next(); self.expect("COLON")
            return ("karta", self.parse_expr())
        if t.kind in ("YOGA", "VIYOGA"):
            self.next()
            return (t.value, self.parse_expr())
        if t.kind in ("DVIGUNA", "LIKH", "PHALA"):
            self.next()
            return (t.value, None)
        if t.kind == "NAME":  # call a user-defined adhikara as a unary op
            self.next()
            return ("call", t.value)
        raise SyntaxError(f"line {t.line}: unexpected {t.kind} {t.value!r} in sutra body")


def parse(src: str) -> list:
    return Parser(tokenize(src)).parse_program()
