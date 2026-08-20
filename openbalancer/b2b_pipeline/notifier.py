"""
Open Balancer B2B Onboarding — Step 5: Notifications & Channel Dispatcher
Configures client SMS/Email text and sends formatted notifications to the Telegram Admin Channel
"""

import os
import json
import urllib.request
import urllib.error
import urllib.parse
from typing import Dict, Any, Optional

DEFAULT_TELEGRAM_BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or "8545664325:AAF7-DKWStIgkzw4uWAm0dNU9LBR8Bcjm88"
DEFAULT_TELEGRAM_CHAT_ID = os.environ.get("TELEGRAM_CHAT_ID") or "8041248687"

def format_client_sms_text(profile: Dict[str, Any], onboarding_info: Dict[str, Any]) -> str:
    """
    Generates concise client SMS notification text.
    """
    name = profile.get("business_name_bg") or profile.get("business_name_en") or "Вашата компания"
    link = onboarding_info.get("onboarding_url", "")
    bonus = profile.get("bonus_amount_eur", 150)
    
    return (
        f"Open Balancer: {name} е одобрена за корпоративна карта с €{bonus:.0f} начален бонус! "
        f"Завършете верификацията си в следващите 72ч: {link}"
    )

def format_client_email_text(profile: Dict[str, Any], onboarding_info: Dict[str, Any]) -> Dict[str, str]:
    """
    Generates structured client Email content (Subject + Plaintext + HTML).
    """
    name_bg = profile.get("business_name_bg", "")
    name_en = profile.get("business_name_en", "")
    eik = profile.get("eik", "")
    app_id = onboarding_info.get("application_id", "")
    link = onboarding_info.get("onboarding_url", "")
    bonus = profile.get("bonus_amount_eur", 150)
    expires_iso = onboarding_info.get("expires_at_iso", "")
    
    subject = f"Успешна B2B верификация: €{bonus:.0f} бонус за {name_bg or name_en} | Open Balancer"
    
    plain_text = f"""Здравейте,

Поздравления! Вашата компания {name_bg} ({name_en}), ЕИК {eik}, премина успешно автоматичната проверка в Търговския регистър и е одобрена за програмата FREE_CARD_PLUS_150_BONUS.

Детайли на заявлението:
- Application ID: {app_id}
- Бонус пакет: €{bonus:.0f} EUR + Безплатна Visa Corporate Platinum карта
- ДДС статус: Потвърден активен

Завършете бързия онбординг чрез защитения криптографски линк (валиден 72 часа):
{link}

С уважение,
Екипът на Open Balancer
https://cashflow.openbalancer.com
"""
    
    html_text = f"""<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
  <h2 style="color: #0284c7; margin-top: 0;">🚀 Успешна B2B Верификация в Open Balancer</h2>
  <p>Здравейте,</p>
  <p>Вашата компания <strong>{name_bg}</strong> (ЕИК: <code>{eik}</code>) беше успешно верифицирана и одобрена за корпоративна карта Wallester с начален бонус от <strong>€{bonus:.0f}</strong>.</p>
  
  <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Application ID:</strong> <code>{app_id}</code></p>
    <p style="margin: 5px 0;"><strong>Програма:</strong> FREE_CARD_PLUS_150_BONUS</p>
    <p style="margin: 5px 0;"><strong>Валидност:</strong> 72 часа</p>
  </div>
  
  <div style="text-align: center; margin: 30px 0;">
    <a href="{link}" style="background-color: #0284c7; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Активирай Корпоративна Карта</a>
  </div>
  
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
  <p style="font-size: 12px; color: #64748b;">Open Balancer & Wallester B2B Infrastructure • cashflow.openbalancer.com</p>
</div>"""

    return {
        "subject": subject,
        "plain_text": plain_text,
        "html_text": html_text
    }

def send_telegram_notification(
    profile: Dict[str, Any],
    onboarding_info: Dict[str, Any],
    duration_ms: int = 0,
    bot_token: Optional[str] = None,
    chat_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends a formatted notification to the Telegram administrative channel.
    """
    token = bot_token or DEFAULT_TELEGRAM_BOT_TOKEN
    target_chat = chat_id or DEFAULT_TELEGRAM_CHAT_ID
    
    eik = profile.get("eik", "N/A")
    eik_len = len(str(eik))
    name_bg = profile.get("business_name_bg", "N/A")
    name_en = profile.get("business_name_en", "N/A")
    legal_form = profile.get("legal_form_bg", "N/A")
    entity_type = profile.get("entity_type", "N/A")
    vat_number = profile.get("vat_number", f"BG{eik}")
    app_id = onboarding_info.get("application_id", "N/A")
    bonus_prog = profile.get("bonus_program", "FREE_CARD_PLUS_150_BONUS")
    bonus_amt = profile.get("bonus_amount_eur", 150)
    onboard_url = onboarding_info.get("onboarding_url", "")
    expires_iso = onboarding_info.get("expires_at_iso", "72h")
    
    msg_html = (
        f"🏢 <b>Нов B2B Онбординг Успешно Верифициран!</b>\n\n"
        f"🔹 <b>Компания:</b> {name_bg} (<i>{name_en}</i>)\n"
        f"🔹 <b>ЕИК / БУЛСТАТ:</b> <code>{eik}</code> ({eik_len} цифри, контролна сума ✅)\n"
        f"🔹 <b>Правна форма:</b> {legal_form} (<code>{entity_type}</code>)\n"
        f"🔹 <b>ДДС Номер:</b> <code>{vat_number}</code> (Статус: Активен)\n"
        f"🔹 <b>Програма:</b> <code>{bonus_prog}</code> (+€{bonus_amt:.0f} EUR)\n"
        f"🔹 <b>Application ID:</b> <code>{app_id}</code>\n\n"
        f"🔗 <b>Онбординг Линк (72ч TTL):</b>\n<a href=\"{onboard_url}\">{onboard_url}</a>\n\n"
        f"⏱ <b>Време за верификация:</b> {duration_ms} ms\n"
        f"🖥 <b>Нод:</b> macmini-primary (100.83.83.8)\n"
        f"⚡ <b>Платформа:</b> Open Balancer Flow Engine"
    )
    
    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {
        "chat_id": target_chat,
        "text": msg_html,
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
            resp_data = json.loads(resp.read().decode('utf-8'))
            return {
                "success": resp_data.get("ok", False),
                "message_id": resp_data.get("result", {}).get("message_id"),
                "status": "DELIVERED",
                "chat_id": target_chat
            }
    except Exception as e:
        return {
            "success": False,
            "status": "DISPATCH_FAILED",
            "error": str(e),
            "chat_id": target_chat
        }
