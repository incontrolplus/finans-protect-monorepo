"""
Open Balancer B2B Onboarding — Step 4: Supabase Persistence & Telemetry
Handles automated upsert into public.verified_business_profiles and telemetry into public.workflow_executions
"""

import os
import sys
import json
import time
import socket
import subprocess
from datetime import datetime, timezone
from typing import Dict, Any, Optional

DB_CONTAINER = "supabase-db"

def run_psql_query(sql_statement: str) -> subprocess.CompletedProcess:
    """Executes a SQL statement directly against supabase-db container via docker exec, or falls back to SSH."""
    try:
        cmd = [
            "docker", "exec", "-i", DB_CONTAINER,
            "psql", "-U", "postgres", "-d", "postgres"
        ]
        res = subprocess.run(cmd, input=sql_statement, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
        if res.returncode == 0:
            return res
    except Exception:
        pass
    
    # Fallback to SSH to macmini-primary (leon)
    cmd_ssh = ["ssh", "leon", f"docker exec -i {DB_CONTAINER} psql -U postgres -d postgres"]
    return subprocess.run(cmd_ssh, input=sql_statement, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=15)

def upsert_verified_business_profile(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Performs an atomic upsert on public.verified_business_profiles based on unique EIK.
    Returns the persisted record details.
    """
    eik = profile_data.get("eik", "")
    if not eik:
        raise ValueError("Cannot upsert verified_business_profile without valid eik")
    
    # Format and escape fields
    business_name_bg = (profile_data.get("business_name_bg") or f"Компания {eik}").replace("'", "''")
    business_name_en = (profile_data.get("business_name_en") or f"Company {eik}").replace("'", "''")
    legal_form_bg = (profile_data.get("legal_form_bg") or "ЕООД").replace("'", "''")
    business_structure_en = (profile_data.get("business_structure_en") or "Single-Member Limited Liability Company").replace("'", "''")
    entity_type = (profile_data.get("entity_type") or "EOOD").replace("'", "''")
    vat_number = (profile_data.get("vat_number") or f"BG{eik}").replace("'", "''")
    is_vat_registered = "true" if profile_data.get("is_vat_registered", True) else "false"
    is_active = "true" if profile_data.get("is_active", True) else "false"
    activity_status = (profile_data.get("activity_status") or "ACTIVE").replace("'", "''")
    
    application_id = (profile_data.get("application_id") or "").replace("'", "''")
    onboarding_url = (profile_data.get("onboarding_url") or "").replace("'", "''")
    onboarding_token = (profile_data.get("onboarding_token") or "").replace("'", "''")
    onboarding_expires_at = profile_data.get("onboarding_expires_at") or profile_data.get("expires_at_iso") or "NOW() + interval '72 hours'"
    if onboarding_expires_at != "NOW() + interval '72 hours'":
        onboarding_expires_at = f"'{onboarding_expires_at}'::timestamptz"
    
    bonus_program = (profile_data.get("bonus_program") or "FREE_CARD_PLUS_150_BONUS").replace("'", "''")
    bonus_amount = float(profile_data.get("bonus_amount_eur", 150.00))
    eligibility_status = (profile_data.get("eligibility_status") or "APPROVED").replace("'", "''")
    approval_reason = (profile_data.get("approval_reason") or "Automated pipeline approval").replace("'", "''")
    
    profile_status = (profile_data.get("profile_status") or "verified").replace("'", "''")
    wallester_status = (profile_data.get("wallester_status") or "ACTIVE").replace("'", "''")
    
    client_sms_text = (profile_data.get("client_sms_text") or "").replace("'", "''")
    client_email_text = (profile_data.get("client_email_text") or "").replace("'", "''")
    
    telegram_notified = "NOW()" if profile_data.get("telegram_notified", True) else "NULL"
    
    sql = f"""
    INSERT INTO public.verified_business_profiles (
        eik, business_name_bg, business_name_en, legal_form_bg, 
        business_structure_en, entity_type, vat_number, is_vat_registered,
        is_active, activity_status, application_id, onboarding_url,
        onboarding_token, onboarding_expires_at, bonus_program, bonus_amount_eur,
        eligibility_status, approval_reason, profile_status, wallester_status,
        telegram_notified_at, client_sms_text, client_email_text,
        verified_at, last_checked_at, created_at, updated_at
    ) VALUES (
        '{eik}', '{business_name_bg}', '{business_name_en}', '{legal_form_bg}',
        '{business_structure_en}', '{entity_type}', '{vat_number}', {is_vat_registered},
        {is_active}, '{activity_status}', '{application_id}', '{onboarding_url}',
        '{onboarding_token}', {onboarding_expires_at}, '{bonus_program}', {bonus_amount},
        '{eligibility_status}', '{approval_reason}', '{profile_status}', '{wallester_status}',
        {telegram_notified}, '{client_sms_text}', '{client_email_text}',
        NOW(), NOW(), NOW(), NOW()
    )
    ON CONFLICT (eik) DO UPDATE SET
        business_name_bg = EXCLUDED.business_name_bg,
        business_name_en = EXCLUDED.business_name_en,
        legal_form_bg = EXCLUDED.legal_form_bg,
        business_structure_en = EXCLUDED.business_structure_en,
        entity_type = EXCLUDED.entity_type,
        vat_number = EXCLUDED.vat_number,
        is_vat_registered = EXCLUDED.is_vat_registered,
        is_active = EXCLUDED.is_active,
        activity_status = EXCLUDED.activity_status,
        application_id = EXCLUDED.application_id,
        onboarding_url = EXCLUDED.onboarding_url,
        onboarding_token = EXCLUDED.onboarding_token,
        onboarding_expires_at = EXCLUDED.onboarding_expires_at,
        bonus_program = EXCLUDED.bonus_program,
        bonus_amount_eur = EXCLUDED.bonus_amount_eur,
        eligibility_status = EXCLUDED.eligibility_status,
        approval_reason = EXCLUDED.approval_reason,
        profile_status = EXCLUDED.profile_status,
        wallester_status = EXCLUDED.wallester_status,
        telegram_notified_at = COALESCE(EXCLUDED.telegram_notified_at, public.verified_business_profiles.telegram_notified_at),
        client_sms_text = EXCLUDED.client_sms_text,
        client_email_text = EXCLUDED.client_email_text,
        last_checked_at = NOW(),
        updated_at = NOW()
    RETURNING id, eik, application_id, eligibility_status, bonus_program, onboarding_url, created_at, updated_at;
    """
    
    res = run_psql_query(sql)
    if res.returncode != 0:
        raise RuntimeError(f"Failed to upsert verified_business_profile: {res.stderr}")
    
    # Also register account in public.wallester_accounts
    acc_res = register_wallester_account(profile_data)

    return {
        "success": True,
        "eik": eik,
        "application_id": application_id,
        "eligibility_status": eligibility_status,
        "persisted_via": "supabase-db.public.verified_business_profiles",
        "wallester_account": acc_res,
        "output": res.stdout.strip()
    }

def register_wallester_account(profile_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Registers an account in public.wallester_accounts for the verified business.
    """
    owner_id = profile_data.get("owner_id")
    phone = (profile_data.get("phone_number") or profile_data.get("phone") or "+359888123456").replace("'", "''")
    eik = profile_data.get("eik", "")
    email = (profile_data.get("email_alias_33mail") or profile_data.get("email") or f"contact_{eik}@openbalancer.com").replace("'", "''")
    status = (profile_data.get("wallester_status") or "ACTIVE").replace("'", "''")
    if status not in ["ACTIVE", "pending_signup", "verified"]:
        status = "ACTIVE"
    
    owner_val = f"'{owner_id}'::uuid" if owner_id else "NULL"
    
    sql = f"""
    INSERT INTO public.wallester_accounts (
        owner_id, status, wallester_phone, wallester_email, created_at, updated_at
    ) VALUES (
        {owner_val}, '{status}', '{phone}', '{email}', NOW(), NOW()
    ) RETURNING id, status, wallester_phone, wallester_email, created_at;
    """
    res = run_psql_query(sql)
    if res.returncode != 0:
        print(f"⚠️ Wallester account insert warning: {res.stderr}", file=sys.stderr)
        return {"success": False, "error": res.stderr}
    return {"success": True, "output": res.stdout.strip()}

def log_workflow_telemetry(
    workflow_name: str,
    run_id: str,
    status: str,
    duration_ms: int,
    payload: Dict[str, Any],
    host_node: Optional[str] = None,
    error_message: Optional[str] = None,
    execution_source: str = "b2b_onboarding_pipeline"
) -> bool:
    """
    Logs workflow execution telemetry into public.workflow_executions.
    """
    resolved_host = host_node or socket.gethostname()
    payload_json = json.dumps(payload, ensure_ascii=False).replace("'", "''")
    err_escaped = (error_message or "").replace("'", "''")
    
    sql = f"""
    INSERT INTO public.workflow_executions (
        workflow_name, execution_source, run_id, status, duration_ms, host_node, error_message, payload, created_at, updated_at
    ) VALUES (
        '{workflow_name}', '{execution_source}', '{run_id}', '{status.upper()}', {duration_ms}, '{resolved_host}', '{err_escaped}', '{payload_json}'::jsonb, NOW(), NOW()
    );
    """
    res = run_psql_query(sql)
    if res.returncode != 0:
        print(f"⚠️ Telemetry log error: {res.stderr}", file=sys.stderr)
        return False
    return True
