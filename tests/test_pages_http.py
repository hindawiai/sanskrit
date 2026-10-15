#!/usr/bin/env python3
"""Serve the Pages directory over HTTP and verify real URL resolution."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.request import urlopen
import os

root = Path(__file__).resolve().parents[1] / "docs"
class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(("127.0.0.1", 0), lambda *a, **kw: QuietHandler(*a, directory=str(root), **kw))
thread = Thread(target=server.serve_forever, daemon=True)
thread.start()
try:
    base = f"http://127.0.0.1:{server.server_port}"
    paths = [
        "/index.html",
        "/documentation-catalog.html",
        "/tasks.html",
        "/tests.html",
        "/sutram-compiler.html",
        "/sutram-compiler.js",
        "/sanchalan-suktam.html",
        "/sanchalan-browser.js",
        "/sanchalan-grammar.json",
        "/sanchalan-source.suktam",
        "/reference/repository/HANDOFF.md",
        "/reference/repository/lang/SPEC.md",
    ]
    for path in paths:
        with urlopen(base + path, timeout=5) as response:
            body = response.read()
            assert response.status == 200, (path, response.status)
            assert body, f"empty response: {path}"
    print(f"Pages HTTP smoke test passed: {len(paths)} URLs returned HTTP 200")
finally:
    server.shutdown()
    server.server_close()
    thread.join(timeout=2)
