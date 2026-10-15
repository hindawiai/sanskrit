#!/usr/bin/env python3
"""Reproducible collision, round-trip, and downstream-normalization audit.

A collision is reported only when two distinct source strings are successfully
encoded to the same output by the same scheme. Rejections are coverage events,
not collisions. Downstream transforms (lowercase, diacritic removal, etc.) are
reported separately because they are not part of the transliterator itself.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
# Set paths before importing the vendored library. Do not import an unused `toml`
# module or depend on callers having configured PYTHONPATH.
sys.path.insert(0, str(ROOT / "tools"))
sys.path.insert(0, str(ROOT / "third_party" / "indic_transliteration"))
from indic_transliteration import sanscript  # noqa: E402
from transliteration import encode as rom_encode, decode as rom_decode  # noqa: E402

SCHEMES = {
    "romenagri": None,
    "iast": sanscript.IAST,
    "hk": sanscript.HK,
    "slp1": sanscript.SLP1,
    "itrans": sanscript.ITRANS,
    "velthuis": sanscript.VELTHUIS,
    "iso": sanscript.ISO,
    "iso_vedic": sanscript.ISO_VEDIC,
    "wx": sanscript.WX,
    "titus": sanscript.TITUS,
    "kolkata": sanscript.KOLKATA,
    "optitrans": sanscript.OPTITRANS,
}

CASES = [
    {"id": "z-sibilant", "group": "sibilant", "inputs": ["श", "ष"], "note": "HK z=श; SLP1 z=ष; scheme identity is required."},
    {"id": "ch-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["छ", "च्ह"], "note": "Aspirated छ versus च् + ह."},
    {"id": "kh-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["ख", "क्ह"], "note": "Aspirated ख versus क् + ह."},
    {"id": "gh-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["घ", "ग्ह"], "note": "Aspirated घ versus ग् + ह."},
    {"id": "jh-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["झ", "ज्ह"], "note": "Aspirated झ versus ज् + ह."},
    {"id": "th-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["थ", "त्ह"], "note": "Dental aspirate versus त् + ह."},
    {"id": "dh-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["ध", "द्ह"], "note": "Dental aspirate versus द् + ह."},
    {"id": "ph-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["फ", "प्ह"], "note": "Aspirated फ versus प् + ह."},
    {"id": "bh-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["भ", "ब्ह"], "note": "Aspirated भ versus ब् + ह."},
    {"id": "sh-vs-cluster", "group": "aspirate-vs-cluster", "inputs": ["श", "स्ह"], "note": "श versus स् + ह."},
    {"id": "dental-retroflex-t", "group": "place-of-articulation", "inputs": ["त", "ट"], "note": "Dental/retroflex distinction."},
    {"id": "dental-retroflex-th", "group": "place-of-articulation", "inputs": ["थ", "ठ"], "note": "Dental/retroflex aspirate distinction."},
    {"id": "dental-retroflex-d", "group": "place-of-articulation", "inputs": ["द", "ड"], "note": "Dental/retroflex distinction."},
    {"id": "dental-retroflex-dh", "group": "place-of-articulation", "inputs": ["ध", "ढ"], "note": "Dental/retroflex aspirate distinction."},
    {"id": "sibilants-three-way", "group": "sibilant", "inputs": ["श", "ष", "स"], "note": "Three distinct Sanskrit sibilants."},
    {"id": "vocalic-r", "group": "vocalic", "inputs": ["ऋ", "रि"], "note": "Vocalic ṛ versus consonant r + i."},
    {"id": "long-vocalic-r", "group": "vocalic", "inputs": ["ॠ", "री"], "note": "Long vocalic ṝ versus consonant r + ī."},
    {"id": "anusvara-homorganic", "group": "nasal", "inputs": ["अंग", "अङ्ग", "अन्ग", "अम्ग"], "note": "Anusvāra, homorganic nasal, dental nasal, and m sequence."},
    {"id": "anunasika-anusvara", "group": "nasal", "inputs": ["अँ", "अं"], "note": "Candrabindu versus anusvāra."},
    {"id": "visarga-ha", "group": "signs", "inputs": ["अः", "अह"], "note": "Visarga versus consonant h."},
    {"id": "avagraha-apostrophe", "group": "punctuation", "inputs": ["सोऽपि", "सो'पि"], "note": "Avagraha versus literal ASCII apostrophe."},
    {"id": "danda-pipe", "group": "punctuation", "inputs": ["।", "|"], "note": "Danda versus literal pipe; unsupported input is not a collision."},
    {"id": "double-danda", "group": "punctuation", "inputs": ["॥", "।।"], "note": "Double danda versus two single dandas."},
    {"id": "virama-inherent", "group": "virama", "inputs": ["क्त", "कट", "कत्"], "note": "Conjunct, inherent vowel, and final virāma."},
    {"id": "terminal-virama", "group": "virama", "inputs": ["क", "क्", "चेत्", "सर्वम्", "पापम्"], "note": "Final inherent vowel and terminal virāma regression set."},
    {"id": "case-sensitivity", "group": "case", "inputs": ["स", "श", "ष"], "note": "SLP1 uses sa/Sa/za; case normalization can destroy distinctions."},
    {"id": "nukta-precomposed", "group": "unicode-normalization", "inputs": ["क़", "क़"], "note": "Precomposed QA versus canonical decomposed KA + nukta; canonical-equivalence case.", "canonical_equivalence": True},
    {"id": "nukta-dda", "group": "unicode-normalization", "inputs": ["\u095c", "ड\u093c"], "note": "Precomposed U+095C DDA with nukta versus decomposed sequence; canonical-equivalence case.", "canonical_equivalence": True},
    {"id": "candra-vowels", "group": "extended-devanagari", "inputs": ["कॅ", "क", "कॉ"], "note": "Candra e/o signs and plain consonant."},
    {"id": "vedic-accents", "group": "vedic", "inputs": ["अ॑", "अ॒", "अ"], "note": "U+0951 udatta, U+0952 anudatta, and unaccented vowel."},
    {"id": "combining-acute", "group": "unicode-normalization", "inputs": ["अ\u0301", "अ"], "note": "Generic combining acute is not the same code point as Vedic udatta."},
    {"id": "zwj-zwnj-conjunct", "group": "unicode-controls", "inputs": ["क्ष", "क्\u200dष", "क्\u200cष"], "note": "Conjunct with no join control, ZWJ, and ZWNJ."},
    {"id": "digit-script", "group": "numerals", "inputs": ["५", "5"], "note": "Romenagri digit normalization may collapse script identity."},
    {"id": "digit-sequence", "group": "numerals", "inputs": ["२०२६", "2026"], "note": "Whole numeral strings in Devanagari and ASCII."},
    {"id": "mixed-latin", "group": "mixed-script", "inputs": ["as", "but"], "note": "Romenagri rejects Latin-source text; two rejections must not be called a collision."},
    {"id": "whitespace", "group": "layout", "inputs": ["क त", "कत", "क\tत", "क\nत"], "note": "Space, tab, newline and no separator."},
]


def encode_one(text: str, scheme: str) -> dict:
    try:
        if scheme == "romenagri":
            result = rom_encode(text, "devanagari", "romenagri")
            return {"status": "ok" if result.output is not None else "unresolved", "output": result.output, "note": result.note}
        output = sanscript.transliterate(text, sanscript.DEVANAGARI, SCHEMES[scheme])
        return {"status": "ok", "output": output, "note": ""}
    except Exception as exc:  # test report preserves adapter exceptions
        return {"status": "error", "output": None, "note": f"{type(exc).__name__}: {exc}"}


def decode_one(text: str, scheme: str) -> dict:
    try:
        if scheme == "romenagri":
            result = rom_decode(text, "romenagri", "devanagari")
            return {"status": "ok" if result.output is not None else "unresolved", "output": result.output, "note": result.note}
        output = sanscript.transliterate(text, SCHEMES[scheme], sanscript.DEVANAGARI)
        return {"status": "ok", "output": output, "note": ""}
    except Exception as exc:
        return {"status": "error", "output": None, "note": f"{type(exc).__name__}: {exc}"}


def successful_collisions(records: list[dict], output_key: str = "output") -> list[dict]:
    grouped: dict[str, list[str]] = defaultdict(list)
    for rec in records:
        if rec.get("status") == "ok" and isinstance(rec.get(output_key), str):
            grouped[rec[output_key]].append(rec["input"])
    return [{"output": out, "inputs": ins} for out, ins in sorted(grouped.items()) if len(set(ins)) > 1]


def strip_diacritics(text: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFD", text) if not unicodedata.combining(ch))


def strip_punctuation(text: str) -> str:
    return "".join(ch for ch in text if not unicodedata.category(ch).startswith("P"))

TRANSFORMS = {
    "lower": str.lower,
    "casefold": str.casefold,
    "NFC": lambda s: unicodedata.normalize("NFC", s),
    "NFD": lambda s: unicodedata.normalize("NFD", s),
    "strip_diacritics": strip_diacritics,
    "strip_punctuation_including_underscore": strip_punctuation,
}


def main() -> int:
    report = {
        "schema": "pushkalavati.transliteration-collision-audit/2",
        "source": "vendored indic_transliteration plus project Romenagri word-level adapter",
        "method": {
            "collision": "two distinct inputs successfully encode to the same output within one named scheme",
            "rejection": "unresolved/error is recorded separately and never counted as a collision",
            "round_trip": "decode(encode(input)) == original Unicode string, exact code-point sequence",
            "normalization": "downstream transforms are reported separately from native scheme collisions",
        },
        "case_count": len(CASES), "schemes": list(SCHEMES), "cases": [],
        "scheme_summary": {}, "cross_scheme_ambiguities": [],
    }
    all_outputs = []
    for case in CASES:
        row = {**case, "schemes": {}}
        for scheme in SCHEMES:
            items = []
            for text in case["inputs"]:
                enc = encode_one(text, scheme)
                dec = decode_one(enc["output"], scheme) if enc["status"] == "ok" and enc["output"] is not None else {"status": "not_run", "output": None, "note": "encoding did not produce output"}
                item = {
                    "input": text, "input_codepoints": [f"U+{ord(ch):04X}" for ch in text],
                    "status": enc["status"], "output": enc["output"], "encode_note": enc["note"],
                    "decode_status": dec["status"], "decoded": dec["output"],
                    "exact_round_trip": dec["status"] == "ok" and dec["output"] == text,
                }
                items.append(item)
                if item["status"] == "ok" and item["output"] is not None:
                    all_outputs.append({"scheme": scheme, "input": text, "output": item["output"], "decoded": item["decoded"]})
            collisions = successful_collisions(items)
            transform_collisions = {}
            for transform_name, transform in TRANSFORMS.items():
                transformed = [{**it, "output": transform(it["output"])} for it in items if it["status"] == "ok" and it["output"] is not None]
                got = successful_collisions(transformed)
                if got:
                    transform_collisions[transform_name] = got
            row["schemes"][scheme] = {
                "inputs": items,
                "successful_encodes": sum(x["status"] == "ok" for x in items),
                "rejections": sum(x["status"] != "ok" for x in items),
                "exact_round_trips": sum(x["exact_round_trip"] for x in items),
                "native_collisions": collisions,
                "collision": bool(collisions) and not case.get("canonical_equivalence", False),
                "canonical_equivalence_output_merges": collisions if case.get("canonical_equivalence", False) else [],
                "downstream_transform_collisions": transform_collisions,
            }
        report["cases"].append(row)

    # Same byte/character string under different scheme identities may decode
    # to different source strings. This is not an intra-scheme collision.
    grouped: dict[str, list[dict]] = defaultdict(list)
    for item in all_outputs:
        grouped[item["output"]].append(item)
    for roman, records in sorted(grouped.items()):
        for i, left in enumerate(records):
            for right in records[i + 1:]:
                if left["scheme"] != right["scheme"] and left["input"] != right["input"] and left.get("decoded") is not None and right.get("decoded") is not None and left.get("decoded") != right.get("decoded"):
                    report["cross_scheme_ambiguities"].append({"output": roman, "left": left, "right": right})
    report["cross_scheme_ambiguity_count"] = len(report["cross_scheme_ambiguities"])
    report["cross_scheme_ambiguities_truncated"] = report["cross_scheme_ambiguity_count"] > 200
    report["cross_scheme_ambiguities"] = report["cross_scheme_ambiguities"][:200]

    for scheme in SCHEMES:
        records = [x for case in report["cases"] for x in case["schemes"][scheme]["inputs"]]
        report["scheme_summary"][scheme] = {
            "inputs_tested": len(records),
            "successful_encodes": sum(x["status"] == "ok" for x in records),
            "rejections": sum(x["status"] != "ok" for x in records),
            "exact_round_trips": sum(x["exact_round_trip"] for x in records),
            "native_collision_cases": sum(bool(case["schemes"][scheme]["collision"]) for case in report["cases"]),
            "canonical_equivalence_output_merge_cases": sum(bool(case["schemes"][scheme]["canonical_equivalence_output_merges"]) for case in report["cases"]),
            "downstream_transform_collision_cases": sum(bool(case["schemes"][scheme]["downstream_transform_collisions"]) for case in report["cases"]),
        }

    out = ROOT / "tools" / "transliteration" / "results" / "collisions.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"cases={len(CASES)} schemes={len(SCHEMES)} input-encodes={sum(x['inputs_tested'] for x in report['scheme_summary'].values())}")
    for scheme, data in report["scheme_summary"].items():
        print(f"{scheme:10} encodes={data['successful_encodes']:3} rejects={data['rejections']:3} exact-rt={data['exact_round_trips']:3} native-collision-cases={data['native_collision_cases']:2} transform-collision-cases={data['downstream_transform_collision_cases']:2}")
    print(f"cross-scheme ambiguities: {report['cross_scheme_ambiguity_count']} (records capped at 200)")
    print(f"wrote {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
