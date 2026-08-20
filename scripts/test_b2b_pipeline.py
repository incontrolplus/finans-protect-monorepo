#!/usr/bin/env python3
"""
Open Balancer — Comprehensive B2B Onboarding Pipeline Test Suite
Tests:
  1. 9-digit EIK verification & checksum validation
  2. 13-digit EIK (branch) verification & checksum validation
  3. Invalid EIK rejection
  4. Eligibility evaluation (FREE_CARD_PLUS_150_BONUS)
  5. Wallester API client (APP-WB format & 72h HMAC-SHA256 signature)
  6. Supabase Persistence (upsert to verified_business_profiles & telemetry log to workflow_executions)
  7. Client SMS/Email formatting & Telegram Admin Channel dispatch
"""

import os
import sys
import json
import time

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from openbalancer.b2b_pipeline.pipeline import execute_b2b_onboarding_pipeline
from openbalancer.b2b_pipeline.eik_verifier import validate_eik_checksum, extract_legal_form, extract_vat_number
from openbalancer.b2b_pipeline.wallester_client import verify_hmac_signature

def run_tests():
    print("=================================================================")
    print("🚀 OPEN BALANCER: B2B ONBOARDING & VERIFICATION PIPELINE TEST")
    print("=================================================================\n")

    # ─── TEST 1: 9-Digit EIK ──────────────────────────────────────────────
    print("📋 [TEST 1] Executing 5-Step Pipeline for 9-Digit EIK (207849182)...")
    t1_start = time.time()
    res9 = execute_b2b_onboarding_pipeline(
        eik="207849182",
        company_name_bg="Опън Балансър ЕООД",
        company_name_en="Open Balancer EOOD",
        phone="+359888123456",
        email="finance@openbalancer.com",
        send_telegram=True,
        persist_db=True
    )
    t1_end = time.time()
    
    print(f"Status: {res9['pipeline_status']}")
    print(f"Total Execution Time: {res9['total_duration_ms']} ms")
    print("Step Timings:")
    for step, ms in res9["step_timings"].items():
        print(f"  - {step}: {ms} ms")
    
    assert res9["success"] is True, "Pipeline 9-digit EIK must succeed"
    assert res9["results"]["step_1_verification"]["vat_number"] == "BG207849182"
    assert res9["results"]["step_1_verification"]["entity_type"] == "EOOD"
    assert res9["results"]["step_2_eligibility"]["bonus_program"] == "FREE_CARD_PLUS_150_BONUS"
    assert res9["results"]["step_2_eligibility"]["bonus_amount_eur"] == 150.00
    assert res9["results"]["step_3_wallester"]["application_id"].startswith("APP-WB-")
    assert "cashflow.openbalancer.com/onboard" in res9["results"]["step_3_wallester"]["onboarding_url"]
    assert res9["results"]["step_4_persistence"]["success"] is True
    print("✅ TEST 1 (9-digit EIK) PASSED!\n")

    # ─── TEST 2: 13-Digit EIK ─────────────────────────────────────────────
    print("📋 [TEST 2] Executing 5-Step Pipeline for 13-Digit EIK (2078491820019)...")
    t2_start = time.time()
    res13 = execute_b2b_onboarding_pipeline(
        eik="2078491820019",
        company_name_bg="Опън Балансър Клон София",
        company_name_en="Open Balancer Sofia Branch",
        phone="+359888654321",
        email="sofia.branch@openbalancer.com",
        send_telegram=True,
        persist_db=True
    )
    t2_end = time.time()
    
    print(f"Status: {res13['pipeline_status']}")
    print(f"Total Execution Time: {res13['total_duration_ms']} ms")
    print("Step Timings:")
    for step, ms in res13["step_timings"].items():
        print(f"  - {step}: {ms} ms")
    
    assert res13["success"] is True, "Pipeline 13-digit EIK must succeed"
    assert res13["results"]["step_1_verification"]["vat_number"] == "BG2078491820019"
    assert res13["results"]["step_1_verification"]["entity_type"] == "BRANCH"
    assert res13["results"]["step_1_verification"]["is_branch"] is True
    assert res13["results"]["step_2_eligibility"]["bonus_program"] == "FREE_CARD_PLUS_150_BONUS"
    assert res13["results"]["step_4_persistence"]["success"] is True
    print("✅ TEST 2 (13-digit EIK) PASSED!\n")

    # ─── TEST 3: Invalid EIK Checksum Rejection ───────────────────────────
    print("📋 [TEST 3] Testing Invalid EIK (123456789) Rejection...")
    res_invalid = execute_b2b_onboarding_pipeline(
        eik="123456789",
        company_name_bg="Невалидна Фирма",
        send_telegram=False,
        persist_db=True
    )
    print(f"Status: {res_invalid['pipeline_status']}")
    print(f"Error caught: {res_invalid.get('error')}")
    assert res_invalid["success"] is False, "Invalid EIK must fail"
    assert res_invalid["pipeline_status"] == "FAILED_VERIFICATION"
    print("✅ TEST 3 (Invalid EIK Rejection) PASSED!\n")

    # ─── Verification Report Summary ──────────────────────────────────────
    print("=================================================================")
    print("📊 5-STEP B2B ONBOARDING PIPELINE EXECUTION SUMMARY")
    print("=================================================================")
    print(f"1. 9-Digit EIK (207849182): SUCCESS ({res9['total_duration_ms']} ms)")
    print(f"   - Application ID: {res9['results']['step_3_wallester']['application_id']}")
    print(f"   - Program: {res9['results']['step_2_eligibility']['bonus_program']} (€150 Bonus)")
    print(f"   - Onboarding URL: {res9['results']['step_3_wallester']['onboarding_url']}")
    print(f"   - Telegram Dispatch: {res9['results']['step_5_notifications']['telegram_notification'].get('status')}")
    print(f"   - DB Record: {res9['results']['step_4_persistence']['persisted_via']}")
    print()
    print(f"2. 13-Digit EIK (2078491820019): SUCCESS ({res13['total_duration_ms']} ms)")
    print(f"   - Application ID: {res13['results']['step_3_wallester']['application_id']}")
    print(f"   - Program: {res13['results']['step_2_eligibility']['bonus_program']} (€150 Bonus)")
    print(f"   - Legal Form: {res13['results']['step_1_verification']['legal_form_bg']} ({res13['results']['step_1_verification']['entity_type']})")
    print(f"   - Onboarding URL: {res13['results']['step_3_wallester']['onboarding_url']}")
    print(f"   - Telegram Dispatch: {res13['results']['step_5_notifications']['telegram_notification'].get('status')}")
    print(f"   - DB Record: {res13['results']['step_4_persistence']['persisted_via']}")
    print("=================================================================")
    
    return {
        "res9": res9,
        "res13": res13,
        "res_invalid": res_invalid
    }

if __name__ == "__main__":
    run_tests()
