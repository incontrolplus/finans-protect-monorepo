# 📊 Telemetry API & Prometheus Metrics Integration

OpenBalancer embeds native observability endpoints that deliver real-time JSON metrics, storage telemetry, and Prometheus exposition without requiring external agents.

---

## 1. Built-in Endpoints Overview

| Endpoint | Protocol | Description |
|---|---|---|
| `/healthz` | HTTP/HTTPS | Proactive cluster liveness probe. |
| `/openbalancer/status` | HTTP/HTTPS | Complete JSON snapshot of cluster health, active TLS, algorithms, and backend nodes. |
| `/openbalancer/dashboard` | HTTP/HTTPS | Self-contained lightweight HTML dashboard for real-time monitoring. |
| `/metrics` | HTTP/HTTPS | Prometheus text exposition format (version 0.0.4) for scraper integration. |
| `/storage/philips-ssd` | HTTP/HTTPS | Real-time capacity, usage, and health of `/Volumes/PHILIPS_SSD` on `macmini-secondary`. |
| `/backup/status` | HTTP/HTTPS | Synchronization state for Obsidian Vault, iCloud, and Windows VM backups. |

---

## 2. Storage & Backup Endpoints

### `/storage/philips-ssd`
```bash
curl -k -s https://127.0.0.1:8888/storage/philips-ssd | jq .
```
```json
{
  "node": "macmini-secondary (100.70.181.127)",
  "mount_point": "/Volumes/PHILIPS_SSD",
  "filesystem": "ntfs-3g / APFS",
  "status": "HEALTHY",
  "total_gb": 466.0,
  "used_gb": 194.0,
  "free_gb": 272.0,
  "used_percent": 41.6,
  "total_bytes": 500363296768,
  "used_bytes": 208305913856,
  "free_bytes": 292057382912,
  "last_checked": 1787042000
}
```

### `/backup/status`
```bash
curl -k -s https://127.0.0.1:8888/backup/status | jq .
```
```json
{
  "node": "macmini-secondary (100.70.181.127)",
  "storage_target": "/Volumes/PHILIPS_SSD",
  "overall_status": "HEALTHY",
  "backups": {
    "obsidian_vault": {
      "status": "SYNCED",
      "target_dir": "Obsidian_Vault_Backup",
      "sync_protocol": "rsync-append-only",
      "healthy": true
    },
    "icloud_backup": {
      "status": "ACTIVE",
      "target_dirs": ["icloud_backup_20260728", "icloud_backup_20260809"],
      "healthy": true
    },
    "windows_vm": {
      "status": "CONFIGURED",
      "target_dir": "VMs/WindowsVM",
      "qemu_service_port": 8006,
      "healthy": true
    }
  }
}
```

---

## 3. Prometheus Metric Names

* `openbalancer_requests_total`: Total proxied HTTP/HTTPS requests.
* `openbalancer_tls_enabled`: 1 if TLS termination is active, 0 if plaintext.
* `openbalancer_storage_total_bytes`: Total storage capacity on Philips SSD.
* `openbalancer_storage_used_bytes`: Used bytes on Philips SSD.
* `openbalancer_storage_free_bytes`: Free bytes available on Philips SSD.
* `openbalancer_storage_used_percent`: Utilization percentage of Philips SSD.
* `openbalancer_backup_sync_status`: Backup sync health (1 = healthy, 0 = degraded).
* `openbalancer_vm_qemu_status`: Windows VM / QEMU engine health status (1 = online).
