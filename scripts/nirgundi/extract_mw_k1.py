#!/usr/bin/env python3
"""Extract Monier-Williams headwords exactly as written in CDSL mw.txt.

k1 is the Cologne headword field. This extractor does not transliterate,
case-fold, or otherwise normalize. Duplicate k1 values are retained as
separate source records.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

K1 = re.compile(r"<k1>([^<]*)")
LID = re.compile(r"<L>([^<]*)")
REC = re.compile(r"<L>([^<]*)<pc>[^<]*<k1>([^<]*)")


def extract(mw_path: Path) -> list[dict]:
    text = mw_path.read_text(encoding="utf-8")
    records = []
    for i, match in enumerate(REC.finditer(text), start=1):
        form = match.group(2)
        if form == "":
            continue
        records.append({
            "source_id": "cdsl_csl_orig_mw",
            "source_class": "MODERN_DICTIONARY",
            "source_record_id": match.group(1),
            "local_id": f"mw-k1-{i}",
            "original_form": form,
            "original_script": "SLP1",
            "original_encoding": "utf-8",
            "edition_id": "csl-orig/v02/mw/mw.txt",
            "location_in_source": f"L={match.group(1)}",
            "entry_context": "k1 headword",
            "extraction_status": "EXTRACTED",
            "confidence": "VERIFIED",
            "rights_status": "CC BY-SA 4.0",
            "code_points": len(form),
        })
    return records


def main() -> None:
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("mw_txt")
    p.add_argument("out_jsonl")
    args = p.parse_args()
    src = Path(args.mw_txt)
    raw = src.read_bytes()
    records = extract(src)
    out = Path(args.out_jsonl)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as fh:
        for rec in records:
            fh.write(json.dumps(rec, ensure_ascii=False) + "\n")
    digest = hashlib.sha256(raw).hexdigest()
    summary = {
        "source_file": str(src),
        "sha256": digest,
        "bytes": len(raw),
        "records": len(records),
        "unique_forms": len({r["original_form"] for r in records}),
    }
    out.with_suffix(".summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary))


if __name__ == "__main__":
    main()
