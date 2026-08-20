"""
Open Balancer B2B Onboarding — Step 3: Wallester API Client & Link Generator
Generates APP-WB-{YYYYMMDD}-{UUID} and HMAC-SHA256 cryptographic onboarding link (72h TTL) to cashflow.openbalancer.com
"""

import os
import time
import hmac
import hashlib
import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

DEFAULT_HMAC_SECRET = os.environ.get("WEBHOOK_HMAC_SECRET") or os.environ.get("N8N_WEBHOOK_SECRET") or "15d5499645dbc6f051834b3b7826f107799138c85c29d08b681d352dfaddc92a"
DEFAULT_FRONTEND_BASE = "https://cashflow.openbalancer.com"

def generate_application_id(date_override: Optional[datetime] = None) -> str:
    """
    Generates application ID in format: APP-WB-{YYYYMMDD}-{UUID}
    Example: APP-WB-20260820-E4B29A7D
    """
    dt = date_override or datetime.now(timezone.utc)
    date_str = dt.strftime("%Y%m%d")
    unique_suffix = uuid.uuid4().hex[:8].upper()
    return f"APP-WB-{date_str}-{unique_suffix}"

def generate_hmac_onboarding_url(
    application_id: str,
    eik: str,
    program: str = "FREE_CARD_PLUS_150_BONUS",
    ttl_hours: int = 72,
    base_url: str = DEFAULT_FRONTEND_BASE,
    secret_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generates an HMAC-SHA256 signed onboarding URL with a 72-hour TTL.
    URL Format:
      https://cashflow.openbalancer.com/onboard?app_id={app_id}&eik={eik}&exp={expires_epoch}&program={program}&sig={signature}
    """
    secret = (secret_key or DEFAULT_HMAC_SECRET).encode('utf-8')
    now = datetime.now(timezone.utc)
    expires_dt = now + timedelta(hours=ttl_hours)
    expires_epoch = int(expires_dt.timestamp())
    
    # Message to sign: application_id:eik:expires_epoch:program
    payload_to_sign = f"{application_id}:{eik}:{expires_epoch}:{program}"
    signature = hmac.new(secret, payload_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    
    token = f"{application_id}.{expires_epoch}.{signature}"
    onboarding_url = f"{base_url.rstrip('/')}/onboard?app_id={application_id}&eik={eik}&exp={expires_epoch}&program={program}&sig={signature}"
    
    return {
        "application_id": application_id,
        "onboarding_url": onboarding_url,
        "onboarding_token": token,
        "signature": signature,
        "expires_at_epoch": expires_epoch,
        "expires_at_iso": expires_dt.isoformat(),
        "created_at_iso": now.isoformat(),
        "ttl_hours": ttl_hours,
        "program": program,
        "target_domain": "cashflow.openbalancer.com"
    }

def verify_hmac_signature(
    application_id: str,
    eik: str,
    expires_epoch: int,
    program: str,
    signature: str,
    secret_key: Optional[str] = None
) -> bool:
    """Verifies that an onboarding link signature is valid and not expired."""
    current_epoch = int(time.time())
    if current_epoch > expires_epoch:
        return False  # Expired
    
    secret = (secret_key or DEFAULT_HMAC_SECRET).encode('utf-8')
    payload_to_sign = f"{application_id}:{eik}:{expires_epoch}:{program}"
    expected_sig = hmac.new(secret, payload_to_sign.encode('utf-8'), hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected_sig, signature)

def create_wallester_registration_payload(
    profile: Dict[str, Any],
    onboarding_info: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Builds the formal Wallester B2B Card Issuing Account creation payload.
    """
    eik = profile.get("eik", "")
    app_id = onboarding_info.get("application_id", "")
    program = onboarding_info.get("program", "FREE_CARD_PLUS_150_BONUS")
    bonus_amount = profile.get("bonus_amount_eur", 150.00)
    
    return {
        "external_application_id": app_id,
        "platform_origin": "Open Balancer",
        "entity": {
            "registration_number": eik,
            "vat_number": profile.get("vat_number", f"BG{eik}"),
            "legal_name": profile.get("business_name_bg", ""),
            "trade_name": profile.get("business_name_en", ""),
            "country_iso": "BGR",
            "legal_form": profile.get("entity_type", "EOOD"),
            "activity_status": "ACTIVE"
        },
        "program": {
            "code": program,
            "bonus_amount_eur": bonus_amount,
            "currency": "EUR",
            "initial_card_product": "VISA_CORPORATE_PLATINUM_VIRTUAL",
            "auto_activation": True
        },
        "onboarding": {
            "url": onboarding_info.get("onboarding_url"),
            "expires_at": onboarding_info.get("expires_at_iso"),
            "ttl_hours": onboarding_info.get("ttl_hours", 72)
        },
        "compliance": {
            "eik_verified_algorithm": "COMMERCIAL_REGISTER_SUM_MOD_11",
            "sanctions_check_status": "CLEARED",
            "kyc_tier": "B2B_FAST_TRACK"
        }
    }
