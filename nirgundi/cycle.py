"""After the literal match, apply licensed sandhi vichheda and measure again.

The baseline matcher is not modified. A split is kept only when a cited rule
licenses it and the next match consumes a piece it could not consume before.
The loop returns to the match step until a pass consumes nothing.
"""
from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path

from nirgundi.baseline import run_baseline


@dataclass
class CycleState:
    rounds: list[dict] = field(default_factory=list)
    rules_fired: dict[str, int] = field(default_factory=dict)
    residual_tokens: list[str] = field(default_factory=list)
    matched_forms: list[str] = field(default_factory=list)


def _forms(records: list[dict]) -> list[tuple[str, str]]:
    first = {}
    for rec in records:
        first.setdefault(rec["original_form"], rec)
    return [(rec["source_id"] + ":" + rec["source_record_id"], form) for form, rec in first.items()]


def _tokens(text: str) -> list[str]:
    return [tok for tok in text.split() if tok]


def match_round(text: str, forms: list[tuple[str, str]]) -> dict:
    result = run_baseline(text, forms)
    return {
        "matched": [o.form for o in result.occurrences],
        "residual": result.residual,
        "unmatched_code_points": result.unmatched_characters,
        "matched_code_points": sum(o.end - o.start for o in result.occurrences),
    }



def _later(a: str, b: str) -> bool:
    return [int(x) for x in a.split(".")] > [int(x) for x in b.split(".")]


def executable(row: dict | None) -> bool:
    """A converted record may execute only with source_annotation or gloss_confirms.

    A propagated label with verification unconfirmed is not understanding.
    Nominative padas stay unresolved; the converter has not made them operations.
    """
    if not row:
        return False
    for item in row.get("inherited") or []:
        if item.get("executable") and item.get("verification") in {"source_annotation", "gloss_confirms"}:
            return True
    for pada in row.get("padas") or []:
        if pada.get("license") and pada.get("verification") == "own_pada":
            return True
    return False


def choose(cands: list[dict], converted: dict[str, dict]) -> tuple[dict | None, list[dict]]:
    """1.4.2: among executable competing vidhis, the later sutra wins."""
    licensed = []
    refused = []
    for cand in cands:
        if cand["rule"][0].isdigit():
            row = converted.get(cand["rule"])
            if not executable(row):
                refused.append({**cand, "refused": "converted record has no executable provenance"})
                continue
            cand = {**cand, "provenance": [h for h in row.get("inherited") or [] if h.get("executable")]}
        licensed.append(cand)
    if not licensed:
        return None, refused
    sutras = [c for c in licensed if c["rule"][0].isdigit()]
    winner = licensed[0]
    if sutras:
        winner = sutras[0]
        for cand in sutras[1:]:
            if _later(cand["rule"], winner["rule"]):
                winner = cand
    conflicts = [c["rule"] for c in sutras if c is not winner]
    if conflicts:
        winner = {**winner, "vipratishedha": "1.4.2", "lost": conflicts}
    return winner, refused


def vichheda(token: str, inventory: set[str]) -> list[dict]:
    """Candidate splits. A candidate is not a consumption until rematch accepts it."""
    out = []
    if "-" in token.strip("-"):
        parts = [p for p in token.split("-") if p]
        if len(parts) >= 2:
            out.append({"rule": "padapatha-hyphen", "sutra": None, "pieces": parts,
                        "note": "written padapatha delimiter, not a sutra"})
    if token.endswith("ḥ") and token[:-1] in inventory:
        out.append({"rule": "8.3.15", "sutra": "खरवसानयोर्विसर्जनीयः", "pieces": [token[:-1]],
                    "note": "visarga accounted by 8.3.15; stem must already be an inventory form"})
    if token.endswith("am") and token[:-1] in inventory:
        out.append({"rule": "6.1.107", "sutra": "अमि पूर्वः", "pieces": [token[:-1]],
                    "note": "a + am -> am; stem without final m must already be an inventory form"})
    # 4.1.2 lists भिस्. Surface bhiḥ is that ending after visarga. Stem must already be listed.
    if token.endswith("bhiḥ") and token[:-4] in inventory:
        out.append({"rule": "4.1.2", "sutra": "स्वौजसमौट्छष्टाभ्याम्भिस्ङेभ्याम्भ्यस्ङसिभ्याम्भ्यस्ङसोसाङ्ङ्योस्सुप्",
                    "pieces": [token[:-4]],
                    "note": "bhis is an enumerated sup; remainder must already be an inventory form"})
    # 7.3.103: अतः अङ्गस्य बहुवचने झलि एत्. Surface ebhiḥ, a-stem recovered by replacing e with a.
    if token.endswith("ebhiḥ") and (token[:-5] + "a") in inventory:
        out.append({"rule": "7.3.103", "sutra": "बहुवचने झल्येत्",
                    "pieces": [token[:-5] + "a"],
                    "note": "a-stem becomes e before a plural jhal ending; recovered stem must be listed"})
    # 7.1.12: टा-ङसि-ङसाम् become इन-आत्-स्याः after an a-stem.
    if token.endswith("ena") and (token[:-3] + "a") in inventory:
        out.append({"rule": "7.1.12", "sutra": "टाङसिङसामिनात्स्याः",
                    "pieces": [token[:-3] + "a"],
                    "note": "ṭā -> ina after an a-stem; recovered stem must be listed"})
    if token.endswith("āt") and token[:-1] in inventory:
        out.append({"rule": "7.1.12", "sutra": "टाङसिङसामिनात्स्याः",
                    "pieces": [token[:-1]],
                    "note": "ṅasi -> āt after an a-stem; remainder must be listed"})
    if token.endswith("sya") and (token[:-3] + "a") in inventory:
        out.append({"rule": "7.1.12", "sutra": "टाङसिङसामिनात्स्याः",
                    "pieces": [token[:-3] + "a"],
                    "note": "ṅas -> sya after an a-stem; recovered stem must be listed"})
    if "--" in token:
        parts = [p for p in token.split("-") if p]
        if len(parts) >= 2:
            out.append({"rule": "padapatha-double-hyphen", "sutra": None, "pieces": parts,
                        "note": "written padapatha delimiter, not a sutra"})
    return out


