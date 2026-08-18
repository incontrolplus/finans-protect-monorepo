import unittest
import asyncio
import json
import os
from core.openbalancer import OpenBalancer, StorageMonitor

class TestStorageMonitoring(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.config_path = "core/config_test_storage.json"
        config_data = {
            "backends": [
                {"host": "127.0.0.1", "port": 9301, "weight": 1}
            ]
        }
        with open(self.config_path, "w") as f:
            json.dump(config_data, f)

        self.balancer = OpenBalancer(self.config_path)
        self.port = 8898
        await self.balancer.start_server('127.0.0.1', self.port)
        await asyncio.sleep(0.1)

    async def asyncTearDown(self):
        if self.balancer.server:
            self.balancer.server.close()
            await self.balancer.server.wait_closed()
        await self.balancer.stop_watcher()
        if os.path.exists(self.config_path):
            os.remove(self.config_path)

    def test_storage_monitor_unit(self):
        ssd = StorageMonitor.get_philips_ssd_status()
        self.assertEqual(ssd["node"], "macmini-secondary (100.70.181.127)")
        self.assertEqual(ssd["mount_point"], "/Volumes/PHILIPS_SSD")
        self.assertGreater(ssd["total_gb"], 0)
        self.assertGreater(ssd["total_bytes"], 0)

        backup = StorageMonitor.get_backup_status()
        self.assertEqual(backup["overall_status"], "HEALTHY")
        self.assertIn("obsidian_vault", backup["backups"])
        self.assertIn("icloud_backup", backup["backups"])
        self.assertIn("windows_vm", backup["backups"])

    async def test_metrics_endpoint_telemetry(self):
        reader, writer = await asyncio.open_connection('127.0.0.1', self.port)
        req = "GET /metrics HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n"
        writer.write(req.encode('utf-8'))
        await writer.drain()

        resp = await reader.read(8192)
        writer.close()
        await writer.wait_closed()
        
        metrics_text = resp.decode('utf-8')
        self.assertIn("openbalancer_storage_total_bytes", metrics_text)
        self.assertIn("openbalancer_storage_used_bytes", metrics_text)
        self.assertIn("openbalancer_storage_free_bytes", metrics_text)
        self.assertIn("openbalancer_storage_used_percent", metrics_text)
        self.assertIn("openbalancer_backup_sync_status", metrics_text)
        self.assertIn("openbalancer_vm_qemu_status", metrics_text)

if __name__ == '__main__':
    unittest.main()
