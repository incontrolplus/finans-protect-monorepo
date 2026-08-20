#!/usr/bin/env python3
"""
Open Balancer — Telegram DevOps Command Center Daemon
Listens for commands in Leon | DevOps 🦁 (@dagoduhasistematabot) and executes:
  - /cards: Displays active issued cards and balances
  - /revenue: Displays live War Room scorecard
  - /issue_card <eik>: Triggers instant virtual card issuance
  - /status: Displays infrastructure health
  - /help: Displays command menu
"""

import os
import sys
import time
import json
import signal
import urllib.request
import urllib.parse
import urllib.error

# Ensure project root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from openbalancer.b2b_pipeline.card_issuer import (
    handle_telegram_command,
    DEFAULT_TELEGRAM_BOT_TOKEN,
    DEFAULT_TELEGRAM_CHAT_ID
)

RUNNING = True

def sig_handler(signum, frame):
    global RUNNING
    print("🛑 Received shutdown signal, exiting Telegram daemon...")
    RUNNING = False

signal.signal(signal.SIGINT, sig_handler)
signal.signal(signal.SIGTERM, sig_handler)

def get_telegram_updates(offset: int = 0, timeout: int = 10) -> list:
    url = f"https://api.telegram.org/bot{DEFAULT_TELEGRAM_BOT_TOKEN}/getUpdates?offset={offset}&timeout={timeout}"
    try:
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req, timeout=timeout + 5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            if data.get("ok"):
                return data.get("result", [])
    except Exception as e:
        # Ignore timeout errors on long-polling
        if "timed out" not in str(e).lower():
            print(f"⚠️ Telegram getUpdates error: {e}")
    return []

def send_telegram_reply(chat_id: str, text: str, reply_to_message_id: int = None) -> bool:
    url = f"https://api.telegram.org/bot{DEFAULT_TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
        "disable_web_page_preview": True
    }
    if reply_to_message_id:
        payload["reply_to_message_id"] = reply_to_message_id
        
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
        print(f"⚠️ Failed to send Telegram reply: {e}")
        return False

def process_single_update(update: dict):
    msg = update.get("message") or update.get("edited_message")
    if not msg:
        return
        
    chat = msg.get("chat", {})
    chat_id = str(chat.get("id"))
    text = msg.get("text", "").strip()
    msg_id = msg.get("message_id")
    
    if not text.startswith("/"):
        return
        
    print(f"📩 Processing command '{text}' from chat {chat_id} (user: {msg.get('from', {}).get('username', 'N/A')})", flush=True)
    reply_html = handle_telegram_command(text)
    
    send_telegram_reply(chat_id, reply_html, reply_to_message_id=msg_id)

def main():
    import argparse
    parser = argparse.ArgumentParser(description="Open Balancer Telegram DevOps Control Daemon")
    parser.add_argument("--single-run", action="store_true", help="Process pending updates once and exit")
    args = parser.parse_args()
    
    print("🦁 Starting Open Balancer Telegram DevOps Daemon...", flush=True)
    print(f"🤖 Bot: Leon | DevOps 🦁 (Chat ID: {DEFAULT_TELEGRAM_CHAT_ID})", flush=True)
    
    # 1. Clear old pending updates on initial startup
    updates = get_telegram_updates(offset=0, timeout=1)
    offset = 0
    if updates:
        for u in updates:
            process_single_update(u)
            offset = max(offset, u["update_id"] + 1)
            
    if args.single_run:
        print("✅ Single-run update processing finished.", flush=True)
        return

    print("🚀 Telegram DevOps Daemon active and listening for /cards, /revenue, /issue_card...", flush=True)
    while RUNNING:
        try:
            updates = get_telegram_updates(offset=offset, timeout=5)
            for u in updates:
                process_single_update(u)
                offset = max(offset, u["update_id"] + 1)
            time.sleep(0.5)
        except Exception as e:
            print(f"⚠️ Main loop error: {e}", flush=True)
            time.sleep(2)

if __name__ == "__main__":
    main()
