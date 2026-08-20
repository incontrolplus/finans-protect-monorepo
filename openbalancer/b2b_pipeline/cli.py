#!/usr/bin/env python3
"""
Open Balancer — B2B Onboarding Pipeline CLI Runner
Tests 9-digit and 13-digit Bulgarian EIK validation and pipeline execution.
"""

import sys
import json
import argparse
from .pipeline import execute_b2b_onboarding_pipeline

def main():
    parser = argparse.ArgumentParser(description="Execute Open Balancer 5-Step B2B Onboarding Pipeline")
    parser.add_argument("--eik", "-e", required=True, help="Bulgarian EIK/BULSTAT (9 or 13 digits)")
    parser.add_argument("--name-bg", help="Company Name in Bulgarian")
    parser.add_argument("--name-en", help="Company Name in English")
    parser.add_argument("--phone", default="+359888123456", help="Contact phone")
    parser.add_argument("--email", default="onboarding@openbalancer.com", help="Contact email")
    parser.add_argument("--no-telegram", action="store_true", help="Skip sending Telegram notification")
    parser.add_argument("--no-db", action="store_true", help="Skip database persistence")

    args = parser.parse_args()

    result = execute_b2b_onboarding_pipeline(
        eik=args.eik,
        company_name_bg=args.name_bg,
        company_name_en=args.name_en,
        phone=args.phone,
        email=args.email,
        send_telegram=not args.no_telegram,
        persist_db=not args.no_db
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))
    if not result.get("success"):
        sys.exit(1)

if __name__ == "__main__":
    main()
