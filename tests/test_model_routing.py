import unittest
import asyncio
import socket
import json
import os
import time

from core.openbalancer import OpenBalancer

class TestModelRouting(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.config_path = "core/config_test_routing.json"
        config_data = {
            "model_routing": {
                "llama3": "http://127.0.0.1:8001",
                "qwen": "http://127.0.0.1:8002"
            },
            "default_backend": "http://127.0.0.1:8000"
        }
        with open(self.config_path, "w") as f:
            json.dump(config_data, f)
            
        self.balancer = OpenBalancer(self.config_path)
        self.port = 8889
        await self.balancer.start_server('127.0.0.1', self.port)
        await asyncio.sleep(0.1)

    async def asyncTearDown(self):
        self.balancer.server.close()
        await self.balancer.server.wait_closed()
        await self.balancer.stop_watcher()
        if os.path.exists(self.config_path):
            os.remove(self.config_path)
            
    async def send_request(self, path, body=""):
        reader, writer = await asyncio.open_connection('127.0.0.1', self.port)
        req = f"POST {path} HTTP/1.1\r\nContent-Length: {len(body)}\r\n\r\n{body}"
        writer.write(req.encode('utf-8'))
        await writer.drain()
        
        resp = await reader.read(4096)
        writer.close()
        await writer.wait_closed()
        return resp.decode('utf-8')

    async def test_dashboard(self):
        resp = await self.send_request("/openbalancer/dashboard")
        self.assertIn("HTTP/1.1 200 OK", resp)
        self.assertIn("<h1>Dashboard</h1>", resp)
        
    async def test_routing_llama3(self):
        body = json.dumps({"model": "llama3"})
        resp = await self.send_request("/v1/chat/completions", body)
        self.assertIn("X-Routed-Target: http://127.0.0.1:8001", resp)

    async def test_routing_qwen(self):
        body = json.dumps({"model": "qwen"})
        resp = await self.send_request("/api/generate", body)
        self.assertIn("X-Routed-Target: http://127.0.0.1:8002", resp)

    async def test_routing_default(self):
        body = json.dumps({"model": "unknown_model"})
        resp = await self.send_request("/v1/chat/completions", body)
        self.assertIn("X-Routed-Target: http://127.0.0.1:8000", resp)
