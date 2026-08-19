#!/usr/bin/env python3
import urllib.request
import urllib.error
import time
import json
import ssl
import sys
import subprocess
import os

TELEGRAM_BOT_TOKEN = '8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88'
TELEGRAM_CHAT_ID = '8041248687'

CLUSTERS = [
    ('dashboard.openbalancer.com', 'https://dashboard.openbalancer.com', '104.21.78.146'),
    ('ocr.openbalancer.com', 'https://ocr.openbalancer.com', '104.21.78.146'),
    ('wallestars.openbalancer.com', 'https://wallestars.openbalancer.com', '104.21.78.146'),
    ('hermes.openbalancer.com', 'https://hermes.openbalancer.com', '104.21.78.146'),
    ('openclaw.openbalancer.com', 'https://openclaw.openbalancer.com', '104.21.78.146'),
    ('supabase.openbalancer.com', 'https://supabase.openbalancer.com', '104.21.78.146'),
    ('api.openbalancer.com', 'https://api.openbalancer.com', '104.21.78.146'),
    ('docs.openbalancer.com', 'https://docs.openbalancer.com', '104.21.78.146'),
    ('mesh.openbalancer.com', 'https://mesh.openbalancer.com', '104.21.78.146'),
    ('ai.openbalancer.com', 'https://ai.openbalancer.com', '104.21.78.146'),
    ('openbalancer.com', 'https://openbalancer.com', '104.21.78.146')
]

LOCAL_SERVICES = [
    ('local_n8n', 'http://100.83.83.8:5679/healthz', [200]),
    ('local_infisical', 'http://100.83.83.8:8080/api/status', [200]),
    ('local_supabase_kong', 'http://100.83.83.8:8002/', [200, 401, 403]),
    ('local_firecrawl', 'http://100.83.83.8:3002/', [200])
]

def send_telegram_alert(service_name, url, status, error_msg):
    try:
        msg = f"🚨 *[OPEN BALANCER SLA ALERT]*\n\n*Service:* `{service_name}`\n*URL:* {url}\n*Status:* `{status}`\n*Error:* {error_msg}\n*Timestamp:* `{time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}`\n\n_SLA Uptime Monitor (60s poll)_"
        tg_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = json.dumps({"chat_id": TELEGRAM_CHAT_ID, "text": msg, "parse_mode": "Markdown"}).encode('utf-8')
        req = urllib.request.Request(tg_url, data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=5) as resp:
            pass
    except Exception as ex:
        print(f"Failed to send Telegram alert: {ex}", file=sys.stderr)

def log_to_supabase(results, all_healthy):
    try:
        payload_json = json.dumps(results).replace("'", "''")
        status_str = "HEALTHY" if all_healthy else "DEGRADED"
        sql_hb = f"INSERT INTO monitor_heartbeats (device_name, status, payload) VALUES ('openbalancer-fleet-monitor', '{status_str}', '{payload_json}'::jsonb);"
        subprocess.run(["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql_hb], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        
        sql_act = f"INSERT INTO agent_activity_log (agent_name, is_active, prs_data) VALUES ('Antigravity-Heartbeat-FleetMonitor', true, '{payload_json}'::jsonb);"
        subprocess.run(["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql_act], check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception as ex:
        print(f"DB Log Error: {ex}", file=sys.stderr)

def check_endpoint(name, url, expected_statuses, ip=None):
    start = time.time()
    try:
        if ip and url.startswith('https://'):
            cmd = ['curl', '-s', '-k', '-o', '/dev/null', '-w', '%{http_code}', '--resolve', f'{name}:443:{ip}', url, '--max-time', '10']
            res = subprocess.run(cmd, capture_output=True, text=True)
            lat = int((time.time() - start) * 1000)
            code = int(res.stdout.strip()) if res.stdout.strip().isdigit() else 0
            ok = code in expected_statuses
            return {"name": name, "url": url, "status": code, "latency_ms": lat, "ok": ok}
        else:
            ctx = ssl.create_default_context()
            ctx.check_hostname = False
            ctx.verify_mode = ssl.CERT_NONE
            req = urllib.request.Request(url, headers={"User-Agent": "OpenBalancer-Heartbeat/1.0"})
            with urllib.request.urlopen(req, timeout=10, context=ctx) as resp:
                lat = int((time.time() - start) * 1000)
                ok = resp.status in expected_statuses
                return {"name": name, "url": url, "status": resp.status, "latency_ms": lat, "ok": ok}
    except Exception as e:
        lat = int((time.time() - start) * 1000)
        code = getattr(e, 'code', 0)
        ok = code in expected_statuses
        return {"name": name, "url": url, "status": code, "latency_ms": lat, "ok": ok, "error": str(e)}

def run():
    results = {}
    all_healthy = True
    
    for name, url, ip in CLUSTERS:
        res = check_endpoint(name, url, [200, 301, 302, 404], ip)
        results[name] = res
        if not res['ok']:
            all_healthy = False
            send_telegram_alert(name, url, res['status'], res.get('error', 'Bad HTTP status'))
            
    for name, url, exp in LOCAL_SERVICES:
        res = check_endpoint(name, url, exp)
        results[name] = res
        if not res['ok']:
            all_healthy = False
            send_telegram_alert(name, url, res['status'], res.get('error', 'Service Unreachable'))

    log_to_supabase(results, all_healthy)
    print(json.dumps({"timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), "healthy": all_healthy, "checked": len(results), "details": results}, indent=2))

if __name__ == '__main__':
    run()
