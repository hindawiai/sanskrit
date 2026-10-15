# Sources directory

No third-party lexical corpus is bundled in this initial pack. Run:

```bash
python scripts/download_csl_mw.py
```

to download the CDSL Monier-Williams source text and its repository licence into `sources/cdsl/`.

The Nighaṇṭu XML edition is documented in `metadata/source_registry.json`, but is not bundled here: its stated CC BY-NC-SA 3.0 terms must be preserved, and this environment could not retrieve the source file. Amarakośa and GRETIL/Nirukta assets are link-only until the exact item licence is established. e-Nighantu carries an All Rights Reserved notice.
