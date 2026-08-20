"""
Open Balancer — Step 2: Email & SMS OTP Ingestion, Parser & Phone Matcher Engine
Handles:
  1. 6-digit OTP code extraction with false-positive filtering (EIKs, postal codes, phones)
  2. Phone number normalization (+359, 088, etc.) and email alias matching
  3. Supabase atomic database updates (verified_business_profiles, email_messages, sms_messages, sms_numbers_pool)
  4. Auto-Advancement engine (VERIFIED_READY_FOR_CARD_ISSUING)
  5. Telegram alerts dispatch to Leon | DevOps (8041248687)
"""

import os
import re
import json
import time
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any, Optional, Tuple

DEFAULT_SUPABASE_URL = os.environ.get("SUPABASE_URL") or "http://100.83.83.8:8002"
DEFAULT_SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"
DEFAULT_TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or "8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88"
DEFAULT_TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID") or "8041248687"

# Context patterns that strongly indicate an OTP verification code
OTP_CONTEXT_PATTERNS = [
    re.compile(r'(?:code|код|otp|pin|passcode|парола|верификация|verification|security|потвърждение|потвърди|въведете)[\s:=]+(\d{6})\b', re.IGNORECASE),
    re.compile(r'\b(\d{6})\b[\s:=]+(?:is\s+your|е\s+вашият|е\s+код|is\s+the\s+code)', re.IGNORECASE),
    re.compile(r'(?:^|[\s\(\[\{:])(\d{6})(?:[\s\)\]\}\.,!?:;]|$)', re.IGNORECASE)
]

def extract_otp_code(text: Optional[str]) -> Optional[str]:
    """
    Extracts a 6-digit OTP code from raw text, email body, or SMS content.
    Guarantees false-positive immunity against:
      - 9 or 13 digit Bulgarian EIK/BULSTAT numbers
      - 4-digit postal codes
      - 10-digit PIN/EGN or phone numbers
    """
    if not text:
        return None
    
    clean_text = str(text).strip()
    
    # 1. Try high-confidence contextual patterns first
    for pattern in OTP_CONTEXT_PATTERNS:
        match = pattern.search(clean_text)
        if match:
            candidate = match.group(1)
            # Ensure candidate is exactly 6 digits
            if len(candidate) == 6 and candidate.isdigit():
                return candidate
                
    # 2. Fallback: Standalone 6-digit word boundary match
    all_6_digits = re.findall(r'\b\d{6}\b', clean_text)
    if all_6_digits:
        # Return first valid 6-digit code
        return all_6_digits[0]
        
    return None

def normalize_phone_number(phone: Optional[str]) -> str:
    """
    Normalizes a phone number to standard international format (e.g., +359888123456).
    """
    if not phone:
        return ""
    
    raw = str(phone).strip()
    digits = re.sub(r'[^\d+]', '', raw)
    
    if digits.startswith('+'):
        return digits
    elif digits.startswith('00'):
        return '+' + digits[2:]
    elif digits.startswith('0') and len(digits) == 10:
        # Bulgarian local 0888... -> +359888...
        return '+359' + digits[1:]
    elif digits.startswith('359') and len(digits) >= 12:
        return '+' + digits
    else:
        return '+' + digits if digits else ""

def normalize_email(email: Optional[str]) -> str:
    """
    Normalizes an email address.
    """
    if not email:
        return ""
    return str(email).strip().lower()

