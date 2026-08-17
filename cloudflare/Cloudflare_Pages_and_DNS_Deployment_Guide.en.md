# Cloudflare Pages & DNS Deployment Guide

<p align="center">
  <a href="Cloudflare_Pages_and_DNS_Deployment_Guide.md"><b>🇧🇬 Българска версия</b></a> | 
  <a href="Cloudflare_Pages_and_DNS_Deployment_Guide.en.md"><b>🇬🇧 English Version</b></a>
</p>

**Objective:** Zero-cost, edge-accelerated static website hosting with automated SSL, DDoS mitigation, and continuous GitHub CI/CD integration for `openbalancer.com`.

---

## 1. Account Setup & Adding Domain to Cloudflare

1. Log into [Cloudflare.com](https://www.cloudflare.com) using your corporate email.
2. In the dashboard, click **Add a Site**.
3. Enter the root domain: `openbalancer.com`.
4. Select the **Free Plan** (Includes unlimited bandwidth, global CDN, WAF, and DDoS mitigation).
5. Cloudflare will scan existing DNS records and provide two authoritative Nameservers (e.g. `ada.ns.cloudflare.com` and `bob.ns.cloudflare.com`).

---

## 2. Update Nameservers at Domain Registrar

1. Open your domain registrar portal where `openbalancer.com` was purchased.
2. Navigate to DNS / Nameserver settings.
3. Switch to **Custom Nameservers** and insert the two Cloudflare nameservers.
4. Save changes. DNS delegation typically propagates within 5 to 60 minutes.

---

## 3. Connect GitHub Repository to Cloudflare Pages

1. In Cloudflare Dashboard, go to **Workers & Pages** -> **Create application** -> **Pages**.
2. Select **Connect to Git**.
3. Authorize your GitHub account / organization `incontrolplus`.
4. Select repository `openbalancer`.
5. Configure Build & Deployment parameters:
   * **Project name:** `openbalancer`
   * **Production branch:** `main`
   * **Framework preset:** `None`
   * **Build command:** *(Leave empty)*
   * **Build output directory:** `website`
6. Click **Save and Deploy**.
7. Cloudflare Pages will build and deploy the site to a free subdomain (e.g. `openbalancer.pages.dev`).

---

## 4. Bind Custom Domain

1. In the Cloudflare Pages project view, click **Custom domains**.
2. Click **Set up a custom domain**.
3. Add `openbalancer.com` and `www.openbalancer.com`.
4. Cloudflare automatically establishes DNS routing and provisions a Universal SSL certificate.

---

## 5. Security & Edge Optimization Recommendations

* **SSL/TLS Mode:** Full (strict)
* **Always Use HTTPS:** Enabled
* **Automatic HTTPS Rewrites:** Enabled
* **Minimum TLS Version:** TLS 1.2
* **HTTP/3 (QUIC) & Early Hints:** Enabled
