import unittest
import asyncio
import json
import os
from core.openbalancer import OpenBalancer

class TestMultiNodeRouting(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.config_path = "core/config_test_multinode.json"
        config_data = {
            "path_routing": {
                "/windows": "http://100.70.181.127:8006",
                "/vm/windows": "http://100.70.181.127:8006",
                "/novnc": "http://100.70.181.127:8006",
                "/qemu": "http://100.70.181.127:8006",
                "/storage/philips-ssd": "http://100.70.181.127:18795/storage",
                "/backup/status": "http://100.70.181.127:18795/backup/status"
            },
            "backends": [
                {"host": "127.0.0.1", "port": 9201, "weight": 1},
                {"host": "100.70.181.127", "port": 8006, "weight": 2}
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

    async def test_windows_vm_routing(self):
        resp = await self.send_request("/windows/console")
        self.assertIn("X-Routed-Target: http://100.70.181.127:8006", resp)

    async def test_novnc_routing(self):
        resp = await self.send_request("/novnc/vnc_lite.html")
        self.assertIn("X-Routed-Target: http://100.70.181.127:8006", resp)

    async def test_qemu_routing(self):
        resp = await self.send_request("/qemu/status")
        self.assertIn("X-Routed-Target: http://100.70.181.127:8006", resp)

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