def format_email_otp_telegram(result: Dict[str, Any], to_address: str, subject: str = "") -> str:
    """
    Formats HTML Telegram alert for Email OTP.
    """
    if result.get("auto_advanced"):
        return (
            f"🦁 <b>Open Balancer — B2B Profile Auto-Advanced! 🚀</b>\n\n"
            f"🏢 <b>Компания:</b> {result.get('business_name_bg') or 'Компания'} (<i>{result.get('business_name_en') or ''}</i>)\n"
            f"🆔 <b>ЕИК:</b> <code>{result.get('eik', 'N/A')}</code>\n"
            f"📧 <b>Email Код:</b> <code>{result.get('code')}</code> ({result.get('email_alias_33mail') or to_address})\n"
            f"📱 <b>SMS Код:</b> <code>{result.get('sms_code') or 'Verified'}</code> ({result.get('phone_number') or 'SIM Pool'})\n"
            f"⚡ <b>Нов Статус:</b> <code>VERIFIED_READY_FOR_CARD_ISSUING</code>\n"
            f"🎯 <b>Auto-Advancement:</b> <code>SUCCESS</code> (Zero-Touch Onboarding)\n"
            f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)"
        )
    else:
        return (
            f"🦁 <b>Open Balancer — Email OTP Ingested 📧</b>\n\n"
            f"🏢 <b>Компания:</b> {result.get('business_name_bg') or 'N/A'} (ЕИК: <code>{result.get('eik', 'N/A')}</code>)\n"
            f"📬 <b>Получател:</b> <code>{to_address}</code>\n"
            f"🔑 <b>Email Код:</b> <code>{result.get('code')}</code>\n"
            f"📝 <b>Тема:</b> {subject or 'Wallester OTP'}\n"
            f"⚡ <b>Статус:</b> <code>PROCESSED</code>\n"
            f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)"
        )

def format_sms_otp_telegram(result: Dict[str, Any], to_number: str, message_body: str = "") -> str:
    """
    Formats HTML Telegram alert for SMS OTP.
    """
    if result.get("auto_advanced"):
        return (
            f"🦁 <b>Open Balancer — B2B Profile Auto-Advanced! 🚀</b>\n\n"
            f"🏢 <b>Компания:</b> {result.get('business_name_bg') or 'Компания'} (<i>{result.get('business_name_en') or ''}</i>)\n"
            f"🆔 <b>ЕИК:</b> <code>{result.get('eik', 'N/A')}</code>\n"
            f"📧 <b>Email Код:</b> <code>{result.get('email_code') or 'Verified'}</code> ({result.get('email_alias_33mail') or '33Mail'})\n"
            f"📱 <b>SMS Код:</b> <code>{result.get('code')}</code> ({result.get('to_number') or to_number})\n"
            f"⚡ <b>Нов Статус:</b> <code>VERIFIED_READY_FOR_CARD_ISSUING</code>\n"
            f"🎯 <b>Auto-Advancement:</b> <code>SUCCESS</code> (Zero-Touch Onboarding)\n"
            f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)"
        )
    else:
        return (
            f"🦁 <b>Open Balancer — SMS OTP Ingested 📱</b>\n\n"
            f"🏢 <b>Компания:</b> {result.get('business_name_bg') or 'N/A'} (ЕИК: <code>{result.get('eik', 'N/A')}</code>)\n"
            f"📞 <b>Телефон:</b> <code>{to_number}</code>\n"
            f"🔑 <b>SMS Код:</b> <code>{result.get('code')}</code>\n"
            f"💬 <b>Текст:</b> {message_body}\n"
            f"⚡ <b>Статус:</b> <code>PROCESSED</code>\n"
            f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)"
        )

def send_telegram_alert(text: str, bot_token: Optional[str] = None, chat_id: Optional[str] = None) -> bool:
    """
    Dispatches HTML Telegram message to Leon | DevOps bot.
    """
    token = bot_token or DEFAULT_TELEGRAM_BOT_TOKEN
    target_chat = chat_id or DEFAULT_TELEGRAM_CHAT_ID
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(payload).encode('utf-8'),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            return bool(data.get("ok"))
    except Exception as e:
        print(f"⚠️ Telegram alert dispatch failed: {e}")
        return False

