"""sanskrit_parser adapter: sandhi and tags, if the package is installed."""
def run(cases):
    try:
        from sanskrit_parser.parser.sandhi import Sandhi
        from sanskrit_parser.base.sanskrit_base import SanskritImmutableString
    except Exception as e:
        return [{"system": "sanskrit_parser", "status": "unavailable", "error": str(e),
                 "note": "pip install sanskrit_parser to enable"}]
    sandhi = Sandhi()
    results = []
    for case in cases.get("sandhi", []):
        try:
            left = SanskritImmutableString(case["left"])
            right = SanskritImmutableString(case["right"]) if case["right"] else None
            joins = list(sandhi.join(left, right)) if right else []
            got = str(joins[0]) if joins else None
        except Exception as e:
            got = f"error: {e}"
        results.append({
            "system": "sanskrit_parser",
            "kind": "sandhi",
            "id": case["id"],
            "expected": case["expected"],
            "got": got,
            "ok": got == case["expected"],
        })
    for case in cases.get("analysis", []):
        results.append({
            "system": "sanskrit_parser",
            "kind": "analysis",
            "id": case["id"],
            "status": "available",
            "note": "call parser.split / getMorphologicalTags; not scored here",
        })
    return results
