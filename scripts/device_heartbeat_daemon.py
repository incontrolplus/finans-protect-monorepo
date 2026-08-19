#!/usr/bin/env python3
"""
Open Balancer — Multi-Node Device Heartbeat & SLA Telemetry Daemon
Collects CPU, RAM, Disk, Active Services, Tailscale Mesh status, and SLA Availability.
Persists heartbeat to Supabase `supabase-ob` (monitor_heartbeats table).
"""

import os
import sys
import json
import time
import socket
import shutil
import subprocess
import urllib.request
import urllib.error

SUPABASE_REST_URL = os.environ.get("SUPABASE_URL", "http://100.83.83.8:8002")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZW5iYWxhbmNlciIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MTc5NTI5OTAsImV4cCI6MjAzMzUyODk5MH0.z5uXJq6k4fO6F4WwW8qXJq6k4fO6F4WwW8qXJq6k4fO")

def get_system_metrics():
    """Gathers CPU, memory, and disk telemetry."""
    hostname = socket.gethostname().split('.')[0]
    
    # Disk Usage
    total, used, free = shutil.disk_usage("/")
    disk_free_gb = round(free / (1024**3), 2)
    disk_used_pct = round((used / total) * 100, 1)

    # CPU & Memory via vm_stat / ps
    cpu_pct = 0.0
    mem_pct = 0.0
    try:
        ps_out = subprocess.run(["ps", "-A", "-o", "%cpu,%mem"], capture_output=True, text=True, timeout=3)
        lines = ps_out.stdout.strip().splitlines()[1:]
        cpu_sum = sum(float(l.split()[0]) for l in lines if l.split())
        mem_sum = sum(float(l.split()[1]) for l in lines if len(l.split()) > 1)
        cpu_pct = round(min(100.0, cpu_sum / os.cpu_count()), 1)
        mem_pct = round(min(100.0, mem_sum), 1)
    except Exception:
        pass

    # Tailscale Check
    tailscale_online = False
    ts_peers = 0
    try:
        ts_res = subprocess.run(["/Applications/Tailscale.app/Contents/MacOS/Tailscale", "status", "--json"], capture_output=True, text=True, timeout=3)
        if ts_res.returncode == 0:
            ts_data = json.loads(ts_res.stdout)
            tailscale_online = ts_data.get("BackendState") == "Running"
            ts_peers = len(ts_data.get("Peer", {}))
    except Exception:
        pass

    return {
        "hostname": hostname,
        "cpu_pct": cpu_pct,
        "mem_pct": mem_pct,
        "disk_free_gb": disk_free_gb,
        "disk_used_pct": disk_used_pct,
        "tailscale_online": tailscale_online,
        "tailscale_peers": ts_peers
    }

def check_listening_services():
    """Checks key local services status."""
    services = {}
    ports_to_check = [
        ("wallestars_ui", 3500),
        ("control_center", 5001),
        ("n8n", 5679),
        ("infisical", 8080),
        ("supabase_kong", 8002),
        ("firecrawl", 3002),
        ("finansprotect", 8083),
        ("revenue_dashboard", 3117)
    ]
    for name, port in ports_to_check:
        try:
            with socket.create_connection(("127.0.0.1", port), timeout=0.5):
                services[name] = True
        except Exception:
            services[name] = False
    return services

def record_device_heartbeat():
    sys_metrics = get_system_metrics()
    services_state = check_listening_services()
    hostname = sys_metrics["hostname"]

    # Calculate status & SLA
    all_healthy = sys_metrics["tailscale_online"] and sys_metrics["disk_free_gb"] > 2.0
    status_str = "HEALTHY" if all_healthy else "DEGRADED"

    payload = {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "system": sys_metrics,
        "services": services_state,
        "sla_target": "99.9%",
        "sla_status": status_str,
        "node_role": "agent-primary" if "macbook" in hostname else "devops-worker"
    }

    record = {
        "device_name": hostname,
        "status": status_str,
        "cpu_pct": sys_metrics["cpu_pct"],
        "mem_pct": sys_metrics["mem_pct"],
        "disk_free_gb": sys_metrics["disk_free_gb"],
        "payload": payload
    }

    # 1. Insert via Supabase REST
    try:
        url = f"{SUPABASE_REST_URL}/rest/v1/monitor_heartbeats"
        req_data = json.dumps(record).encode("utf-8")
        req = urllib.request.Request(
            url,
            data=req_data,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
        )
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status in [200, 201, 204]:
                print(f"✅ Device heartbeat recorded in Supabase: {hostname} [{status_str}]")
                return True
    except Exception:
        # Fallback to local Docker DB if running
        try:
            payload_escaped = json.dumps(payload).replace("'", "''")
            sql = f"""
            INSERT INTO public.monitor_heartbeats (device_name, status, cpu_pct, mem_pct, disk_free_gb, payload)
            VALUES ('{hostname}', '{status_str}', {sys_metrics['cpu_pct']}, {sys_metrics['mem_pct']}, {sys_metrics['disk_free_gb']}, '{payload_escaped}'::jsonb);
            """
            subprocess.run(["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql],
                           capture_output=True, timeout=4, check=True)
            print(f"✅ Device heartbeat recorded via Docker DB fallback: {hostname} [{status_str}]")
            return True
        except Exception:
            pass

    # Spool locally
    spool_dir = os.path.expanduser("~/Library/Logs/openbalancer/spool_heartbeats")
    os.makedirs(spool_dir, exist_ok=True)
    spool_path = os.path.join(spool_dir, f"heartbeat_{hostname}.json")
    try:
        with open(spool_path, "w") as f:
            json.dump(record, f, indent=2)
        print(f"ℹ️ Device heartbeat spooled locally: {spool_path}")
        return True
    except Exception as e:
        print(f"Failed to spool heartbeat: {e}", file=sys.stderr)
        return False

if __name__ == "__main__":
    record_device_heartbeat()
