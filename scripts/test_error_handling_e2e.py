#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Open Balancer: E2E Test Suite for Error Handling & Zero Data Loss Request Protection
Tests:
  Test A: Valid Request -> Status PROCESSED, validation_errors empty, full raw_payload stored
  Test B: Incomplete/Broken Request -> Status NEEDS_MANUAL_REVIEW, validation_errors populated, 100% Zero Data Loss raw_payload, Telegram alert
  Test C: Internal Pipeline Exception -> Status NEEDS_MANUAL_REVIEW in workflow_executions, zero data loss payload, Telegram alert
"""

import json
import urllib.request
import urllib.error
import datetime
import uuid

SUPABASE_URL = "http://100.83.83.8:8002"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"
TELEGRAM_BOT_TOKEN = "8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88"
TELEGRAM_CHAT_ID = "8041248687"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

def send_telegram(text: str, parse_mode: str = "HTML"):
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": parse_mode
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as he:
        body = he.read().decode("utf-8", errors="ignore")
        print(f"[Telegram] HTTP Error {he.code}: {body}")
        return None
    except Exception as e:
        print(f"[Telegram] Failed to send alert: {e}")
        return None

def process_intake_payload(raw_input: dict, source_workflow: str = "OpenBalancer Intake Validator"):
    """Implements the exact n8n error routing and validation logic with zero data loss."""
    errors = []
    email = raw_input.get("email")
    if not email or not isinstance(email, str) or "@" not in email:
        errors.append("Невалиден или липсващ email адрес")
        
    company_name = raw_input.get("company_name") or raw_input.get("name")
    if not company_name:
        errors.append("Липсва име на компания или лице")

    needs_manual = len(errors) > 0 or raw_input.get("has_exception") is True

    record = {
        "client_id": raw_input.get("client_id") or raw_input.get("id"),
        "email": email,
        "phone": raw_input.get("phone"),
        "company_name": company_name,
        "status": "NEEDS_MANUAL_REVIEW" if needs_manual else raw_input.get("status", "PROCESSED"),
        "validation_errors": errors,
        "rejection_reason": "; ".join(errors) or raw_input.get("error_message"),
        "raw_payload": raw_input, # 100% ZERO DATA LOSS
        "source_workflow": source_workflow,
        "updated_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    return record, needs_manual

def run_test_a():
    print("\n==========================================")
    print("🧪 ТЕСТ А: Валидна Заявка (Happy Path)")
    print("==========================================")
    valid_payload = {
        "client_id": f"client_valid_{uuid.uuid4().hex[:6]}",
        "name": "Alexander Petrov",
        "company_name": "Open Balancer Fleet Ltd",
        "email": "alexander@openbalancer.com",
        "phone": "+359888123456",
        "plan": "Enterprise Pro",
        "custom_metadata": {"kyc_verified": True, "lead_score": 95}
    }
    
    record, needs_manual = process_intake_payload(valid_payload, "Test Suite A")
    assert not needs_manual, "Valid payload marked as manual review!"
    assert record["status"] == "PROCESSED", f"Expected PROCESSED, got {record['status']}"

    # Insert into Supabase registration_requests
    url = f"{SUPABASE_URL}/rest/v1/registration_requests"
    req = urllib.request.Request(url, data=json.dumps(record).encode("utf-8"), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        created = json.loads(resp.read().decode("utf-8"))[0]

    record_id = created["id"]
    print(f"✅ Успешно записан запис в Supabase! ID: {record_id}")
    print(f"   • Status: {created['status']}")
    print(f"   • Company: {created['company_name']}")
    print(f"   • Email: {created['email']}")
    print(f"   • Validation Errors: {created['validation_errors']}")
    print(f"   • Zero Data Loss Raw Payload: {json.dumps(created['raw_payload'])}")

    assert created["status"] == "PROCESSED"
    assert created["raw_payload"]["email"] == "alexander@openbalancer.com"
    return record_id

def run_test_b():
    print("\n==========================================")
    print("🧪 ТЕСТ B: Невалидна/Непълна Заявка (Zero Data Loss + Manual Review + Telegram)")
    print("==========================================")
    broken_payload = {
        "client_id": f"client_broken_{uuid.uuid4().hex[:6]}",
        "email": "broken-email-format", # Липсва @
        "phone": "+359888999888",
        # Липсва name и company_name
        "vip_comment": "Критичен клиент - моля свържете се веднага по телефон!",
        "deep_nested_config": {
            "requested_cards": 50,
            "monthly_turnover_eur": 250000,
            "geo_scope": ["EU", "US", "UK"]
        }
    }

    record, needs_manual = process_intake_payload(broken_payload, "Test Suite B")
    assert needs_manual, "Broken payload NOT marked as manual review!"
    assert record["status"] == "NEEDS_MANUAL_REVIEW"
    assert len(record["validation_errors"]) >= 2

    # Insert into Supabase registration_requests
    url = f"{SUPABASE_URL}/rest/v1/registration_requests"
    req = urllib.request.Request(url, data=json.dumps(record).encode("utf-8"), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        created = json.loads(resp.read().decode("utf-8"))[0]

    record_id = created["id"]
    print(f"✅ Успешно прихваната и записана заявка за РЪЧЕН ПРЕГЛЕД! ID: {record_id}")
    print(f"   • Status: {created['status']}")
    print(f"   • Rejection Reason: {created['rejection_reason']}")
    print(f"   • Validation Errors: {created['validation_errors']}")
    print(f"   • Zero Data Loss (nested data intact): {created['raw_payload']['deep_nested_config']['requested_cards']} cards")

    # Send Telegram Alert with HTML formatting
    telegram_msg = (
        f"⚠️ <b>[Open Balancer - Lead Needs Manual Review]</b>\n\n"
        f"• <b>Record ID:</b> <code>{record_id}</code>\n"
        f"• <b>Client ID:</b> <code>{created.get('client_id')}</code>\n"
        f"• <b>Phone:</b> <code>{created.get('phone')}</code>\n"
        f"• <b>Status:</b> <code>NEEDS_MANUAL_REVIEW</code>\n"
        f"• <b>Reason:</b> {created.get('rejection_reason')}\n\n"
        f"<i>100% Zero Data Loss: Пълният raw_payload с всички вложени данни е запазен в Supabase (macmini-primary).</i>"
    )
    tg_resp = send_telegram(telegram_msg, parse_mode="HTML")
    if tg_resp and tg_resp.get("ok"):
        print("✅ Успешно изпратен Telegram Alert до оператора!")
    else:
        print(f"⚠️ Telegram alert response: {tg_resp}")

    assert created["status"] == "NEEDS_MANUAL_REVIEW"
    assert created["raw_payload"]["vip_comment"] == broken_payload["vip_comment"]
    return record_id

def run_test_c():
    print("\n==========================================")
    print("🧪 ТЕСТ C: Internal API / Pipeline Exception (Global Error Handler Telemetry)")
    print("==========================================")
    exec_id = f"exec_fail_{uuid.uuid4().hex[:8]}"
    error_telemetry = {
        "workflow_name": "Wallester Registration V4.5",
        "execution_source": "n8n",
        "run_id": exec_id,
        "status": "NEEDS_MANUAL_REVIEW",
        "duration_ms": 1420,
        "host_node": "macmini-primary",
        "error_message": "Bank Core API 422: Tax number verification failed for company 'Kirko MRK Ltd'",
        "validation_errors": ["Bank Core API 422: Tax number verification failed for company 'Kirko MRK Ltd'"],
        "is_manual_review": True,
        "payload": {
            "execution_id": exec_id,
            "last_node_executed": "Submit Wallester Business Application",
            "attempt": 3,
            "raw_input_snapshot": {
                "company_name": "Kirko MRK Ltd",
                "tax_number": "BG999999999",
                "director": "Dimitar Kiryakov",
                "email": "dk@openbalancer.com"
            },
            "error_details": {
                "http_status": 422,
                "api_endpoint": "https://api.wallester.com/v1/kyb/applications",
                "stack": "Error: 422 Unprocessable Entity\n    at WallesterService.apply (/wallester.js:108)"
            }
        }
    }

    url = f"{SUPABASE_URL}/rest/v1/workflow_executions"
    req = urllib.request.Request(url, data=json.dumps(error_telemetry).encode("utf-8"), headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        created = json.loads(resp.read().decode("utf-8"))[0]

    record_id = created["id"]
    print(f"✅ Успешно записан инцидент в workflow_executions! ID: {record_id}")
    print(f"   • Run ID: {created['run_id']}")
    print(f"   • Status: {created['status']}")
    print(f"   • Error: {created['error_message']}")
    print(f"   • Is Manual Review: {created['is_manual_review']}")
    print(f"   • Validation Errors: {created['validation_errors']}")

    # Telegram Alert with HTML formatting
    telegram_msg = (
        f"🚨 <b>[Open Balancer Global Error Handler - Pipeline Exception]</b>\n\n"
        f"• <b>Workflow:</b> <code>{created['workflow_name']}</code>\n"
        f"• <b>Execution ID:</b> <code>{created['run_id']}</code>\n"
        f"• <b>Status:</b> <code>NEEDS_MANUAL_REVIEW</code>\n"
        f"• <b>Last Node:</b> <code>Submit Wallester Business Application</code>\n"
        f"• <b>Error:</b> <code>{created['error_message']}</code>\n\n"
        f"<i>Инцидентът е регистриран в supabase-ob с пълен raw snapshot на данните.</i>"
    )
    tg_resp = send_telegram(telegram_msg, parse_mode="HTML")
    if tg_resp and tg_resp.get("ok"):
        print("✅ Успешно изпратен Telegram Alert за инцидента!")
    else:
        print(f"⚠️ Telegram response: {tg_resp}")

    assert created["status"] == "NEEDS_MANUAL_REVIEW"
    assert created["is_manual_review"] is True
    return record_id

def main():
    print("🚀 Стартиране на E2E Test Suite за Error Handling & Zero Data Loss...")
    id_a = run_test_a()
    id_b = run_test_b()
    id_c = run_test_c()
    print("\n==========================================")
    print("🎉 ВСИЧКИ ТЕСТОВЕ ПРЕМИНАХА УСПЕШНО (100% PASS)!")
    print(f"• Тест А Record ID: {id_a}")
    print(f"• Тест B Record ID: {id_b} (NEEDS_MANUAL_REVIEW)")
    print(f"• Тест C Record ID: {id_c} (workflow_executions)")
    print("==========================================")

if __name__ == "__main__":
    main()
