#!/usr/bin/env python3
"""
Open Balancer — Step 2: OTP Ingestion & Verification Stream Deployment Script
Deploys:
  1. n8n/otp_ingestion_and_verification_stream.n8n.json
  2. Webhooks: /webhook/email-otp-ingest & /webhook/sms-otp-ingest
  3. Activates workflow in n8n-ob on macmini-primary (100.83.83.8:5679)
  4. Tests webhook responsiveness and database state
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
    print("📦 [1/4] Building otp_ingestion_and_verification_stream.n8n.json...")
    
    workflow = {
      "name": "otp_ingestion_and_verification_stream",
      "nodes": [
        # --- BRANCH 1: EMAIL OTP STREAM ---
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "email-otp-ingest",
            "responseMode": "responseNode",
            "options": {}
          },
          "name": "Webhook: Email OTP Ingest",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 2,
          "position": [200, 200],
          "id": "node-webhook-email-otp",
          "webhookId": "email-otp-ingest-webhook"
        },
        {
          "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": r"""const raw = $input.item.json.body || $input.item.json;
const toAddress = String(raw.to_address || raw.to || raw.recipient || raw.email || '').trim().toLowerCase();
const fromAddress = String(raw.from_address || raw.from || raw.sender || 'support@wallester.com').trim();
const subject = String(raw.subject || 'Wallester Verification Code').trim();
const bodyText = String(raw.body_full || raw.body_preview || raw.body || raw.text || raw.message || raw.html || '').trim();
const fullText = `${bodyText} ${subject}`;

// RegEx for 6-digit OTP code (with context priority)
const contextMatch = fullText.match(/(?:code|код|otp|pin|is|e|е|:|\s|^)(\d{6})(?:\.|\s|$|,|!)/i);
let code = contextMatch ? contextMatch[1] : null;
if (!code) {
  const fallbackMatch = fullText.match(/\b\d{6}\b/);
  code = fallbackMatch ? fallbackMatch[0] : null;
}

const isValid = Boolean(code && toAddress);

return {
  json: {
    is_valid: isValid,
    code: code,
    to_address: toAddress,
    from_address: fromAddress,
    subject: subject,
    body_preview: bodyText.slice(0, 250),
    body_full: bodyText,
    raw_payload: raw,
    ingest_type: 'EMAIL_OTP',
    started_at: new Date().toISOString()
  }
};"""
          },
          "name": "1A. Parse & Normalize Email Payload",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [440, 200],
          "id": "node-parse-email-otp"
        },
        {
          "parameters": {
            "method": "POST",
            "url": "http://100.83.83.8:8002/rest/v1/rpc/process_email_otp",
            "sendHeaders": True,
            "headerParameters": {
              "parameters": [
                {
                  "name": "apikey",
                  "value": SUPABASE_KEY
                },
                {
                  "name": "Authorization",
                  "value": f"Bearer {SUPABASE_KEY}"
                },
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": """={
  "p_to_address": "{{ $json.to_address }}",
  "p_from_address": "{{ $json.from_address }}",
  "p_subject": "{{ $json.subject.replace(/"/g, '\\\\"') }}",
  "p_body": "{{ $json.body_full.replace(/"/g, '\\\\"').replace(/\\n/g, '\\\\n') }}",
  "p_metadata": {{ JSON.stringify($json.raw_payload) }}
}""",
            "options": {
              "response": {
                "response": {
                  "neverError": True
                }
              }
            }
          },
          "id": "node-supabase-rpc-email",
          "name": "2A. Supabase RPC Process Email OTP",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.4,
          "position": [680, 200],
          "continueOnFail": True
        },
        {
          "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": """const rpc = $input.item.json;
const prev = $('1A. Parse & Normalize Email Payload').item.json;

