"""
Open Balancer — 5-Step B2B Onboarding & Verification Pipeline Orchestrator
Executes:
  1. Verification Node (Bulgarian EIK Checksum 9/13 digits, Legal form & VAT extraction)
  2. Eligibility Rules (Active status + VAT registration -> FREE_CARD_PLUS_150_BONUS)
  3. Wallester API Client (APP-WB-{YYYYMMDD}-{UUID} & 72h HMAC-SHA256 link to cashflow.openbalancer.com)
  4. Supabase Persistence (Atomic Upsert into verified_business_profiles + telemetry into workflow_executions)
  5. Notifications (Client SMS/Email formatting + Telegram Admin Alert dispatch)
"""

import time
import uuid
from typing import Dict, Any, Optional

from .eik_verifier import verify_business_node
from .eligibility_rules import evaluate_b2b_eligibility
from .wallester_client import (
    generate_application_id,
    generate_hmac_onboarding_url,
    create_wallester_registration_payload
)
from .supabase_persistence import upsert_verified_business_profile, log_workflow_telemetry
from .notifier import (
    format_client_sms_text,
    format_client_email_text,
    send_telegram_notification
)

def execute_b2b_onboarding_pipeline(
    eik: str,
    company_name_bg: Optional[str] = None,
    company_name_en: Optional[str] = None,
    phone: Optional[str] = None,
    email: Optional[str] = None,
    is_vat_registered: bool = True,
    is_active: bool = True,
    send_telegram: bool = True,
    persist_db: bool = True
) -> Dict[str, Any]:
    """
    Executes the complete 5-step B2B Onboarding and Verification Pipeline.
    Returns full execution report with per-step timing and telemetry.
    """
    pipeline_t0 = time.time()
    step_timings = {}
    run_id = f"wb-b2b-{int(pipeline_t0 * 1000)}-{uuid.uuid4().hex[:6]}"
    
    # ─── STEP 1: Verification Node ──────────────────────────────────────────
    s1_t0 = time.time()
    verification_res = verify_business_node(
        eik=eik,
        company_name_bg=company_name_bg or "",
        company_name_en=company_name_en or ""
    )
    step_timings["1_verification_node_ms"] = round((time.time() - s1_t0) * 1000, 2)
    
    if not verification_res.get("success"):
        total_ms = round((time.time() - pipeline_t0) * 1000, 2)
        error_msg = verification_res.get("error", "EIK verification failed")
        if persist_db:
            log_workflow_telemetry(
                workflow_name="B2B_ONBOARDING_VERIFICATION_PIPELINE",
                run_id=run_id,
                status="FAILED_VERIFICATION",
                duration_ms=int(total_ms),
                payload={"eik": eik, "error": error_msg, "step_timings": step_timings},
                error_message=error_msg
            )
        return {
            "success": False,
            "pipeline_status": "FAILED_VERIFICATION",
            "run_id": run_id,
            "eik": eik,
            "error": error_msg,
            "step_timings": step_timings,
            "total_duration_ms": total_ms
        }
    
    profile_data = {**verification_res}
    profile_data["is_active"] = is_active
    profile_data["is_vat_registered"] = is_vat_registered
    if phone:
        profile_data["phone_number"] = phone
    if email:
        profile_data["email_alias_hostinger"] = email

    # ─── STEP 2: Eligibility Rules ──────────────────────────────────────────
    s2_t0 = time.time()
    eligibility_res = evaluate_b2b_eligibility(profile_data)
    step_timings["2_eligibility_rules_ms"] = round((time.time() - s2_t0) * 1000, 2)
    
    profile_data.update({
        "eligibility_status": eligibility_res.get("eligibility_status"),
        "bonus_program": eligibility_res.get("bonus_program"),
        "bonus_amount_eur": eligibility_res.get("bonus_amount_eur"),
        "card_tier": eligibility_res.get("card_tier"),
        "approval_reason": eligibility_res.get("approval_reason")
    })

    # ─── STEP 3: Wallester API Client ───────────────────────────────────────
    s3_t0 = time.time()
    app_id = generate_application_id()
    onboarding_info = generate_hmac_onboarding_url(
        application_id=app_id,
        eik=profile_data["eik"],
        program=profile_data["bonus_program"],
        ttl_hours=72
    )
    wallester_payload = create_wallester_registration_payload(profile_data, onboarding_info)
    step_timings["3_wallester_client_ms"] = round((time.time() - s3_t0) * 1000, 2)
    
    profile_data.update({
        "application_id": app_id,
        "onboarding_url": onboarding_info["onboarding_url"],
        "onboarding_token": onboarding_info["onboarding_token"],
        "onboarding_expires_at": onboarding_info["expires_at_iso"],
        "wallester_status": "READY_FOR_KYC"
    })

    # ─── STEP 4: Notifications Formatting & Telegram Dispatch ───────────────
    s5_t0 = time.time()
    sms_text = format_client_sms_text(profile_data, onboarding_info)
    email_bundle = format_client_email_text(profile_data, onboarding_info)
    profile_data["client_sms_text"] = sms_text
    profile_data["client_email_text"] = email_bundle["plain_text"]
    
    telegram_res = {"success": False, "status": "SKIPPED"}
    if send_telegram:
        partial_duration = round((time.time() - pipeline_t0) * 1000)
        telegram_res = send_telegram_notification(
            profile=profile_data,
            onboarding_info=onboarding_info,
            duration_ms=partial_duration
        )
    profile_data["telegram_notified"] = telegram_res.get("success", False)
    step_timings["5_notifications_ms"] = round((time.time() - s5_t0) * 1000, 2)

    # ─── STEP 5: Supabase Persistence & Telemetry Log ────────────────────────
    s4_t0 = time.time()
    db_res = {"success": False, "status": "SKIPPED"}
    if persist_db:
        db_res = upsert_verified_business_profile(profile_data)
    step_timings["4_supabase_persistence_ms"] = round((time.time() - s4_t0) * 1000, 2)
    
    total_duration_ms = round((time.time() - pipeline_t0) * 1000, 2)
    
    if persist_db:
        log_workflow_telemetry(
            workflow_name="B2B_ONBOARDING_VERIFICATION_PIPELINE",
            run_id=run_id,
            status="SUCCESS",
            duration_ms=int(total_duration_ms),
            payload={
                "eik": eik,
                "application_id": app_id,
                "eligibility": eligibility_res,
                "onboarding": onboarding_info,
                "step_timings": step_timings,
                "telegram": telegram_res
            }
        )
    
    return {
        "success": True,
        "pipeline_status": "COMPLETED_SUCCESSFULLY",
        "run_id": run_id,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "total_duration_ms": total_duration_ms,
        "step_timings": step_timings,
        "results": {
            "step_1_verification": {
                "status": "VERIFIED",
                "eik": eik,
                "length": len(eik),
                "is_branch": (len(eik) == 13),
                "legal_form_bg": profile_data["legal_form_bg"],
                "business_structure_en": profile_data["business_structure_en"],
                "entity_type": profile_data["entity_type"],
                "vat_number": profile_data["vat_number"],
                "business_name_bg": profile_data["business_name_bg"],
                "business_name_en": profile_data["business_name_en"]
            },
            "step_2_eligibility": eligibility_res,
            "step_3_wallester": {
                "application_id": app_id,
                "onboarding_url": onboarding_info["onboarding_url"],
                "expires_at": onboarding_info["expires_at_iso"],
                "ttl_hours": onboarding_info["ttl_hours"],
                "wallester_payload": wallester_payload
            },
            "step_4_persistence": db_res,
            "step_5_notifications": {
                "client_sms": sms_text,
                "client_email_subject": email_bundle["subject"],
                "telegram_notification": telegram_res
            }
        }
    }
