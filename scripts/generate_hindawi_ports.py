#!/usr/bin/env python3
"""Generate reviewable C/C++ keyword tables from canonical Romenagri CSV data.

No language translations are invented. Missing rows and lexical collisions are
reported in CSV coverage reports. Generated tables are not compiler integration.
"""
from __future__ import annotations
import argparse, collections, csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HINDAWI = ROOT / "lang/hindawi"
DATA = HINDAWI / "upstream/langspec/data"
OUT = HINDAWI / "ports"
C_TARGETS = {
    "KW_IF":"if", "KW_ELSE":"else", "KW_WHILE":"while", "KW_DO":"do",
    "KW_FOR":"for", "KW_BREAK":"break", "KW_CONTINUE":"continue",
    "KW_SWITCH":"switch", "KW_CASE":"case", "KW_DEFAULT":"default",
    "KW_RETURN":"return", "KW_CONST":"const", "KW_INT":"int",
    "KW_FLOAT":"float", "KW_DOUBLE":"double", "KW_CHAR":"char",
    "KW_VOID":"void", "KW_STATIC":"static", "KW_STRUCT":"struct",
    "KW_INCLUDE":"include",
}
CPP_EXTRA = {"KW_CLASS":"class", "KW_NEW":"new", "KW_PUBLIC":"public",
             "KW_PRIVATE":"private", "KW_VIRTUAL":"virtual"}
FIELDS = ["profile_code","language_name","script","construct_id","native_keyword",
          "romenagri","programming_language_token","category","source_file","status"]

def rows(path: Path):
    lines=[s for s in path.read_text(encoding="utf-8-sig").splitlines() if s.strip() and not s.lstrip().startswith("#")]
    return list(csv.DictReader(lines))

def write_csv(path, header, records):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=header); w.writeheader(); w.writerows(records)

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--output",type=Path,default=OUT); args=ap.parse_args()
    ontology={r["construct_id"]:r for r in rows(DATA/"keyword_ontology.csv")}
    english_to_id={r["english_keyword"]:r["construct_id"] for r in ontology.values()}
    registry=rows(DATA/"language_registry.csv")
    targets={"c":C_TARGETS,"cpp":{**C_TARGETS,**CPP_EXTRA}}
    summary=[]; matrix=[]
    for profile in registry:
        code=profile["code"]; src=DATA/f"lang_{code}.csv"
        langrows=rows(src) if src.exists() else []
        localized={}
        for r in langrows:
            key=(r.get("construct_id") or "").strip()
            if not key:
                old=(r.get("construct") or "").strip()
                key=english_to_id.get(old,"")
            if key: localized[key]=r
        for pl, target in targets.items():
            out=[]; missing=[]
            for cid, token in target.items():
                r=localized.get(cid)
                # Hindi's legacy profile is intentionally small; use its existing
                # Hindawi C table only for the standard-C constructs it explicitly maps.
                if not r and code == "hindi":
                    legacy=HINDAWI/"upstream/langs/hindi_c.tsv"
                    if legacy.exists():
                        lines=[line for line in legacy.read_text(encoding="utf-8-sig").splitlines() if line.strip() and not line.lstrip().startswith("#")]
                        for lr in csv.DictReader(lines, delimiter="\t"):
                            if lr.get("c") == token:
                                r={"native_keyword":lr.get("native"),"romenagri":lr.get("romenagri")}
                                break
                native=(r or {}).get("native_keyword", "").strip()
                roman=(r or {}).get("romenagri", "").strip()
                if not native or not roman:
                    missing.append(cid); continue
                out.append({"profile_code":code,"language_name":profile.get("language_name", ""),
                    "script":profile.get("script", ""),"construct_id":cid,"native_keyword":native,
                    "romenagri":roman,"programming_language_token":token,
                    "category":ontology[cid].get("category", ""),"source_file":src.name,
                    "status":"derived-keyword-data; compiler integration unverified"})
            def collisions(field):
                d=collections.defaultdict(list)
                for r in out: d[r[field]].append(r["construct_id"])
                return {k:v for k,v in d.items() if len(v)>1}
            nc=collisions("native_keyword"); rc=collisions("romenagri")
            status="candidate-keyword-table" if not missing and not nc and not rc else "needs-review"
            write_csv(args.output/pl/f"{code}.csv",FIELDS,out)
            summary.append({"profile_code":code,"language_name":profile.get("language_name",""),"script":profile.get("script",""),
                "programming_language":pl,"mapped_constructs":len(out),"target_constructs":len(target),"status":status,
                "missing_construct_ids":";".join(missing),
                "native_collisions":";".join(f'{k}:{"/".join(v)}' for k,v in nc.items()),
                "romenagri_collisions":";".join(f'{k}:{"/".join(v)}' for k,v in rc.items()),
                "compiler_integration":"not-tested; Chintamani adapters remain Hindi-specific"})
            matrix.append({"human_language_profile":code,"script":profile.get("script",""),
                "programming_language":("C" if pl=="c" else "C++"),"keyword_table_status":status,
                "compiler_integration_status":"not-verified","evidence":src.name if src.exists() else "missing language CSV"})
    # Other upstream Chintamani shailis are represented in the matrix but are not
    # falsely marked as ported: the vendored adapters translate Hindi, not all 68 profiles.
    existing={(r["human_language_profile"],r["programming_language"]) for r in matrix}
    other_pl=[("Python","Chintamani Soochee adapter is Hindi-specific"),
              ("BASIC","Chintamani Praatha adapter is Hindi-specific"),
              ("Assembly","HindiASM sample exists; adapter not generalized"),
              ("Java","HindiJAVA sample exists; adapter not generalized"),
              ("Lex","Chintamani Shabda adapter is Hindi-specific"),
              ("Yacc","Chintamani Wyaaka adapter is Hindi-specific")]
    for profile in registry:
        code=profile["code"]
        for plname,evidence in other_pl:
            matrix.append({"human_language_profile":code,"script":profile.get("script",""),
                "programming_language":plname,"keyword_table_status":"shared-ontology-available; language-specific table not generated",
                "compiler_integration_status":"not-implemented-and-not-tested","evidence":evidence})
    header=list(summary[0])
    write_csv(args.output/"port_coverage.csv",header,summary)
    write_csv(args.output/"language_x_programming_language.csv",list(matrix[0]),matrix)
    print(f"profiles={len(registry)} programming_languages=2 tables={len(registry)*2}")
    print(f"C candidate keyword tables={sum(x['status']=='candidate-keyword-table' for x in summary if x['programming_language']=='c')}/{len(registry)}")
    for x in summary:
        if x['status']!='candidate-keyword-table':
            print(f"REVIEW {x['profile_code']} {x['programming_language']}: {x['mapped_constructs']}/{x['target_constructs']} missing={x['missing_construct_ids']} native_collisions={x['native_collisions']} roman_collisions={x['romenagri_collisions']}")
if __name__=="__main__": main()
