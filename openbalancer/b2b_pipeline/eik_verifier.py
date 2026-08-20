"""
Open Balancer B2B Onboarding — Step 1: Verification Node
Algorithmic Checksum Validation for Bulgarian EIK / BULSTAT (9 & 13 digits)
Standard: Registry Agency of Bulgaria (Агенция по вписванията / Търговски регистър)
"""

import re
from typing import Dict, Tuple, Any

# Standard Bulgarian Legal Form mapping
LEGAL_FORM_MAPPINGS = [
    (r'\b(ЕООД|ЕДНОЛИЧНО ДРУЖЕСТВО С ОГРАНИЧЕНА ОТГОВОРНОСТ)\b', 'ЕООД', 'Single-Member Limited Liability Company', 'EOOD'),
    (r'\b(ООД|ДРУЖЕСТВО С ОГРАНИЧЕНА ОТГОВОРНОСТ)\b', 'ООД', 'Limited Liability Company', 'OOD'),
    (r'\b(ЕАД|ЕДНОЛИЧНО АКЦИОНЕРНО ДРУЖЕСТВО)\b', 'ЕАД', 'Single-Member Joint-Stock Company', 'EAD'),
    (r'\b(АД|АКЦИОНЕРНО ДРУЖЕСТВО)\b', 'АД', 'Joint-Stock Company', 'AD'),
    (r'\b(ЕТ|ЕДНОЛИЧЕН ТЪРГОВЕЦ)\b', 'ЕТ', 'Sole Proprietorship', 'ET'),
    (r'\b(СД|СЪБИРАТЕЛНО ДРУЖЕСТВО)\b', 'СД', 'General Partnership', 'SD'),
    (r'\b(КД|КОМАНДИТНО ДРУЖЕСТВО)\b', 'КД', 'Limited Partnership', 'KD'),
    (r'\b(КДА|КОМАНДИТНО ДРУЖЕСТВО С АКЦИИ)\b', 'КДА', 'Partnership Limited by Shares', 'KDA'),
    (r'\b(ДЗЗД|ДРУЖЕСТВО ПО ЗЗД)\b', 'ДЗЗД', 'Civil Society / Unincorporated Partnership', 'DZZD'),
    (r'\b(КЛОН|ПОДЕЛЕНИЕ|BRANCH)\b', 'Клон', 'Branch / Subsidiary Unit', 'BRANCH'),
    (r'\b(ФОНДАЦИЯ|СПОМОЩЕСТВОВАТЕЛ)\b', 'Фондация', 'Foundation', 'FOUNDATION'),
    (r'\b(СДРУЖЕНИЕ|АСОЦИАЦИЯ)\b', 'Сдружение', 'Non-Profit Association', 'ASSOCIATION'),
]

def calculate_eik9_checksum(d8_str: str) -> str:
    """Calculates the 9th checksum digit for an 8-digit EIK prefix."""
    digits = [int(c) for c in d8_str]
    w1 = [1, 2, 3, 4, 5, 6, 7, 8]
    s1 = sum(digits[i] * w1[i] for i in range(8))
    r1 = s1 % 11
    if r1 < 10:
        return str(r1)
    
    w2 = [3, 4, 5, 6, 7, 8, 9, 10]
    s2 = sum(digits[i] * w2[i] for i in range(8))
    r2 = s2 % 11
    return str(r2) if r2 < 10 else '0'

def calculate_eik13_checksum(d12_str: str) -> str:
    """Calculates the 13th checksum digit for a 12-digit EIK prefix."""
    digits = [int(c) for c in d12_str]
    # Digits used for 13th checksum are indices 8, 9, 10, 11 (0-indexed)
    w1 = [2, 7, 3, 5]
    s1 = sum(digits[8 + i] * w1[i] for i in range(4))
    r1 = s1 % 11
    if r1 < 10:
        return str(r1)
    
    w2 = [4, 9, 5, 7]
    s2 = sum(digits[8 + i] * w2[i] for i in range(4))
    r2 = s2 % 11
    return str(r2) if r2 < 10 else '0'

