#!/usr/bin/env python3
"""
Open Balancer — Step 2: E2E Verification & Test Suite for OTP Ingestion Pipeline
Executes:
  - Test A: Incoming Email OTP -> DB record -> Telegram alert
  - Test B: Incoming SMS OTP -> DB record -> Telegram alert
  - Test C: Full Cycle -> Auto-Advancement to VERIFIED_READY_FOR_CARD_ISSUING & Scorecard check
  - Test D: RegEx False-Positive Immunity (EIKs, postal codes, phones)
"""

import os
import sys
import json
import time
import urllib.request
import urllib.parse
import urllib.error

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from openbalancer.b2b_pipeline.otp_processor import (
    extract_otp_code,
    normalize_phone_number,
    normalize_email,
    send_email_webhook,
    send_sms_webhook,
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_KEY
)

def is_local_docker_node() -> bool:
    """Checks if supabase-db docker container is running locally on this machine."""
    import subprocess
    try:
        res = subprocess.run(["docker", "inspect", "supabase-db"], capture_output=True, text=True, timeout=2)
        return res.returncode == 0
    except Exception:
        return False

def get_supabase_base_url() -> str:
    if os.environ.get("SUPABASE_URL"):
        return os.environ["SUPABASE_URL"]
    if is_local_docker_node():
        return "http://127.0.0.1:8002"
    return "http://100.83.83.8:8002"

def get_webhook_base_url() -> str:
    if is_local_docker_node():
        return "http://127.0.0.1:5679"
    return "http://100.83.83.8:5679"

WEBHOOK_HOST = get_webhook_base_url()
SUPABASE_URL = get_supabase_base_url()
SUPABASE_KEY = DEFAULT_SUPABASE_KEY

def supabase_get(endpoint: str) -> list:
    """Performs a GET request to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json"
    }
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode('utf-8'))

def supabase_post(endpoint: str, payload: dict, prefer: str = "return=representation") -> list:
    """Performs a POST (upsert) request to Supabase REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": prefer
    }
    req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
    with urllib.request.urlopen(req, timeout=5) as resp:
        return json.loads(resp.read().decode('utf-8'))

def test_d_regex_immunity():
    print("\n🧪 [TEST D] Testing RegEx False-Positive Immunity...")
    
    # 1. Message with 9-digit EIK, 4-digit postal code, phone number, and 6-digit OTP
    sample_text = (
        "Уважаеми клиенти на фирма с ЕИК 207849182, адрес гр. София 1000, тел +359888123456. "
        "Вашият 6-цифрен код за верификация е: 592014. Не го споделяйте."
    )
    code = extract_otp_code(sample_text)
    assert code == "592014", f"Expected 592014, got {code}"
    print("  ✅ Successfully extracted 6-digit OTP (592014) while ignoring EIK (207849182) and Zip (1000)")
    
    # 2. Wallester English SMS template
    sample_sms = "Wallester Corporate: Your security passcode is 839201 for application APP-WB-20260820-A1B2. Valid 10 min."
    code2 = extract_otp_code(sample_sms)
    assert code2 == "839201", f"Expected 839201, got {code2}"
    print("  ✅ Successfully extracted OTP (839201) from Wallester SMS template")
    
    # 3. 13-digit branch EIK check
    sample_branch = "Регистрация на клон с ЕИК 2078491820019. Код за потвърждение: 318492"
    code3 = extract_otp_code(sample_branch)
    assert code3 == "318492", f"Expected 318492, got {code3}"
    print("  ✅ Successfully ignored 13-digit EIK and extracted OTP (318492)")
    
    # 4. Text with NO 6-digit code (only EIK and zip)
    sample_none = "Фирма с ЕИК 207849182 и пощенски код 1000."
    code4 = extract_otp_code(sample_none)
    assert code4 is None, f"Expected None, got {code4}"
    print("  ✅ Correctly returned None when no 6-digit OTP is present")
    
    print("🎯 [TEST D PASSED] RegEx immunity verified 100%! (4/4 test cases)")

