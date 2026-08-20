#!/usr/bin/env python3
"""
Update Cloudflare Tunnel Ingress Configuration for openbalancer.com
Fixes 522 Connection Timed Out by routing traffic to active localhost services.
"""

import json
import urllib.request
import urllib.error

TOKEN_FILE = '/Users/diokarabaz/secure/cloudflare_api_token.txt'
token = open(TOKEN_FILE).read().strip()
account_id = '7979c4fdc70fa11c48ac5bf469386145'
tunnel_id = 'f7bac82c-51ac-44dc-b8f0-693bafe9d0cf'

new_config = {
    "config": {
        "ingress": [
            {
                "hostname": "dashboard.openbalancer.com",
                "service": "http://127.0.0.1:8083",
                "originRequest": {
                    "noTLSVerify": True,
                    "httpHostHeader": "dashboard.openbalancer.com"
                }
            },
            {
                "hostname": "cashflow.openbalancer.com",
                "service": "http://127.0.0.1:8083",
                "originRequest": {
                    "noTLSVerify": True,
                    "httpHostHeader": "cashflow.openbalancer.com"
                }
            },
            {
                "hostname": "openbalancer.com",
                "service": "http://127.0.0.1:8083",
                "originRequest": {
                    "noTLSVerify": True,
                    "httpHostHeader": "openbalancer.com"
                }
            },
            {
                "hostname": "www.openbalancer.com",
                "service": "http://127.0.0.1:8083",
                "originRequest": {
                    "noTLSVerify": True,
                    "httpHostHeader": "www.openbalancer.com"
                }
            },
            {
                "hostname": "n8n.openbalancer.com",
                "service": "http://127.0.0.1:5679"
            },
            {
                "hostname": "infisical.openbalancer.com",
                "service": "http://127.0.0.1:8080"
            },
            {
                "hostname": "finans.openbalancer.com",
                "service": "http://127.0.0.1:8083"
            },
            {
                "hostname": "finansprotect.com",
                "service": "http://127.0.0.1:8083"
            },
            {
                "hostname": "www.finansprotect.com",
                "service": "http://127.0.0.1:8083"
            },
            {
                "hostname": "win.openbalancer.com",
                "service": "http://127.0.0.1:8006"
            },
            {
                "hostname": "vm.openbalancer.com",
                "service": "http://127.0.0.1:8006"
            },
            {
                "hostname": "hermes.openbalancer.com",
                "service": "http://127.0.0.1:11434"
            },
            {
                "service": "http_status:404"
            }
        ],
        "warp-routing": {
            "enabled": False
        }
    }
}

url = f'https://api.cloudflare.com/client/v4/accounts/{account_id}/cfd_tunnel/{tunnel_id}/configurations'
req = urllib.request.Request(
    url,
    data=json.dumps(new_config).encode('utf-8'),
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
    method='PUT'
)

try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        resp_data = json.loads(resp.read().decode('utf-8'))
        print('✅ Cloudflare Tunnel Ingress Update SUCCESS:', resp_data.get('success'))
        for item in resp_data.get('result', {}).get('config', {}).get('ingress', []):
            if 'hostname' in item:
                print(f"  {item.get('hostname'):30} -> {item.get('service')}")
except urllib.error.HTTPError as e:
    print(f'❌ HTTP Error {e.code}: {e.read().decode("utf-8")}')
except Exception as e:
    print('❌ Error:', e)
