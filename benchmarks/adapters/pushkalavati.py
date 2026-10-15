"""Pushkalavati adapter: runs the project's own sandhi executor."""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COMPILER = ROOT / "tools/pushkalavati-compiler"
sys.path.insert(0, str(COMPILER / "python"))

def run(cases):
    results = []
    try:
        from execute import apply_sandhi_rule, apply_rule
        ops = json.loads((COMPILER / "data/operations.json").read_text())
        rules = {}
        for k, v in {**ops.get("ATTESTED", {}), **ops.get("SANDHI_ATTESTED", {})}.items():
            op = dict(v)
            op.setdefault("status", "executable_tested")
            rules[k] = {"id": k, "operation": op}
    except Exception as e:
        return [{"system": "pushkalavati", "status": "unavailable", "error": str(e)}]
    for case in cases.get("sandhi", []):
        rule = rules.get(case["id"])
        if not rule:
            results.append({"system": "pushkalavati", "kind": "sandhi", "id": case["id"], "status": "no_rule"})
            continue
        got = apply_sandhi_rule(case["left"], case["right"], case.get("context", {}), rule)
        if not got:
            got = apply_rule(case["left"], case["right"], rule)
        output = got.get("output") if isinstance(got, dict) else got
        results.append({
            "system": "pushkalavati",
            "kind": "sandhi",
            "id": case["id"],
            "expected": case["expected"],
            "got": output,
            "ok": output == case["expected"],
        })
    for case in cases.get("generation", []):
        results.append({"system": "pushkalavati", "kind": "generation", "id": case["id"],
                        "status": "not_applicable", "note": "this project has no word generator"})
    for case in cases.get("analysis", []):
        results.append({"system": "pushkalavati", "kind": "analysis", "id": case["id"],
                        "status": "not_applicable", "note": "this project has no morphological analyzer"})
    return results
