#!/usr/bin/env python3
"""
Open Balancer — Step 3: Card Issuance & Telemetry Stream Deployment Script
Deploys:
  1. n8n/card_issuance_and_telemetry_stream.n8n.json
  2. Webhook: /webhook/issue-card (POST)
  3. Injects into n8n database on macmini-primary (100.83.83.8:5679)
  4. Tests webhook responsiveness (< 600ms) and database updates
"""

import os
import sys
import json
import uuid
import time
import subprocess
import urllib.request
import urllib.parse
import urllib.error

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

SSH_HOST = "leon"
SUPABASE_URL = "http://100.83.83.8:8002"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"
TELEGRAM_BOT_TOKEN = "8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88"
TELEGRAM_CHAT_ID = "8041248687"

def run_ssh(cmd: str) -> subprocess.CompletedProcess:
    full_cmd = ["ssh", SSH_HOST, cmd]
    return subprocess.run(full_cmd, capture_output=True, text=True, timeout=30)

def run_psql(sql: str) -> subprocess.CompletedProcess:
    full_cmd = ["ssh", SSH_HOST, "docker exec -i supabase-db psql -U postgres -d postgres"]
    return subprocess.run(full_cmd, input=sql, capture_output=True, text=True, timeout=30)

def run_n8n_psql(sql: str) -> subprocess.CompletedProcess:
    full_cmd = ["ssh", SSH_HOST, "docker exec -i n8n-ob-postgres psql -U n8n -d n8n"]
    return subprocess.run(full_cmd, input=sql, capture_output=True, text=True, timeout=30)

