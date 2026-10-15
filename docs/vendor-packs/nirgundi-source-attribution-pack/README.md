# Nirgundi Source & Attribution Pack

Prepared 2026-10-09 for Project Pushkalāvatī.

## What this package contains

This is a **source-acquisition and rights-attribution pack**, not a claim that all listed lexical datasets have already been downloaded. The execution environment could verify official source and license pages but could not retrieve the large source files into the working filesystem. Therefore, no third-party lexical corpus is falsely represented as bundled.

Included:
- source registry with verified/qualified license findings;
- attribution statements and source URLs;
- a downloader for the CDSL Monier-Williams source text;
- a checklist for sources whose redistribution terms are not yet cleared.

## Initial rights findings

1. **Nighaṇṭu: The Sanskrit Library's first XML edition (2010), edited/contributed by Peter M. Scharf.**
   Its source page states Copyright © 2010 The Sanskrit Library and permits use under **CC BY-NC-SA 3.0**, requiring attribution and ShareAlike for derivative work. NonCommercial applies. This is not a permissive commercial-use source. The original XML was not bundled because it could not be retrieved into this environment.
   Source: https://sanskritlibrary.org/catalogsText/niGaRwu.html
   License: https://creativecommons.org/licenses/by-nc-sa/3.0/

2. **Cologne Digital Sanskrit Dictionaries (CDSL), csl-orig.**
   The repository explicitly identifies its license as **CC BY-SA 4.0**. The canonical source text is stored under `v02/<dictionary-id>/<dictionary-id>.txt`; for Monier-Williams, `v02/mw/mw.txt`. ShareAlike obligations apply to adaptations and attribution is required.
   Repository: https://github.com/sanskrit-lexicon/csl-orig
   License: https://github.com/sanskrit-lexicon/csl-orig/blob/main/LICENSE
   Direct MW source: https://raw.githubusercontent.com/sanskrit-lexicon/csl-orig/main/v02/mw/mw.txt
   Citation: Cologne Digital Sanskrit Dictionaries (CDSL), csl-orig, Monier-Williams source text, accessed 2026-10-09.

3. **Amarakośa on SanskritDocuments.**
   The site offers text and scans, but the page reviewed did not establish a clear licence for every digitization/edition. The underlying classical work is ancient, but a modern transcription, scan, edition, commentary, or database can have separate rights. Treat as **licence unresolved for redistribution** until the specific asset's rights are confirmed.
   Catalogue: https://sanskritdocuments.org/amarakosha/

4. **Nirukta on GRETIL.**
   GRETIL is a platform for texts contributed by multiple people and institutions; do not assume one universal licence for every file. The specific Nirukta record and its contributor/source notes must be checked before redistribution. Use link/reference-only until item-level rights are verified.
   Platform: https://www.gretil.uni-goettingen.de/gretil.htm
   Nirukta text: https://www.gretil.uni-goettingen.de/gretil/corpustei/transformations/html/sa_yAska-nirukta.htm

5. **e-Nighantu (Ayurvedic lexicons), NIIMH/CCRAS.**
   The site states “All Rights Reserved.” It is a discovery/search source, not a redistributable dataset absent separate permission. Do not scrape and repackage its database without permission.
   Source: https://niimh.nic.in/ebooks/e-Nighantu/

## Nirgundi-specific method boundary

Source records are evidence, not yet the experimental lexeme inventory. Preserve the exact original forms and source identities. Do not normalize, lemmatize, derive inflections, reverse sandhi, or split compounds for the baseline. Once an inventory is lawfully acquired, sort forms by descending literal string length, assign IDs after sorting, perform sequential literal replacement, and retain the unmatched residual.

## Running the downloader

Requires Python 3.10+ and network access:

```bash
python scripts/download_csl_mw.py
```

The script downloads the official CDSL Monier-Williams source text and the repository's licence file, saves them under `sources/cdsl/`, and writes SHA-256 checksums. It does not download or redistribute Nighaṇṭu, Amarakośa, GRETIL, or e-Nighantu data without source-specific rights review.

## Important

This pack is not legal advice. Its purpose is to avoid misrepresenting availability or licensing. Verify source-level terms again before publication or redistribution.
