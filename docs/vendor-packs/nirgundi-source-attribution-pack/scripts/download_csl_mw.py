#!/usr/bin/env python3
"""Download CDSL Monier-Williams source text and its repository licence.

Requires network access. This script intentionally does not scrape sources whose
item-level redistribution rights remain unresolved.
"""
from pathlib import Path
from urllib.request import Request, urlopen
import hashlib
import json
from datetime import date

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "sources" / "cdsl"
OUT.mkdir(parents=True, exist_ok=True)

FILES = {
    "mw.txt": "https://raw.githubusercontent.com/sanskrit-lexicon/csl-orig/main/v02/mw/mw.txt",
    "LICENSE": "https://raw.githubusercontent.com/sanskrit-lexicon/csl-orig/main/LICENSE",
    "README.md": "https://raw.githubusercontent.com/sanskrit-lexicon/csl-orig/main/README.md",
}

manifest = {
    "source": "Cologne Digital Sanskrit Dictionaries (CDSL), csl-orig",
    "access_date": date.today().isoformat(),
    "license": "CC BY-SA 4.0",
    "license_url": "https://github.com/sanskrit-lexicon/csl-orig/blob/main/LICENSE",
    "attribution": "Cologne Digital Sanskrit Dictionaries (CDSL), csl-orig, Monier-Williams source text.",
    "files": {}
}

for name, url in FILES.items():
    request = Request(url, headers={"User-Agent": "Nirgundi-source-acquisition/1.0"})
    with urlopen(request, timeout=90) as response:
        data = response.read()
    path = OUT / name
    path.write_bytes(data)
    manifest["files"][name] = {
        "url": url,
        "bytes": len(data),
        "sha256": hashlib.sha256(data).hexdigest()
    }
    print(f"{name}: {len(data)} bytes sha256={manifest['files'][name]['sha256']}")

(OUT / "download-manifest.json").write_text(
    json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("Downloaded CDSL source files. Verify attribution and CC BY-SA 4.0 terms before redistribution.")
