#!/usr/bin/env python3
"""Corpus-observed-form bootstrap for Pushkalavati/Nirgundi.

This is a literal cross-representation experiment, not a Sanskrit parser.
It extracts whitespace/punctuation-delimited observed forms from term,
padaccheda, gloss, and anuvrtti[].term, then scans each sutra field using
longest-first, deterministic literal replacement. No transliteration,
morphology, sandhi reversal, fuzzy matching, or compound analysis occurs.
"""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_DATA = ROOT / "data" / "sutras.json"
DEFAULT_OUT = ROOT / "experiments" / "nirgundi" / "observed-form-bootstrap"
SPLIT_RE = re.compile(r"[\s।॥,;]+")


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def extract_forms(records: list[dict]) -> list[str]:
    forms: set[str] = set()
    for row in records:
        values = [row.get("term", ""), row.get("padaccheda", ""), row.get("gloss", "")]
        values.extend(x.get("term", "") for x in row.get("anuvrtti", []) if isinstance(x, dict))
        for value in values:
            if not isinstance(value, str):
                continue
            for token in SPLIT_RE.split(value.strip()):
                token = token.strip()
                if token:
                    forms.add(token)
    # Longest-first; Unicode code-point length; lexical tie-break is stable.
    return sorted(forms, key=lambda s: (-len(s), s))


def run(data_path: Path, out_dir: Path) -> dict:
    raw = data_path.read_bytes()
    records = json.loads(raw.decode("utf-8"))
    if not isinstance(records, list):
        raise ValueError("sutra data must be a JSON array")
    if any(not isinstance(row, dict) or not row.get("id") or not isinstance(row.get("sutra"), str) for row in records):
        raise ValueError("each source record must contain id and sutra text")
    forms = extract_forms(records)
    id_for = {form: i for i, form in enumerate(forms, 1)}
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "observed-form-inventory.jsonl").write_text("".join(
        json.dumps({"integer_id": id_for[f], "form": f, "code_points": len(f)}, ensure_ascii=False) + "\n" for f in forms), encoding="utf-8")
    (out_dir / "stable-id-map.json").write_text(json.dumps({f: id_for[f] for f in forms}, ensure_ascii=False, indent=2, sort_keys=False) + "\n", encoding="utf-8")

    per_sutra = []
    all_occurrences = 0
    matched_records = 0
    residual_freq: dict[str, int] = {}
    corpus_chars = 0
    covered_chars = 0
    for row in records:
        original = row["sutra"]
        corpus_chars += len(original)
        working = original
        substitutions = []
        # Repeated literal substitution in deterministic longest-first order.
        for form in forms:
            n = working.count(form)
            if not n:
                continue
            marker = f"⟦{id_for[form]:06d}⟧"
            working = working.replace(form, marker)
            substitutions.append({"integer_id": id_for[form], "form": form, "occurrences": n})
            all_occurrences += n
            covered_chars += n * len(form)
        if substitutions:
            matched_records += 1
        # Remove markers and collect residual runs; this is a diagnostic only.
        residual = re.sub(r"⟦\d{6}⟧", "", working)
        for tok in SPLIT_RE.split(residual):
            tok = tok.strip()
            if tok:
                residual_freq[tok] = residual_freq.get(tok, 0) + 1
        per_sutra.append({"id": row["id"], "sutra": original, "substitutions": substitutions, "substitution_occurrences": sum(x["occurrences"] for x in substitutions), "transformed": working, "residual": residual})
    (out_dir / "per-sutra-substitutions.jsonl").write_text("".join(json.dumps(x, ensure_ascii=False) + "\n" for x in per_sutra), encoding="utf-8")
    (out_dir / "residual-frequency.json").write_text(json.dumps(dict(sorted(residual_freq.items(), key=lambda kv: (-kv[1], kv[0]))), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "residual-tokens.txt").write_text("\n".join(sorted(residual_freq)) + ("\n" if residual_freq else ""), encoding="utf-8")
    metrics = {
        "experiment": "Nirgundi observed-form bootstrap",
        "method_version": "observed-form-literal-substitution/1",
        "source_records": len(records),
        "distinct_observed_forms": len(forms),
        "records_with_at_least_one_literal_match": matched_records,
        "records_without_literal_match": len(records) - matched_records,
        "substitution_occurrences": all_occurrences,
        "distinct_residual_tokens": len(residual_freq),
        "residual_token_occurrences": sum(residual_freq.values()),
        "sutra_code_points": corpus_chars,
        "covered_code_points_estimate": min(covered_chars, corpus_chars),
        "character_coverage_estimate_percent": round(100 * min(covered_chars, corpus_chars) / corpus_chars, 2) if corpus_chars else 0,
        "coverage_note": "Sum of literal matched-form lengths over the original sutra text; overlapping matches and sequential replacement mean this is an estimate, not linguistic coverage.",
        "tokenization": "Split term, padaccheda, gloss, and anuvrtti[].term on whitespace, danda, double danda, comma, and semicolon; no transliteration or Unicode normalization.",
        "replacement": "Exact literal string replacement in sutra field, forms ordered by descending code-point length then lexical order; already replaced text is protected by integer markers.",
        "source_sha256": sha256_bytes(raw),
        "source_file": str(data_path.relative_to(ROOT)) if data_path.is_relative_to(ROOT) else data_path.name,
    }
    (out_dir / "metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (out_dir / "REPRODUCIBILITY.md").write_text(
        "# Observed-form bootstrap — reproducibility report\n\n"
        "This experiment cross-matches forms observed in the corpus annotations against each sūtra's compact `sutra` field. It is not a grammatical interpretation.\n\n"
        "## Results\n\n" + "\n".join(f"- **{k.replace('_', ' ')}:** {v}" for k, v in metrics.items() if k not in {"experiment", "method_version", "coverage_note", "tokenization", "replacement", "source_sha256", "source_file"}) +
        "\n\n## Method contract\n\n" + metrics["tokenization"] + "\n\n" + metrics["replacement"] +
        "\n\n## Interpretation boundary\n\nA literal match means only that an observed annotation token occurs in the sūtra text. It does not establish that the token is a grammatical operand, that the sūtra is understood, or that a rule is executable. Residuals are preserved without morphology, sandhi, fuzzy matching, or automatic correction.\n\n"
        f"Source SHA-256: `{metrics['source_sha256']}`\n", encoding="utf-8")
    return metrics


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--data", type=Path, default=DEFAULT_DATA)
    p.add_argument("--out", type=Path, default=DEFAULT_OUT)
    a = p.parse_args()
    print(json.dumps(run(a.data, a.out), ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
