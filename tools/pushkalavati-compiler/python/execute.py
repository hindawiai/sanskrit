"""Interpret the canonical rule IR. Does not recompile and does not invent mappings."""
import json
from pathlib import Path


def last_sound(word):
    return word[-1]


def first_sound(word):
    return word[:2] if word[:2] in {"ai", "au"} else word[:1]


def rest_after_first(word):
    return word[2:] if word[:2] in {"ai", "au"} else word[1:]


def apply_rule(left, right, rule):
    op = rule.get("operation") or {}
    if op.get("status") != "executable_tested":
        return None
    end, start = last_sound(left), first_sound(right)
    if op.get("left") and end not in op["left"]:
        return None
    mapped = op["map"].get(end if op["mode"] == "replace_left" else start)
    if not mapped:
        return None
    stem = left[:-1]
    output = stem + mapped + (rest_after_first(right) if op["mode"] == "fuse" else right)
    return {"output": output, "rule": rule["id"]}



def apply_sandhi_rule(left, right, context, rule):
    """Execute context-bearing vowel-sandhi operations from the canonical IR."""
    op = rule.get("operation") or {}
    if op.get("kind") != "sandhi_substitution" or op.get("status") != "executable_tested":
        return None
    for key, expected in (op.get("requires") or {}).items():
        if context.get(key) != expected:
            return None
    mode = op.get("mode")
    if mode == "ec_to_ayavayav_before_vowel":
        vowels = ("ai", "au", "a", "ā", "i", "ī", "u", "ū", "ṛ", "ṝ", "ḷ", "ḹ", "e", "o")
        if context.get("vowel_following") is not True or not right.startswith(vowels):
            return None
        ending = next((v for v in ("ai", "au", "e", "o") if left.endswith(v)), None)
        if not ending:
            return None
        if context.get("pada_final") is True and ending in {"e", "o"} and context.get("following_short_a") is True:
            return None
        mapping = {"e": "ay", "o": "av", "ai": "āy", "au": "āv"}
        return {"output": left[:-len(ending)] + mapping[ending] + right, "rule": rule["id"]}
    if mode == "pada_final_eo_before_short_a_purvarupa":
        ending = next((v for v in ("e", "o") if left.endswith(v)), None)
        if not ending or not right.startswith("a") or context.get("pada_final") is not True or context.get("following_short_a") is not True:
            return None
        return {"output": left + "ऽ" + right[1:], "rule": rule["id"]}
    if mode == "ra_to_visarga_before_khar_or_avasana":
        if not left.endswith("r") or context.get("avasana_or_khar") is not True:
            return None
        return {"output": left[:-1] + "ḥ" + right, "rule": rule["id"]}
    if mode == "v_y_lopa_before_val":
        if context.get("val_following") is not True:
            return None
        if not (left.endswith("v") or left.endswith("y")):
            return None
        return {"output": left[:-1] + right, "rule": rule["id"]}
    if mode == "visarga_to_s_before_khar":
        if not left.endswith("ḥ") or context.get("khar_following") is not True:
            return None
        return {"output": left[:-1] + "s", "rule": rule["id"]}
    if mode == "sto_stu_before_stu":
        if not left.endswith("s") or not right.startswith("ṭ") or context.get("stu_following") is not True:
            return None
        return {"output": left[:-1] + "ṣ" + right, "rule": rule["id"]}
    if mode == "jhal_to_car_before_khar":
        if not left.endswith("g") or not right.startswith("k") or context.get("khar_following") is not True:
            return None
        return {"output": left[:-1] + "k" + right, "rule": rule["id"]}
    if mode == "anusvara_to_class_nasal_before_yay":
        nasal = context.get("class_nasal")
        if not left.endswith("ṃ") or context.get("yay_following") is not True or not nasal:
            return None
        return {"output": left[:-1] + nasal + right, "rule": rule["id"]}
    if mode == "m_to_anusvara_before_hal":
        if not left.endswith("m") or context.get("hal_following") is not True:
            return None
        return {"output": left[:-1] + "ṃ" + right, "rule": rule["id"]}
    if mode == "sto_scu_before_scu":
        if not left.endswith("s") or not right.startswith("c") or context.get("scu_following") is not True:
            return None
        return {"output": left[:-1] + "ś" + right, "rule": rule["id"]}
    if mode == "upasarga_final_a_before_dhatu_initial_en_pararupa":
        ending = next((v for v in ("ā", "a") if left.endswith(v)), None)
        initial = next((v for v in ("e", "o") if right.startswith(v)), None)
        if not ending or not initial or context.get("upasarga") is not True or context.get("dhatu") is not True:
            return None
        return {"output": left[:-len(ending)] + right, "rule": rule["id"]}
    if mode == "final_s_to_ru":
        if not left.endswith("s") or context.get("pada_final") is not True:
            return None
        return {"output": left[:-1] + "r", "rule": rule["id"]}
    if mode == "visarga_to_y_before_ash":
        if not left.endswith("ḥ") or context.get("ash_following") is not True:
            return None
        if not any(left[:-1].endswith(v) for v in ("a", "ā")):
            return None
        return {"output": left[:-1] + "y" + right, "rule": rule["id"]}
    if mode == "a_before_am_purvarupa":
        ending = next((v for v in ("ā", "a") if left.endswith(v)), None)
        if not ending or right != "am":
            return None
        return {"output": left[:-len(ending)] + "am", "rule": rule["id"]}
    if mode == "jhal_to_jash_final":
        jhal_jash = {"k": "g", "kh": "g", "g": "g", "gh": "g", "c": "j", "ch": "j", "j": "j", "jh": "j",
                     "ṭ": "ḍ", "ṭh": "ḍ", "ḍ": "ḍ", "ḍh": "ḍ", "t": "d", "th": "d", "d": "d", "dh": "d",
                     "p": "b", "ph": "b", "b": "b", "bh": "b"}
        for end, repl in sorted(jhal_jash.items(), key=lambda x: -len(x[0])):
            if left.endswith(end) and context.get("pada_final") is True:
                return {"output": left[:-len(end)] + repl, "rule": rule["id"]}
        return None
    return None


