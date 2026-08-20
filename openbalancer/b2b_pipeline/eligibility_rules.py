"""
Open Balancer B2B Onboarding — Step 2: Eligibility Rules Engine
Rule: Automatic approval for Active entities with valid VAT registration for "FREE_CARD_PLUS_150_BONUS"
"""

from typing import Dict, Any

DEFAULT_BONUS_PROGRAM = "FREE_CARD_PLUS_150_BONUS"
DEFAULT_BONUS_AMOUNT_EUR = 150.00
DEFAULT_CARD_TIER = "CORPORATE_PLATINUM_VIRTUAL"

def evaluate_b2b_eligibility(profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Evaluates B2B Onboarding Eligibility for commercial programs.
    Rule:
      1. Business must be Active (is_active == True and activity_status in ['ACTIVE', 'VERIFIED'])
      2. Business must have valid VAT registration (is_vat_registered == True and vat_number starts with 'BG')
    """
    eik = profile.get("eik", "")
    is_active = profile.get("is_active", True)
    activity_status = str(profile.get("activity_status", "ACTIVE")).upper()
    is_vat_registered = profile.get("is_vat_registered", True)
    vat_number = str(profile.get("vat_number", f"BG{eik}")).upper()
    
    reasons = []
    
    # Check 1: Active Status
    active_ok = bool(is_active and activity_status in ["ACTIVE", "VERIFIED", "OPERATIONAL"])
    if not active_ok:
        reasons.append(f"Entity is not active (status: {activity_status})")
    
    # Check 2: VAT Registration
    vat_ok = bool(is_vat_registered and vat_number.startswith("BG") and len(vat_number) >= 11)
    if not vat_ok:
        reasons.append(f"Entity lacks active BG VAT registration (vat: {vat_number})")
    
    if active_ok and vat_ok:
        return {
            "success": True,
            "eligibility_status": "APPROVED",
            "is_eligible": True,
            "bonus_program": DEFAULT_BONUS_PROGRAM,
            "bonus_amount_eur": DEFAULT_BONUS_AMOUNT_EUR,
            "card_tier": DEFAULT_CARD_TIER,
            "approval_reason": f"Automatic approval: Active entity with validated VAT registration ({DEFAULT_BONUS_PROGRAM})",
            "requires_manual_review": False,
            "credit_line_available": False,
            "corporate_cards_limit": 10,
            "instant_issuing": True
        }
    elif active_ok and not vat_ok:
        return {
            "success": True,
            "eligibility_status": "STANDARD_APPROVAL",
            "is_eligible": False,
            "bonus_program": "STANDARD_B2B_NO_BONUS",
            "bonus_amount_eur": 0.00,
            "card_tier": "CORPORATE_STANDARD",
            "approval_reason": "Approved for standard corporate card without 150 EUR bonus (No active VAT)",
            "requires_manual_review": False,
            "credit_line_available": False,
            "corporate_cards_limit": 2,
            "instant_issuing": True
        }
    else:
        return {
            "success": False,
            "eligibility_status": "REJECTED",
            "is_eligible": False,
            "bonus_program": "NONE",
            "bonus_amount_eur": 0.00,
            "card_tier": "NONE",
            "approval_reason": "; ".join(reasons),
            "requires_manual_review": True,
            "credit_line_available": False,
            "corporate_cards_limit": 0,
            "instant_issuing": False
        }
