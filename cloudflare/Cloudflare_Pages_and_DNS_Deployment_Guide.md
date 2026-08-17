# Ръководство за Разгръщане в Cloudflare Pages & Конфигурация на DNS

<p align="center">
  <a href="Cloudflare_Pages_and_DNS_Deployment_Guide.md"><b>🇧🇬 Българска версия</b></a> | 
  <a href="Cloudflare_Pages_and_DNS_Deployment_Guide.en.md"><b>🇬🇧 English Version</b></a>
</p>

**Цел:** 100% безплатен, бърз глобален CDN хостинг с автоматичен SSL сертификат, DDoS защита, HTTP сигурност и непрекъсната интеграция (CI/CD) през Cloudflare Pages и Hostinger DNS за `openbalancer.com`.

---

## 🚀 Текущо Състояние на Разгръщането (Live Status)

* **Cloudflare Pages Проект:** `openbalancer`
* **Project ID:** `62ae9ae7-d21c-4d9c-bd78-0948544bc4cb`
* **Публичен Pages URL:** **[https://openbalancer.pages.dev](https://openbalancer.pages.dev)**
* **SSL Сертификат:** Google Trust Services Universal SSL (Auto-provisioned)
* **Защитни заглавия:** CSP, HSTS (`max-age=31536000`), X-Frame-Options (`SAMEORIGIN`), X-Content-Type-Options (`nosniff`).
* **Потребителски Домейни (Custom Domains):** `openbalancer.com`, `www.openbalancer.com`
* **Hostinger DNS Настройка:** `CNAME www -> openbalancer.pages.dev.`

---

## 🔐 Infisical Secrets Mapping (Проект: "Hosting & Domains")

Всички ключове и конфигурации за автоматизация се управляват централизирано в self-hosted Infisical:

| Тайна (Secret Key) | Предназначение |
| :--- | :--- |
| `CLOUDFLARE_INCONTROLPLUS_ACCOUNT_ID` | Account ID за Cloudflare акаунта на Incontrol Plus (`1128cf4fabd6...`) |
| `CLOUDFLARE_INCONTROLPLUS_API_TOKEN` | API Token с права за Pages Projects, Deployments и Domains |
| `HOSTINGER_API_TOKEN_OPENBALANCER` | Hostinger Developer API Token за управление на DNS зоната на `openbalancer.com` |
| `CLOUDFLARE_INCONTROLPLUS_ACCESS_KEY_ID` | S3/R2 съвместим Access Key |
| `CLOUDFLARE_INCONTROLPLUS_SECRET_ACCESS_KEY` | S3/R2 съвместим Secret Key |
| `CLOUDFLARE_INCONTROLPLUS_S3_API_ENDPOINT` | R2 Cloudflare S3 API Endpoint |

---

## 🛠️ Автоматизирано Разгръщане чрез Wrangler CLI

Сайтът се качва от локалната директория `website/` към Cloudflare Pages чрез следната команда:

```bash
CLOUDFLARE_API_TOKEN="<FETCHED_FROM_INFISICAL>" \
CLOUDFLARE_ACCOUNT_ID="<FETCHED_FROM_INFISICAL>" \
npx wrangler pages deploy website --project-name=openbalancer --branch=main
```

---

## 🌐 Hostinger DNS Автоматизация

Конфигурирането на DNS записите в Hostinger се извършва директно през Hostinger DNS v1 REST API:

* **Ендпоинт:** `PUT https://developers.hostinger.com/api/dns/v1/zones/openbalancer.com`
* **Автентикация:** `Authorization: Bearer <HOSTINGER_API_TOKEN_OPENBALANCER>`
* **Ключов CNAME запис:**
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

## 🔒 Препоръчителни Настройки за Сигурност в Cloudflare

1. **SSL/TLS Encryption Mode:** Задайте на **Full** или **Full (strict)**.
2. **Always Use HTTPS:** Включено (**ON**).
3. **Automatic HTTPS Rewrites:** Включено (**ON**).
4. **Minimum TLS Version:** TLS 1.2 или TLS 1.3.
5. **HTTP/3 (QUIC) & Early Hints:** Включено (**ON**).
