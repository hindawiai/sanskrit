#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
python3 scripts/build_docs_catalog.py
test -f docs/documentation-catalog.html
test -f docs/index.html
test -f docs/app.js
test -f docs/site.css
test -f docs/pipeline.html
test -f docs/validation.html
test -f docs/tasks.html
test -f docs/tests.html
test -f docs/sutram-compiler.html
test -f docs/sutram-compiler.js
test -f docs/compiler-page.js
test -f docs/sanchalan-suktam.html
test -f docs/sanchalan-browser.js
test -f docs/sanchalan-lexicon.json
test -f docs/sanchalan-source.suktam
test -f docs/reference.html
test -f docs/reference/HANDOFF.md
test -f docs/reference/SUTRAM-SPEC.md
test -f docs/reference/PUSHKALAVATI-COMPILER.md
test -f docs/reference/RULE-CLASSIFICATION.md
test -f docs/reference/SANCHALAN-SUKTAM.md
test -f docs/reference/SANCHALAN-GRAMMAR.json
test -f docs/reference/repository/HANDOFF.md
test -f docs/reference/repository/lang/SPEC.md
test -f docs/reference/repository/lang/suktam/README.md
test -f docs/reference/repository/tools/pushkalavati-compiler/README.md
test -f docs/sanchalan-grammar.json
test -f docs/specifications/sanchalan.html
test -f .github/workflows/pages.yml
test -x scripts/build_romenagri.sh
test -x scripts/vendor_romenagri.sh
test -x scripts/romenagri_perso_arabic_filter.sh
grep -q 'path: docs' .github/workflows/pages.yml
# Check all local relative href/src targets in authored HTML (ignore anchors, URLs and mailto).
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path
class P(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.path=path; self.refs=[]
    def handle_starttag(self, tag, attrs):
        for k,v in attrs:
            if k in ("href","src") and v and not v.startswith(("#","http://","https://","mailto:","data:","javascript:")):
                self.refs.append(v.split("#",1)[0])
root=Path("docs")
missing=[]
for path in root.rglob("*.html"):
    p=P(path); p.feed(path.read_text(encoding="utf-8"))
    for ref in p.refs:
        if not ref: continue
        target=(path.parent/ref).resolve()
        if not target.exists(): missing.append(f"{path}: {ref}")
if missing:
    raise SystemExit("Broken local docs links:\n"+"\n".join(missing))
print(f"Static page links passed: {len(list(root.rglob('*.html')))} HTML files")
PY
node --check docs/app.js
node --check docs/sutram-compiler.js
node --check docs/compiler-page.js
node --check docs/sanchalan-browser.js
python3 tests/test_pages_http.py
node tests/test_browser_labs.js
node <<'JS'
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const ids=["sutram","run-sutram","load-sample","sutram-output","sound-input","audit-sounds","sound-output","rule-choice","left","right","run-rule","rule-output"];
const elements={};
for(const id of ids) elements[id]={value: id==="sutram" ? `adhyaya ganana:\npada mula:\nadhikara ganana():\n  karta: 5\n  yoga 7\n  likh\n  yoga 1\n  phala\niti\niti\niti` : id==="sound-input"?"upendra":id==="rule-choice"?"6.1.87":id==="left"?"upa":id==="right"?"indra":"",textContent:"",handlers:{},addEventListener(event,fn){this.handlers[event]=fn;}};
const context={document:{getElementById:id=>elements[id]},console,Intl,Set,Map,Object,JSON,Error};
vm.runInNewContext(fs.readFileSync("docs/app.js","utf8"),context);
elements["run-sutram"].handlers.click();
const sutram=JSON.parse(elements["sutram-output"].textContent);
assert.equal(sutram.result,13);assert.deepEqual(Array.from(sutram.output),["12"]);
elements["audit-sounds"].handlers.click();
const audit=JSON.parse(elements["sound-output"].textContent);
assert.equal(audit.status,"APPLIED");assert.deepEqual(Array.from(audit.tokens),["u","p","e","n","d","r","a"]);
elements["run-rule"].handlers.click();
const rule=JSON.parse(elements["rule-output"].textContent);
assert.equal(rule.status,"APPLIED");assert.equal(rule.output,"upendra");
elements["sound-input"].value="ṝ";elements["audit-sounds"].handlers.click();
const unsupported=JSON.parse(elements["sound-output"].textContent);
assert.equal(unsupported.status,"PARTIAL");
console.log("Browser app smoke tests passed: Sūtram, sound audit, rule execution, unsupported mapping");
JS
echo "Static pages validation passed"
