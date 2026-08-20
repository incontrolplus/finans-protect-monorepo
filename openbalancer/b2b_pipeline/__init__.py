"""
Open Balancer — B2B Onboarding & Verification Pipeline Package
"""

from .eik_verifier import validate_eik_checksum, extract_legal_form, extract_vat_number, verify_business_node
from .eligibility_rules import evaluate_b2b_eligibility
from .wallester_client import generate_application_id, generate_hmac_onboarding_url, create_wallester_registration_payload
from .supabase_persistence import upsert_verified_business_profile, log_workflow_telemetry
from .notifier import format_client_sms_text, format_client_email_text, send_telegram_notification
from .pipeline import execute_b2b_onboarding_pipeline

__all__ = [
    "validate_eik_checksum",
    "extract_legal_form",
    "extract_vat_number",
    "verify_business_node",
    "evaluate_b2b_eligibility",
    "generate_application_id",
    "generate_hmac_onboarding_url",
    "create_wallester_registration_payload",
    "upsert_verified_business_profile",
    "log_workflow_telemetry",
    "format_client_sms_text",
    "format_client_email_text",
    "send_telegram_notification",
    "execute_b2b_onboarding_pipeline"
]
