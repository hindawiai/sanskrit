"""
Sūtram evaluator. The whole point of this file is one thing: `karta` is a
single register that persists across statements within an adhikara, so a
chain of ops never restates its operand -- that persistence *is* anuvrtti,
implemented literally rather than metaphorically.
"""

from parser import parse, Adhikara


class Interpreter:
    def __init__(self, program):
        self.adhikaras = {}
        for adhyaya in program:
            for pada in adhyaya.padas:
                for ad in pada.adhikaras:
                    self.adhikaras[ad.name] = ad

    def eval_expr(self, expr, env):
        kind, val = expr
        if kind in ("num", "bool"):
            return val
        if kind == "name":
            if val not in env:
                raise NameError(f"{val} is not bound (not a parameter in scope)")
            return env[val]
        raise ValueError(f"unknown expr kind {kind}")

    def call(self, name: str, args: list) -> int:
        ad = self.adhikaras.get(name)
        if ad is None:
            raise NameError(f"no adhikara named {name!r}")
        if len(args) != len(ad.params):
            raise TypeError(f"{name} wants {len(ad.params)} args, got {len(args)}")
        env = dict(zip(ad.params, args))
        karta = None  # the carried-over subject -- this *is* anuvrtti
        result = None
        for op, arg in ad.body:
            if op == "karta":
                karta = self.eval_expr(arg, env)
            elif op == "yoga":
                karta = karta + self.eval_expr(arg, env)
            elif op == "viyoga":
                karta = karta - self.eval_expr(arg, env)
            elif op == "dviguna":
                karta = karta * 2
            elif op == "likh":
                print(karta)
            elif op == "phala":
                result = karta
            elif op == "call":
                karta = self.call(arg, [karta])
            else:
                raise ValueError(f"unknown op {op}")
        return result if result is not None else karta


def run(src: str, entry: str, args: list = ()) -> int:
    program = parse(src)
    interp = Interpreter(program)
    return interp.call(entry, list(args))
