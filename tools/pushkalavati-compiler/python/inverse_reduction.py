"""Placeholder. The inverse-reduction parser is implemented in JavaScript.

Canonical module: tools/pushkalavati-compiler/src/inverse-reduction.js
Runner: node src/inverse-cli.js <devanagari-form>

This file exists so the Python tree has an explicit boundary. It does not
parse, and it must not be extended into a second implementation.
"""


class InverseReductionNotImplemented(NotImplementedError):
    """Raised by the Python placeholder. Use the JavaScript implementation."""


def analyze_inverse_reduction(text: str):
    raise InverseReductionNotImplemented(
        "Inverse reduction is implemented in JavaScript only: "
        "tools/pushkalavati-compiler/src/inverse-reduction.js"
    )
