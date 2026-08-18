import unittest
import asyncio
import json
import os
import ssl
import urllib.request
from core.openbalancer import OpenBalancer

class TestTLSTermination(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.config_path = "core/config_test_tls.json"
        self.cert_path = "certs/server.crt"
        self.key_path = "certs/server.key"
        
        # Ensure test certificates exist
        if not os.path.exists(self.cert_path) or not os.path.exists(self.key_path):
            os.system(
                "mkdir -p certs && openssl req -x509 -newkey rsa:2048 "
                "-keyout certs/server.key -out certs/server.crt -days 365 -nodes "
                "-subj '/CN=openbalancer-test' "
                "-addext 'subjectAltName=DNS:localhost,IP:127.0.0.1'"
            )

        config_data = {
            "tls": {
                "enabled": True,
                "cert_file": self.cert_path,
                "key_file": self.key_path,
                "min_version": "TLSv1.2"
            },
            "backends": [
                {"host": "127.0.0.1", "port": 9901, "weight": 1}
            ]
        }
        with open(self.config_path, "w") as f:
            json.dump(config_data, f)

        self.balancer = OpenBalancer(self.config_path)
        self.port = 8895
        await self.balancer.start_server('127.0.0.1', self.port)
        await asyncio.sleep(0.1)

    async def asyncTearDown(self):
        if self.balancer.server:
            self.balancer.server.close()
            await self.balancer.server.wait_closed()
        await self.balancer.stop_watcher()
        if os.path.exists(self.config_path):
            os.remove(self.config_path)

    async def test_tls_configuration_loaded(self):
        self.assertTrue(self.balancer.tls_enabled)
        self.assertEqual(self.balancer.tls_min_version, "TLSv1.2")
        ssl_ctx = self.balancer.get_ssl_context()
        self.assertIsNotNone(ssl_ctx)

    async def test_https_healthz_request(self):
        client_ctx = ssl.create_default_context()
        client_ctx.check_hostname = False
        client_ctx.verify_mode = ssl.CERT_NONE

        reader, writer = await asyncio.open_connection('127.0.0.1', self.port, ssl=client_ctx)
        req = "GET /healthz HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
        writer.write(req.encode('utf-8'))
        await writer.drain()

        resp = await reader.read(4096)
        writer.close()
        await writer.wait_closed()
        resp_text = resp.decode('utf-8')
        self.assertIn("HTTP/1.1 200 OK", resp_text)
        self.assertIn("OK", resp_text)

    async def test_https_status_api(self):
        client_ctx = ssl.create_default_context()
        client_ctx.check_hostname = False
        client_ctx.verify_mode = ssl.CERT_NONE

        reader, writer = await asyncio.open_connection('127.0.0.1', self.port, ssl=client_ctx)
        req = "GET /openbalancer/status HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
        writer.write(req.encode('utf-8'))
        await writer.drain()

        resp = await reader.read(8192)
        writer.close()
        await writer.wait_closed()
        
        resp_text = resp.decode('utf-8')
        self.assertIn("HTTP/1.1 200 OK", resp_text)
        header_part, body_part = resp_text.split("\r\n\r\n", 1)
        data = json.loads(body_part)
        self.assertTrue(data["tls"]["enabled"])
        self.assertEqual(data["system"], "OpenBalancer Core")

if __name__ == '__main__':
    unittest.main()