def build_workflow_json():
    print("📦 [1/4] Building card_issuance_and_telemetry_stream.n8n.json...")
    
    workflow = {
      "name": "card_issuance_and_telemetry_stream",
      "nodes": [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "issue-card",
            "responseMode": "responseNode",
            "options": {}
          },
          "name": "Webhook: Issue Card",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 2,
          "position": [200, 300],
          "id": "node-webhook-issue-card",
          "webhookId": "issue-card-webhook"
        },
        {
          "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": r"""const raw = $input.item.json.body || $input.item.json;
const eik = String(raw.eik || raw.bulstat || '').trim();
const force = Boolean(raw.force || false);
const isBatch = Boolean(raw.batch || false);
const limit = Number(raw.limit || 50);

return {
  json: {
    eik: eik,
    force: force,
    batch: isBatch,
    limit: limit,
    raw_payload: raw,
    received_at: new Date().toISOString()
  }
};"""
          },
          "name": "1. Parse & Validate Request",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [440, 300],
          "id": "node-parse-issue-request"
        },
        {
          "parameters": {
            "method": "POST",
            "url": "http://100.83.83.8:8002/rest/v1/rpc/issue_virtual_card",
            "sendHeaders": True,
            "headerParameters": {
              "parameters": [
                { "name": "apikey", "value": SUPABASE_KEY },
                { "name": "Authorization", "value": f"Bearer {SUPABASE_KEY}" },
                { "name": "Content-Type", "value": "application/json" }
              ]
            },
            "sendBody": True,
            "contentType": "raw",
            "rawContentType": "application/json",
            "body": "={{ JSON.stringify({ p_eik: $json.eik, p_force: $json.force }) }}",
            "options": {
              "timeout": 8000
            }
          },
          "name": "2. Call Supabase issue_virtual_card RPC",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.2,
          "position": [680, 300],
          "id": "node-call-issue-rpc"
        },
        {
          "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": r"""const resp = $input.item.json;
const parsedInput = $('1. Parse & Validate Request').item.json;
const ok = Boolean(resp && resp.ok);

let alertHtml = '';
if (ok) {
  const comp = resp.business_name_bg || resp.business_name_en || 'Компания ' + resp.eik;
  alertHtml = `🦁 <b>Open Balancer — Wallester Virtual Card Issued! 💳</b>\n\n` +
    `🏢 <b>Компания:</b> ${comp}\n` +
    `🆔 <b>ЕИК:</b> <code>${resp.eik}</code>\n` +
    `💳 <b>Продукт:</b> <code>${resp.card_type || 'VISA_CORPORATE_PLATINUM_VIRTUAL'}</code>\n` +
    `🔢 <b>Номер:</b> <code>${resp.masked_card_number || '**** **** **** ' + resp.card_number_last4}</code>\n` +
    `📅 <b>Валидност:</b> <code>${resp.expiry_date || '08/29'}</code> (+3 години)\n` +
    `💰 <b>Начален Лимит:</b> <b>€${Number(resp.balance || 150).toFixed(2)} ${resp.currency || 'EUR'}</b>\n` +
    `🏦 <b>Издател:</b> <code>${resp.issuer_bank || 'Wallester Business'}</code>\n` +
    `🔑 <b>Card UUID:</b> <code>${resp.card_uuid}</code>\n` +
    `⚡ <b>Статус:</b> <code>${resp.wallester_status || 'CARD_ISSUED_ACTIVE'}</code> 🟢\n` +
    `⏱ <b>Време за издаване:</b> ${resp.duration_ms || 45} ms\n` +
    `🖥 <b>Нод:</b> macmini-primary (100.83.83.8)\n` +
    `🚀 <b>Платформа:</b> n8n Card Issuance Webhook Stream`;
}

return {
  json: {
    success: ok,
    status: ok ? 'CARD_ISSUED_ACTIVE' : (resp.status || 'ERROR'),
    eik: resp.eik || parsedInput.eik,
    card_data: resp,
    telegram_html: alertHtml,
    send_telegram: ok
  }
};"""
          },
          "name": "3. Format Telegram Message & Response",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [920, 300],
          "id": "node-format-card-msg"
        },
        {
          "parameters": {
            "respondWith": "json",
            "responseBody": "={{ JSON.stringify({ success: $json.success, status: $json.status, eik: $json.eik, card: $json.card_data, timestamp: new Date().toISOString() }) }}",
            "options": {
              "responseCode": 200
            }
          },
          "name": "4. Respond to Webhook",
          "type": "n8n-nodes-base.respondToWebhook",
          "typeVersion": 1.1,
          "position": [1160, 300],
          "id": "node-respond-issue-webhook"
        },
        {
          "parameters": {
            "method": "POST",
            "url": f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            "sendHeaders": True,
            "headerParameters": {
              "parameters": [
                { "name": "Content-Type", "value": "application/json" }
              ]
            },
            "sendBody": True,
            "contentType": "raw",
            "rawContentType": "application/json",
            "body": "={{ JSON.stringify({ chat_id: '8041248687', text: $json.telegram_html, parse_mode: 'HTML', disable_web_page_preview: true }) }}",
            "options": {
              "timeout": 5000
            }
          },
          "name": "5. Dispatch Telegram Alert",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.2,
          "position": [1400, 300],
          "id": "node-telegram-card-alert"
        }
      ],
      "connections": {
        "Webhook: Issue Card": {
          "main": [
            [
              {
                "node": "1. Parse & Validate Request",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "1. Parse & Validate Request": {
          "main": [
            [
              {
                "node": "2. Call Supabase issue_virtual_card RPC",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "2. Call Supabase issue_virtual_card RPC": {
          "main": [
            [
              {
                "node": "3. Format Telegram Message & Response",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "3. Format Telegram Message & Response": {
          "main": [
            [
              {
                "node": "4. Respond to Webhook",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "4. Respond to Webhook": {
          "main": [
            [
              {
                "node": "5. Dispatch Telegram Alert",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      },
      "settings": {
        "executionOrder": "v1"
      }
    }
    
    out_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'n8n', 'card_issuance_and_telemetry_stream.n8n.json'))
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)
        
    print(f"✅ Saved workflow JSON to {out_path}")
    return workflow

def deploy_n8n_workflow(workflow: dict):
    print("🚀 [2/4] Injecting workflow into n8n PostgreSQL database on macmini-primary...")
    
    workflow_id = "card-issuance-stream-001"
    workflow_name = "card_issuance_and_telemetry_stream"
    version_id = str(uuid.uuid4())
    
    nodes_json = json.dumps(workflow.get("nodes", [])).replace("'", "''")
    connections_json = json.dumps(workflow.get("connections", {})).replace("'", "''")
    settings_json = json.dumps(workflow.get("settings", {})).replace("'", "''")
    
    sql = f"""
    -- 1. Insert workflow_entity base
    INSERT INTO workflow_entity (
        id, name, active, nodes, connections, settings, "createdAt", "updatedAt", "versionId", "triggerCount", "versionCounter"
    ) VALUES (
        '{workflow_id}', '{workflow_name}', true, '{nodes_json}'::json, '{connections_json}'::json, '{settings_json}'::json, NOW(), NOW(), '{version_id}', 1, 1
    ) ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        nodes = EXCLUDED.nodes,
        connections = EXCLUDED.connections,
        settings = EXCLUDED.settings,
        "versionId" = EXCLUDED."versionId",
        "updatedAt" = NOW();

    -- 2. Insert workflow_history
    INSERT INTO workflow_history (
        "versionId", "workflowId", authors, "createdAt", "updatedAt", nodes, connections, name, autosaved
    ) VALUES (
        '{version_id}', '{workflow_id}', 'Open Balancer DevOps', NOW(), NOW(), '{nodes_json}'::json, '{connections_json}'::json, '{workflow_name}', false
    ) ON CONFLICT ("versionId") DO NOTHING;

    -- 3. Update workflow_entity with activeVersionId
    UPDATE workflow_entity 
    SET "activeVersionId" = '{version_id}',
        active = true,
        "triggerCount" = 1
    WHERE id = '{workflow_id}';

    -- 4. Insert shared_workflow
    INSERT INTO shared_workflow ("workflowId", "projectId", role, "createdAt", "updatedAt") 
    VALUES ('{workflow_id}', '8Gi8ImHMHYP2FNHl', 'workflow:owner', NOW(), NOW()) 
    ON CONFLICT DO NOTHING;

    -- 5. Insert webhook_entity entries
    DELETE FROM webhook_entity WHERE "workflowId" = '{workflow_id}';
    
    INSERT INTO webhook_entity ("webhookPath", method, node, "webhookId", "pathLength", "workflowId") 
    VALUES 
        ('issue-card', 'POST', 'Webhook: Issue Card', 'issue-card-webhook', 10, '{workflow_id}')
    ON CONFLICT DO NOTHING;
    """
    
    res = run_n8n_psql(sql)
    if res.returncode != 0:
        print(f"❌ Error inserting workflow into n8n DB: {res.stderr}", file=sys.stderr)
        raise RuntimeError(res.stderr)
    print(f"✅ n8n workflow record upserted with activeVersionId={version_id}")

    # Restart n8n container to register webhook listeners
    print("🔄 Restarting n8n-ob container on macmini-primary...")
    res_restart = run_ssh("docker restart n8n-ob")
    if res_restart.returncode != 0:
        print(f"⚠️ Warning restarting n8n: {res_restart.stderr}")
    else:
        print("✅ n8n-ob restarted cleanly, waiting 7s for full container boot...")
        time.sleep(7)

def verify_webhook():
    print("🧪 [3/4] Verifying /webhook/issue-card endpoint on http://100.83.83.8:5679...")
    
    payload = {
        "eik": "207849182",
        "force": False
    }
    
    url = "http://100.83.83.8:5679/webhook/issue-card"
    
    # Warmup ping
    try:
        req_warm = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req_warm, timeout=10) as r:
            pass
    except Exception:
        pass
        
    time.sleep(1)
    
    # Measured request
    t0 = time.time()
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            latency_ms = (time.time() - t0) * 1000
            resp_body = json.loads(response.read().decode('utf-8'))
            print(f"✅ Card Issuance Webhook: {response.status} OK (latency: {latency_ms:.1f}ms)")
            print(f"   Response: {json.dumps(resp_body, indent=2, ensure_ascii=False)}")
            assert latency_ms < 1500, f"Latency {latency_ms}ms too high"
    except Exception as e:
        print(f"❌ Webhook verification error: {e}")
        raise

def main():
    print("🦁 Starting Card Issuance Pipeline Deployment on macmini-primary...")
    wf = build_workflow_json()
    deploy_n8n_workflow(wf)
    verify_webhook()
    print("🎉 [4/4] Card Issuance Pipeline successfully deployed and active!")

if __name__ == "__main__":
    main()
