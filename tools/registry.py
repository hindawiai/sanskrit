#!/usr/bin/env python3
"""
Implementation registry.

Tracks what is present, what is executable in this project's own
executor, and what is covered by a vendored system. The two are not
the same claim.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
COMPILER = ROOT / "tools" / "pushkalavati-compiler" / "data"


def load():
    ops = json.loads((COMPILER / "operations.json").read_text())
    own = []
    for section in ("ATTESTED", "SANDHI_ATTESTED", "MORPH_ATTESTED"):
        for sid, op in ops.get(section, {}).items():
            own.append({"id": sid, "section": section, "mode": op.get("mode"), "status": "executable_tested"})
    categories = [json.loads(line) for line in (DATA / "sutra-categories.jsonl").read_text().splitlines() if line.strip()]
    dhatu = json.loads((DATA / "dhatupatha-summary.json").read_text())
    vidyut = json.loads((DATA / "vidyut-coverage.json").read_text())
    return {
        "own_executor": {
            "count": len(own),
            "rules": own,
            "note": "rules this project's execute.py / execute.js can run",
        },
        "structural_conversion": {
            "count": 3983,
            "source": "data/nirgundi/all-sutras-converted.jsonl",
            "note": "padaccheda, roles, anuvrtti. Not executable.",
        },
        "categories": {
            "count": len(categories),
            "by_type": json.loads((DATA / "sutra-categories-summary.json").read_text())["by_type"],
            "source": "data/sutra-categories.jsonl (Tajziya join)",
        },
        "dhatupatha": {
            "count": dhatu["count"],
            "source": dhatu["source"],
            "licence": dhatu["licence"],
            "path": "data/external/vidyut-dhatupatha.tsv",
        },
        "vidyut_coverage": {
            "unique_rule_ids": vidyut["vidyut_unique_rule_ids_in_src"],
            "matched_to_ours": vidyut["matched_to_our_3983"],
            "by_type": vidyut["by_type"],
            "note": vidyut["note"],
            "path": "third_party/vidyut-prakriya",
        },
    }


def main():
    reg = load()
    out = DATA / "implementation-registry.json"
    out.write_text(json.dumps(reg, ensure_ascii=False, indent=2))
    print(f"own executor:        {reg['own_executor']['count']}")
    print(f"structural:          {reg['structural_conversion']['count']}")
    print(f"categories:          {reg['categories']['count']}")
    print(f"dhatupatha:          {reg['dhatupatha']['count']}")
    print(f"vidyut rule ids:     {reg['vidyut_coverage']['unique_rule_ids']}")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
