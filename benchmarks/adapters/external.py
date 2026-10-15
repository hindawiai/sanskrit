"""External systems that are not invoked by this harness."""
SYSTEMS = [
    {"name": "sanskrit_heritage", "kind": "analyzer", "license": "GPL / LGPL (Zen)",
     "why_not": "OCaml platform with Apache and generated form banks; not installed"},
    {"name": "samsaadhanii", "kind": "analyzer", "license": "GPL-2.0",
     "why_not": "requires lttoolbox, ocaml, flex, bison, and a server install"},
    {"name": "sanskritshala", "kind": "analyzer", "license": "Apache-2.0",
     "why_not": "neural models; needs weights and a GPU or long CPU run"},
    {"name": "dharmamitra", "kind": "analyzer", "license": "permissive code; data terms vary",
     "why_not": "API or local model; not bundled"},
]

def run(cases):
    return [{"system": s["name"], "status": "external", **s} for s in SYSTEMS]
