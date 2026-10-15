# Multilingual port status — evidence boundary

This report is deliberately conservative. It records what can be asserted before the full canonical checkout is available locally.

| Family / requested profile | Canonical source expected | Current evidence state | Release status |
|---|---|---|---|
| Hindi / Devanagari | Chintamani `hincc`, Guru translators, Romenagri Hindi profile | Existing upstream baseline; not rebuilt in this environment | Re-test baseline |
| Sanskrit / Devanagari | Romenagri Sanskrit profile + separate Hindawi vocabulary directory | Local keyword prototype only; not integrated into Guru | Prototype |
| Urdu / Perso-Arabic | `lang_urdu.csv`, original `fltr_hi_ur` and `fltr_ur_hi` | Canonical filters known from source documentation; no real local checkout for differential tests | Blocked on checkout/test |
| Persian/Farsi | `lang_persian.csv` + reviewed language-specific script rules | Vocabulary exists upstream; base Urdu filter alone is insufficient evidence | Overlay and conformance required |
| Arabic | `lang_arabic.csv` + Arabic script rules | Vocabulary exists upstream; Arabic is not interchangeable with Urdu | Projection/filter conformance required |
| Punjabi (Shahmukhi) | `lang_punjabi_shahmukhi.csv` | Vocabulary exists upstream; must remain distinct from Gurmukhi Punjabi | Projection/filter conformance required |
| Sindhi (Perso-Arabic) | `lang_sindhi.csv` | Vocabulary exists upstream; separate from `lang_sindhi_dev.csv` | Projection/filter conformance required |
| Kashmiri (Perso-Arabic) | `lang_kashmiri.csv` | Vocabulary exists upstream; separate from `lang_kashmiri_dev.csv` | Projection/filter conformance required |
| Tibetan | `lang_tibetan.csv`, `tibetan_to_deva.tsv` | Upstream keyword entries explicitly contain `romenagri_pending_tibetan`; table requires row-count audit | Not complete |
| Sinhala | `lang_sinhala.csv`, `sinhala_to_deva.tsv` | Upstream keyword entries explicitly contain `romenagri_pending_sinhala`; table requires row-count audit | Not complete |
| Other language profiles | `language_registry.csv`, `lang_*.csv`, `tables/*_to_deva.tsv` | Canonical Romenagri repo declares 68 profiles; actual completeness varies by profile | Per-profile audit required |
| Hebrew filter | Local `hi_he_map.csv` and `fltr_hi_he.py` | Provisional mapping only; unmapped code points are retained and reported | Awaiting manual audit |

## Required release gate

Run `scripts/hindawi_language_port_audit.py` against the real Romenagri and Chintamani checkouts. Then, for every profile marked as a candidate, run source → script hub → Romenagri → compiler translation, reverse conversion where supported, native compilation, runtime tests and original-symbol debugger tests. Preserve all originals and logs. Do not describe a profile as complete until all applicable tests pass.