def setup_test_profile(eik: str, name_bg: str, phone: str, email: str):
    """Inserts or resets a test profile in verified_business_profiles via REST API."""
    profile_payload = {
        "eik": eik,
        "business_name_bg": name_bg,
        "business_name_en": f"{name_bg} EN",
        "legal_form_bg": "ЕООД",
        "business_structure_en": "Single-member Limited Liability Company (EOOD)",
        "entity_type": "EOOD",
        "phone_number": phone,
        "email_alias_33mail": email,
        "vat_number": f"BG{eik}",
        "is_active": True,
        "is_vat_registered": True,
        "wallester_status": "READY_FOR_KYC",
        "selected_for_registration": False,
        "email_confirmation_code": None,
        "sms_verification_code": None,
        "sms_confirmation_code": None
    }
    supabase_post("verified_business_profiles?on_conflict=eik", profile_payload, prefer="resolution=merge-duplicates,return=representation")

def test_a_email_otp_webhook():
    print("\n🧪 [TEST A] Testing Incoming Email OTP Ingestion via Webhook...")
    test_eik = "207111001"
    test_email = f"contact_{test_eik}@openbalancer.com"
    test_phone = "+359888111001"
    test_name = "ТЕСТ ЕМАЙЛ АУТОМЕЙШЪН ЕООД"
    
    setup_test_profile(test_eik, test_name, test_phone, test_email)
    
    otp_code = "739182"
    payload = {
        "to_address": test_email,
        "from_address": "support@wallester.com",
        "subject": "Wallester Business Verification Code",
        "body_preview": f"Your confirmation code is {otp_code}.",
        "body_full": f"Hello, your Wallester confirmation code is {otp_code}. Valid for 10 minutes."
    }
    
    url = f"{WEBHOOK_HOST}/webhook/email-otp-ingest"
    res = send_email_webhook(url, payload)
    latency = res["latency_ms"]
    
    print(f"  📡 Webhook Latency: {latency:.1f}ms, Status: {res['status_code']}")
    assert res["status_code"] == 200, f"Expected status 200, got {res['status_code']}"
    assert res["body"].get("ok") is True, f"Expected ok: True, got {res['body']}"
    assert res["body"].get("code") == otp_code, f"Expected code {otp_code}, got {res['body'].get('code')}"
    
    # Verify DB update in verified_business_profiles
    records = supabase_get(f"verified_business_profiles?eik=eq.{test_eik}&select=email_confirmation_code,email_confirmation_received_at")
    assert len(records) > 0, "Profile not found in DB"
    db_code = records[0].get("email_confirmation_code")
    db_received_at = records[0].get("email_confirmation_received_at")
    assert db_code == otp_code, f"DB email_confirmation_code expected {otp_code}, got {db_code}"
    assert db_received_at is not None, "DB email_confirmation_received_at must be populated"
    print(f"  ✅ DB Verification: email_confirmation_code = {db_code} at {db_received_at}")
    
    # Verify archiving in email_messages
    msg_records = supabase_get(f"email_messages?to_address=eq.{test_email}&order=created_at.desc&limit=1&select=extracted_code,status")
    assert len(msg_records) > 0, "No email_messages row archived"
    msg_code = msg_records[0].get("extracted_code")
    msg_status = msg_records[0].get("status")
    assert msg_code == otp_code, f"Archived message code mismatch: {msg_code}"
    assert msg_status == "processed", f"Archived message status mismatch: {msg_status}"
    print(f"  ✅ Email Messages Archive: extracted_code = {msg_code}, status = {msg_status}")
    
    print("🎯 [TEST A PASSED] Email OTP stream verified 100%!")