def process_email_otp_payload(
    payload: Dict[str, Any],
    supabase_url: Optional[str] = None,
    supabase_key: Optional[str] = None,
    send_alert: bool = True
) -> Dict[str, Any]:
    """
    Processes an incoming email OTP payload via Supabase RPC endpoint.
    """
    base_url = supabase_url or DEFAULT_SUPABASE_URL
    key = supabase_key or DEFAULT_SUPABASE_KEY
    
    to_address = normalize_email(payload.get("to_address") or payload.get("to") or payload.get("recipient") or payload.get("email"))
    from_address = str(payload.get("from_address") or payload.get("from") or payload.get("sender") or "support@wallester.com").strip()
    subject = str(payload.get("subject") or "Wallester Verification Code").strip()
    body = str(payload.get("body_full") or payload.get("body_preview") or payload.get("body") or payload.get("text") or payload.get("message") or payload.get("html") or "").strip()
    
    rpc_url = f"{base_url}/rest/v1/rpc/process_email_otp"
    rpc_payload = {
        "p_to_address": to_address,
        "p_from_address": from_address,
        "p_subject": subject,
        "p_body": body,
        "p_metadata": payload
    }
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        rpc_url,
        data=json.dumps(rpc_payload).encode('utf-8'),
        headers=headers
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            
            if send_alert and result.get("ok"):
                alert_text = format_email_otp_telegram(result, to_address, subject)
                send_telegram_alert(alert_text)
                
            return {
                "success": True,
                "data": result
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        return {
            "success": False,
            "error": f"HTTP {e.code}: {err_msg}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def process_sms_otp_payload(
    payload: Dict[str, Any],
    supabase_url: Optional[str] = None,
    supabase_key: Optional[str] = None,
    send_alert: bool = True
) -> Dict[str, Any]:
    """
    Processes an incoming SMS OTP payload via Supabase RPC endpoint.
    """
    base_url = supabase_url or DEFAULT_SUPABASE_URL
    key = supabase_key or DEFAULT_SUPABASE_KEY
    
    to_number = normalize_phone_number(payload.get("to_number") or payload.get("to") or payload.get("phone_number") or payload.get("phone"))
    from_number = str(payload.get("from_number") or payload.get("from") or payload.get("sender") or "Wallester").strip()
    message_body = str(payload.get("message_body") or payload.get("message") or payload.get("body") or payload.get("text") or payload.get("content") or "").strip()
    
    rpc_url = f"{base_url}/rest/v1/rpc/process_sms_otp"
    rpc_payload = {
        "p_to_number": to_number,
        "p_from_number": from_number,
        "p_message_body": message_body,
        "p_metadata": payload
    }
    
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    req = urllib.request.Request(
        rpc_url,
        data=json.dumps(rpc_payload).encode('utf-8'),
        headers=headers
    )
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            
            if send_alert and result.get("ok"):
                alert_text = format_sms_otp_telegram(result, to_number, message_body)
                send_telegram_alert(alert_text)
                
            return {
                "success": True,
                "data": result
            }
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode('utf-8')
        return {
            "success": False,
            "error": f"HTTP {e.code}: {err_msg}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def send_email_webhook(url: str, payload: Dict[str, Any], timeout: int = 10) -> Dict[str, Any]:
    """
    Submits incoming email payload to n8n Webhook endpoint.
    """
    t0 = time.time()
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        latency_ms = (time.time() - t0) * 1000
        body = json.loads(resp.read().decode('utf-8'))
        return {
            "status_code": resp.status,
            "latency_ms": latency_ms,
            "body": body
        }

def send_sms_webhook(url: str, payload: Dict[str, Any], timeout: int = 10) -> Dict[str, Any]:
    """
    Submits incoming SMS payload to n8n Webhook endpoint.
    """
    t0 = time.time()
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        latency_ms = (time.time() - t0) * 1000
        body = json.loads(resp.read().decode('utf-8'))
        return {
            "status_code": resp.status,
            "latency_ms": latency_ms,
            "body": body
        }
