import unittest
import asyncio
import json
import os
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from core.openbalancer import OpenBalancer

class MockUpstreamHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if "/windows" in self.path:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"service": "windows-vm", "status": "running"}')
        elif "/novnc" in self.path:
            self.send_response(200)
            self.send_header("Content-Type", "text/html")
            self.end_headers()
            self.wfile.write(b'<html>noVNC Desktop Session</html>')
        elif "/qemu" in self.path:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(b'{"qemu": "active", "kvm": true}')
        else:
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.end_headers()
            self.wfile.write(b'Upstream Mock OK')

    def log_message(self, format, *args):
        pass

class TestMultiNodeRouting(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        # 1. Start a real mock upstream server on port 9205
        self.mock_upstream_port = 9205
        self.mock_upstream_server = HTTPServer(('127.0.0.1', self.mock_upstream_port), MockUpstreamHandler)
        self.mock_thread = threading.Thread(target=self.mock_upstream_server.serve_forever, daemon=True)
        self.mock_thread.start()

        # 2. Config mapping to the real mock upstream and an offline endpoint
        self.config_path = "core/config_test_multinode.json"
        config_data = {
            "path_routing": {
                "/windows": f"http://127.0.0.1:{self.mock_upstream_port}",
                "/novnc": f"http://127.0.0.1:{self.mock_upstream_port}",
                "/qemu": f"http://127.0.0.1:{self.mock_upstream_port}",
                "/offline_node": "http://127.0.0.1:9999"
            },
            "backends": [
                {"host": "127.0.0.1", "port": self.mock_upstream_port, "weight": 1}
            ]
        }
        with open(self.config_path, "w") as f:
            json.dump(config_data, f)

        self.balancer = OpenBalancer(self.config_path)
        self.port = 8896
        await self.balancer.start_server('127.0.0.1', self.port)
        await asyncio.sleep(0.1)

    async def asyncTearDown(self):
        if self.balancer.server:
            self.balancer.server.close()
            await self.balancer.server.wait_closed()
        await self.balancer.stop_watcher()
        self.mock_upstream_server.shutdown()
        self.mock_upstream_server.server_close()
        if os.path.exists(self.config_path):
            os.remove(self.config_path)

    async def send_request(self, path: str, method: str = "GET", body: str = "") -> str:
        reader, writer = await asyncio.open_connection('127.0.0.1', self.port)
        req = f"{method} {path} HTTP/1.1\r\nHost: 127.0.0.1\r\nContent-Length: {len(body)}\r\nConnection: close\r\n\r\n{body}"
        writer.write(req.encode('utf-8'))
        await writer.drain()

        resp = await reader.read(4096)
        writer.close()
        await writer.wait_closed()
        return resp.decode('utf-8')

    async def test_windows_vm_real_proxy(self):
        resp = await self.send_request("/windows/console")
        self.assertIn("HTTP/1.1 200 OK", resp)
        self.assertIn(f"X-Routed-Target: http://127.0.0.1:{self.mock_upstream_port}", resp)
        self.assertIn("windows-vm", resp)

    async def test_novnc_real_proxy(self):
        resp = await self.send_request("/novnc/vnc_lite.html")
        self.assertIn("HTTP/1.1 200 OK", resp)
        self.assertIn(f"X-Routed-Target: http://127.0.0.1:{self.mock_upstream_port}", resp)
        self.assertIn("noVNC Desktop Session", resp)

    async def test_qemu_real_proxy(self):
        resp = await self.send_request("/qemu/status")
        self.assertIn("HTTP/1.1 200 OK", resp)
        self.assertIn(f"X-Routed-Target: http://127.0.0.1:{self.mock_upstream_port}", resp)
        self.assertIn("kvm", resp)

    async def test_offline_backend_returns_502_bad_gateway(self):
        resp = await self.send_request("/offline_node/test")
        self.assertIn("HTTP/1.1 502 Bad Gateway", resp)
        self.assertIn("502 Bad Gateway", resp)
        self.assertIn("unreachable", resp)

    async def test_storage_endpoint(self):
        resp = await self.send_request("/storage/philips-ssd")
        self.assertIn("HTTP/1.1 200 OK", resp)
        self.assertIn("PHILIPS_SSD", resp)
        self.assertIn("macmini-secondary", resp)

    async def test_backup_status_endpoint(self):
        resp = await self.send_request("/backup/status")
        self.assertIn("HTTP/1.1 200 OK", resp)
        self.assertIn("Obsidian_Vault_Backup", resp)
        self.assertIn("icloud_backup", resp)

if __name__ == '__main__':
    unittest.main()
