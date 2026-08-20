#!/usr/bin/env python3
"""
Open Balancer — Unified Execution & Workflow Registration Engine
Registers every workflow execution (from n8n, GitHub Actions, cron, or API services)
into Supabase (supabase-ob) table `public.workflow_executions`.
"""

import os
import sys
import json
import time
import argparse
import subprocess
import urllib.request
import urllib.error

DEFAULT_SUPABASE_URL = "http://100.83.83.8:8002"
DEFAULT_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"

SUPABASE_REST_URL = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL") or DEFAULT_SUPABASE_URL
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY") or os.environ.get("SUPABASE_ANON_KEY") or DEFAULT_SERVICE_ROLE_KEY

def register_execution(workflow_name: str,
                       execution_source: str = 'github_actions',
                       run_id: str = None,
                       status: str = 'SUCCESS',
                       duration_ms: int = 0,
                       host_node: str = None,
                       error_message: str = None,
                       payload: dict = None) -> bool:
    """Registers an execution event in Supabase table `public.workflow_executions`."""
    if host_node is None:
        try:
            import socket
            host_node = socket.gethostname()
        except Exception:
            host_node = 'openbalancer-node'

    resolved_run_id = run_id or f"run-{int(time.time()*1000)}"
    normalized_status = status.strip().upper()
    
    record = {
        "workflow_name": workflow_name,
        "execution_source": execution_source,
        "run_id": resolved_run_id,
        "status": normalized_status,
        "duration_ms": duration_ms or 0,
        "host_node": host_node,
        "error_message": error_message,
        "payload": payload or {}
    }

    # 1. Attempt insertion via Supabase REST API
    try:
        url = f"{SUPABASE_REST_URL.rstrip('/')}/rest/v1/workflow_executions"
        data = json.dumps(record).encode('utf-8')
        req = urllib.request.Request(
            url,
            data=data,
            headers={
                "apikey": SUPABASE_KEY,
                "Authorization": f"Bearer {SUPABASE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal"
            }
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            if resp.status in [200, 201, 204]:
                print(f"✅ Telemetry successfully registered in Supabase: {workflow_name} [{normalized_status}] (run_id: {resolved_run_id})")
                return True
    except Exception as rest_err:
        print(f"⚠️ Supabase REST dispatch note: {rest_err}", file=sys.stderr)
        # 2. Fallback to local Docker postgres if running on macmini-primary / local host
        try:
            payload_escaped = json.dumps(record['payload']).replace("'", "''")
            err_escaped = (error_message or '').replace("'", "''")
            sql = f"""
            INSERT INTO public.workflow_executions (workflow_name, execution_source, run_id, status, duration_ms, host_node, error_message, payload)
            VALUES ('{workflow_name}', '{execution_source}', '{resolved_run_id}', '{normalized_status}', {duration_ms}, '{host_node}', '{err_escaped}', '{payload_escaped}'::jsonb);
            """
            subprocess.run(["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql],
                           capture_output=True, timeout=5, check=True)
            print(f"✅ Execution registered via Docker DB fallback: {workflow_name} [{normalized_status}]")
            return True
        except Exception:
            pass

    # 3. Save to local spool if REST / DB are currently unreachable
    spool_dirs = [
        os.path.expanduser("~/Library/Logs/openbalancer/spool_executions"),
        "/tmp/openbalancer_spool_executions"
    ]
    spooled = False
    for s_dir in spool_dirs:
        try:
            os.makedirs(s_dir, exist_ok=True)
            spool_file = os.path.join(s_dir, f"exec_{int(time.time()*1000)}_{normalized_status}.json")
            with open(spool_file, "w") as f:
                json.dump(record, f, indent=2)
            print(f"ℹ️ Execution spooled locally: {spool_file}")
            spooled = True
            break
        except Exception:
            continue

    return spooled or True

def main():
    parser = argparse.ArgumentParser(description="Register a workflow execution in Open Balancer Supabase")
    parser.add_argument("--name", "-n", required=True, help="Workflow / Job name")
    parser.add_argument("--source", "-s", default="github_actions", help="Execution source")
    parser.add_argument("--run-id", "-r", default=None, help="Execution or run ID")
    parser.add_argument("--status", default="SUCCESS", help="Status (RUNNING, SUCCESS, FAILED, etc.)")
    parser.add_argument("--duration", "-d", type=int, default=0, help="Duration in ms")
    parser.add_argument("--host", default=None, help="Host node name")
    parser.add_argument("--error", "-e", default=None, help="Error message if failed")
    parser.add_argument("--payload", "-p", default="{}", help="JSON payload string")

    args = parser.parse_args()
    try:
        payload_dict = json.loads(args.payload)
    except Exception:
        payload_dict = {"raw": args.payload}

    success = register_execution(
        workflow_name=args.name,
        execution_source=args.source,
        run_id=args.run_id,
        status=args.status,
        duration_ms=args.duration,
        host_node=args.host,
        error_message=args.error,
        payload=payload_dict
    )
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
