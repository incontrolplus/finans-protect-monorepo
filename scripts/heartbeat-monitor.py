#!/usr/bin/env python3
"""
Open Balancer - Fleet Heartbeat Monitor & Self-Healing Auto-Remediation Engine
- Proactively checks fleet endpoints and local Docker/LaunchAgent services.
- Automatically executes self-healing remediation routines on failure.
- Zero-Spam Alert Policy: Deduplicates alerts, sends single consolidated digests,
  and throttles notifications (1hr cooldown) with recovery notices.
"""

import os
import sys
import time
import json
import ssl
import subprocess
import urllib.request
import urllib.error

TELEGRAM_BOT_TOKEN = '8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88'
TELEGRAM_CHAT_ID = '8041248687'
STATE_FILE = os.path.expanduser('~/Library/Logs/openbalancer/fleet_monitor_state.json')
ALERT_COOLDOWN_SECONDS = 3600  # 1 hour cooldown between repeated alerts for ongoing incidents

# Active production gateways & domain endpoints (9 Meta-Cluster Subdomains)
GATEWAY_ENDPOINTS = [
    {
        'name': 'cashflow.openbalancer.com',
        'url': 'https://cashflow.openbalancer.com',
        'expected': [200, 301, 302, 401, 403],
        'remediation': 'restart_control_center'
    },
    {
        'name': 'n8n.openbalancer.com',
        'url': 'https://n8n.openbalancer.com',
        'expected': [200, 301, 302, 401, 403],
        'remediation': 'restart_n8n'
    },
    {
        'name': 'win.openbalancer.com',
        'url': 'https://win.openbalancer.com',
        'expected': [200, 301, 302, 401, 403, 502],
        'remediation': 'restart_windows_vm'
    },
    {
        'name': 'ocr.openbalancer.com',
        'url': 'https://ocr.openbalancer.com',
        'expected': [200, 301, 302, 401, 403, 502],
        'remediation': 'restart_ocr'
    },
    {
        'name': 'finansprotect.com',
        'url': 'https://finansprotect.com',
        'expected': [200, 301, 302],
        'remediation': 'restart_finansprotect'
    },
    {
        'name': 'agents.openbalancer.com',
        'url': 'https://agents.openbalancer.com',
        'expected': [200, 301, 302, 401, 403, 502],
        'remediation': 'restart_openclaw'
    },
    {
        'name': 'vault.openbalancer.com',
        'url': 'https://vault.openbalancer.com',
        'expected': [200, 301, 302, 401, 403, 502],
        'remediation': 'restart_infisical'
    },
    {
        'name': 'db.openbalancer.com',
        'url': 'https://db.openbalancer.com',
        'expected': [200, 301, 302, 401, 403, 502],
        'remediation': 'restart_supabase'
    },
    {
        'name': 'infra.openbalancer.com',
        'url': 'https://infra.openbalancer.com',
        'expected': [200, 301, 302, 401, 403, 502],
        'remediation': 'restart_firecrawl'
    }
]

# Local backend services on macmini-primary
LOCAL_SERVICES = [
    {
        'name': 'local_n8n',
        'url': 'http://100.83.83.8:5679/healthz',
        'expected': [200],
        'remediation': 'restart_n8n'
    },
    {
        'name': 'local_infisical',
        'url': 'http://100.83.83.8:8080/api/status',
        'expected': [200],
        'remediation': 'restart_infisical'
    },
    {
        'name': 'local_supabase_kong',
        'url': 'http://100.83.83.8:8002/',
        'expected': [200, 401, 403],
        'remediation': 'restart_supabase'
    },
    {
        'name': 'local_firecrawl',
        'url': 'http://100.83.83.8:3002/',
        'expected': [200],
        'remediation': 'restart_firecrawl'
    },
    {
        'name': 'local_control_center_ui',
        'url': 'http://100.83.83.8:5001/',
        'expected': [200],
        'remediation': 'restart_control_center'
    },
    {
        'name': 'local_revenue_dashboard',
        'url': 'http://100.83.83.8:3117/',
        'expected': [200],
        'remediation': 'restart_revenue_dashboard'
    },
    {
        'name': 'local_finansprotect_srv',
        'url': 'http://100.83.83.8:8083/',
        'expected': [200],
        'remediation': 'restart_finansprotect'
    }
]

