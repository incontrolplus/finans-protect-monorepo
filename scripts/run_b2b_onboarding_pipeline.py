#!/usr/bin/env python3
"""
Open Balancer — Standalone B2B Onboarding & Verification Pipeline Runner
Runs the 5-step pipeline for 9-digit or 13-digit EIK on macmini-primary.
"""

import sys
import os
import json
import argparse

# Add parent directory to sys.path
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from openbalancer.b2b_pipeline.pipeline import execute_b2b_onboarding_pipeline

def main():
    parser = argparse.ArgumentParser(description="Open Balancer B2B Onboarding Runner")
    parser.add_argument("--eik", "-e", required=True, help="Bulgarian EIK (9 or 13 digits)")
    parser.add_argument("--name-bg", help="Company Name in Bulgarian")
    parser.add_argument("--name-en", help="Company Name in English")
    parser.add_argument("--phone", default="+359888123456", help="Contact phone")
    parser.add_argument("--email", default="b2b@openbalancer.com", help="Contact email")
    parser.add_argument("--no-telegram", action="store_true", help="Skip Telegram notification")
    parser.add_argument("--no-db", action="store_true", help="Skip Supabase persistence")

    args = parser.parse_args()

    res = execute_b2b_onboarding_pipeline(
        eik=args.eik,
        company_name_bg=args.name_bg,
        company_name_en=args.name_en,
        phone=args.phone,
        email=args.email,
        send_telegram=not args.no_telegram,
        persist_db=not args.no_db
    )

    print(json.dumps(res, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()
