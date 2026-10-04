"""Local dev server with caching disabled: python tools/serve.py [port]
(localhost counts as a secure context, so the service worker and install work here.)"""
import http.server
import sys


class NoCache(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
                      ".js": "text/javascript", ".mjs": "text/javascript",
                      ".json": "application/json", ".webmanifest": "application/manifest+json"}

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8123
    print(f"Mashq Kundaligi: http://localhost:{port}")
    http.server.ThreadingHTTPServer(("127.0.0.1", port), NoCache).serve_forever()
