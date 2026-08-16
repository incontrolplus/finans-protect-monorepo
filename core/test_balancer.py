#!/usr/bin/env python3
"""
Real Automated Verification Test for OpenBalancer Core Engine.
Spawns mock backends, starts OpenBalancer, dispatches requests, and validates telemetry.
"""

import subprocess
import time
import urllib.request
import json
import sys
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
import threading

class MockHandler(BaseHTTPRequestHandler):
    server_id = "Default"

    def do_GET(self):
        if self.path == "/health":
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"status":"healthy"}')
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(f"Response from Mock Server {self.server_id}".encode('utf-8'))

    def log_message(self, format, *args):
        pass  # Suppress stdout clutter during test

def make_handler(srv_id):
    class CustomHandler(MockHandler):
        server_id = srv_id
    return CustomHandler

def run_mock_server(port, srv_id):
    server = HTTPServer(('127.0.0.1', port), make_handler(srv_id))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server

def main():
    print("=== [OpenBalancer] Running Automated Verification Test ===")
    
    # 1. Start two mock backend servers on 9101 and 9102
    print("[1/5] Starting mock backends on ports 9101 and 9102...")
    srv1 = run_mock_server(9101, "ALPHA-9101")
    srv2 = run_mock_server(9102, "BETA-9102")
    time.sleep(0.5)

    # 2. Start OpenBalancer
    script_dir = os.path.dirname(os.path.abspath(__file__))
    lb_script = os.path.join(script_dir, "openbalancer.py")
    config_file = os.path.join(script_dir, "config.json")

    print("[2/5] Spawning OpenBalancer process on port 8088...")
    lb_proc = subprocess.Popen([sys.executable, lb_script, config_file], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(1.0)

    try:
        # 3. Test telemetry / status endpoint
        print("[3/5] Testing /openbalancer/status API endpoint...")
        req = urllib.request.Request("http://127.0.0.1:8088/openbalancer/status")
        with urllib.request.urlopen(req, timeout=3.0) as resp:
            raw = resp.read().decode('utf-8')
            data = json.loads(raw)
            print("Status response:\n", json.dumps(data, indent=2))
            assert data["system"] == "OpenBalancer Core"
            assert data["operator"] == "INCONTROL PLUS EOOD"
            assert len(data["backends"]) == 2

        # 4. Dispatch 6 requests and verify round-robin
        print("\n[4/5] Sending 6 requests through the load balancer...")
        responses = []
        for i in range(6):
            with urllib.request.urlopen("http://127.0.0.1:8088/api/test", timeout=3.0) as r:
                body = r.read().decode('utf-8')
                responses.append(body)
                print(f" Request #{i+1} -> {body}")

        count_alpha = sum(1 for r in responses if "ALPHA-9101" in r)
        count_beta = sum(1 for r in responses if "BETA-9102" in r)
        print(f"\nDistribution: ALPHA-9101: {count_alpha}, BETA-9102: {count_beta}")
        assert count_alpha == 3, f"Expected 3 to ALPHA, got {count_alpha}"
        assert count_beta == 3, f"Expected 3 to BETA, got {count_beta}"

        # 5. Check updated telemetry metrics
        print("\n[5/5] Checking telemetry counts after requests...")
        with urllib.request.urlopen("http://127.0.0.1:8088/openbalancer/status", timeout=3.0) as resp:
            updated_data = json.loads(resp.read().decode('utf-8'))
            assert updated_data["total_proxied_requests"] >= 7
            print("Final telemetry metrics:\n", json.dumps(updated_data["backends"], indent=2))

        print("\n✅ ALL TESTS PASSED SUCCESSFULLY! OpenBalancer Core engine is 100% operational.")

    finally:
        lb_proc.terminate()
        lb_proc.wait()

if __name__ == "__main__":
    main()
