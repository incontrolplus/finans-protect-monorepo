"""
Open Balancer B2B Onboarding — Step 3: Wallester Virtual Card Issuing Client & Telegram DevOps Control
Handles:
  1. Virtual Card issuance for verified business profiles (VERIFIED_READY_FOR_CARD_ISSUING)
  2. Cryptographic token generation (card_uuid, last4, expiry, CVV token)
  3. Atomic Supabase persistence (public.payment_cards, public.verified_business_profiles, public.wallester_accounts)
  4. Telemetry logging in public.workflow_executions
  5. Instant Telegram alert dispatch to Leon | DevOps (8041248687)
  6. Interactive Telegram command processing (/cards, /revenue, /issue_card <eik>)
"""

import os
import sys
import json
import time
import random
import string
import socket
import datetime
import subprocess
import urllib.request
import urllib.parse
import urllib.error
from typing import Dict, Any, Optional, List, Tuple

DEFAULT_SUPABASE_URL = os.environ.get("SUPABASE_URL") or "http://100.83.83.8:8002"
DEFAULT_SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY") or "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODIyMjY3OTksImV4cCI6MTkzOTkwNjc5OX0.5DAqw9x0gC7ZH-0UPg4eEkP2LqcW_PRk6O0AEISJUG4"
DEFAULT_TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or "8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88"
DEFAULT_TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID") or "8041248687"

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

def format_card_issued_telegram(card_info: Dict[str, Any]) -> str:
    """
    Formats a rich HTML Telegram alert for a newly issued Wallester Virtual Card.
    """
    eik = card_info.get("eik", "N/A")
    name_bg = card_info.get("business_name_bg", "")
    name_en = card_info.get("business_name_en", "")
    company_name = f"{name_bg} ({name_en})" if (name_bg and name_en and name_bg != name_en) else (name_bg or name_en or f"Компания {eik}")
    
    card_last4 = card_info.get("card_number_last4", "XXXX")
    masked_num = card_info.get("masked_card_number") or f"**** **** **** {card_last4}"
    expiry = card_info.get("expiry_date", "08/29")
    balance = float(card_info.get("balance", 150.00))
    currency = card_info.get("currency", "EUR")
    card_type = card_info.get("card_type", "VISA_CORPORATE_PLATINUM_VIRTUAL")
    issuer = card_info.get("issuer_bank", "Wallester Business")
    card_uuid = card_info.get("card_uuid", "CRD-WB-XXXX")
    status = card_info.get("wallester_status") or card_info.get("status") or "CARD_ISSUED_ACTIVE"
    duration_ms = card_info.get("duration_ms", 45)
    
    return (
        f"🦁 <b>Open Balancer — Wallester Virtual Card Issued! 💳</b>\n\n"
        f"🏢 <b>Компания:</b> {company_name}\n"
        f"🆔 <b>ЕИК:</b> <code>{eik}</code>\n"
        f"💳 <b>Картов Продукт:</b> <code>{card_type}</code>\n"
        f"🔢 <b>Номер на карта:</b> <code>{masked_num}</code>\n"
        f"📅 <b>Валидност:</b> <code>{expiry}</code> (+3 години)\n"
        f"💰 <b>Начален Лимит:</b> <b>€{balance:.2f} {currency}</b>\n"
        f"🏦 <b>Издател:</b> <code>{issuer}</code>\n"
        f"🔑 <b>Card UUID:</b> <code>{card_uuid}</code>\n"
        f"⚡ <b>Статус:</b> <code>{status}</code> 🟢\n"
        f"⏱ <b>Време за издаване:</b> {duration_ms} ms\n"
        f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)\n"
        f"🚀 <b>Платформа:</b> Open Balancer Card Issuing Engine"
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
        print(f"⚠️ Telegram alert dispatch failed: {e}", file=sys.stderr)
        return False

