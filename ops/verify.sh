#!/usr/bin/env bash
# © 1993–2026 Abhishek Choudhary. All rights reserved. AyeAI.
# hindawiai/sanskrit: the seed gate. It vouches that the builds are preserved and the build's own
# tests pass; the builds' content is theirs and is not judged here. Exit 0 when nothing fails.
set -uo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
PASS=0; FAIL=0; UNJ=0
# scratch for the tests and their Python packages, never committed: excluded locally inside a clone
mkdir -p .verify
if git rev-parse --git-dir >/dev/null 2>&1; then
  ex="$(git rev-parse --git-dir)/info/exclude"; mkdir -p "$(dirname "$ex")"
  grep -qx '/.verify/' "$ex" 2>/dev/null || echo '/.verify/' >> "$ex"
fi
chk() { local id="$1" desc="$2" out rc; shift 2; out="$("$@" 2>&1)"; rc=$?
  if [ "$rc" -eq 0 ]; then printf '  PASS     %s  %s\n' "$id" "$desc"; PASS=$((PASS + 1))
  elif [ "$rc" -eq 3 ]; then printf '  UNJUDGED %s  %s: %s\n' "$id" "$desc" "$(printf '%s' "$out" | tail -1)"; UNJ=$((UNJ + 1))
  else printf '  FAIL     %s  %s\n' "$id" "$desc"; printf '%s\n' "$out" | tail -8 | sed 's/^/           /'; FAIL=$((FAIL + 1)); fi; }
files() { if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then git ls-files -z --cached --others --exclude-standard
          else find . -type f -not -path './.verify/*' -not -path './.git/*' -print0 | sed -z 's#^\./##'; fi; }
s01() { (cd releases/originals && sha256sum -c --quiet SHA256SUMS); }
s02() { local miss=""; while IFS= read -r f; do [ -e "$f" ] || miss="$miss $f"; done < ops/restore-dropped.txt
        [ -z "$miss" ] || { echo "missing:$miss"; return 1; }; }
s03() { for t in node gcc python3; do command -v "$t" >/dev/null || { echo "$t is not installed"; return 3; }; done
        # The build's scripts call npm only to run its package.json scripts; it has no dependencies to install.
        # Where npm is absent, the gate puts a stand-in on the PATH that runs those scripts the way npm does.
        local npmpath=""
        if ! command -v npm >/dev/null; then
          mkdir -p .verify/bin
          cat > .verify/bin/npm <<'NPM'
#!/usr/bin/env bash
# The gate's stand-in for npm's script runner: npm [--prefix DIR] run NAME, or npm [--prefix DIR] test.
set -euo pipefail
dir=.
while [ $# -gt 0 ]; do case "$1" in --prefix) dir="$2"; shift 2 ;; *) break ;; esac; done
case "${1:-}" in run) name="${2:?npm run needs a script name}" ;; test) name=test ;;
  *) echo "npm stand-in: only 'run NAME' and 'test' are supported" >&2; exit 1 ;; esac
cmd="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["scripts"][sys.argv[2]])' "$dir/package.json" "$name")" \
  || { echo "npm stand-in: no script $name in $dir/package.json" >&2; exit 1; }
printf '\n> %s\n> %s\n\n' "$name" "$cmd"
cd "$dir" && exec sh -c "$cmd"
NPM
          chmod +x .verify/bin/npm; npmpath="$ROOT/.verify/bin:"
        fi
        if [ ! -x .verify/venv/bin/python ]; then
          { python3 -m venv .verify/venv && PIP_NO_CACHE_DIR=1 TMPDIR="$ROOT/.verify" .verify/venv/bin/pip install -q regex tqdm typer toml roman; } >/dev/null 2>&1 \
            || { echo "could not install the tests' Python packages into .verify/venv"; return 3; }
        fi
        rm -rf .verify/tree && mkdir -p .verify/tree
        files | (cd "$ROOT" && tar --null -T - -cf -) | tar -C .verify/tree -xf -
        (cd .verify/tree && PATH="$npmpath$ROOT/.verify/venv/bin:$PATH" TMPDIR="$ROOT/.verify" bash scripts/test_all.sh > "$ROOT/.verify/test_all.log" 2>&1)
        local rc=$?; rm -rf .verify/tree
        tail -1 .verify/test_all.log
        [ -z "$npmpath" ] || echo "npm is not installed here; the gate ran the build's package.json scripts itself"
        [ "$rc" -eq 0 ] || { echo "the full output is in .verify/test_all.log"; return 1; }; }
s04() { local hit; hit=$(files | grep -zv '^releases/originals/' | xargs -0 grep -lIE 'ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|ZENODO_TOKEN=[A-Za-z0-9]{20,}' 2>/dev/null | grep -v '^ops/verify.sh$')
        [ -z "$hit" ] || { echo "a secret pattern in: $hit"; return 1; }; }
s05() { local big; big=$(files | xargs -0 -I{} find {} -maxdepth 0 -type f -size +95M 2>/dev/null); [ -z "$big" ] || { echo "$big"; return 1; }; }
s06() { python3 - <<'PY'
import json, re, sys
m = json.load(open("misty.json"))["version"]
c = re.search(r"^version:\s*(\S+)", open("CITATION.cff").read(), re.M).group(1)
sys.exit(0 if m == c else print(f"misty.json {m}, CITATION.cff {c}") or 1)
PY
}
echo "hindawiai/sanskrit: seed verification"
chk S01 "every original archive matches its pin"                         s01
chk S02 "the files later builds dropped are restored"                    s02
chk S03 "the build's own test suite passes on a scratch copy"            s03
chk S04 "no secret is committed"                                         s04
chk S05 "no file over 95 MB"                                             s05
chk S06 "misty.json and CITATION.cff agree on the version"               s06
echo "  $PASS passed, $FAIL failed, $UNJ unjudged"
[ "$FAIL" -eq 0 ]
