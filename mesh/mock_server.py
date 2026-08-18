#!/usr/bin/env python3
import json
import os
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

MODEL_NAME = os.environ.get("MODEL_NAME", "mock-ai-node")
PORT = int(os.environ.get("PORT", "8000"))

class MockAIHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("X-Mock-Model", MODEL_NAME)
        self.end_headers()

    def do_GET(self):
        if self.path in ("/healthz", "/health", "/ready"):
            self._set_headers(200)
            resp = {
                "status": "healthy",
                "model": MODEL_NAME,
                "timestamp": time.time()
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return
        
        self._set_headers(200)
        resp = {"service": "mock-ai-upstream", "model": MODEL_NAME, "status": "running"}
        self.wfile.write(json.dumps(resp).encode("utf-8"))

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode("utf-8") if content_length > 0 else "{}"
        
        try:
            req_data = json.loads(body)
        except Exception:
            req_data = {}

        requested_model = req_data.get("model", MODEL_NAME)

        # OpenAI Chat Completions Mock
        if "/v1/chat/completions" in self.path:
            self._set_headers(200)
            resp = {
                "id": f"chatcmpl-mock-{int(time.time())}",
                "object": "chat.completion",
                "created": int(time.time()),
                "model": requested_model,
                "choices": [
                    {
                        "index": 0,
                        "message": {
                            "role": "assistant",
                            "content": f"[OpenBalancer Mesh] Inference generated successfully by {MODEL_NAME} upstream node."
                        },
                        "finish_reason": "stop"
                    }
                ],
                "usage": {
                    "prompt_tokens": 18,
                    "completion_tokens": 32,
                    "total_tokens": 50
                }
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        # Ollama Generate Mock
        if "/api/generate" in self.path:
            self._set_headers(200)
            resp = {
                "model": requested_model,
                "response": f"[OpenBalancer Mesh] Fast generation from {MODEL_NAME}.",
                "done": True,
                "prompt_eval_count": 18,
                "eval_count": 32
            }
            self.wfile.write(json.dumps(resp).encode("utf-8"))
            return

        # Generic 200 response
        self._set_headers(200)
        resp = {
            "status": "ok",
            "model": MODEL_NAME,
            "path": self.path,
            "usage": {
                "prompt_tokens": 10,
                "completion_tokens": 10
            }
        }
        self.wfile.write(json.dumps(resp).encode("utf-8"))

    def log_message(self, format, *args):
        print(f"[{MODEL_NAME}] {self.address_string()} - - [{self.log_date_time_string()}] {format % args}")

def run():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, MockAIHandler)
    print(f"[{MODEL_NAME}] Mock AI Server listening on 0.0.0.0:{PORT}...")
    httpd.serve_forever()

if __name__ == "__main__":
    run()
