#!/usr/bin/env python3
"""Validate localized C/C++ keyword-table coverage and reversible token maps.

Checks generated tables derived from Romenagri's canonical language CSVs.
This validates table integrity only; it does not claim the compiler adapter works.
"""
from __future__ import annotations
import csv, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PORTS = ROOT / "lang/hindawi/ports"
REGISTRY = ROOT / "lang/hindawi/upstream/langspec/data/language_registry.csv"

def read_csv(path: Path):
    lines=[x for x in path.read_text(encoding="utf-8-sig").splitlines() if x.strip() and not x.lstrip().startswith("#")]
    return list(csv.DictReader(lines))

def main() -> int:
    registry=read_csv(REGISTRY)
    failures=0
    expected={"c":20,"cpp":25}
    for profile in registry:
        code=profile["code"]
        for lang, count in expected.items():
            path=PORTS/lang/f"{code}.csv"
            if not path.exists():
                print(f"FAIL {lang}/{code}: missing generated table"); failures+=1; continue
            rows=read_csv(path)
            if len(rows)!=count:
                print(f"FAIL {lang}/{code}: rows={len(rows)} expected={count}"); failures+=1; continue
            native={}; roman={}; tokens=set()
            for r in rows:
                token=r["programming_language_token"]
                if token in tokens:
                    print(f"FAIL {lang}/{code}: duplicate programming token {token}"); failures+=1
                tokens.add(token)
                native.setdefault(r["native_keyword"],[]).append(token)
                roman.setdefault(r["romenagri"],[]).append(token)
            nc={k:v for k,v in native.items() if len(v)>1}
            rc={k:v for k,v in roman.items() if len(v)>1}
            # C tables must be collision-free to be considered round-trippable.
            # C++ collision status is recorded, never silently accepted.
            report={r["profile_code"]:r for r in read_csv(PORTS/"port_coverage.csv")}
            status=report.get(code+"|"+lang)
            # coverage report is one row per profile/language; check actual collision fields.
            matches=[r for r in read_csv(PORTS/"port_coverage.csv") if r["profile_code"]==code and r["programming_language"]==lang]
            if not matches:
                print(f"FAIL {lang}/{code}: missing coverage row"); failures+=1; continue
            if lang=="c" and (nc or rc):
                print(f"FAIL c/{code}: collisions native={nc} romenagri={rc}"); failures+=1
            if lang=="c" and matches[0]["status"]!="candidate-keyword-table":
                print(f"FAIL c/{code}: status={matches[0]['status']}"); failures+=1
            if lang=="cpp" and bool(nc or rc) != (matches[0]["status"]=="needs-review"):
                print(f"FAIL cpp/{code}: collision status mismatch"); failures+=1
            print(f"PASS {lang}/{code} rows={len(rows)}" if not (lang=="c" and (nc or rc)) else f"FAIL c/{code}")
    print(f"profiles={len(registry)} failures={failures}")
    return 1 if failures else 0
if __name__=="__main__": sys.exit(main())