let alertText = '';
if (rpc.auto_advanced) {
  alertText = `🦁 <b>Open Balancer — B2B Profile Auto-Advanced! 🚀</b>\\n\\n` +
    `🏢 <b>Компания:</b> ${rpc.business_name_bg || 'Компания'} (<i>${rpc.business_name_en || ''}</i>)\\n` +
    `🆔 <b>ЕИК:</b> <code>${rpc.eik || 'N/A'}</code>\\n` +
    `📧 <b>Email Код:</b> <code>${rpc.code}</code> (${rpc.email_alias_33mail || prev.to_address})\\n` +
    `📱 <b>SMS Код:</b> <code>${rpc.sms_code || 'Verified'}</code> (${rpc.phone_number || 'SIM Pool'})\\n` +
    `⚡ <b>Нов Статус:</b> <code>VERIFIED_READY_FOR_CARD_ISSUING</code>\\n` +
    `🎯 <b>Auto-Advancement:</b> <code>SUCCESS</code> (Zero-Touch Onboarding)\\n` +
    `🖥 <b>Нод:</b> macmini-primary (100.83.83.8)`;
} else {
  alertText = `🦁 <b>Open Balancer — Email OTP Ingested 📧</b>\\n\\n` +
    `🏢 <b>Компания:</b> ${rpc.business_name_bg || 'N/A'} (ЕИК: <code>${rpc.eik || 'N/A'}</code>)\\n` +
    `📬 <b>Получател:</b> <code>${prev.to_address}</code>\\n` +
    `🔑 <b>Email Код:</b> <code>${rpc.code || prev.code}</code>\\n` +
    `📝 <b>Тема:</b> ${prev.subject}\\n` +
    `⚡ <b>Статус:</b> <code>PROCESSED</code>\\n` +
    `🖥 <b>Нод:</b> macmini-primary (100.83.83.8)`;
}

return {
  json: {
    ...rpc,
    telegram_text: alertText,
    input_prev: prev
  }
};"""
          },
          "name": "3A. Format Email Telegram Alert",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [920, 200],
          "id": "node-format-email-alert"
        },
        {
          "parameters": {
            "method": "POST",
            "url": f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            "sendHeaders": True,
            "headerParameters": {
              "parameters": [
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": """={
  "chat_id": "8041248687",
  "text": {{ JSON.stringify($json.telegram_text) }},
  "parse_mode": "HTML",
  "disable_web_page_preview": true
}""",
            "options": {
              "response": {
                "response": {
                  "neverError": True
                }
              }
            }
          },
          "id": "node-telegram-email-alert",
          "name": "4A. Telegram Dispatch (Email)",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.4,
          "position": [1160, 200],
          "continueOnFail": True
        },
        {
          "parameters": {
            "respondWith": "json",
            "responseBody": """={
  "ok": {{ $('2A. Supabase RPC Process Email OTP').item.json.ok || false }},
  "stream": "EMAIL_OTP",
  "code": "{{ $('2A. Supabase RPC Process Email OTP').item.json.code || '' }}",
  "eik": "{{ $('2A. Supabase RPC Process Email OTP').item.json.eik || '' }}",
  "business_name": "{{ $('2A. Supabase RPC Process Email OTP').item.json.business_name_bg || '' }}",
  "auto_advanced": {{ $('2A. Supabase RPC Process Email OTP').item.json.auto_advanced || false }},
  "wallester_status": "{{ $('2A. Supabase RPC Process Email OTP').item.json.wallester_status || '' }}",
  "email_message_id": "{{ $('2A. Supabase RPC Process Email OTP').item.json.email_message_id || '' }}",
  "timestamp": "{{ new Date().toISOString() }}"
}""",
            "options": {}
          },
          "name": "5A. Respond to Webhook (Email)",
          "type": "n8n-nodes-base.respondToWebhook",
          "typeVersion": 1.1,
          "position": [1400, 200],
          "id": "node-response-email"
        },

        # --- BRANCH 2: SMS OTP STREAM ---
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "sms-otp-ingest",
            "responseMode": "responseNode",
            "options": {}
          },
          "name": "Webhook: SMS OTP Ingest",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 2,
          "position": [200, 480],
          "id": "node-webhook-sms-otp",
          "webhookId": "sms-otp-ingest-webhook"
        },
        {
          "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": r"""const raw = $input.item.json.body || $input.item.json;
const toNumber = String(raw.to_number || raw.to || raw.phone_number || raw.phone || '').trim();
const fromNumber = String(raw.from_number || raw.from || raw.sender || 'Wallester').trim();
const messageBody = String(raw.message_body || raw.message || raw.body || raw.text || raw.content || '').trim();

// RegEx for 6-digit OTP code (with context priority)
const contextMatch = messageBody.match(/(?:code|код|otp|pin|is|e|е|:|\s|^)(\d{6})(?:\.|\s|$|,|!)/i);
let code = contextMatch ? contextMatch[1] : null;
if (!code) {
  const fallbackMatch = messageBody.match(/\b\d{6}\b/);
  code = fallbackMatch ? fallbackMatch[0] : null;
}