def load_state():
    os.makedirs(os.path.dirname(STATE_FILE), exist_ok=True)
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, 'r') as f:
                return json.load(f)
        except Exception:
            pass
    return {
        'active_incident': False,
        'incident_failures': [],
        'last_alert_timestamp': 0,
        'consecutive_failures': {},
        'auto_healed_count': 0
    }

def save_state(state):
    try:
        with open(STATE_FILE, 'w') as f:
            json.dump(state, f, indent=2)
    except Exception as e:
        print(f"Failed to save state: {e}", file=sys.stderr)

def send_telegram_message(text):
    try:
        tg_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = json.dumps({
            "chat_id": TELEGRAM_CHAT_ID,
            "text": text,
            "parse_mode": "Markdown",
            "disable_web_page_preview": True
        }).encode('utf-8')
        req = urllib.request.Request(tg_url, data=payload, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req, timeout=8) as resp:
            return resp.status == 200
    except Exception as ex:
        print(f"Telegram dispatch error: {ex}", file=sys.stderr)
        return False

def execute_remediation(action_name):
    """Executes automated self-healing workflows based on failure type."""
    print(f"⚙️ Executing Auto-Remediation: {action_name}...")
    try:
        if action_name == 'restart_n8n':
            subprocess.run(["docker", "restart", "n8n-ob"], capture_output=True, timeout=20)
        elif action_name == 'restart_infisical':
            subprocess.run(["docker", "restart", "infisical-standalone"], capture_output=True, timeout=20)
        elif action_name == 'restart_supabase':
            subprocess.run(["docker", "restart", "supabase-kong"], capture_output=True, timeout=20)
        elif action_name == 'restart_firecrawl':
            subprocess.run(["docker", "restart", "firecrawl-api"], capture_output=True, timeout=20)
        elif action_name == 'restart_control_center':
            uid = os.getuid()
            subprocess.run(["launchctl", "kickstart", "-k", f"gui/{uid}/com.openbalancer.control-center"], capture_output=True, timeout=10)
        elif action_name == 'restart_revenue_dashboard':
            uid = os.getuid()
            subprocess.run(["launchctl", "kickstart", "-k", f"gui/{uid}/ai.revenue.dashboard"], capture_output=True, timeout=10)
        elif action_name == 'restart_finansprotect':
            res = subprocess.run(["pgrep", "-f", "http.server 8083"], capture_output=True, text=True)
            if not res.stdout.strip():
                subprocess.Popen(["/opt/homebrew/bin/python3", "-m", "http.server", "8083", "--bind", "0.0.0.0", "--directory", os.path.expanduser("~/Wallestars/dist")],
                                 stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        elif action_name == 'restart_tunnel':
            subprocess.run(["docker", "restart", "n8n-ob-tunnel"], capture_output=True, timeout=20)
        time.sleep(4)  # Warm up time after auto-remediation
        return True
    except Exception as e:
        print(f"Auto-Remediation failed for {action_name}: {e}", file=sys.stderr)
        return False

def check_single_endpoint(name, url, expected_statuses, timeout=6):
    start = time.time()
    try:
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE
        req = urllib.request.Request(url, headers={"User-Agent": "OpenBalancer-SelfHealingMonitor/2.0"})
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
            lat = int((time.time() - start) * 1000)
            ok = resp.status in expected_statuses
            return {"name": name, "url": url, "status": resp.status, "latency_ms": lat, "ok": ok}
    except urllib.error.HTTPError as e:
        lat = int((time.time() - start) * 1000)
        ok = e.code in expected_statuses
        return {"name": name, "url": url, "status": e.code, "latency_ms": lat, "ok": ok, "error": str(e)}
    except Exception as e:
        lat = int((time.time() - start) * 1000)
        return {"name": name, "url": url, "status": 0, "latency_ms": lat, "ok": False, "error": str(e)}

def log_to_supabase(results, all_healthy, auto_healed_events):
    try:
        payload_json = json.dumps({
            "results": results,
            "auto_healed": auto_healed_events
        }).replace("'", "''")
        status_str = "HEALTHY" if all_healthy else "DEGRADED"
        sql_hb = f"INSERT INTO monitor_heartbeats (device_name, status, payload) VALUES ('openbalancer-fleet-monitor', '{status_str}', '{payload_json}'::jsonb);"
        subprocess.run(["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql_hb],
                       check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except Exception:
        pass

def run():
    state = load_state()
    results = {}
    failing_services = []
    auto_healed_events = []
    all_targets = GATEWAY_ENDPOINTS + LOCAL_SERVICES

    # 1. First Pass Health Check
    for target in all_targets:
        name = target['name']
        res = check_single_endpoint(name, target['url'], target['expected'])
        
        # If check failed, attempt auto-remediation before raising alarms
        if not res['ok']:
            remediation_action = target.get('remediation')
            if remediation_action:
                print(f"⚠️ Health check failed for {name} ({res.get('status')}). Triggering auto-remediation: {remediation_action}")
                remediation_ok = execute_remediation(remediation_action)
                
                # Second pass re-test after self-healing
                retest_res = check_single_endpoint(name, target['url'], target['expected'])
                if retest_res['ok']:
                    print(f"✅ Auto-Remediation SUCCEEDED for {name}! Service is healthy.")
                    res = retest_res
                    res['auto_healed'] = True
                    auto_healed_events.append(name)
                    state['auto_healed_count'] = state.get('auto_healed_count', 0) + 1
                else:
                    print(f"❌ Auto-Remediation failed to restore {name}. Status: {retest_res.get('status')}")
                    res = retest_res
            
        results[name] = res
        if not res['ok']:
            failing_services.append(res)

    all_healthy = len(failing_services) == 0
    now = time.time()
    last_alert_time = state.get('last_alert_timestamp', 0)
    time_since_last_alert = now - last_alert_time
    failing_names = [f['name'] for f in failing_services]

    # 2. Smart Notification & Deduplication State Machine
    if all_healthy:
        if state.get('active_incident', False):
            # Recovery notice (Single message when all services are restored)
            recovery_msg = (
                "✅ *[OPEN BALANCER - ALL SYSTEMS OPERATIONAL]*\n\n"
                "All fleet endpoints and backend services are healthy.\n\n"
                f"• *Status:* `100% OPERATIONAL`\n"
                f"• *Services Checked:* `{len(results)}`\n"
                f"• *Resolved At:* `{time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}`\n\n"
                "_Auto-Remediation SLA Engine_"
            )
            send_telegram_message(recovery_msg)
            state['active_incident'] = False
            state['incident_failures'] = []
            state['consecutive_failures'] = {}
    else:
        # Check if an incident alert should be dispatched
        is_new_incident = not state.get('active_incident', False)
        failures_changed = set(failing_names) != set(state.get('incident_failures', []))
        cooldown_expired = time_since_last_alert > ALERT_COOLDOWN_SECONDS

        if is_new_incident or failures_changed or cooldown_expired:
            # Build ONE single consolidated digest (Zero-spam)
            failed_details = "\n".join([
                f"• *{f['name']}*: `{f['status']}` ({f.get('error', 'Unreachable')}) - {f['latency_ms']}ms"
                for f in failing_services
            ])
            auto_healed_note = ""
            if auto_healed_events:
                auto_healed_note = f"\n*Auto-Remediated:* `{', '.join(auto_healed_events)}` (Restored)\n"

            incident_msg = (
                "🚨 *[OPEN BALANCER FLEET INCIDENT]*\n\n"
                f"*Status:* `DEGRADED ({len(failing_services)}/{len(results)} services failing)`\n"
                f"*Timestamp:* `{time.strftime('%Y-%m-%d %H:%M:%S UTC', time.gmtime())}`\n"
                f"{auto_healed_note}\n"
                f"*Failing Components (Auto-Remediation Attempted):*\n{failed_details}\n\n"
                "_Next alert throttled (1hr cooldown). Next check in 60s._"
            )
            send_telegram_message(incident_msg)
            state['last_alert_timestamp'] = now
            state['active_incident'] = True
            state['incident_failures'] = failing_names

    # 3. Telemetry & Supabase Logging
    log_to_supabase(results, all_healthy, auto_healed_events)
    save_state(state)

    output_payload = {
        "timestamp": time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        "healthy": all_healthy,
        "checked": len(results),
        "failed_count": len(failing_services),
        "auto_healed": auto_healed_events,
        "details": results
    }
    print(json.dumps(output_payload, indent=2))

if __name__ == '__main__':
    run()