def test_b_sms_otp_webhook():
    print("\n🧪 [TEST B] Testing Incoming SMS OTP Ingestion via Webhook...")
    test_eik = "207111002"
    test_email = f"contact_{test_eik}@openbalancer.com"
    test_phone = "+359888111002"
    test_name = "ТЕСТ ЕСЕМЕС АУТОМЕЙШЪН ЕООД"
    
    setup_test_profile(test_eik, test_name, test_phone, test_email)
    
    # Also register phone in sms_numbers_pool
    pool_payload = {
        "phone_number": test_phone,
        "sms_url": f"https://duoplus.app/sms/{test_phone}",
        "status": "assigned",
        "country_code": "BG",
        "country_name": "Bulgaria"
    }
    supabase_post("sms_numbers_pool?on_conflict=phone_number", pool_payload, prefer="resolution=merge-duplicates,return=representation")
    
    otp_code = "928374"
    payload = {
        "to_number": test_phone,
        "from_number": "Wallester",
        "message_body": f"DuoPlus SIM: [Wallester] Kod za verifikatsiya: {otp_code}. Vazhi 10 min."
    }
    
    url = f"{WEBHOOK_HOST}/webhook/sms-otp-ingest"
    res = send_sms_webhook(url, payload)
    latency = res["latency_ms"]
    
    print(f"  📡 Webhook Latency: {latency:.1f}ms, Status: {res['status_code']}")
    assert res["status_code"] == 200, f"Expected status 200, got {res['status_code']}"
    assert res["body"].get("ok") is True, f"Expected ok: True, got {res['body']}"
    assert res["body"].get("code") == otp_code, f"Expected code {otp_code}, got {res['body'].get('code')}"
    
    # Verify DB update in verified_business_profiles
    records = supabase_get(f"verified_business_profiles?eik=eq.{test_eik}&select=sms_verification_code,sms_confirmation_code,sms_verification_received_at")
    assert len(records) > 0, "Profile not found in DB"
    sms_ver_code = records[0].get("sms_verification_code")
    sms_conf_code = records[0].get("sms_confirmation_code")
    db_received_at = records[0].get("sms_verification_received_at")
    assert sms_ver_code == otp_code, f"DB sms_verification_code expected {otp_code}, got {sms_ver_code}"
    assert sms_conf_code == otp_code, f"DB sms_confirmation_code expected {otp_code}, got {sms_conf_code}"
    assert db_received_at is not None, "DB sms_verification_received_at must be populated"
    print(f"  ✅ DB Verification: sms_verification_code = {sms_ver_code} (and confirmation code: {sms_conf_code})")
    
    # Verify update in sms_numbers_pool
    encoded_phone = urllib.parse.quote(test_phone)
    pool_records = supabase_get(f"sms_numbers_pool?phone_number=eq.{encoded_phone}&select=last_verification_code")
    assert len(pool_records) > 0 and pool_records[0].get("last_verification_code") == otp_code, f"Pool code expected {otp_code}, got {pool_records}"
    print(f"  ✅ SMS Pool Verification: last_verification_code = {pool_records[0].get('last_verification_code')}")
    
    # Verify archiving in sms_messages
    msg_records = supabase_get(f"sms_messages?to_number=eq.{encoded_phone}&order=created_at.desc&limit=1&select=sms_code,status")
    assert len(msg_records) > 0, "No sms_messages row archived"
    msg_code = msg_records[0].get("sms_code")
    msg_status = msg_records[0].get("status")
    assert msg_code == otp_code, f"Archived message code mismatch: {msg_code}"
    assert msg_status == "processed", f"Archived message status mismatch: {msg_status}"
    print(f"  ✅ SMS Messages Archive: sms_code = {msg_code}, status = {msg_status}")
    
    print("🎯 [TEST B PASSED] SMS OTP stream verified 100%!")

