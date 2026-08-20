#!/usr/bin/env python3
"""
Open Balancer — Card Issuance Pipeline CLI Runner
Usage:
  python3 run_card_issuance_pipeline.py --help
  python3 run_card_issuance_pipeline.py --eik 207849182
  python3 run_card_issuance_pipeline.py --pending
  python3 run_card_issuance_pipeline.py --list-cards
  python3 run_card_issuance_pipeline.py --scorecard
  python3 run_card_issuance_pipeline.py --eik 207111003 --webhook
"""

import os
import sys
import json
import time
import argparse
import urllib.request
import urllib.parse
from typing import Dict, Any

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from openbalancer.b2b_pipeline.card_issuer import (
    issue_card_for_profile,
    issue_cards_for_pending_profiles,
    get_issued_cards,
    get_revenue_scorecard,
    DEFAULT_SUPABASE_URL,
    DEFAULT_SUPABASE_KEY
)

WEBHOOK_URL = "http://100.83.83.8:5679/webhook/issue-card"

def run_single_card_webhook(eik: str, force: bool = False):
    print(f"📡 Invoking n8n Webhook for Card Issuance (EIK: {eik})...")
    payload = {"eik": eik, "force": force}
    t0 = time.time()
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            latency_ms = (time.time() - t0) * 1000
            data = json.loads(resp.read().decode('utf-8'))
            print(f"✅ Status: {resp.status} OK (latency: {latency_ms:.1f}ms)")
            print(f"📦 Response:\n{json.dumps(data, indent=2, ensure_ascii=False)}")
    except Exception as e:
        print(f"❌ Webhook call failed: {e}")

def run_single_card_direct(eik: str, force: bool = False, send_alert: bool = True):
    print(f"⚡ Issuing Card directly via Supabase Engine (EIK: {eik}, Force: {force})...")
    res = issue_card_for_profile(eik, force=force, send_alert=send_alert)
    print(f"📦 Result (latency: {res.get('latency_ms', 0):.1f}ms):")
    print(json.dumps(res, indent=2, ensure_ascii=False))

def run_batch_pending(limit: int = 50, send_alert: bool = True):
    print(f"🚀 Scanning for pending profiles in VERIFIED_READY_FOR_CARD_ISSUING (limit: {limit})...")
    res = issue_cards_for_pending_profiles(limit=limit, send_alert=send_alert)
    print(f"✅ Processed {res.get('processed_count', 0)} profiles, issued {res.get('issued_count', 0)} cards:")
    print(json.dumps(res, indent=2, ensure_ascii=False))

def print_cards_list(limit: int = 50):
    print("💳 Fetching all issued payment cards from Supabase...")
    cards = get_issued_cards(limit=limit)
    if not cards:
        print("ℹ️ No payment cards found in database.")
        return
        
    print(f"📋 Total Cards Found: {len(cards)}")
    for idx, c in enumerate(cards, 1):
        print(f"\n[{idx}] Card UUID: {c.get('card_uuid')}")
        print(f"    EIK: {c.get('eik')} | Holder: {c.get('cardholder_full_name')}")
        print(f"    Number: **** **** **** {c.get('card_number_last4')} | Exp: {c.get('expiry_date')}")
        print(f"    Product: {c.get('card_type')} | Issuer: {c.get('issuer_bank')}")
        print(f"    Balance: €{float(c.get('balance') or 0):.2f} {c.get('currency')} | Status: {c.get('status')}")
        print(f"    Created At: {c.get('created_at')}")

def print_scorecard():
    print("📊 Querying Revenue Scorecard from Supabase...")
    data = get_revenue_scorecard()
    print(json.dumps(data, indent=2, ensure_ascii=False))

def main():
    parser = argparse.ArgumentParser(description="Open Balancer Card Issuance Pipeline CLI")
    parser.add_argument("--eik", type=str, help="Bulgarian EIK/BULSTAT to issue card for")
    parser.add_argument("--force", action="store_true", help="Force card issuance even if not in VERIFIED_READY_FOR_CARD_ISSUING state")
    parser.add_argument("--pending", action="store_true", help="Batch issue cards for all pending verified profiles")
    parser.add_argument("--all", action="store_true", help="Alias for --pending")
    parser.add_argument("--limit", type=int, default=50, help="Batch processing limit")
    parser.add_argument("--list-cards", action="store_true", help="List all issued payment cards")
    parser.add_argument("--scorecard", action="store_true", help="Display Revenue Scorecard")
    parser.add_argument("--webhook", action="store_true", help="Route single request through n8n webhook")
    parser.add_argument("--no-alert", action="store_true", help="Do not dispatch Telegram alert")
    
    args = parser.parse_args()
    
    if args.scorecard:
        print_scorecard()
        return
        
    if args.list_cards:
        print_cards_list(limit=args.limit)
        return
        
    if args.pending or args.all:
        run_batch_pending(limit=args.limit, send_alert=not args.no_alert)
        return
        
    if args.eik:
        if args.webhook:
            run_single_card_webhook(args.eik, force=args.force)
        else:
            run_single_card_direct(args.eik, force=args.force, send_alert=not args.no_alert)
        return
        
    parser.print_help()

if __name__ == "__main__":
    main()
