#!/usr/bin/env python3
"""
Open Balancer - Fleet Telemetry & SLA 99.9% Heartbeat Daemon
Collects CPU, RAM, Root and PHILIPS_SSD Disk metrics, Tailscale Mesh status,
and local/mesh service connectivity. Persists directly to Supabase (`supabase-ob`).
Features resilient local spooling fallback with automatic queue re-transmission.
"""

import os
import sys
import json
import time
import socket
import shutil
import re
import subprocess
import urllib.request
import urllib.error

# Ensure standard PATH for headless LaunchAgent / cron environments
os.environ["PATH"] = f"/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/sbin:/sbin:{os.environ.get('PATH', '')}"

# Supabase REST configuration
SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://100.83.83.8:8002")
SUPABASE_SERVICE_ROLE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"
)

SPOOL_DIR = os.path.expanduser("~/Library/Logs/openbalancer/spool_heartbeats")


def get_canonical_device_name():
    """Identifies the canonical device name within the Open Balancer fleet."""
    raw_hostname = socket.gethostname().lower()
    user = os.environ.get("USER", "")

    if "air" in raw_hostname or "macbook" in raw_hostname:
        return "dios-macbook-air", "Primary Agent & CLI Node"
    elif "leon2" in raw_hostname or user == "diokarabaz2":
        return "macmini-secondary", "High-Availability Backup & Storage"
    elif "leon" in raw_hostname or "primary" in raw_hostname:
        return "macmini-primary", "DevOps, Docker, n8n, Supabase"
    
    # Fallback to sanitized hostname
    sanitized = raw_hostname.split('.')[0]
    return sanitized, "Worker Node"


def get_cpu_utilization():
    """Extracts accurate CPU utilization percentage."""
    try:
        top_out = subprocess.run(
            ["top", "-l", "1", "-n", "0"],
            capture_output=True,
            text=True,
            timeout=3
        )
        if top_out.returncode == 0:
            for line in top_out.stdout.splitlines():
                if "CPU usage:" in line:
                    # e.g. CPU usage: 6.25% user, 12.50% sys, 81.25% idle
                    parts = line.split("CPU usage:")[1].split(",")
                    user = float(parts[0].replace("% user", "").strip())
                    sys_cpu = float(parts[1].replace("% sys", "").strip())
                    return round(user + sys_cpu, 2)
    except Exception:
        pass

    try:
        ps_out = subprocess.run(
            ["ps", "-A", "-o", "%cpu"],
            capture_output=True,
            text=True,
            timeout=3
        )
        if ps_out.returncode == 0:
            lines = [l.strip() for l in ps_out.stdout.splitlines()[1:] if l.strip()]
            total_cpu = sum(float(l) for l in lines)
            core_count = os.cpu_count() or 1
            return round(min(100.0, total_cpu / core_count), 2)
    except Exception:
        pass

    return 0.0


def get_ram_utilization():
    """Calculates used memory percentage on macOS considering active, wired, and compressor pages."""
    try:
        mem_bytes = int(subprocess.check_output(["sysctl", "-n", "hw.memsize"], timeout=3).strip())
        vm = subprocess.check_output(["vm_stat"], timeout=3).decode("utf-8")
        page_size = 16384 if "16384" in vm else 4096

        lines = {}
        for line in vm.splitlines():
            if ":" in line and not line.startswith("Mach"):
                k, v = line.split(":", 1)
                m = re.search(r"(\d+)", v)
                if m:
                    lines[k.strip()] = int(m.group(1))

        # Available memory includes free, inactive, speculative, and purgeable pages
        available_pages = (
            lines.get("Pages free", 0) +
            lines.get("Pages inactive", 0) +
            lines.get("Pages speculative", 0) +
            lines.get("Pages purgeable", 0)
        )
        available_bytes = available_pages * page_size
        used_bytes = max(0, mem_bytes - available_bytes)
        mem_pct = round((used_bytes / mem_bytes) * 100, 2)
        return mem_pct
    except Exception:
        return 0.0


