"""Vidyut adapter: runs the vendored generator example if cargo is available."""
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
VIDYUT = ROOT / "third_party/vidyut"

def run(cases):
    if not (VIDYUT / "Cargo.toml").exists():
        return [{"system": "vidyut", "status": "unavailable", "error": "workspace missing"}]
    try:
        proc = subprocess.run(
            ["cargo", "run", "-p", "vidyut-prakriya", "--example", "bench_forms", "--quiet"],
            cwd=VIDYUT, capture_output=True, text=True, timeout=180,
        )
    except Exception as e:
        return [{"system": "vidyut", "status": "unavailable", "error": str(e)}]
    results = []
    for line in proc.stdout.splitlines():
        parts = line.split("\t")
        if len(parts) == 4:
            dhatu, expected, got, status = parts
            results.append({
                "system": "vidyut",
                "kind": "generation",
                "id": dhatu,
                "expected": expected,
                "got": got,
                "ok": status == "ok",
            })
    if not results:
        results.append({"system": "vidyut", "status": "error", "stderr": proc.stderr[-500:]})
    for case in cases.get("analysis", []):
        results.append({
            "system": "vidyut",
            "kind": "analysis",
            "id": case["id"],
            "status": "not_applicable",
            "note": "vidyut is a generator, not an analyzer",
        })
    return results
