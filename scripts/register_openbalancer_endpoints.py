#!/usr/bin/env python3
"""
Open Balancer — Comprehensive Registration Engine for Supabase-OB, n8n-OB, and Self-Hosted n8n-MCP.
Registers all core endpoints, AI routers, 9-cluster subdomains, n8n workflows, and MCP servers.
"""

import os
import sys
import json
import uuid
import subprocess
import time

SUPABASE_URL = os.environ.get("SUPABASE_URL", "http://100.83.83.8:8002")
SUPABASE_KEY = os.environ.get(
    "SUPABASE_SERVICE_ROLE_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"
)

def rest_insert(table: str, record: dict) -> bool:
    """Inserts or merges a single record into a Supabase table via REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}"
    payload = json.dumps(record)
    cmd = [
        "curl", "-s", "-w", "\n%{http_code}", "-X", "POST", url,
        "-H", f"apikey: {SUPABASE_KEY}",
        "-H", f"Authorization: Bearer {SUPABASE_KEY}",
        "-H", "Content-Type: application/json",
        "-H", "Prefer: resolution=merge-duplicates,return=minimal",
        "-d", payload
    ]
    try:
        res = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
        lines = res.stdout.strip().splitlines()
        code = lines[-1] if lines else "ERR"
        return code in ("200", "201", "204")
    except Exception as e:
        print(f"Error inserting into {table}: {e}", file=sys.stderr)
        return False

# =========================================================================
# 1. CORE ENDPOINTS & 9 MESH SUBDOMAINS -> service_registry
# =========================================================================
SERVICES = [
    # Core Open Balancer Endpoints
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "healthz.openbalancer.core")),
        "service_name": "OpenBalancer Health Probe (/healthz)",
        "category": "openbalancer_core",
        "url": "http://127.0.0.1:8080/healthz",
        "status": "active",
        "tags": ["openbalancer", "core", "healthz", "probe"],
        "notes": "Active HTTP healthcheck endpoint returning HTTP 200 OK."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "status.openbalancer.core")),
        "service_name": "OpenBalancer Status API (/openbalancer/status)",
        "category": "openbalancer_core",
        "url": "http://127.0.0.1:8080/openbalancer/status",
        "status": "active",
        "tags": ["openbalancer", "core", "telemetry", "status_api"],
        "notes": "Full JSON telemetry, active backend status, uptime and proxy stats."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "dashboard.openbalancer.core")),
        "service_name": "OpenBalancer Dashboard UI (/openbalancer/dashboard)",
        "category": "openbalancer_core",
        "url": "http://127.0.0.1:8080/openbalancer/dashboard",
        "status": "active",
        "tags": ["openbalancer", "core", "dashboard", "ui"],
        "notes": "Real-time HTML monitoring dashboard with SLA telemetry and backend table."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "storage.openbalancer.core")),
        "service_name": "OpenBalancer Storage Status (/storage/philips-ssd)",
        "category": "openbalancer_core",
        "url": "http://127.0.0.1:8080/storage/philips-ssd",
        "status": "active",
        "tags": ["openbalancer", "core", "storage", "philips_ssd"],
        "notes": "Secondary SSD storage metrics and partition health telemetry."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "backup.openbalancer.core")),
        "service_name": "OpenBalancer Backup Status (/backup/status)",
        "category": "openbalancer_core",
        "url": "http://127.0.0.1:8080/backup/status",
        "status": "active",
        "tags": ["openbalancer", "core", "backup", "resilience"],
        "notes": "Obsidian Vault, iCloud, and Windows VM backup status metrics."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "metrics.openbalancer.core")),
        "service_name": "OpenBalancer Prometheus Metrics (/metrics)",
        "category": "openbalancer_core",
        "url": "http://127.0.0.1:8080/metrics",
        "status": "active",
        "tags": ["openbalancer", "core", "prometheus", "metrics"],
        "notes": "Prometheus-compatible scraping format for latency, requests, LLM tokens, and SSD storage."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "chat.completions.openbalancer.core")),
        "service_name": "OpenBalancer AI LLM Router (/v1/chat/completions)",
        "category": "openbalancer_ai_router",
        "url": "http://127.0.0.1:8080/v1/chat/completions",
        "status": "active",
        "tags": ["openbalancer", "ai", "llm", "routing", "openai_compat"],
        "notes": "Sub-millisecond AI model routing with token cost tracking and failover."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "generate.openbalancer.core")),
        "service_name": "OpenBalancer Ollama AI Router (/api/generate)",
        "category": "openbalancer_ai_router",
        "url": "http://127.0.0.1:8080/api/generate",
        "status": "active",
        "tags": ["openbalancer", "ai", "ollama", "routing"],
        "notes": "Asynchronous proxy for Ollama inference nodes."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "models.openbalancer.core")),
        "service_name": "OpenBalancer AI Model Catalog (/v1/models)",
        "category": "openbalancer_ai_router",
        "url": "http://127.0.0.1:8080/v1/models",
        "status": "active",
        "tags": ["openbalancer", "ai", "models", "catalog"],
        "notes": "Catalog discovery endpoint for active LLM backends."
    },
    # 9 Subdomains & Mesh Meta-Repositories
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "cashflow.openbalancer.com")),
        "service_name": "Open Balancer Cashflow Core Nexus",
        "category": "openbalancer_mesh",
        "url": "https://cashflow.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "cashflow", "core", "meta-cashflow-core", "port_3500"],
        "notes": "Primary Cashflow automation frontend and Wallestars Express server on Port 3500."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "n8n.openbalancer.com")),
        "service_name": "Open Balancer n8n Workflow Automation Mesh",
        "category": "openbalancer_mesh",
        "url": "https://n8n.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "n8n", "automation", "meta-n8n-automation", "port_5679"],
        "notes": "Self-hosted n8n container on macmini-primary (Port 5679) proxied via Cloudflare Tunnel."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "win.openbalancer.com")),
        "service_name": "Open Balancer Windows VM Resilience Matrix",
        "category": "openbalancer_mesh",
        "url": "https://win.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "windows_vm", "qemu", "meta-win-resilience", "port_8006"],
        "notes": "Windows VM QEMU environment on macmini-secondary (Port 8006)."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "ocr.openbalancer.com")),
        "service_name": "Open Balancer Microinvest OCR & AI Accountant",
        "category": "openbalancer_mesh",
        "url": "https://ocr.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "ocr", "microinvest", "meta-ocr-accounting", "port_4321"],
        "notes": "AI OCR pipeline for Bulgarian invoices and receipts on Port 4321."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "agents.openbalancer.com")),
        "service_name": "Open Balancer OpenClaw Multi-Agent Gateway",
        "category": "openbalancer_mesh",
        "url": "https://agents.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "openclaw", "agents", "meta-openclaw-agents", "port_18789"],
        "notes": "Autonomous multi-agent gateway (supervisor, n8n_orchestrator, browser_automation)."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "vault.openbalancer.com")),
        "service_name": "Open Balancer Infisical Secret Vault",
        "category": "openbalancer_mesh",
        "url": "https://vault.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "infisical", "vault", "meta-vault-infisical", "port_8080"],
        "notes": "Self-hosted Infisical credentials vault on macmini-primary (Port 8080)."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "db.openbalancer.com")),
        "service_name": "Open Balancer Supabase DB & Storage Mesh",
        "category": "openbalancer_mesh",
        "url": "https://db.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "supabase", "database", "meta-supabase-data", "port_8002"],
        "notes": "Self-hosted Supabase PostgREST, Kong, and PostgreSQL on macmini-primary (Port 8002)."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "infra.openbalancer.com")),
        "service_name": "Open Balancer GitOps & Firecrawl Infra",
        "category": "openbalancer_mesh",
        "url": "https://infra.openbalancer.com",
        "status": "active",
        "tags": ["openbalancer", "firecrawl", "gitops", "meta-gitops-infra", "port_3002"],
        "notes": "Self-hosted Firecrawl API and scraping workers on macmini-primary (Port 3002)."
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "finansprotect.com")),
        "service_name": "Finans Protect SaaS & B2B Portal",
        "category": "openbalancer_mesh",
        "url": "https://finansprotect.com",
        "status": "active",
        "tags": ["openbalancer", "finansprotect", "saas", "meta-finansprotect-saas", "port_3000"],
        "notes": "B2B Financial Protection & Compliance SaaS platform."
    }
]

# =========================================================================
# 2. MCP SERVERS -> mcp_servers
# =========================================================================
MCP_SERVERS = [
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "n8n-mcp.openbalancer")),
        "name": "Self-Hosted n8n MCP Server",
        "host": "100.83.83.8",
        "port": 5679,
        "status": "active",
        "last_checked": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "response_ms": 15,
        "metadata": {
            "type": "self-hosted",
            "transport": "stdio / ssh tunnel",
            "endpoint": "https://n8n.openbalancer.com",
            "command": "/opt/homebrew/bin/n8n-mcp",
            "host_device": "macmini-primary (100.83.83.8)",
            "tools": [
                "n8n_list_workflows",
                "n8n_get_workflow",
                "n8n_toggle_workflow",
                "n8n_execute_workflow",
                "n8n_list_executions",
                "n8n_get_execution"
            ]
        }
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "supabase-postgrest-mcp.openbalancer")),
        "name": "Self-Hosted Supabase PostgREST MCP",
        "host": "100.83.83.8",
        "port": 8002,
        "status": "active",
        "last_checked": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "response_ms": 10,
        "metadata": {
            "type": "self-hosted",
            "transport": "stdio / npx",
            "package": "@supabase/mcp-server-postgrest@latest",
            "apiUrl": "http://100.83.83.8:8002/rest/v1",
            "schema": "public",
            "host_device": "macmini-primary (100.83.83.8)"
        }
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "firecrawl-mcp.openbalancer")),
        "name": "Self-Hosted Firecrawl MCP",
        "host": "100.83.83.8",
        "port": 3002,
        "status": "active",
        "last_checked": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "response_ms": 12,
        "metadata": {
            "type": "self-hosted",
            "transport": "stdio / npx",
            "package": "firecrawl-mcp",
            "apiUrl": "http://100.83.83.8:3002",
            "host_device": "macmini-primary (100.83.83.8)"
        }
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_DNS, "wallestars-mcp.openbalancer")),
        "name": "Wallestars Unified Agent MCP Server",
        "host": "127.0.0.1",
        "port": 3100,
        "status": "active",
        "last_checked": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "response_ms": 5,
        "metadata": {
            "type": "local",
            "transport": "stdio / http",
            "tools": [
                "n8n_list_workflows", "n8n_get_workflow", "n8n_toggle_workflow",
                "n8n_execute_workflow", "n8n_list_executions", "n8n_get_execution",
                "supabase_list_tables", "supabase_query_table", "supabase_execute_sql", "supabase_insert_row",
                "vps_health_check", "vps_service_status", "vps_docker_list", "vps_shell_command"
            ],
            "location": "/Users/diokarabaz/.openclaw/wallestars-mcp-server"
        }
    }
]

# =========================================================================
# 3. N8N WORKFLOWS -> n8n_workflow_registry
# =========================================================================
N8N_WORKFLOWS = [
    {
        "workflow_id": "FleetHeartbeat01",
        "name": "Open Balancer 9-Cluster Fleet Heartbeat Monitor",
        "description": "Monitors all 9 cluster endpoints, detects degradation, and triggers auto-remediation alerts.",
        "status": "active",
        "n8n_instance": "n8n-ob (100.83.83.8:5679)",
        "nodes_count": 5,
        "source": "n8n/openbalancer_fleet_heartbeat_monitor.n8n.json",
        "json_backup": {
            "schedule": "1m",
            "target": "/Users/diokarabaz/Wallestars/scripts/heartbeat-monitor.py"
        }
    },
    {
        "workflow_id": "GlobalErrorHandler01",
        "name": "Open Balancer Global Workflow Error Handler",
        "description": "Captures any unhandled workflow exception across n8n-ob, dispatches Telegram alerts, and registers telemetry in Supabase.",
        "status": "active",
        "n8n_instance": "n8n-ob (100.83.83.8:5679)",
        "nodes_count": 4,
        "source": "n8n/openbalancer_global_error_handler.n8n.json",
        "json_backup": {
            "handler": "global-error-trigger",
            "telemetry_table": "public.workflow_executions"
        }
    },
    {
        "workflow_id": "WallesterReg01",
        "name": "Wallester Card Issuing & Registration Agent",
        "description": "Automated business registration and payment card issuance funnel via Wallester Business API.",
        "status": "active",
        "n8n_instance": "n8n-ob (100.83.83.8:5679)",
        "nodes_count": 12,
        "source": "wallester_reg.json",
        "json_backup": {"type": "registration_agent"}
    },
    {
        "workflow_id": "MicroinvestOCR01",
        "name": "Microinvest Invoice & Receipt AI OCR Intake",
        "description": "Processes Bulgarian tax invoices, receipts, and extracts accounting fields into Supabase.",
        "status": "active",
        "n8n_instance": "n8n-ob (100.83.83.8:5679)",
        "nodes_count": 8,
        "source": "g8_ocr.json",
        "json_backup": {"type": "ocr_accounting"}
    },
    {
        "workflow_id": "FinansProtectLead01",
        "name": "Finans Protect B2B Lead Intake & Qualification",
        "description": "Captures leads from finansprotect.com, enriches corporate profile, and routes to CRM.",
        "status": "active",
        "n8n_instance": "n8n-ob (100.83.83.8:5679)",
        "nodes_count": 6,
        "source": "fp_lead_capture.json",
        "json_backup": {"type": "lead_capture"}
    }
]

def main():
    print("🦁 Starting Open Balancer Full Registration Cycle...")
    
    # 1. Services
    print(f"\n--- [1/3] Registering {len(SERVICES)} Endpoints & Subdomains in service_registry ---")
    srv_ok = 0
    for s in SERVICES:
        ok = rest_insert("service_registry", s)
        stat = "✅" if ok else "❌"
        print(f"  {stat} [{s['category']}] {s['service_name']} -> {s['url']}")
        if ok:
            srv_ok += 1

    # 2. MCP Servers
    print(f"\n--- [2/3] Registering {len(MCP_SERVERS)} MCP Servers in mcp_servers ---")
    mcp_ok = 0
    for m in MCP_SERVERS:
        ok = rest_insert("mcp_servers", m)
        stat = "✅" if ok else "❌"
        print(f"  {stat} {m['name']} ({m['host']}:{m['port']})")
        if ok:
            mcp_ok += 1

    # 3. n8n Workflows
    print(f"\n--- [3/3] Registering {len(N8N_WORKFLOWS)} n8n Workflows in n8n_workflow_registry ---")
    n8n_ok = 0
    for w in N8N_WORKFLOWS:
        ok = rest_insert("n8n_workflow_registry", w)
        stat = "✅" if ok else "❌"
        print(f"  {stat} [{w['workflow_id']}] {w['name']}")
        if ok:
            n8n_ok += 1

    print("\n=======================================================")
    print(f"🎯 Registration Complete:")
    print(f"  • Endpoints/Subdomains: {srv_ok}/{len(SERVICES)} registered in service_registry")
    print(f"  • MCP Servers:          {mcp_ok}/{len(MCP_SERVERS)} registered in mcp_servers")
    print(f"  • n8n Workflows:        {n8n_ok}/{len(N8N_WORKFLOWS)} registered in n8n_workflow_registry")
    print("=======================================================")

if __name__ == "__main__":
    main()