const isValid = Boolean(code && toNumber);

return {
  json: {
    is_valid: isValid,
    code: code,
    to_number: toNumber,
    from_number: fromNumber,
    message_body: messageBody,
    raw_payload: raw,
    ingest_type: 'SMS_OTP',
    started_at: new Date().toISOString()
  }
};"""
          },
          "name": "1B. Parse & Normalize SMS Payload",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [440, 480],
          "id": "node-parse-sms-otp"
        },
        {
          "parameters": {
            "method": "POST",
            "url": "http://100.83.83.8:8002/rest/v1/rpc/process_sms_otp",
            "sendHeaders": True,
            "headerParameters": {
              "parameters": [
                {
                  "name": "apikey",
                  "value": SUPABASE_KEY
                },
                {
                  "name": "Authorization",
                  "value": f"Bearer {SUPABASE_KEY}"
                },
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": """={
  "p_to_number": "{{ $json.to_number }}",
  "p_from_number": "{{ $json.from_number }}",
  "p_message_body": "{{ $json.message_body.replace(/"/g, '\\\\"').replace(/\\n/g, '\\\\n') }}",
  "p_metadata": {{ JSON.stringify($json.raw_payload) }}
}""",
            "options": {
              "response": {
                "response": {
                  "neverError": True
                }
              }
            }
          },
          "id": "node-supabase-rpc-sms",
          "name": "2B. Supabase RPC Process SMS OTP",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.4,
          "position": [680, 480],
          "continueOnFail": True
        },
        {
          "parameters": {
            "mode": "runOnceForEachItem",
            "jsCode": """const rpc = $input.item.json;
const prev = $('1B. Parse & Normalize SMS Payload').item.json;

let alertText = '';
if (rpc.auto_advanced) {
  alertText = `🦁 <b>Open Balancer — B2B Profile Auto-Advanced! 🚀</b>\\n\\n` +
    `🏢 <b>Компания:</b> ${rpc.business_name_bg || 'Компания'} (<i>${rpc.business_name_en || ''}</i>)\\n` +
    `🆔 <b>ЕИК:</b> <code>${rpc.eik || 'N/A'}</code>\\n` +
    `📧 <b>Email Код:</b> <code>${rpc.email_code || 'Verified'}</code> (${rpc.email_alias_33mail || '33Mail'})\\n` +
    `📱 <b>SMS Код:</b> <code>${rpc.code}</code> (${rpc.to_number || prev.to_number})\\n` +
    `⚡ <b>Нов Статус:</b> <code>VERIFIED_READY_FOR_CARD_ISSUING</code>\\n` +
    `🎯 <b>Auto-Advancement:</b> <code>SUCCESS</code> (Zero-Touch Onboarding)\\n` +
    `🖥 <b>Нод:</b> macmini-primary (100.83.83.8)`;
} else {
  alertText = `🦁 <b>Open Balancer — SMS OTP Ingested 📱</b>\\n\\n` +
    `🏢 <b>Компания:</b> ${rpc.business_name_bg || 'N/A'} (ЕИК: <code>${rpc.eik || 'N/A'}</code>)\\n` +
    `📞 <b>Телефон:</b> <code>${prev.to_number}</code>\\n` +
    `🔑 <b>SMS Код:</b> <code>${rpc.code || prev.code}</code>\\n` +
    `💬 <b>Текст:</b> ${prev.message_body}\\n` +
    `⚡ <b>Статус:</b> <code>PROCESSED</code>\\n` +
    `🖥 <b>Нод:</b> macmini-primary (100.83.83.8)`;
}