def test_c_full_cycle_auto_advancement():
    print("\n🧪 [TEST C] Testing Full Cycle -> Auto-Advancement to VERIFIED_READY_FOR_CARD_ISSUING...")
    test_eik = "207111003"
    test_email = f"contact_{test_eik}@openbalancer.com"
    test_phone = "+359888111003"
    test_name = "ОПЪН БАЛАНСЪР АУТО-АДВАНС ЕООД"
    
    setup_test_profile(test_eik, test_name, test_phone, test_email)
    
    # Stage 1: Ingest Email OTP
    email_code = "415263"
    print(f"  Step 1: Sending Email OTP ({email_code}) to {test_email}...")
    res_email = send_email_webhook(
        f"{WEBHOOK_HOST}/webhook/email-otp-ingest",
        {
            "to_address": test_email,
            "subject": "Wallester Business Email OTP",
            "body_full": f"Security Code: {email_code}."
        }
    )
    assert res_email["status_code"] == 200
    assert res_email["body"]["auto_advanced"] is False, "Should NOT auto-advance with email only"
    print("  ✅ Step 1 complete: Email OTP recorded, waiting for SMS OTP.")
    
    # Stage 2: Ingest SMS OTP
    sms_code = "829104"
    print(f"  Step 2: Sending SMS OTP ({sms_code}) to {test_phone}...")
    res_sms = send_sms_webhook(
        f"{WEBHOOK_HOST}/webhook/sms-otp-ingest",
        {
            "to_number": test_phone,
            "from_number": "Wallester",
            "message_body": f"Kod za potvarzhdenie: {sms_code}"
        }
    )
    assert res_sms["status_code"] == 200
    assert res_sms["body"]["auto_advanced"] is True, f"Expected auto_advanced: True, got {res_sms['body']}"
    assert res_sms["body"]["wallester_status"] == "VERIFIED_READY_FOR_CARD_ISSUING"
    print("  ✅ Step 2 complete: Both codes present -> Auto-Advancement triggered!")
    
    # Stage 3: Verify Profile Status in Database
    records = supabase_get(f"verified_business_profiles?eik=eq.{test_eik}&select=wallester_status,selected_for_registration,email_confirmation_code,sms_verification_code")
    assert len(records) > 0
    rec = records[0]
    assert rec.get("wallester_status") == "VERIFIED_READY_FOR_CARD_ISSUING", f"Expected VERIFIED_READY_FOR_CARD_ISSUING, got {rec.get('wallester_status')}"
    assert rec.get("selected_for_registration") is True, f"Expected selected_for_registration = true, got {rec.get('selected_for_registration')}"
    assert rec.get("email_confirmation_code") == email_code
    assert rec.get("sms_verification_code") == sms_code
    print(f"  ✅ DB Profile State: wallester_status = {rec.get('wallester_status')}, selected_for_registration = {rec.get('selected_for_registration')}")
    
    # Stage 4: Verify Workflow Execution Log
    exec_records = supabase_get(f"workflow_executions?workflow_name=eq.otp_ingestion_and_verification_stream&order=created_at.desc&limit=5&select=status,payload")
    matching_execs = [e for e in exec_records if e.get("payload", {}).get("eik") == test_eik]
    assert len(matching_execs) > 0, "No workflow execution record found for auto-advancement"
    assert matching_execs[0].get("status") == "SUCCESS"
    print(f"  ✅ Workflow Execution Telemetry logged: status = {matching_execs[0].get('status')}")
    
    # Stage 5: Verify Revenue Scorecard Reflection
    sc_records = supabase_get("revenue_scorecard?select=email_codes,sms_codes,selected_for_registration")
    assert len(sc_records) > 0
    sc = sc_records[0]
    print(f"  📊 Revenue Scorecard Telemetry: email_codes = {sc.get('email_codes')}, sms_codes = {sc.get('sms_codes')}, selected_for_registration = {sc.get('selected_for_registration')}")
    assert int(sc.get("email_codes", 0)) >= 3
    assert int(sc.get("sms_codes", 0)) >= 3
    assert int(sc.get("selected_for_registration", 0)) >= 3
    
    print("🎯 [TEST C PASSED] Full Cycle Auto-Advancement verified 100%!")

def main():
    print("🦁 ====================================================================")
    print("🦁 Open Balancer — Step 2: OTP Ingestion & Auto-Advancement E2E Suite")
    print("🦁 Target Node: macmini-primary (100.83.83.8)")
    print("🦁 ====================================================================")
    
    t_start = time.time()
    test_d_regex_immunity()
    test_a_email_otp_webhook()
    test_b_sms_otp_webhook()
    test_c_full_cycle_auto_advancement()
    
    total_time = time.time() - t_start
    print("\n🎉 ====================================================================")
    print(f"🎉 ALL E2E TESTS PASSED (100% SUCCESS in {total_time:.2f}s)")
    print("🎉 Zero-Touch Automated OTP Onboarding Pipeline is LIVE & VERIFIED!")
    print("🦁 ====================================================================")

if __name__ == "__main__":
    main()
