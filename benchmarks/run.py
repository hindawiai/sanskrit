#!/usr/bin/env python3
"""Run the shared benchmark cases against every adapter that can answer."""
import importlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
CASES = json.loads((HERE / "cases.json").read_text())
ADAPTERS = ["pushkalavati", "vidyut", "sanskrit_parser", "external"]

def main():
    all_results = []
    for name in ADAPTERS:
        mod = importlib.import_module(f"adapters.{name}")
        all_results.extend(mod.run(CASES))
    out = HERE / "results" / "latest.json"
    out.write_text(json.dumps(all_results, ensure_ascii=False, indent=2))
    scored = [r for r in all_results if "ok" in r]
    passed = sum(1 for r in scored if r["ok"])
    print(f"scored {passed}/{len(scored)}")
    for r in all_results:
        status = "ok" if r.get("ok") else r.get("status", "diff")
        print(f"  {r['system']:20} {r.get('kind',''):12} {r.get('id',''):16} {status}")
    print(f"wrote {out}")

if __name__ == "__main__":
    main()
