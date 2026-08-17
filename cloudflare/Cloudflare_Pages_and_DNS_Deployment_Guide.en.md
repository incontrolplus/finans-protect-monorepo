# Cloudflare Pages & DNS Deployment Guide

<p align="center">
  <a href="Cloudflare_Pages_and_DNS_Deployment_Guide.md"><b>🇧🇬 Българска версия</b></a> | 
  <a href="Cloudflare_Pages_and_DNS_Deployment_Guide.en.md"><b>🇬🇧 English Version</b></a>
</p>

**Objective:** Zero-cost, edge-accelerated static website hosting with automated SSL, DDoS mitigation, HTTP security headers, and continuous deployment via Cloudflare Pages and Hostinger DNS API for `openbalancer.com`.

---

## 🚀 Live Deployment Status

* **Cloudflare Pages Project:** `openbalancer`
* **Project ID:** `62ae9ae7-d21c-4d9c-bd78-0948544bc4cb`
* **Live Pages URL:** **[https://openbalancer.pages.dev](https://openbalancer.pages.dev)**
* **SSL Certificate:** Google Trust Services Universal SSL (Auto-provisioned)
* **Security Headers:** CSP, HSTS (`max-age=31536000`), X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`).
* **Custom Domains Bound:** `openbalancer.com`, `www.openbalancer.com`
* **Hostinger DNS Configuration:** `CNAME www -> openbalancer.pages.dev.`
* **Internal Ops Gateway:** `A ops -> 72.61.154.188` (Serving 4 n8n-MCP autonomous agents on `ops.openbalancer.com`)

---

## 🏛️ Domain Isolation Architecture (Stripe KYB Compliance)

| Domain / Host | Purpose | Visibility | Backend Infrastructure |
| :--- | :--- | :---: | :--- |
| **`openbalancer.com`** / **`www`** | Official B2B Website, Stripe KYB verification, SLA contracts, retainers | Public | Cloudflare Pages CDN (`openbalancer.pages.dev`) |
| **`ops.openbalancer.com`** | Internal Control Gateway for 4 n8n-MCP Agents (ReID, Vault, IDP OCR) | Internal / Auth | VPS (`72.61.154.188` / Traefik Gateway) |
| **`n8n.openbalancer.com`** | n8n Webhook endpoints & Automation flows | System | n8n-ob Gateway |

## 🔐 Infisical Secrets Mapping (Project: "Hosting & Domains")

All deployment credentials and automation tokens are centrally managed in self-hosted Infisical:

| Secret Key | Description |
| :--- | :--- |
| `CLOUDFLARE_INCONTROLPLUS_ACCOUNT_ID` | Cloudflare Account ID for Incontrol Plus (`1128cf4fabd6...`) |
| `CLOUDFLARE_INCONTROLPLUS_API_TOKEN` | API Token with Pages Projects, Deployments, and Custom Domain scopes |
| `HOSTINGER_API_TOKEN_OPENBALANCER` | Hostinger Developer API Token for automated DNS zone management |
| `CLOUDFLARE_INCONTROLPLUS_ACCESS_KEY_ID` | S3/R2-compatible Access Key |
| `CLOUDFLARE_INCONTROLPLUS_SECRET_ACCESS_KEY` | S3/R2-compatible Secret Key |
| `CLOUDFLARE_INCONTROLPLUS_S3_API_ENDPOINT` | R2 Cloudflare S3 API Endpoint |

---

## 🛠️ Automated Deployment via Wrangler CLI

Deploy directly from the local `website/` directory to Cloudflare Pages:

```bash
CLOUDFLARE_API_TOKEN="<FETCHED_FROM_INFISICAL>" \
CLOUDFLARE_ACCOUNT_ID="<FETCHED_FROM_INFISICAL>" \
npx wrangler pages deploy website --project-name=openbalancer --branch=main
```

---

## 🌐 Hostinger DNS API Automation

DNS records are configured directly via Hostinger DNS v1 REST API:

* **Endpoint:** `PUT https://developers.hostinger.com/api/dns/v1/zones/openbalancer.com`
* **Authentication:** `Authorization: Bearer <HOSTINGER_API_TOKEN_OPENBALANCER>`
* **Primary CNAME Record:**
  ```json
  {
    "name": "www",
    "type": "CNAME",
    "ttl": 300,
    "records": [
      {
        "content": "openbalancer.pages.dev.",
        "is_disabled": false
      }
    ]
  }
  ```

---

## 🔒 Recommended Security Configurations

1. **SSL/TLS Mode:** Full (strict)
2. **Always Use HTTPS:** Enabled
3. **Automatic HTTPS Rewrites:** Enabled
4. **Minimum TLS Version:** TLS 1.2 or TLS 1.3
5. **HTTP/3 (QUIC) & Early Hints:** Enabled
