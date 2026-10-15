"""Narrow TOML read shim for the vendored transliteration runtime.

The upstream package uses ``toml.load`` to read static scheme tables. This
shim supplies that read-only operation from Python's standard-library
``tomllib``; it is not a complete replacement for the third-party ``toml``
package and intentionally does not implement TOML writing.
"""
from __future__ import annotations

from pathlib import Path

try:
    import tomllib as _toml
except ImportError as exc:  # Python < 3.11
    raise ImportError(
        "The vendored transliteration runtime needs Python 3.11+ for tomllib, "
        "or the 'toml' package on Python 3.10."
    ) from exc


def load(source):
    if isinstance(source, (str, bytes, Path)):
        with open(source, "rb") as stream:
            return _toml.load(stream)
    data = source.read()
    if isinstance(data, str):
        return _toml.loads(data)
    import io
    return _toml.load(io.BytesIO(data))