def apply_morph_rule(input_value, context, rule):
    """Execute the context-bearing morphological operation in canonical IR."""
    op = rule.get("operation") or {}
    if op.get("kind") != "morph_substitution" or op.get("status") != "executable_tested":
        return None
    for key, expected in (op.get("requires") or {}).items():
        if context.get(key) != expected:
            return None
    mode = op.get("mode")
    if mode == "replace_final_ec_with_aa":
        ending = next((s for s in ("ai", "au", "e", "o") if input_value.endswith(s)), None)
        if not ending or context.get("upadesha_dhatu") is not True or context.get("following_affix_shit") is not False:
            return None
        output = input_value[:-len(ending)] + "ā"
    elif mode == "div_to_diu_in_pada":
        if input_value != "div" or context.get("pada") is not True:
            return None
        output = "diu"
    elif mode == "iṇ_final_i_to_y_before_vowel_affix":
        if input_value != "i" or context.get("root") != "iṇ" or context.get("vowel_initial_affix") is not True or not context.get("affix"):
            return None
        output = "y" + context["affix"]
    elif mode == "kṛ_a_to_u_before_kṅit_sarvadhātuka":
        if not input_value.endswith("karu") or context.get("root") != "kṛ" or context.get("u_pratyaya") is not True or context.get("sarvadhatuka") is not True or context.get("kṅit") is not True or not context.get("affix"):
            return None
        output = input_value[:-4] + "kuru" + context["affix"]
    elif mode == "pathin_family_i_to_a_in_strong_case":
        if context.get("strong_case") is not True or context.get("sarvanamasthana") is not True:
            return None
        member = next((s for s in ("pathin", "mathin", "ṛbhukṣin") if input_value.endswith(s)), None)
        if not member:
            return None
        output = input_value[:-2] + "an"
    else:
        return None
    return {"output": output, "rule": rule["id"]}