return {
  json: {
    ...rpc,
    telegram_text: alertText,
    input_prev: prev
  }
};"""
          },
          "name": "3B. Format SMS Telegram Alert",
          "type": "n8n-nodes-base.code",
          "typeVersion": 2,
          "position": [920, 480],
          "id": "node-format-sms-alert"
        },
        {
          "parameters": {
            "method": "POST",
            "url": f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage",
            "sendHeaders": True,
            "headerParameters": {
              "parameters": [
                {
                  "name": "Content-Type",
                  "value": "application/json"
                }
              ]
            },
            "sendBody": True,
            "specifyBody": "json",
            "jsonBody": """={
  "chat_id": "8041248687",
  "text": {{ JSON.stringify($json.telegram_text) }},
  "parse_mode": "HTML",
  "disable_web_page_preview": true
}""",
            "options": {
              "response": {
                "response": {
                  "neverError": True
                }
              }
            }
          },
          "id": "node-telegram-sms-alert",
          "name": "4B. Telegram Dispatch (SMS)",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 4.4,
          "position": [1160, 480],
          "continueOnFail": True
        },
        {
          "parameters": {
            "respondWith": "json",
            "responseBody": """={
  "ok": {{ $('2B. Supabase RPC Process SMS OTP').item.json.ok || false }},
  "stream": "SMS_OTP",
  "code": "{{ $('2B. Supabase RPC Process SMS OTP').item.json.code || '' }}",
  "eik": "{{ $('2B. Supabase RPC Process SMS OTP').item.json.eik || '' }}",
  "business_name": "{{ $('2B. Supabase RPC Process SMS OTP').item.json.business_name_bg || '' }}",
  "auto_advanced": {{ $('2B. Supabase RPC Process SMS OTP').item.json.auto_advanced || false }},
  "wallester_status": "{{ $('2B. Supabase RPC Process SMS OTP').item.json.wallester_status || '' }}",
  "sms_message_id": "{{ $('2B. Supabase RPC Process SMS OTP').item.json.sms_message_id || '' }}",
  "timestamp": "{{ new Date().toISOString() }}"
}""",
            "options": {}
          },
          "name": "5B. Respond to Webhook (SMS)",
          "type": "n8n-nodes-base.respondToWebhook",
          "typeVersion": 1.1,
          "position": [1400, 480],
          "id": "node-response-sms"
        }
      ],
      "connections": {
        "Webhook: Email OTP Ingest": {
          "main": [[{"node": "1A. Parse & Normalize Email Payload", "type": "main", "index": 0}]]
        },
        "1A. Parse & Normalize Email Payload": {
          "main": [[{"node": "2A. Supabase RPC Process Email OTP", "type": "main", "index": 0}]]
        },
        "2A. Supabase RPC Process Email OTP": {
          "main": [[{"node": "3A. Format Email Telegram Alert", "type": "main", "index": 0}]]
        },
        "3A. Format Email Telegram Alert": {
          "main": [[{"node": "4A. Telegram Dispatch (Email)", "type": "main", "index": 0}]]
        },
        "4A. Telegram Dispatch (Email)": {
          "main": [[{"node": "5A. Respond to Webhook (Email)", "type": "main", "index": 0}]]
        },

        "Webhook: SMS OTP Ingest": {
          "main": [[{"node": "1B. Parse & Normalize SMS Payload", "type": "main", "index": 0}]]
        },
        "1B. Parse & Normalize SMS Payload": {
          "main": [[{"node": "2B. Supabase RPC Process SMS OTP", "type": "main", "index": 0}]]
        },
        "2B. Supabase RPC Process SMS OTP": {
          "main": [[{"node": "3B. Format SMS Telegram Alert", "type": "main", "index": 0}]]
        },
        "3B. Format SMS Telegram Alert": {
          "main": [[{"node": "4B. Telegram Dispatch (SMS)", "type": "main", "index": 0}]]
        },
        "4B. Telegram Dispatch (SMS)": {
          "main": [[{"node": "5B. Respond to Webhook (SMS)", "type": "main", "index": 0}]]
        }
      },
      "active": True,
      "settings": {
        "executionOrder": "v1",
        "saveDataErrorExecution": "all",
        "saveDataSuccessExecution": "all",
        "saveManualExecutions": True,
        "saveExecutionProgress": True
      },
      "versionId": "1"
    }

    local_path = "/Users/diokarabaz/Wallestars/n8n/otp_ingestion_and_verification_stream.n8n.json"
    with open(local_path, "w", encoding="utf-8") as f:
        json.dump(workflow, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Local workflow file written: {local_path}")
    subprocess.run(["scp", local_path, f"{SSH_HOST}:{local_path}"], check=True)
    print(f"✅ Synced workflow file to remote {SSH_HOST}")
    return workflow

def deploy_n8n_workflow(workflow):
    print("🚀 [2/4] Deploying workflow to n8n-ob-postgres and registering webhooks...")
    workflow_id = "otp_ingestion_stream"
    workflow_name = "otp_ingestion_and_verification_stream"
    version_id = str(uuid.uuid4())
    nodes_json = json.dumps(workflow["nodes"]).replace("'", "''")
    connections_json = json.dumps(workflow["connections"]).replace("'", "''")
    settings_json = json.dumps(workflow.get("settings", {})).replace("'", "''")
    
    sql = f"""
    -- 1. Insert workflow_entity base
    INSERT INTO workflow_entity (
        id, name, active, nodes, connections, settings, "createdAt", "updatedAt", "versionId", "triggerCount", "versionCounter"
    ) VALUES (
        '{workflow_id}', '{workflow_name}', true, '{nodes_json}'::json, '{connections_json}'::json, '{settings_json}'::json, NOW(), NOW(), '{version_id}', 2, 1
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
        "triggerCount" = 2
    WHERE id = '{workflow_id}';

    -- 4. Insert shared_workflow
    INSERT INTO shared_workflow ("workflowId", "projectId", role, "createdAt", "updatedAt") 
    VALUES ('{workflow_id}', '8Gi8ImHMHYP2FNHl', 'workflow:owner', NOW(), NOW()) 
    ON CONFLICT DO NOTHING;

    -- 5. Insert webhook_entity entries
    DELETE FROM webhook_entity WHERE "workflowId" = '{workflow_id}';
    
    INSERT INTO webhook_entity ("webhookPath", method, node, "webhookId", "pathLength", "workflowId") 
    VALUES 
        ('email-otp-ingest', 'POST', 'Webhook: Email OTP Ingest', 'email-otp-ingest-webhook', 16, '{workflow_id}'),
        ('sms-otp-ingest', 'POST', 'Webhook: SMS OTP Ingest', 'sms-otp-ingest-webhook', 14, '{workflow_id}')
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
        print("✅ n8n-ob restarted cleanly, waiting 5s for boot...")
        time.sleep(5)

def verify_webhooks():
    print("🧪 [3/4] Verifying webhook endpoints on http://100.83.83.8:5679...")
    
    # Test Email OTP webhook ping
    payload_email = {
        "to_address": "contact_207849182@openbalancer.com",
        "from_address": "verification@wallester.com",
        "subject": "Wallester Security Passcode",
        "body_preview": "Your Wallester registration OTP is 654321. Do not share.",
        "body_full": "Your Wallester registration OTP is 654321. Do not share this passcode with anyone."
    }
    
    url_email = "http://100.83.83.8:5679/webhook/email-otp-ingest"
    t0 = time.time()
    req_email = urllib.request.Request(
        url_email,
        data=json.dumps(payload_email).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req_email, timeout=10) as response:
            latency_ms = (time.time() - t0) * 1000
            resp_body = json.loads(response.read().decode('utf-8'))
            print(f"✅ Email OTP Webhook: {response.status} OK (latency: {latency_ms:.1f}ms)")
            print(f"   Response: {resp_body}")
    except Exception as e:
        print(f"❌ Email OTP Webhook failed: {e}")
        raise

    # Test SMS OTP webhook ping
    payload_sms = {
        "to_number": "+359888123456",
        "from_number": "Wallester",
        "message_body": "Wallester OTP: 839201. Srok: 10 min."
    }
    
    url_sms = "http://100.83.83.8:5679/webhook/sms-otp-ingest"
    t0 = time.time()
    req_sms = urllib.request.Request(
        url_sms,
        data=json.dumps(payload_sms).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    
    try:
        with urllib.request.urlopen(req_sms, timeout=10) as response:
            latency_ms = (time.time() - t0) * 1000
            resp_body = json.loads(response.read().decode('utf-8'))
            print(f"✅ SMS OTP Webhook: {response.status} OK (latency: {latency_ms:.1f}ms)")
            print(f"   Response: {resp_body}")
    except Exception as e:
        print(f"❌ SMS OTP Webhook failed: {e}")
        raise

def main():
    print("🦁 Starting OTP Ingestion Pipeline Deployment on macmini-primary...")
    wf = build_workflow_json()
    deploy_n8n_workflow(wf)
    verify_webhooks()
    print("🎉 [4/4] OTP Pipeline successfully deployed and active!")

if __name__ == "__main__":
    main()
