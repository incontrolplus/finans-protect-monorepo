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

SUPABASE_REST_URL = os.environ.get("SUPABASE_URL", "http://100.83.83.8:8002")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZW5iYWxhbmNlciIsInJvbGUiOiJzZXJ2aWNlX3JvbGUiLCJpYXQiOjE3MTc5NTI5OTAsImV4cCI6MjAzMzUyODk5MH0.z5uXJq6k4fO6F4WwW8qXJq6k4fO6F4WwW8qXJq6k4fO")

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
    record = {
        "workflow_name": workflow_name,
        "execution_source": execution_source,
        "run_id": resolved_run_id,
        "status": status.upper(),
        "duration_ms": duration_ms,
        "host_node": host_node,
        "error_message": error_message,
        "payload": payload or {}
    }

    # 1. Attempt insertion via Supabase REST API
    try:
        url = f"{SUPABASE_REST_URL}/rest/v1/workflow_executions"
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
        with urllib.request.urlopen(req, timeout=4) as resp:
            if resp.status in [200, 201, 204]:
                print(f"✅ Execution registered via REST: {workflow_name} [{status}] ({resolved_run_id})")
                return True
    except Exception:
        # Fallback to local Docker postgres if on macmini-primary
        try:
            payload_escaped = json.dumps(record['payload']).replace("'", "''")
            err_escaped = (error_message or '').replace("'", "''")
            sql = f"""
            INSERT INTO public.workflow_executions (workflow_name, execution_source, run_id, status, duration_ms, host_node, error_message, payload)
            VALUES ('{workflow_name}', '{execution_source}', '{resolved_run_id}', '{status.upper()}', {duration_ms}, '{host_node}', '{err_escaped}', '{payload_escaped}'::jsonb);
            """
            subprocess.run(["docker", "exec", "supabase-db", "psql", "-U", "postgres", "-d", "postgres", "-c", sql],
                           capture_output=True, timeout=5, check=True)
            print(f"✅ Execution registered via Docker DB fallback: {workflow_name} [{status}]")
            return True
        except Exception:
            pass

    # Save to local spool if DB unreachable
    spool_dir = os.path.expanduser("~/Library/Logs/openbalancer/spool_executions")
    os.makedirs(spool_dir, exist_ok=True)
    spool_file = os.path.join(spool_dir, f"exec_{int(time.time()*1000)}.json")
    try:
        with open(spool_file, "w") as f:
            json.dump(record, f, indent=2)
        print(f"ℹ️ Execution spooled locally: {spool_file}")
        return True
    except Exception as ex:
        print(f"Failed to spool execution: {ex}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Register a workflow execution in Open Balancer Supabase")
    parser.add_argument("--name", "-n", required=True, help="Workflow / Job name")
    parser.add_argument("--source", "-s", default="github_actions", choices=["n8n", "github_actions", "cron", "service_api"], help="Execution source")
    parser.add_argument("--run-id", "-r", default=None, help="Execution or run ID")
    parser.add_argument("--status", choices=["SUCCESS", "FAILED", "RETRYING", "AUTO_REMEDIATED"], default="SUCCESS", help="Status")
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