def get_disk_metrics():
    """Checks free and total disk space on root and optional external storage."""
    metrics = {}
    
    # Root partition
    try:
        r_total, r_used, r_free = shutil.disk_usage("/")
        metrics["root_free_gb"] = round(r_free / (1024 ** 3), 2)
        metrics["root_total_gb"] = round(r_total / (1024 ** 3), 2)
        metrics["root_used_pct"] = round((r_used / r_total) * 100, 1)
    except Exception:
        metrics["root_free_gb"] = 0.0
        metrics["root_total_gb"] = 0.0
        metrics["root_used_pct"] = 0.0

    # PHILIPS_SSD partition
    ssd_path = "/Volumes/PHILIPS_SSD"
    if os.path.exists(ssd_path):
        try:
            s_total, s_used, s_free = shutil.disk_usage(ssd_path)
            metrics["philips_ssd_free_gb"] = round(s_free / (1024 ** 3), 2)
            metrics["philips_ssd_total_gb"] = round(s_total / (1024 ** 3), 2)
            metrics["philips_ssd_used_pct"] = round((s_used / s_total) * 100, 1)
        except Exception:
            metrics["philips_ssd_free_gb"] = None
    else:
        metrics["philips_ssd_free_gb"] = None

    return metrics


def get_tailscale_status():
    """Queries Tailscale Mesh status and connected peers."""
    ts_candidates = [
        "/usr/local/bin/tailscale",
        "/opt/homebrew/bin/tailscale",
        "/Applications/Tailscale.app/Contents/MacOS/Tailscale"
    ]
    ts_bin = None
    for candidate in ts_candidates:
        if os.path.exists(candidate):
            ts_bin = candidate
            break

    if not ts_bin:
        ts_bin = shutil.which("tailscale")

    if not ts_bin:
        return {"state": "NotInstalled", "total_peers": 0, "online_peers": 0, "self_ip": ""}

    try:
        res = subprocess.run([ts_bin, "status", "--json"], capture_output=True, text=True, timeout=4)
        if res.returncode == 0 and res.stdout.strip().startswith("{"):
            data = json.loads(res.stdout)
            backend_state = data.get("BackendState", "Unknown")
            peers = data.get("Peer", {})
            total_peers = len(peers)
            online_peers = sum(1 for p in peers.values() if p.get("Online", False))
            self_ips = data.get("Self", {}).get("TailscaleIPs", [])
            self_ip = self_ips[0] if self_ips else ""
            return {
                "state": backend_state,
                "total_peers": total_peers,
                "online_peers": online_peers,
                "self_ip": self_ip
            }
        else:
            # Fallback simple status check
            res_txt = subprocess.run([ts_bin, "status"], capture_output=True, text=True, timeout=4)
            if res_txt.returncode == 0 and res_txt.stdout.strip():
                lines = [l for l in res_txt.stdout.splitlines() if l.strip()]
                return {
                    "state": "Running",
                    "total_peers": len(lines),
                    "online_peers": sum(1 for l in lines if "active" in l.lower() or "direct" in l.lower() or "-" in l),
                    "self_ip": ""
                }
    except Exception as e:
        return {"state": "Error", "total_peers": 0, "online_peers": 0, "self_ip": "", "error": str(e)}

    return {"state": "Unknown", "total_peers": 0, "online_peers": 0, "self_ip": ""}


def check_tcp_service(host, port, timeout=1.5):
    """Probes a single TCP service endpoint."""
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except Exception:
        return False


def check_fleet_services(is_primary_node):
    """Probes specified fleet and local microservices."""
    ports = {
        "ui_3500": 3500,
        "control_center_5001": 5001,
        "n8n_5679": 5679,
        "infisical_8080": 8080,
        "supabase_kong_8002": 8002,
        "firecrawl_3002": 3002,
        "finansprotect_8083": 8083,
        "revenue_dashboard_3117": 3117
    }

    target_host = "127.0.0.1" if is_primary_node else "100.83.83.8"
    results = {}
    for name, port in ports.items():
        results[name] = check_tcp_service(target_host, port)
    return results


