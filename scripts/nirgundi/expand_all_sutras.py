#!/usr/bin/env python3
"""Structural conversion of every sutra record in data/sutras.json.

Same licenses as lang/js/convert.js:
  1.1.49 genitive -> sthana
  1.1.66 locative -> condition on the preceding
  1.1.67 ablative -> condition on the following
  anuvrtti field copied as source_annotation
  single-locative pada propagates until the next single-locative pada
  gloss confirms; it does not cause the copy

This is not a morphological derivation of each rule. A converted record
is an operational skeleton with provenance, not a claim the sutra is understood.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

DIGIT = {"०": 0, "१": 1, "२": 2, "३": 3, "४": 4, "५": 5, "६": 6, "७": 7, "८": 8, "९": 9}
PADA = re.compile(r"(\S+)\s+([०-९]+)/([०-९]+)")


def parse_padas(padaccheda: str | None) -> list[dict]:
    if not padaccheda:
        return []
    out = []
    for term, vib, vac in PADA.findall(padaccheda):
        vibhakti = DIGIT[vib]
        role, license_id = {
            6: ("sthana", "1.1.49"),
            7: ("on_preceding", "1.1.66"),
            5: ("on_following", "1.1.67"),
            1: ("nominative_unresolved", None),
            0: ("particle", None),
        }.get(vibhakti, ("unassigned", None))
        out.append({
            "term": term,
            "vibhakti": vibhakti,
            "vacana": DIGIT[vac],
            "role": role,
            "license": license_id,
            "verification": "own_pada",
            "via": "padaccheda",
        })
    return out


def id_less(a: str, b: str) -> bool:
    return [int(x) for x in a.split(".")] < [int(x) for x in b.split(".")]


def stem(term: str) -> str:
    return re.sub(r"[ःम्ेािुू]$", "", term)


def convert(rows: list[dict]) -> list[dict]:
    parsed = []
    heads = []
    for row in rows:
        padas = parse_padas(row.get("padaccheda"))
        adhikara = None
        if len(padas) == 1 and padas[0]["vibhakti"] == 7:
            adhikara = {"term": padas[0]["term"], "detection": "single_locative_pada"}
            heads.append(row["id"])
        parsed.append({**row, "padas": padas, "adhikara": adhikara, "inherited": []})
    head_until = {}
    for i, hid in enumerate(heads):
        head_until[hid] = heads[i + 1] if i + 1 < len(heads) else "9.9.999"
    by_id = {row["id"]: row for row in parsed}
    for row in parsed:
        if row["adhikara"]:
            row["adhikara"]["scopeUntil"] = head_until[row["id"]]
        for item in row.get("anuvrtti") or []:
            source = by_id.get(item["from"])
            source_has = False
            if source:
                source_has = any(p["term"] == item["term"] for p in source["padas"]) or any(
                    h["term"] == item["term"] for h in source["inherited"])
            row["inherited"].append({
                "term": item["term"],
                "from": item["from"],
                "via": "anuvrtti",
                "verification": "source_annotation",
                "source_has_term": source_has,
                "executable": True,
            })
    for row in parsed:
        for head in parsed:
            if not head["adhikara"]:
                continue
            if id_less(head["id"], row["id"]) and id_less(row["id"], head["adhikara"]["scopeUntil"]):
                confirmed = bool(row.get("gloss") and stem(head["adhikara"]["term"]) in row["gloss"])
                row["inherited"].append({
                    "term": head["adhikara"]["term"],
                    "from": head["id"],
                    "via": "adhikara",
                    "verification": "gloss_confirms" if confirmed else "unconfirmed",
                    "executable": confirmed,
                })
    return parsed


def main() -> None:
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("--sutras", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    rows = json.loads(Path(args.sutras).read_text(encoding="utf-8"))
    converted = convert(rows)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    with out.open("w", encoding="utf-8") as fh:
        for row in converted:
            fh.write(json.dumps({
                "id": row["id"],
                "sutra_krama": row.get("sutra_krama"),
                "type": row.get("type"),
                "sutra": row.get("sutra"),
                "padas": row["padas"],
                "inherited": row["inherited"],
                "adhikara": row["adhikara"],
            }, ensure_ascii=False) + "\n")
    summary = {
        "sutras": len(converted),
        "with_padas": sum(1 for r in converted if r["padas"]),
        "with_inherited": sum(1 for r in converted if r["inherited"]),
        "adhikara_headings": sum(1 for r in converted if r["adhikara"]),
        "executable_inherited": sum(1 for r in converted for h in r["inherited"] if h["executable"]),
        "unconfirmed_inherited": sum(1 for r in converted for h in r["inherited"] if not h["executable"]),
        "not_a_derivation": True,
    }
    out.with_suffix(".summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()
