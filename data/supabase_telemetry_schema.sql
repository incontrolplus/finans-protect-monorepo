-- Open Balancer - Unified SLA, Device Heartbeat & Workflow Telemetry Schema (v2)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Device & Fleet Heartbeats
CREATE TABLE IF NOT EXISTS public.monitor_heartbeats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_name text NOT NULL,
  status text NOT NULL DEFAULT 'HEALTHY',
  cpu_pct numeric,
  mem_pct numeric,
  disk_free_gb numeric,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monitor_heartbeats_device ON public.monitor_heartbeats(device_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_monitor_heartbeats_status ON public.monitor_heartbeats(status);

-- 2. Unified Workflow & Pipeline Executions (n8n, GitHub Actions, Cron, API)
CREATE TABLE IF NOT EXISTS public.workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text NOT NULL,
  execution_source text NOT NULL, -- 'n8n', 'github_actions', 'cron', 'service_api'
  run_id text,
  status text NOT NULL DEFAULT 'SUCCESS', -- 'SUCCESS', 'FAILED', 'RETRYING', 'AUTO_REMEDIATED'
  duration_ms integer DEFAULT 0,
  host_node text NOT NULL DEFAULT 'dios-macbook-air',
  error_message text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_name ON public.workflow_executions(workflow_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_source ON public.workflow_executions(execution_source, status);

-- 3. Service Audit Log
CREATE TABLE IF NOT EXISTS public.service_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name text NOT NULL,
  action text NOT NULL, -- 'START', 'STOP', 'RESTART', 'RECOVERY', 'HEALTH_CHECK'
  status text NOT NULL, -- 'OK', 'FAIL', 'WARNING'
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  host_node text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_service_audit_log_svc ON public.service_audit_log(service_name, created_at DESC);

-- 4. Agent Activity Log
CREATE TABLE IF NOT EXISTS public.agent_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  prs_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_activity_agent ON public.agent_activity_log(agent_name, created_at DESC);
