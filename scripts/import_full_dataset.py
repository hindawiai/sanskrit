"""
Transform the complete ashtadhyayi-com/data sutraani/data.txt export into this
project's rule schema. Run once against the uploaded file; output replaces
data/sutras_1.1-1.3.json with the full corpus (renamed to data/sutras.json).

Source field reference (as shipped by ashtadhyayi-com/data):
  i   sutra_krama (adhyaya+pada+3-digit sutra number, e.g. "11001")
  a/p/n  adhyaya / pada / sutra-within-pada
  s   sutra text, Devanagari
  skn Siddhanta Kaumudi number
  pc  padaccheda: "word$KIND$case$number$##word2$KIND$case2$number2$..."
  type  rule classification: "S$term$" samjna | "P$name$" paribhasha |
        "AT$name$" atidesha | "V$...$"/"T$...$" vidhi -- "##"-joined if >1
  an  anuvrtti: "term$sutra_krama##term2$sutra_krama2..."
  ss  fully-assembled paraphrase sentence
"""

import json
import re
import sys

DEV_DIGITS = str.maketrans("0123456789", "०१२३४५६७८९")


def to_dev(s: str) -> str:
    return s.translate(DEV_DIGITS)


TYPE_MAP = {"S": "samjna", "P": "paribhasha", "AT": "atidesha", "V": "vidhi", "T": "vidhi"}


def parse_type(type_str: str):
    if not type_str:
        return None, None
    first = type_str.split("##")[0]
    m = re.match(r"^([A-Z]+)\$(.*)\$$", first)
    if not m:
        return None, None
    code, label = m.group(1), m.group(2)
    our_type = TYPE_MAP.get(code)
    term = None
    if our_type == "samjna" and label:
        term = label[:-len("संज्ञा")] if label.endswith("संज्ञा") else label
    return our_type, term


def parse_padaccheda(pc_str: str):
    if not pc_str:
        return None
    pieces = []
    for part in pc_str.split("##"):
        fields = part.split("$")
        if len(fields) >= 4 and (fields[2] or fields[3]):
            case_d = to_dev(fields[2]) if fields[2] else ""
            num_d = to_dev(fields[3]) if fields[3] else ""
            pieces.append(f"{fields[0]} {case_d}/{num_d}" if case_d and num_d else fields[0])
        else:
            pieces.append(fields[0])
    return " ".join(p for p in pieces if p)


def krama_to_id(krama: str) -> str:
    krama = krama.zfill(5)
    return f"{int(krama[0])}.{int(krama[1])}.{int(krama[2:])}"


def parse_anuvrtti(an_str: str):
    if not an_str:
        return []
    out = []
    for part in an_str.split("##"):
        if "$" not in part:
            continue
        term, krama = part.rsplit("$", 1)
        if term and krama.isdigit():
            out.append({"term": term, "from": krama_to_id(krama)})
    return out


def main(src_path: str, out_path: str):
    raw = json.load(open(src_path, encoding="utf-8"))
    entries = raw["data"]
    out = []
    errors = []
    for e in entries:
        try:
            rule_type, term = parse_type(e.get("type", ""))
            out.append({
                "id": f"{e['a']}.{e['p']}.{e['n']}",
                "sutra_krama": int(e["i"]),
                "kaumudi_krama": int(e["skn"]) if e.get("skn") else None,
                "type": rule_type,
                "term": term,
                "sutra": e["s"],
                "padaccheda": parse_padaccheda(e.get("pc", "")),
                "anuvrtti": parse_anuvrtti(e.get("an", "")),
                "gloss": e.get("ss", "").strip() or None,
            })
        except Exception as ex:
            errors.append((e.get("i"), str(ex)))

    out.sort(key=lambda r: r["sutra_krama"])
    json.dump(out, open(out_path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)

    print(f"Parsed {len(out)} / {len(entries)} entries -> {out_path}")
    print(f"Errors: {len(errors)}")
    for i, msg in errors[:10]:
        print(f"  {i}: {msg}")
    types = {}
    for r in out:
        types[r["type"]] = types.get(r["type"], 0) + 1
    print("Type distribution:", types)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