def send_to_supabase(record):
    """Submits a single heartbeat record to Supabase via REST API."""
    target_urls = [
        f"{SUPABASE_URL}/rest/v1/monitor_heartbeats",
        "http://127.0.0.1:8002/rest/v1/monitor_heartbeats",
        "http://100.83.83.8:8002/rest/v1/monitor_heartbeats"
    ]

    req_body = json.dumps(record).encode("utf-8")

    for url in set(target_urls):
        try:
            req = urllib.request.Request(
                url,
                data=req_body,
                headers={
                    "apikey": SUPABASE_SERVICE_ROLE_KEY,
                    "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                }
            )
            with urllib.request.urlopen(req, timeout=4) as resp:
                if resp.status in [200, 201, 204]:
                    return True
        except Exception:
            continue

    # Fallback directly via docker exec if on macmini-primary
    if os.path.exists("/var/run/docker.sock") or shutil.which("docker"):
        try:
            payload_str = json.dumps(record["payload"]).replace("'", "''")
            sql = f"""
            INSERT INTO public.monitor_heartbeats (
                device_name, status, cpu_pct, mem_pct, disk_free_gb, payload, created_at, observed_at
            ) VALUES (
                '{record["device_name"]}',
                '{record["status"]}',
                {record["cpu_pct"]},
                {record["mem_pct"]},
                {record["disk_free_gb"]},
                '{payload_str}'::jsonb,
                now(),
                now()
            );
            """
            res = subprocess.run(
                ["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql],
                capture_output=True,
                text=True,
                timeout=4
            )
            if res.returncode == 0:
                return True
        except Exception:
            pass

    return False


def spool_heartbeat_locally(record):
    """Caches the heartbeat record locally when offline."""
    try:
        os.makedirs(SPOOL_DIR, exist_ok=True)
        filename = f"heartbeat_{record['device_name']}_{int(time.time()*1000)}.json"
        filepath = os.path.join(SPOOL_DIR, filename)
        with open(filepath, "w") as f:
            json.dump(record, f, indent=2)
        print(f"📦 [SPOOL] Heartbeat cached locally at {filepath}")
        return True
    except Exception as e:
        print(f"❌ [SPOOL ERROR] Failed to spool heartbeat: {e}", file=sys.stderr)
        return False


def flush_local_spool():
    """Flushes cached offline heartbeats to Supabase upon reconnection."""
    if not os.path.exists(SPOOL_DIR):
        return

    for filename in sorted(os.listdir(SPOOL_DIR)):
        if filename.endswith(".json"):
            filepath = os.path.join(SPOOL_DIR, filename)
            try:
                with open(filepath, "r") as f:
                    cached_record = json.load(f)
                if send_to_supabase(cached_record):
                    os.remove(filepath)
                    print(f"🚀 [SPOOL FLUSH] Successfully delivered cached heartbeat: {filename}")
            except Exception:
                pass


def run_heartbeat_cycle():
    """Executes a single end-to-end heartbeat collection and persistence cycle."""
    device_name, node_role = get_canonical_device_name()
    is_primary = (device_name == "macmini-primary")

    cpu_pct = get_cpu_utilization()
    mem_pct = get_ram_utilization()
    disks = get_disk_metrics()
    tailscale = get_tailscale_status()
    services = check_fleet_services(is_primary)

    warnings = []
    if cpu_pct > 85.0:
        warnings.append(f"High CPU utilization: {cpu_pct}% (> 85%)")
    if mem_pct > 90.0:
        warnings.append(f"High RAM utilization: {mem_pct}% (> 90%)")
    if disks.get("root_free_gb", 0.0) < 5.0:
        warnings.append(f"Low root disk space: {disks.get('root_free_gb')} GB (< 5 GB)")
    if disks.get("philips_ssd_free_gb") is not None and disks["philips_ssd_free_gb"] < 5.0:
        warnings.append(f"Low PHILIPS_SSD disk space: {disks.get('philips_ssd_free_gb')} GB (< 5 GB)")
    if tailscale.get("state") != "Running":
        warnings.append(f"Tailscale mesh not active (state: {tailscale.get('state')})")

    # SLA 99.9% health assessment
    is_healthy = (len(warnings) == 0)
    status_str = "HEALTHY" if is_healthy else "DEGRADED"

    payload = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "node_role": node_role,
        "sla_target": "99.9%",
        "sla_status": status_str,
        "services": services,
        "disks": disks,
        "tailscale": tailscale,
        "warnings": warnings
    }

    record = {
        "device_name": device_name,
        "status": status_str,
        "cpu_pct": cpu_pct,
        "mem_pct": mem_pct,
        "disk_free_gb": disks.get("root_free_gb", 0.0),
        "payload": payload
    }

    # Attempt to flush any previously spooled records
    flush_local_spool()

    # Deliver current heartbeat
    delivered = send_to_supabase(record)
    if delivered:
        print(f"✅ [HEARTBEAT OK] {device_name} ({node_role}) -> Status: {status_str} | CPU: {cpu_pct}% | RAM: {mem_pct}% | Disk: {disks.get('root_free_gb')}GB")
        sys.exit(0)
    else:
        print(f"⚠️ [HEARTBEAT OFFLINE] Supabase unreachable. Falling back to local spool.")
        spool_heartbeat_locally(record)
        sys.exit(0)


if __name__ == "__main__":
    run_heartbeat_cycle()