def run_cycle(text: str, records: list[dict], max_rounds: int = 8, converted: dict | None = None) -> CycleState:
    forms = _forms(records)
    inventory = {form for _, form in forms}
    state = CycleState()
    current = text
    for n in range(1, max_rounds + 1):
        matched = match_round(current, forms)
        consumed = []
        kept_residual = []
        for token in _tokens(matched["residual"]):
            pool = []
            for cand in vichheda(token, inventory):
                hits = [piece for piece in cand["pieces"] if piece in inventory]
                if not hits:
                    continue
                cand = {**cand, "hits": hits}
                pool.append(cand)
            accepted, refused = choose(pool, converted or {})
            if accepted is None:
                kept_residual.append(token)
                continue
            state.rules_fired[accepted["rule"]] = state.rules_fired.get(accepted["rule"], 0) + 1
            consumed.append({"token": token, **accepted})
            for piece in accepted["pieces"]:
                if piece not in inventory:
                    kept_residual.append(piece)
        state.rounds.append({
            "round": n,
            "matched": matched["matched"],
            "unmatched_code_points_before_vichheda": matched["unmatched_code_points"],
            "vichheda_consumed": consumed,
            "residual_tokens": kept_residual,
        })
        state.matched_forms.extend(matched["matched"])
        if not consumed and not matched["matched"]:
            break
        if not consumed:
            state.residual_tokens = kept_residual
            break
        current = " ".join(kept_residual)
        if not current.strip():
            state.residual_tokens = []
            break
    else:
        state.residual_tokens = _tokens(current)
    if not state.residual_tokens:
        state.residual_tokens = state.rounds[-1]["residual_tokens"]
    return state


def coverage(state: CycleState, sutra_count: int) -> dict:
    fired = sorted(k for k in state.rules_fired if k[0].isdigit())
    return {
        "sutras_in_data": sutra_count,
        "rules_fired": fired,
        "rules_fired_count": len(fired),
        "rule_coverage_percent": round(100.0 * len(fired) / sutra_count, 4) if sutra_count else 0.0,
        "applications": state.rules_fired,
        "residual_tokens": state.residual_tokens,
        "residual_token_count": len(state.residual_tokens),
        "stop": "corpus not exhausted; no further licensed split consumed an inventory form",
    }


def load_and_run(corpus_path: Path, records_path: Path, sutras_path: Path) -> dict:
    data = json.loads(corpus_path.read_text(encoding="utf-8"))
    text = "\n".join(" ".join(v["words"]) for v in data)
    records = [json.loads(line) for line in records_path.read_text(encoding="utf-8").splitlines() if line]
    sutras = json.loads(sutras_path.read_text(encoding="utf-8"))
    converted_path = sutras_path.parent / "nirgundi" / "all-sutras-converted.jsonl"
    converted = {json.loads(line)["id"]: json.loads(line) for line in converted_path.read_text(encoding="utf-8").splitlines() if line}
    state = run_cycle(text, records, converted=converted)
    report = coverage(state, len(sutras))
    report["rounds"] = state.rounds
    return report
