"""
Build tools/review-tool.html from data/sutras.json + data/cross_source_diffs.json.
Covers all 3,983 rules (searchable/filterable), not just the 53 flagged
diffs -- those are still marked, but browsing/flagging works on everything.
Run from the project root: python3 scripts/build_review_tool.py
"""
import json

sutras = json.load(open("data/sutras.json", encoding="utf-8"))
diffs = json.load(open("data/cross_source_diffs.json", encoding="utf-8"))
diffs_by_id = {}
for d in diffs:
    diffs_by_id.setdefault(d["id"], []).append(d)

records = [{
    "id": s["id"], "t": s["type"], "tm": s["term"], "s": s["sutra"], "pc": s["padaccheda"],
    "d": diffs_by_id.get(s["id"]),
} for s in sutras]

TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Sanskrit Parser — Source Review</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600&display=swap" rel="stylesheet">
<style>
  :root {
    --bg:#faf8f4; --card:#ffffff; --text:#1f1b16; --muted:#6b6258;
    --accent:#9a5b2e; --border:#e5ddd0; --good:#3f7d4f; --warn:#b4452e; --flag:#fff3e6;
    box-sizing:border-box; padding-top:env(safe-area-inset-top,0px);
    padding-bottom:env(safe-area-inset-bottom,0px);
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --bg:#17140f; --card:#211c15; --text:#efe8da; --muted:#a79c8a;
      --accent:#d79a63; --border:#3a332a; --good:#6fbf83; --warn:#e07a5f; --flag:#2e2416;
    }
  }
  :root[data-theme="dark"] {
    --bg:#17140f; --card:#211c15; --text:#efe8da; --muted:#a79c8a;
    --accent:#d79a63; --border:#3a332a; --good:#6fbf83; --warn:#e07a5f; --flag:#2e2416;
  }
  * { box-sizing:inherit; }
  body { margin:0; background:var(--bg); color:var(--text);
    font-family:-apple-system,Segoe UI,Roboto,sans-serif; line-height:1.5; }
  .wrap { max-width:760px; margin:0 auto; padding:20px 16px 64px; }
  h1 { font-size:1.25rem; margin:0 0 4px; }
  .sub { color:var(--muted); font-size:0.88rem; margin:0 0 16px; }
  .sa { font-family:"Noto Sans Devanagari","Segoe UI",sans-serif; font-size:1.1rem; }
  .controls { position:sticky; top:0; background:var(--bg); padding:8px 0 12px; z-index:1; }
  #search { width:100%; font:inherit; font-size:0.95rem; padding:10px 12px; border:1px solid var(--border);
    border-radius:8px; background:var(--card); color:var(--text); }
  .tabs { display:flex; gap:6px; margin-top:8px; }
  .tabs button { flex:1; font:inherit; font-size:0.82rem; padding:7px; border-radius:6px;
    border:1px solid var(--border); background:var(--card); color:var(--text); cursor:pointer; }
  .tabs button.active { background:var(--accent); color:#fff; border-color:var(--accent); }
  #count { font-size:0.78rem; color:var(--muted); margin-top:6px; }
  .card { background:var(--card); border:1px solid var(--border); border-radius:10px;
    padding:12px 14px; margin-bottom:8px; }
  .card.flagged { background:var(--flag); }
  .id { font-weight:600; color:var(--accent); font-size:0.82rem; }
  .badge { font-size:0.68rem; color:var(--muted); border:1px solid var(--border); border-radius:4px;
    padding:1px 6px; margin-left:6px; }
  .term { color:var(--muted); font-size:0.8rem; }
  .pc { color:var(--muted); font-size:0.85rem; margin-top:4px; }
  .diff { margin-top:8px; font-size:0.82rem; border-top:1px dashed var(--border); padding-top:8px; }
  .diff .src { color:var(--muted); font-size:0.72rem; }
  textarea { width:100%; font:inherit; font-size:0.85rem; padding:7px 9px; border:1px solid var(--border);
    border-radius:6px; background:var(--bg); color:var(--text); margin-top:8px; min-height:38px; resize:vertical; }
  .actions { display:flex; gap:8px; margin-top:8px; }
  a.btn { font-size:0.8rem; padding:6px 12px; border-radius:6px; border:1px solid var(--accent);
    background:var(--accent); color:#fff; cursor:pointer; text-decoration:none; }
  .more { text-align:center; color:var(--muted); font-size:0.85rem; padding:16px 0; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Sanskrit Parser — Source Review</h1>
  <p class="sub">All 3,983 sutras. 53 are marked (background tint) as disagreeing between sanskritdocuments.org and ashtadhyayi.com. Flag any of them, or search for others — "Open issue" opens a pre-filled GitHub issue against <strong>hindawiai/sanskrit</strong> for you to review and submit.</p>
  <div class="controls">
    <input type="text" id="search" placeholder="Search by ID (2.3.17), text, or term…">
    <div class="tabs">
      <button id="tabFlagged" class="active">Flagged (__N_FLAGGED__)</button>
      <button id="tabAll">All 3,983</button>
    </div>
    <div id="count"></div>
  </div>
  <div id="list"></div>
  <div id="more" class="more" style="display:none"></div>
</div>
<script>
const REPO = "hindawiai/sanskrit";
const DATA = __DATA_JSON__; // [{id,t,tm,s,pc,d}], d = diff list or null
const PAGE = 80;
let mode = "flagged", shown = PAGE;

function issueUrl(title, body) {
  return `https://github.com/${REPO}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function matches(r, q) {
  if (!q) return true;
  q = q.toLowerCase();
  return r.id.includes(q) || (r.s && r.s.includes(q)) || (r.tm && r.tm.toLowerCase().includes(q));
}

function cardHtml(r) {
  const flagged = !!r.d;
  const diffHtml = flagged ? r.d.map((d, i) => `
      <div class="diff">
        <div class="src">sanskritdocuments.org</div><div class="sa">${d.sanskritdocuments_org ?? '—'}</div>
        <div class="src">ashtadhyayi.com</div><div class="sa">${d.ashtadhyayi_com ?? '—'}</div>
      </div>`).join("") : "";
  return `
    <div class="card ${flagged ? 'flagged' : ''}" data-id="${r.id}">
      <span class="id">${r.id}</span>
      ${r.t ? `<span class="badge">${r.t}</span>` : ""}
      ${r.tm ? `<span class="term">${r.tm}</span>` : ""}
      <div class="sa">${r.s}</div>
      ${r.pc ? `<div class="pc sa">${r.pc}</div>` : ""}
      ${diffHtml}
      <textarea placeholder="Note for the issue (optional)"></textarea>
      <div class="actions"><a class="btn" target="_blank" rel="noopener">Open issue</a></div>
    </div>`;
}

function render() {
  const q = document.getElementById("search").value.trim();
  const pool = mode === "flagged" ? DATA.filter(r => r.d) : DATA.filter(r => matches(r, q));
  const list = document.getElementById("list");
  const slice = pool.slice(0, shown);
  list.innerHTML = slice.map(cardHtml).join("") || '<p class="sub">No matches.</p>';

  document.getElementById("count").textContent =
    mode === "flagged" ? `${pool.length} flagged` : `${Math.min(shown, pool.length)} of ${pool.length} shown`;

  const moreEl = document.getElementById("more");
  if (pool.length > shown) {
    moreEl.style.display = "block";
    moreEl.textContent = `Showing ${shown} of ${pool.length} — search to narrow, or load more.`;
  } else { moreEl.style.display = "none"; }

  list.querySelectorAll(".card").forEach(card => {
    const r = DATA.find(x => x.id === card.dataset.id);
    const noteEl = card.querySelector("textarea");
    const link = card.querySelector("a.btn");
    const refresh = () => {
      const note = noteEl.value.trim();
      let title, body;
      if (r.d) {
        title = `Sutra ${r.id}: discrepancy between sources`;
        body = `**Sutra:** ${r.id}\n\n` + r.d.map(d =>
          `**${d.field}**\nsanskritdocuments.org: ${d.sanskritdocuments_org ?? '(missing)'}\nashtadhyayi.com: ${d.ashtadhyayi_com ?? '(missing)'}`
        ).join("\n\n") + (note ? `\n\n**Reviewer note:** ${note}` : "") + `\n\n_Flagged via the source-review tool._`;
      } else {
        title = `Sutra ${r.id}: flagged for review`;
        body = `**Sutra:** ${r.id}\n**Text:** ${r.s}\n\n${note || "(no note given)"}\n\n_Flagged via the source-review tool._`;
      }
      link.href = issueUrl(title, body);
    };
    refresh();
    noteEl.addEventListener("input", refresh);
  });
}

document.getElementById("search").addEventListener("input", () => { shown = PAGE; render(); });
document.getElementById("tabFlagged").addEventListener("click", (e) => {
  mode = "flagged"; shown = PAGE; e.target.classList.add("active");
  document.getElementById("tabAll").classList.remove("active"); render();
});
document.getElementById("tabAll").addEventListener("click", (e) => {
  mode = "all"; shown = PAGE; e.target.classList.add("active");
  document.getElementById("tabFlagged").classList.remove("active"); render();
});
document.getElementById("more").addEventListener("click", () => { shown += 200; render(); });

render();
</script>
</body>
</html>
"""

n_flagged = sum(1 for r in records if r["d"])
html = TEMPLATE.replace("__DATA_JSON__", json.dumps(records, ensure_ascii=False))
html = html.replace("__N_FLAGGED__", str(n_flagged))
open("tools/review-tool.html", "w", encoding="utf-8").write(html)
print(f"Wrote tools/review-tool.html: {len(records)} rules ({len(diffs)} flagged), {len(html)} bytes")
