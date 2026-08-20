import subprocess
import urllib.request
import urllib.error
import json
import sys
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def aes_gcm_decrypt(key, blob):
    iv = blob[:12]
    tag = blob[-16:]
    ct = blob[12:-16]
    aesgcm = AESGCM(key)
    return aesgcm.decrypt(iv, ct + tag, None)

def get_infisical_secrets():
    enc_key = b"586ad8bca5e7f236ce64c8a1eefe7aab"
    root_hex = subprocess.check_output([
        "docker", "exec", "infisical-db", "psql", "-U", "infisical", "-d", "infisical", "-t", "-A", "-c",
        "SELECT encode(\"encryptedRootKey\", 'hex') FROM kms_root_config LIMIT 1;"
    ]).decode().strip()
    root_key = aes_gcm_decrypt(enc_key, bytes.fromhex(root_hex))

    proj_kms_hex = subprocess.check_output([
        "docker", "exec", "infisical-db", "psql", "-U", "infisical", "-d", "infisical", "-t", "-A", "-c",
        "SELECT encode(ik.\"encryptedKey\", 'hex') FROM projects p JOIN kms_keys k ON p.\"kmsSecretManagerKeyId\" = k.id JOIN internal_kms ik ON k.id = ik.\"kmsKeyId\" WHERE p.id = '36343982-880f-4174-8629-ec3f009cbcc4';"
    ]).decode().strip()
    proj_key = aes_gcm_decrypt(root_key, bytes.fromhex(proj_kms_hex))

    proj_datakey_hex = subprocess.check_output([
        "docker", "exec", "infisical-db", "psql", "-U", "infisical", "-d", "infisical", "-t", "-A", "-c",
        "SELECT encode(\"kmsSecretManagerEncryptedDataKey\", 'hex') FROM projects WHERE id = '36343982-880f-4174-8629-ec3f009cbcc4';"
    ]).decode().strip()
    data_key = aes_gcm_decrypt(proj_key, bytes.fromhex(proj_datakey_hex)[:-3])

    secrets_raw = subprocess.check_output([
        "docker", "exec", "infisical-db", "psql", "-U", "infisical", "-d", "infisical", "-t", "-A", "-c",
        "SELECT s.key, pe.slug, encode(s.\"encryptedValue\", 'hex') FROM secrets_v2 s JOIN secret_folders f ON s.\"folderId\" = f.id JOIN project_environments pe ON f.\"envId\" = pe.id WHERE pe.\"projectId\" = '36343982-880f-4174-8629-ec3f009cbcc4';"
    ]).decode().strip().splitlines()

    decrypted = {}
    for line in secrets_raw:
        if not line: continue
        parts = line.split("|")
        if len(parts) == 3:
            k, env, val_hex = parts
            if val_hex:
                val_blob = bytes.fromhex(val_hex)
                val_bytes = aes_gcm_decrypt(data_key, val_blob[:-3])
                decrypted[f"{env}:{k}"] = val_bytes.decode("utf-8", errors="ignore")
    return decrypted

def cf_api_request(method, endpoint, token, data=None):
    url = f"https://api.cloudflare.com/client/v4{endpoint}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        return {"success": False, "status_code": e.code, "error": err_body}

if __name__ == "__main__":
    secrets = get_infisical_secrets()
    dns_token = secrets.get("prod:CLOUDFLARE_DNS_TOKEN_INCONTROLPLUS") or secrets.get("dev:CLOUDFLARE_DNS_TOKEN_INCONTROLPLUS")
    api_token = secrets.get("prod:CLOUDFLARE_INCONTROLPLUS_API_TOKEN") or secrets.get("dev:CLOUDFLARE_INCONTROLPLUS_API_TOKEN")
    account_id = secrets.get("prod:CLOUDFLARE_INCONTROLPLUS_ACCOUNT_ID") or secrets.get("dev:CLOUDFLARE_INCONTROLPLUS_ACCOUNT_ID")
    
    print(f"Decrypted Infisical tokens:")
    print(f"  Account ID: {account_id}")
    print(f"  DNS Token prefix: {dns_token[:6]}... (length={len(dns_token)})")
    print(f"  API Token prefix: {api_token[:6]}... (length={len(api_token)})")

    # Verify Token
    verify = cf_api_request("GET", "/user/tokens/verify", dns_token)
    print("DNS Token Verification:", verify.get("status"), verify.get("messages"))

    # List Zones
    zones = cf_api_request("GET", "/zones", dns_token)
    print("Zones:", [(z["id"], z["name"]) for z in zones.get("result", [])])

    zone_id = "f88038d999ebcad660655dc522c58851" # openbalancer.com
    
    # List specific DNS records
    records = cf_api_request("GET", f"/zones/{zone_id}/dns_records?per_page=100", dns_token)
    print(f"\nTotal DNS Records in {zone_id}:", len(records.get("result", [])))
    
    targets = ["openbalancer.com", "www.openbalancer.com", "n8n.openbalancer.com", "cashflow.openbalancer.com"]
    for r in records.get("result", []):
        if r["name"] in targets:
            print(f"  -> {r['type']} {r['name']} -> {r['content']} (proxied: {r['proxied']}, id: {r['id']})")

    # List Pages Projects
    pages = cf_api_request("GET", f"/accounts/{account_id}/pages/projects", api_token)
    print(f"\nPages Projects ({len(pages.get('result', []))}):")
    for p in pages.get("result", []):
        print(f"  Project: {p['name']} -> {p['subdomain']}")
        for domain in p.get("domains", []):
            print(f"    Custom Domain: {domain}")
