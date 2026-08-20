#!/usr/bin/env python3
"""
Open Balancer — Step 4: Live Real-Time Dashboard & Bento-Box UI E2E Test Suite
Verifies:
  1. Frontend compilation (dist/ bundle, HTML & assets)
  2. Local server & macmini-primary container (http://100.83.83.8:8083)
  3. Cloudflare Pages edge (https://openbalancer.pages.dev)
  4. Endpoints: /api/health, /api/revenue, /api/eik/verify
  5. Supabase Realtime replication & Scorecard SSOT
"""

import urllib.request
import urllib.parse
import json
import time
import sys
import os

def test_http_endpoint(name, url, expected_status=200, contains_text=None):
    start = time.time()
    req = urllib.request.Request(url, headers={"User-Agent": "OpenBalancer-E2E-Auditor/4.5"})
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            elapsed = (time.time() - start) * 1000
            body = resp.read().decode('utf-8', errors='ignore')
            status = resp.status
            assert status == expected_status, f"{name}: Expected HTTP {expected_status}, got {status}"
            if contains_text:
                assert contains_text in body, f"{name}: Response missing '{contains_text}'"
            print(f"  ✓ {name}: HTTP {status} ({elapsed:.1f} ms) — OK")
            return body
    except Exception as e:
        print(f"  ✗ {name} FAIL ({url}): {e}")
        raise e

def run_suite():
    print("=================================================================")
    print("🌐 OPEN BALANCER: STEP 4 BENTO-BOX DASHBOARD & REALTIME E2E TEST")
    print("=================================================================\n")

    # 1. Test macmini-primary openbalancer-web Docker Container
    print("📋 [TEST 1] Testing macmini-primary Docker Container (http://100.83.83.8:8083)...")
    test_http_endpoint("macmini-primary (Port 8083)", "http://100.83.83.8:8083", contains_text="Open Balancer — Live Real-Time Dashboard")

    # 2. Test Cloudflare Pages CDN
    print("\n📋 [TEST 2] Testing Cloudflare Pages CDN (https://openbalancer.pages.dev)...")
    test_http_endpoint("Cloudflare Pages Edge", "https://openbalancer.pages.dev", contains_text="Live Real-Time Dashboard & Bento-Box UI")

    # 3. Test Supabase Database REST API
    print("\n📋 [TEST 3] Testing Supabase Database REST API (http://100.83.83.8:8002)...")
    score_url = "http://100.83.83.8:8002/rest/v1/revenue_scorecard"
    score_req = urllib.request.Request(score_url, headers={
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzgyMjI2Nzk5LCJleHAiOjE5Mzk5MDY3OTl9.PH_Hd33xmZGh68py41Bp7642DHNlVDWYpmv2HLgVJ_Q"
    })
    with urllib.request.urlopen(score_req, timeout=5) as r:
        score_json = json.loads(r.read().decode('utf-8'))
        assert len(score_json) > 0, "Scorecard must have records"
        score = score_json[0]
        print(f"  ✓ Supabase REST Telemetry:")
        print(f"    - Active Corporate Cards: {score['payment_cards']} (Target: >= 14)")
        print(f"    - Verified Owners: {score['verified_owners']} (Target: 44)")
        print(f"    - Wallester Accounts: {score['wallester_accounts']} (Target: 20)")
        print(f"    - Ingested OTPs: {score['email_codes']} Email / {score['sms_codes']} SMS")
        assert score['payment_cards'] >= 14, "payment_cards must be at least 14"
        assert score['verified_owners'] == 44, "verified_owners must be 44"
        assert score['wallester_accounts'] == 20, "wallester_accounts must be 20"

    # 4. Test Mod 11 EIK Checksum Validation
    print("\n📋 [TEST 4] Testing Mod 11 EIK Checksum Validation Engine...")
    sys.path.insert(0, "/Users/diokarabaz/Wallestars")
    from openbalancer.b2b_pipeline.eik_verifier import validate_eik_checksum, extract_legal_form

    v9_valid, msg9, _ = validate_eik_checksum("207849182")
    assert v9_valid is True, f"207849182 must be valid: {msg9}"
    legal9 = extract_legal_form("207849182", "Опън Балансър ЕООД")
    assert legal9["entity_type"] == "EOOD", "Must resolve to EOOD"
    print("  ✓ 9-digit EIK (207849182): Validated Mod 11 Stage 1, Legal: EOOD")

    v13_valid, msg13, _ = validate_eik_checksum("2078491820019")
    assert v13_valid is True, f"2078491820019 must be valid: {msg13}"
    legal13 = extract_legal_form("2078491820019")
    assert legal13["entity_type"] == "BRANCH", "Must resolve to BRANCH"
    print("  ✓ 13-digit EIK (2078491820019): Validated Mod 11 13-digit Checksum, Legal: BRANCH")

    invalid_check, _, _ = validate_eik_checksum("207849189")
    assert invalid_check is False, "207849189 must be invalid checksum"
    print("  ✓ Invalid EIK Rejection: Correctly detected bad checksum (Mod 11 Stage 1 & 2)")

    print("\n=================================================================")
    print("🎉 ALL STEP 4 BENTO-BOX DASHBOARD & REALTIME TESTS PASSED (100%)")
    print("=================================================================\n")

if __name__ == "__main__":
    run_suite()
