"""Cross-system benchmark runner.

Jobs are separate. Analysis is reverse. Generation is forward.
A system is scored only on the job it claims. Missing tools are reported,
not treated as failures of this repository.
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
FIXTURES = Path(__file__).resolve().parent / "fixtures" / "attested.json"
OUT = Path(__file__).resolve().parent / "out"


def run_local_inverse() -> dict:
    script = Path(__file__).resolve().parent / "local_inverse.js"
    proc = subprocess.run(
        ["node", str(script)],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode not in {0, 1}:
        return {"system": "pushkalavati-inverse", "available": False, "error": proc.stderr.strip()}
    return {"available": True, **json.loads(proc.stdout)}


def probe(module: str) -> dict:
    try:
        __import__(module)
    except Exception as exc:
        return {"available": False, "reason": f"{module} not importable: {exc.__class__.__name__}"}
    return {"available": True}


def main() -> int:
    fixtures = json.loads(FIXTURES.read_text(encoding="utf-8"))
    OUT.mkdir(exist_ok=True)
    report = {
        "fixtures": {
            "analysis": len(fixtures["analysis"]),
            "generation": len(fixtures["generation"]),
        },
        "systems": {
            "pushkalavati-inverse": run_local_inverse(),
            "vidyut": {
                "available": shutil.which("vidyut") is not None,
                "job": "generation",
                "reason": "MIT forward prakriya generator. Not an analyzer. Install separately to score generation.",
            },
            "sanskrit_parser": {
                **probe("sanskrit_parser"),
                "job": "sandhi-split-and-lookup",
                "reason": "MIT sandhi splitter plus lexical lookup. Reverse only at the sandhi layer.",
            },
            "vyakarana": {
                "available": False,
                "job": "generation",
                "reason": "No LICENSE file. Not scored.",
            },
        },
    }
    (OUT / "benchmark-report.json").write_text(
        json.dumps(report, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    local = report["systems"]["pushkalavati-inverse"]
    print(json.dumps({
        "local_available": local.get("available"),
        "local_rows": local.get("rows", []),
        "others_installed": {
            name: item.get("available")
            for name, item in report["systems"].items()
            if name != "pushkalavati-inverse"
        },
    }, ensure_ascii=False, indent=2))
    return 0 if local.get("available") and all(r["pass"] for r in local.get("rows", [])) else 1


if __name__ == "__main__":
    sys.exit(main())