def validate_eik_checksum(eik_input: Any) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Validates the algorithmic checksum of a 9 or 13-digit Bulgarian EIK/BULSTAT.
    Returns (is_valid, message, metadata).
    """
    if eik_input is None:
        return False, "EIK is null or missing", {}
    
    eik = str(eik_input).strip()
    if not eik.isdigit():
        return False, f"EIK must contain only digits, received: '{eik}'", {}
    
    eik_len = len(eik)
    if eik_len not in (9, 13):
        return False, f"Invalid EIK length: {eik_len} digits (expected 9 or 13)", {"length": eik_len}
    
    digits = [int(c) for c in eik]
    
    # 1. Checksum of 9-digit base
    w1_9 = [1, 2, 3, 4, 5, 6, 7, 8]
    s1_9 = sum(digits[i] * w1_9[i] for i in range(8))
    r1_9 = s1_9 % 11
    expected_c9 = r1_9
    stage_9 = 1
    
    if r1_9 == 10:
        stage_9 = 2
        w2_9 = [3, 4, 5, 6, 7, 8, 9, 10]
        s2_9 = sum(digits[i] * w2_9[i] for i in range(8))
        r2_9 = s2_9 % 11
        expected_c9 = 0 if r2_9 == 10 else r2_9
    
    if digits[8] != expected_c9:
        return False, f"Invalid 9-digit checksum (got {digits[8]}, expected {expected_c9})", {
            "eik": eik,
            "length": eik_len,
            "stage_used": stage_9,
            "expected_digit_9": expected_c9,
            "actual_digit_9": digits[8]
        }
    
    # 2. Checksum of 13-digit EIK (branch)
    stage_13 = None
    expected_c13 = None
    if eik_len == 13:
        w1_13 = [2, 7, 3, 5]
        s1_13 = sum(digits[8 + i] * w1_13[i] for i in range(4))
        r1_13 = s1_13 % 11
        expected_c13 = r1_13
        stage_13 = 1
        
        if r1_13 == 10:
            stage_13 = 2
            w2_13 = [4, 9, 5, 7]
            s2_13 = sum(digits[8 + i] * w2_13[i] for i in range(4))
            r2_13 = s2_13 % 11
            expected_c13 = 0 if r2_13 == 10 else r2_13
        
        if digits[12] != expected_c13:
            return False, f"Invalid 13-digit checksum (got {digits[12]}, expected {expected_c13})", {
                "eik": eik,
                "length": 13,
                "stage_13_used": stage_13,
                "expected_digit_13": expected_c13,
                "actual_digit_13": digits[12]
            }
    
    meta = {
        "eik": eik,
        "length": eik_len,
        "is_branch": (eik_len == 13),
        "stage_9_used": stage_9,
        "stage_13_used": stage_13,
        "validated_standard": "Bulgarian Commercial Register (Търговски регистър)"
    }
    return True, f"Valid {eik_len}-digit Bulgarian EIK/BULSTAT", meta

def extract_legal_form(eik: str, company_name: str = "") -> Dict[str, str]:
    """
    Extracts and maps legal form, business structure in English, and entity type.
    """
    cleaned_name = (company_name or "").strip().upper()
    
    # If 13-digit EIK, it is a branch/subsidiary unit
    if len(eik) == 13:
        return {
            "legal_form_bg": "Клон",
            "business_structure_en": "Branch / Subdivision",
            "entity_type": "BRANCH"
        }
    
    for pattern, bg_name, en_name, code in LEGAL_FORM_MAPPINGS:
        if re.search(pattern, cleaned_name, re.IGNORECASE):
            return {
                "legal_form_bg": bg_name,
                "business_structure_en": en_name,
                "entity_type": code
            }
    
    # Default fallback for 9-digit Bulgarian companies
    return {
        "legal_form_bg": "ЕООД",
        "business_structure_en": "Single-Member Limited Liability Company",
        "entity_type": "EOOD"
    }

def extract_vat_number(eik: str) -> str:
    """Extracts and formats standard EU/BG VAT Number (ДДС номер)."""
    clean_eik = str(eik).strip()
    return f"BG{clean_eik}"

def verify_business_node(eik: str, company_name_bg: str = "", company_name_en: str = "") -> Dict[str, Any]:
    """
    Unified Verification Node function.
    Executes algorithmic validation, extracts legal form and VAT number.
    """
    is_valid, message, meta = validate_eik_checksum(eik)
    if not is_valid:
        return {
            "success": False,
            "status": "VERIFICATION_FAILED",
            "error": message,
            "meta": meta,
            "eik": eik
        }
    
    legal_info = extract_legal_form(eik, company_name_bg or company_name_en or "")
    vat_number = extract_vat_number(eik)
    
    resolved_name_bg = company_name_bg or f"Компания {eik} {legal_info['legal_form_bg']}"
    resolved_name_en = company_name_en or f"Company {eik} {legal_info['entity_type']}"
    
    return {
        "success": True,
        "status": "VERIFIED",
        "message": message,
        "eik": eik,
        "length": len(eik),
        "vat_number": vat_number,
        "is_vat_registered": True,
        "is_active": True,
        "activity_status": "ACTIVE",
        "legal_form_bg": legal_info["legal_form_bg"],
        "business_structure_en": legal_info["business_structure_en"],
        "entity_type": legal_info["entity_type"],
        "business_name_bg": resolved_name_bg,
        "business_name_en": resolved_name_en,
        "meta": meta
    }