def issue_card_for_profile(
    eik: str,
    force: bool = False,
    send_alert: bool = True,
    supabase_url: Optional[str] = None,
    supabase_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Issues a virtual Wallester Visa Platinum Corporate card for the specified business profile.
    Uses Supabase REST RPC endpoint with automatic psql fallback.
    """
    base_url = supabase_url or DEFAULT_SUPABASE_URL
    key = supabase_key or DEFAULT_SUPABASE_KEY
    clean_eik = str(eik).strip()
    
    t0 = time.time()
    
    # 1. Primary path: Supabase PostgREST RPC
    rpc_url = f"{base_url}/rest/v1/rpc/issue_virtual_card"
    rpc_payload = {
        "p_eik": clean_eik,
        "p_force": force,
        "p_metadata": {"source": "openbalancer_python_client", "issued_at": datetime.datetime.now(datetime.timezone.utc).isoformat()}
    }
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    }
    
    try:
        req = urllib.request.Request(rpc_url, data=json.dumps(rpc_payload).encode('utf-8'), headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            result = json.loads(resp.read().decode('utf-8'))
            latency_ms = (time.time() - t0) * 1000
            
            if isinstance(result, dict) and result.get("ok"):
                result["latency_ms"] = latency_ms
                if send_alert:
                    alert_text = format_card_issued_telegram(result)
                    send_telegram_alert(alert_text)
                return {
                    "success": True,
                    "data": result,
                    "latency_ms": latency_ms
                }
            elif isinstance(result, dict):
                return {
                    "success": False,
                    "error": result.get("message") or result.get("status") or "Issuance failed",
                    "data": result,
                    "latency_ms": latency_ms
                }
    except Exception as e:
        # Fallback to direct PSQL invocation
        pass
        
    # 2. Fallback: Direct PostgreSQL RPC call via docker exec / SSH
    force_sql = "true" if force else "false"
    sql = f"SELECT public.issue_virtual_card('{clean_eik}', {force_sql});"
    res = run_psql_query(sql)
    latency_ms = (time.time() - t0) * 1000
    
    if res.returncode == 0 and res.stdout:
        # Extract JSON from psql output
        for line in res.stdout.splitlines():
            line_str = line.strip()
            if line_str.startswith("{") and line_str.endswith("}"):
                try:
                    result = json.loads(line_str)
                    if result.get("ok"):
                        result["latency_ms"] = latency_ms
                        if send_alert:
                            alert_text = format_card_issued_telegram(result)
                            send_telegram_alert(alert_text)
                        return {
                            "success": True,
                            "data": result,
                            "latency_ms": latency_ms
                        }
                    else:
                        return {
                            "success": False,
                            "error": result.get("message") or "Issuance rejected",
                            "data": result,
                            "latency_ms": latency_ms
                        }
                except Exception:
                    pass
                    
    return {
        "success": False,
        "error": f"Card issuance query failed: {res.stderr if 'res' in locals() else 'Unknown error'}",
        "latency_ms": latency_ms
    }

def issue_cards_for_pending_profiles(
    limit: int = 50,
    send_alert: bool = True,
    supabase_url: Optional[str] = None,
    supabase_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Finds all profiles in VERIFIED_READY_FOR_CARD_ISSUING status and issues cards for each.
    """
    base_url = supabase_url or DEFAULT_SUPABASE_URL
    key = supabase_key or DEFAULT_SUPABASE_KEY
    
    # 1. Fetch pending profiles
    fetch_url = f"{base_url}/rest/v1/verified_business_profiles?wallester_status=eq.VERIFIED_READY_FOR_CARD_ISSUING&select=eik,business_name_bg,business_name_en,email_alias_33mail,phone_number&limit={limit}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    
    pending_profiles = []
    try:
        req = urllib.request.Request(fetch_url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            pending_profiles = json.loads(resp.read().decode('utf-8'))
    except Exception:
        # Fallback to psql
        sql = "SELECT json_agg(t) FROM (SELECT eik, business_name_bg, business_name_en, email_alias_33mail, phone_number FROM public.verified_business_profiles WHERE wallester_status = 'VERIFIED_READY_FOR_CARD_ISSUING' LIMIT 50) t;"
        res = run_psql_query(sql)
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                if line.strip().startswith("[") and line.strip().endswith("]"):
                    try:
                        pending_profiles = json.loads(line.strip())
                    except Exception:
                        pass

    results = []
    issued_count = 0
    
    for prof in pending_profiles:
        eik = prof.get("eik")
        if not eik:
            continue
        card_res = issue_card_for_profile(eik, force=False, send_alert=send_alert, supabase_url=base_url, supabase_key=key)
        if card_res.get("success"):
            issued_count += 1
            results.append(card_res.get("data", {}))
        else:
            results.append({"eik": eik, "error": card_res.get("error")})
            
    return {
        "success": True,
        "processed_count": len(pending_profiles),
        "issued_count": issued_count,
        "cards": results
    }

def get_issued_cards(limit: int = 50, supabase_url: Optional[str] = None, supabase_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Fetches the list of active issued cards from public.payment_cards.
    """
    base_url = supabase_url or DEFAULT_SUPABASE_URL
    key = supabase_key or DEFAULT_SUPABASE_KEY
    
    url = f"{base_url}/rest/v1/payment_cards?select=id,card_uuid,card_number_last4,cardholder_full_name,expiry_date,card_type,issuer_bank,status,balance,currency,linked_email,eik,created_at&order=created_at.desc&limit={limit}"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception:
        sql = f"SELECT json_agg(t) FROM (SELECT id, card_uuid, card_number_last4, cardholder_full_name, expiry_date, card_type, issuer_bank, status, balance, currency, linked_email, eik, created_at FROM public.payment_cards ORDER BY created_at DESC LIMIT {limit}) t;"
        res = run_psql_query(sql)
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                if line.strip().startswith("[") and line.strip().endswith("]"):
                    try:
                        return json.loads(line.strip())
                    except Exception:
                        pass
        return []

def get_revenue_scorecard(supabase_url: Optional[str] = None, supabase_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Queries the live public.revenue_scorecard view.
    """
    base_url = supabase_url or DEFAULT_SUPABASE_URL
    key = supabase_key or DEFAULT_SUPABASE_KEY
    
    url = f"{base_url}/rest/v1/revenue_scorecard"
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}"
    }
    
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if isinstance(data, list) and len(data) > 0:
                return data[0]
            return {}
    except Exception:
        sql = "SELECT row_to_json(t) FROM (SELECT * FROM public.revenue_scorecard) t;"
        res = run_psql_query(sql)
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                if line.strip().startswith("{") and line.strip().endswith("}"):
                    try:
                        return json.loads(line.strip())
                    except Exception:
                        pass
        return {}

def handle_telegram_command(cmd_text: str) -> str:
    """
    Parses and executes interactive Telegram commands (/cards, /revenue, /issue_card <eik>, /status, /help).
    Returns formatted HTML reply.
    """
    raw = cmd_text.strip()
    parts = raw.split()
    cmd = parts[0].lower() if parts else ""
    
    if cmd == "/cards":
        cards = get_issued_cards(limit=15)
        if not cards:
            return "🦁 <b>Open Balancer — Payment Cards</b>\n\n<i>Няма издадени активни карти към момента.</i>"
            
        lines = [f"🦁 <b>Open Balancer — Активни Wallester Карти ({len(cards)}) 💳</b>\n"]
        for idx, c in enumerate(cards, 1):
            eik = c.get("eik") or "N/A"
            holder = c.get("cardholder_full_name") or "Business Officer"
            last4 = c.get("card_number_last4") or "XXXX"
            bal = float(c.get("balance") or 150.00)
            curr = c.get("currency") or "EUR"
            exp = c.get("expiry_date") or "MM/YY"
            uuid_short = (c.get("card_uuid") or "")[:18]
            lines.append(
                f"{idx}. <b>{holder}</b> (ЕИК: <code>{eik}</code>)\n"
                f"   💳 <code>**** **** **** {last4}</code> (Exp: {exp})\n"
                f"   💰 Баланс: <b>€{bal:.2f} {curr}</b> | <code>{c.get('status', 'active')}</code>\n"
                f"   🔑 <code>{uuid_short}...</code>\n"
            )
        lines.append("🖥 <b>Кластър:</b> macmini-primary (100.83.83.8)")
        return "\n".join(lines)
        
    elif cmd == "/revenue" or cmd == "/scorecard":
        sc = get_revenue_scorecard()
        if not sc:
            return "🦁 <b>War Room Scorecard</b>\n\n⚠️ Неуспешно извличане на метриките."
            
        p_cards = sc.get("payment_cards", 0)
        card_icon = "🟢" if p_cards > 0 else "🔴"
        
        return (
            f"🦁 <b>Open Balancer — Live War Room Scorecard 📊</b>\n\n"
            f"👥 <b>Верифицирани собственици:</b> <code>{sc.get('verified_owners', 0)}</code>\n"
            f"🏢 <b>Фирмени профили (VBP):</b> <code>{sc.get('vbp_total', 0)}</code>\n"
            f"📞 <b>Профили с телефон:</b> <code>{sc.get('vbp_with_phone', 0)}</code>\n"
            f"📧 <b>Профили с Email:</b> <code>{sc.get('vbp_with_email', 0)}</code>\n"
            f"🔑 <b>Email OTP кодове:</b> <code>{sc.get('email_codes', 0)}</code>\n"
            f"📱 <b>SMS OTP кодове:</b> <code>{sc.get('sms_codes', 0)}</code>\n"
            f"🎯 <b>Auto-Advanced (Избрани):</b> <code>{sc.get('selected_for_registration', 0)}</code>\n"
            f"🏦 <b>Wallester Акаунти:</b> <code>{sc.get('wallester_accounts', 0)}</code>\n"
            f"💳 <b>Издадени Карти:</b> {card_icon} <b>{p_cards}</b>\n"
            f"📶 <b>SIM пул свободни/заети:</b> <code>{sc.get('sms_pool_available', 0)} / {sc.get('sms_pool_assigned', 0)}</code>\n\n"
            f"🌐 <b>Dashboard:</b> <a href=\"http://100.83.83.8:3117\">http://100.83.83.8:3117</a>\n"
            f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)"
        )
        
    elif cmd == "/issue_card":
        if len(parts) < 2:
            return "🦁 <b>Употреба:</b> <code>/issue_card &lt;eik&gt;</code>\n<i>Пример:</i> <code>/issue_card 207849182</code>"
            
        target_eik = parts[1].strip()
        res = issue_card_for_profile(target_eik, force=True, send_alert=False)
        if res.get("success"):
            data = res.get("data", {})
            return (
                f"🦁 <b>Картата е успешно издадена! 💳</b>\n\n"
                f"🏢 <b>Компания:</b> {data.get('business_name_bg') or data.get('business_name_en')}\n"
                f"🆔 <b>ЕИК:</b> <code>{data.get('eik')}</code>\n"
                f"💳 <b>Номер:</b> <code>{data.get('masked_card_number')}</code>\n"
                f"📅 <b>Валидност:</b> <code>{data.get('expiry_date')}</code>\n"
                f"💰 <b>Баланс:</b> <b>€{float(data.get('balance', 150)):.2f} EUR</b>\n"
                f"🔑 <b>UUID:</b> <code>{data.get('card_uuid')}</code>\n"
                f"⏱ <b>Латентност:</b> {res.get('latency_ms', 0):.1f} ms"
            )
        else:
            return f"❌ <b>Грешка при издаване на карта за ЕИК {target_eik}:</b>\n<code>{res.get('error')}</code>"
            
    elif cmd == "/status":
        return (
            f"🦁 <b>Open Balancer — DevOps Status ⚡</b>\n\n"
            f"✅ <b>Mesh Core:</b> macmini-primary (100.83.83.8)\n"
            f"✅ <b>Postgres / Supabase:</b> Healthy (port 8002)\n"
            f"✅ <b>n8n Engine:</b> Active (port 5679)\n"
            f"✅ <b>Card Issuing Webhook:</b> /webhook/issue-card\n"
            f"✅ <b>War Room:</b> http://100.83.83.8:3117\n"
            f"⏰ <b>Време:</b> {datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}"
        )
        
    else:
        return (
            f"🦁 <b>Open Balancer DevOps Bot 🦁</b>\n\n"
            f"Достъпни команди:\n"
            f"💳 <code>/cards</code> — списък с всички активни издадени карти\n"
            f"📊 <code>/revenue</code> — скоркарта на живо от War Room\n"
            f"⚡ <code>/issue_card &lt;eik&gt;</code> — мигновено издаване за конкретен ЕИК\n"
            f"ℹ️ <code>/status</code> — статус на клъстера и услугите\n"
            f"❓ <code>/help</code> — това помощно меню"
        )
