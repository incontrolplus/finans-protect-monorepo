#!/usr/bin/env python3
"""
Open Balancer — OTP Ingestion & Verification CLI Runner
Usage:
  python3 run_otp_ingestion_pipeline.py --help
  python3 run_otp_ingestion_pipeline.py --email-code 123456 --to contact_207849182@openbalancer.com
  python3 run_otp_ingestion_pipeline.py --sms-code 654321 --to +359888123456
  python3 run_otp_ingestion_pipeline.py --full-cycle --eik 207849182
  python3 run_otp_ingestion_pipeline.py --scorecard
"""

import os
import sys
import json
import argparse
import urllib.request
from typing import Dict, Any

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from openbalancer.b2b_pipeline.otp_processor import (
    extract_otp_code,
    normalize_phone_number,
    normalize_email,
    process_email_otp_payload,
    process_sms_otp_payload,
    send_email_webhook,
    send_sms_webhook,
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_KEY
)

WEBHOOK_BASE_URL = "http://100.83.83.8:5679/webhook"

def run_email_otp(to_address: str, code: str, body: str = None, use_webhook: bool = True):
    print(f"📧 Ingesting Email OTP for {to_address}...")
    full_body = body or f"Your Wallester verification code is {code}. Valid for 10 minutes."
    payload = {
        "to_address": to_address,
        "from_address": "support@wallester.com",
        "subject": "Wallester Verification Code",
        "body_preview": full_body[:100],
        "body_full": full_body
    }
    
    if use_webhook:
        url = f"{WEBHOOK_BASE_URL}/email-otp-ingest"
        print(f"📡 Sending to n8n Webhook: {url}")
        res = send_email_webhook(url, payload)
        print(f"✅ Status: {res['status_code']}, Latency: {res['latency_ms']:.1f}ms")
        print(f"📦 Response: {json.dumps(res['body'], indent=2, ensure_ascii=False)}")
    else:
        print("⚡ Processing directly via Supabase RPC...")
        res = process_email_otp_payload(payload)
        print(f"📦 Result: {json.dumps(res, indent=2, ensure_ascii=False)}")

def run_sms_otp(to_number: str, code: str, body: str = None, use_webhook: bool = True):
    print(f"📱 Ingesting SMS OTP for {to_number}...")
    full_body = body or f"Wallester OTP: {code}. Exp: 10m."
    payload = {
        "to_number": to_number,
        "from_number": "Wallester",
        "message_body": full_body
    }
    
    if use_webhook:
        url = f"{WEBHOOK_BASE_URL}/sms-otp-ingest"
        print(f"📡 Sending to n8n Webhook: {url}")
        res = send_sms_webhook(url, payload)
        print(f"✅ Status: {res['status_code']}, Latency: {res['latency_ms']:.1f}ms")
        print(f"📦 Response: {json.dumps(res['body'], indent=2, ensure_ascii=False)}")
    else:
        print("⚡ Processing directly via Supabase RPC...")
        res = process_sms_otp_payload(payload)
        print(f"📦 Result: {json.dumps(res, indent=2, ensure_ascii=False)}")

def print_scorecard():
    print("📊 Querying Revenue Scorecard from Supabase...")
    url = f"{DEFAULT_SUPABASE_URL}/rest/v1/revenue_scorecard"
    headers = {
        "apikey": DEFAULT_SUPABASE_KEY,
        "Authorization": f"Bearer {DEFAULT_SUPABASE_KEY}"
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            print(json.dumps(data, indent=2))
    except Exception as e:
        print(f"❌ Failed to fetch scorecard: {e}")

def main():
    parser = argparse.ArgumentParser(description="Open Balancer OTP Ingestion & Auto-Advancement CLI")
    parser.add_argument("--email-code", type=str, help="Email 6-digit OTP code")
    parser.add_argument("--sms-code", type=str, help="SMS 6-digit OTP code")
    parser.add_argument("--to", type=str, help="Target email or phone number")
    parser.add_argument("--body", type=str, help="Custom message body")
    parser.add_argument("--direct", action="store_true", help="Use direct Supabase RPC instead of n8n webhook")
    parser.add_argument("--scorecard", action="store_true", help="Print current revenue scorecard metrics")
    
    args = parser.parse_args()
    
    if args.scorecard:
        print_scorecard()
        return

    if args.email_code:
        if not args.to:
            print("❌ --to is required when supplying --email-code")
            sys.exit(1)
        run_email_otp(args.to, args.email_code, args.body, use_webhook=not args.direct)
        
    elif args.sms_code:
        if not args.to:
            print("❌ --to is required when supplying --sms-code")
            sys.exit(1)
        run_sms_otp(args.to, args.sms_code, args.body, use_webhook=not args.direct)
        
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
