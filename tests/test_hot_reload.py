import unittest
import asyncio
import json
import os
import signal

from core.openbalancer import OpenBalancer

class TestHotReload(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.config_path = "core/config_test_reload.json"
        self.write_config({"default_backend": "http://127.0.0.1:8000"})
            
        self.balancer = OpenBalancer(self.config_path)
        self.port = 8890
        await self.balancer.start_server('127.0.0.1', self.port)
        await asyncio.sleep(0.1)

    async def asyncTearDown(self):
        self.balancer.server.close()
        await self.balancer.server.wait_closed()
        await self.balancer.stop_watcher()
        if os.path.exists(self.config_path):
            os.remove(self.config_path)

    def write_config(self, data):
        with open(self.config_path, "w") as f:
            json.dump(data, f)
            
    async def send_request(self, path, body=""):
        reader, writer = await asyncio.open_connection('127.0.0.1', self.port)
        req = f"POST {path} HTTP/1.1\r\nContent-Length: {len(body)}\r\n\r\n{body}"
        writer.write(req.encode('utf-8'))
        await writer.drain()
        resp = await reader.read(4096)
        writer.close()
        await writer.wait_closed()
        return resp.decode('utf-8')

    async def test_file_modification_reload(self):
        resp = await self.send_request("/v1/chat/completions", json.dumps({"model": "new_model"}))
        self.assertIn("X-Routed-Target: http://127.0.0.1:8000", resp)
        
        # Modify config
        self.write_config({
            "model_routing": {"new_model": "http://127.0.0.1:9999"},
            "default_backend": "http://127.0.0.1:8000"
        })
        
        # Wait for watcher to pick up
        await asyncio.sleep(0.5)
        
        resp = await self.send_request("/v1/chat/completions", json.dumps({"model": "new_model"}))
        self.assertIn("X-Routed-Target: http://127.0.0.1:9999", resp)

    async def test_sighup_reload(self):
        # Change config but don't rely on watcher wait, trigger sighup
        self.write_config({
            "model_routing": {"another_model": "http://127.0.0.1:7777"},
            "default_backend": "http://127.0.0.1:8000"
        })
        self.balancer.handle_sighup()
        
        resp = await self.send_request("/v1/chat/completions", json.dumps({"model": "another_model"}))
        self.assertIn("X-Routed-Target: http://127.0.0.1:7777", resp)