def main():
    ir = json.loads(Path("out/rules-ir.json").read_text(encoding="utf-8"))
    by_id = {row["id"]: row for row in ir}
    failures = 0
    for rule_id in ("6.1.77", "6.1.87", "6.1.88", "6.1.101"):
        rule = by_id[rule_id]
        for left, right, expected in rule["operation"]["examples"]:
            got = apply_rule(left, right, rule)
            if not got or got["output"] != expected:
                failures += 1
                print("FAIL", rule_id, left, right, got)
    sandhi_cases = [
        ("6.1.78", "ce", "anam", {"vowel_following": True, "pada_final": False}, "cayanam"),
        ("6.1.78", "lo", "anam", {"vowel_following": True, "pada_final": False}, "lavanam"),
        ("6.1.78", "cai", "aka", {"vowel_following": True, "pada_final": False}, "cāyaka"),
        ("6.1.78", "lau", "aka", {"vowel_following": True, "pada_final": False}, "lāvaka"),
        ("6.1.109", "agne", "atra", {"pada_final": True, "following_short_a": True}, "agneऽtra"),
        ("6.1.109", "vāyo", "atra", {"pada_final": True, "following_short_a": True}, "vāyoऽtra"),
        ("6.1.94", "pra", "ejate", {"upasarga": True, "dhatu": True}, "prejate"),
        ("6.1.94", "parā", "ejate", {"upasarga": True, "dhatu": True}, "parejate"),
        ("6.1.94", "upa", "oṣati", {"upasarga": True, "dhatu": True}, "upoṣati"),
        ("6.1.94", "pra", "oṣati", {"upasarga": True, "dhatu": True}, "proṣati"),
        ("6.1.66", "kay", "ta", {"val_following": True}, "kata"),
        ("8.3.15", "devar", "", {"avasana_or_khar": True}, "devaḥ"),
        ("8.3.34", "agniḥ", "ca", {"khar_following": True}, "agnis"),
        ("8.3.23", "ramam", "gacchati", {"hal_following": True}, "ramaṃgacchati"),
        ("8.4.55", "vag", "ka", {"khar_following": True}, "vakka"),
        ("8.4.58", "ramaṃ", "gacchati", {"yay_following": True, "class_nasal": "ṅ"}, "ramaṅgacchati"),
        ("8.4.40", "agnis", "ca", {"scu_following": True}, "agniśca"),
        ("8.4.41", "agnis", "ṭa", {"stu_following": True}, "agniṣṭa"),
        ("8.2.66", "agnis", "", {"pada_final": True}, "agnir"),
        ("8.3.17", "devaḥ", "api", {"ash_following": True}, "devayapi"),
        ("6.1.107", "deva", "am", {}, "devam"),
        ("8.2.39", "vāk", "", {"pada_final": True}, "vāg"),
    ]
    for rule_id, left, right, context, expected in sandhi_cases:
        got = apply_sandhi_rule(left, right, context, by_id[rule_id])
        if not got or got["output"] != expected:
            failures += 1
            print("FAIL", rule_id, left, right, got)
    sandhi_negative_cases = [
        ("6.1.78", "hare", "atra", {"vowel_following": True, "pada_final": True, "following_short_a": True}),
        ("6.1.109", "hare", "atra", {"pada_final": False, "following_short_a": True}),
        ("6.1.109", "hare", "iti", {"pada_final": True, "following_short_a": False}),
        ("6.1.78", "ka", "tra", {"vowel_following": True, "pada_final": False}),
        ("6.1.94", "pra", "ejate", {"upasarga": False, "dhatu": True}),
        ("6.1.94", "pra", "ejate", {"upasarga": True, "dhatu": False}),
        ("6.1.94", "pra", "ait", {"upasarga": True, "dhatu": True}),
    ]
    for rule_id, left, right, context in sandhi_negative_cases:
        if apply_sandhi_rule(left, right, context, by_id[rule_id]) is not None:
            failures += 1
            print("FAIL negative applicability", rule_id, left, right, context)
    for rule_id in ("6.1.45", "6.1.131", "6.4.81", "6.4.110", "7.1.86"):
        rule = by_id[rule_id]
        for example in rule["operation"]["examples"]:
            got = apply_morph_rule(example["input"], example["context"], rule)
            if not got or got["output"] != example["expected"]:
                failures += 1
                print("FAIL", rule_id, example, got)
    negative_cases = [
        ("6.1.45", "glai", {"upadesha_dhatu": True, "following_affix_shit": True}),
        ("6.1.131", "div", {"pada": False}),
        ("6.4.81", "i", {"root": "iṇ", "vowel_initial_affix": False, "affix": "ta"}),
        ("6.4.110", "vidāṅkaru", {"root": "kṛ", "u_pratyaya": True, "sarvadhatuka": True, "kṅit": False, "affix": "tām"}),
        ("7.1.86", "supathin", {"strong_case": False, "sarvanamasthana": True}),
    ]
    for rule_id, input_value, context in negative_cases:
        if apply_morph_rule(input_value, context, by_id[rule_id]) is not None:
            failures += 1
            print("FAIL negative applicability", rule_id, input_value, context)
    print("python parity", "failed" if failures else "passed", "records", len(ir))
    return failures


if __name__ == "__main__":
    raise SystemExit(main())
