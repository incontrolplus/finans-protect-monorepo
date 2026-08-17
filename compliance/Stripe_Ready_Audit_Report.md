# 🛡️ Stripe Commercial Readiness & KYB Verification Audit Report

**Entity:** ИНКОНТРОЛ ПЛЮС ЕООД (INCONTROL PLUS EOOD)  
**Product:** OpenBalancer (https://www.openbalancer.com)  
**Date of Audit:** 2026-08-17  
**Status:** 🟢 **100% COMPLIANT & STRIPE-READY**

---

## 1. Executive Summary & Verification Matrix

Stripe strictly requires that all merchant websites are fully operational, have transparent pricing, clear corporate ownership, explicit refund terms, GDPR-compliant privacy policies, and zero "Under Construction" states.

| # | Stripe Verification Requirement | OpenBalancer Implementation | Compliance Status |
|---|---------------------------------|-----------------------------|:-----------------:|
| 1 | **Legal Entity & Registration** | Registered Bulgarian Ltd: `ИНКОНТРОЛ ПЛЮС ЕООД`, UIC `204882190`, VAT `BG204882190` | ✅ PASSED |
| 2 | **Physical Address & Contact Info** | Sofia 1407, Bulgaria, `support@openbalancer.com`, `+359 88 518 8892` | ✅ PASSED |
| 3 | **Clear B2B Pricing & Invoicing** | Concrete EUR pricing (€1,500/mo Pro, Custom Enterprise), Net-14 invoicing | ✅ PASSED |
| 4 | **Delivery & SLA Timeline** | Instant automated binary access, SLA onboarding within 2 hours | ✅ PASSED |
| 5 | **Refund & SLA Credit Policy** | 30-day money-back guarantee, automated uptime credit schedule (`refunds.html`) | ✅ PASSED |
| 6 | **Terms of Service** | Comprehensive B2B Terms, Sofia jurisdiction, SLA guarantees (`terms.html`) | ✅ PASSED |
| 7 | **Privacy Policy (GDPR)** | Full data processing register, cookie disclosures, DPO contact (`privacy.html`) | ✅ PASSED |
| 8 | **Working Web Application** | 100% functional simulator, interactive config builder, working FAQ | ✅ PASSED |
| 9 | **Functional Inquiry / Contact Form** | Real asynchronous `/api/contact` edge API with UUID tracking and n8n backend | ✅ PASSED |
| 10| **Security & HTTPS** | Cloudflare SSL, HSTS, CSP, X-Frame-Options, DNSSEC enabled | ✅ PASSED |
| 11| **Bilingual Accessibility** | Instant English & Bulgarian UI and legal translations | ✅ PASSED |
| 12| **No Placeholder or Under Construction** | All sections populated with verified production copy and tools | ✅ PASSED |

---

## 2. Stripe Reviewer Walkthrough Guide

When the Stripe underwriting team reviews the application, they can verify every element directly on the live website:

### A. Homepage (`https://www.openbalancer.com/`)
1. **Interactive Traffic Simulator:** Demonstrates sub-millisecond balancing with live Prometheus sparklines.
2. **Cluster Configuration Generator:** Generates valid `openbalancer.json` with dynamic sliders and 1-click download.
3. **Architecture Comparison Table:** Shows OpenBalancer vs NGINX / HAProxy / Traefik on async sockets and memory footprint.
4. **Transparent Pricing Cards:**
   * *Community Open-Source:* Free under MIT license.
   * *B2B Pro SLA Retainer:* €1,500 / month (99.9% uptime SLA, 2h response time).
   * *Custom Enterprise SLA:* Tailored cluster engineering & turnkey migration.
5. **Interactive Modal:** Clicking any enterprise tier opens the modal, validating inputs and returning a real reference ID (`Ref ID: xxxxxxxx`).

### B. Legal & Compliance Pages
* **Terms of Service:** [`https://www.openbalancer.com/terms.html`](https://www.openbalancer.com/terms.html)
* **Privacy Policy:** [`https://www.openbalancer.com/privacy.html`](https://www.openbalancer.com/privacy.html)
* **Refund & SLA Credit Policy:** [`https://www.openbalancer.com/refunds.html`](https://www.openbalancer.com/refunds.html)
* **Contact & Impressum:** [`https://www.openbalancer.com/contact.html`](https://www.openbalancer.com/contact.html)

---

## 3. Stripe Dashboard Setup Instructions

1. **Business Type:** Company (Sole-shareholder LLC / ЕООД).
2. **Business Registration Number:** `204882190`.
3. **VAT ID:** `BG204882190`.
4. **Website URL:** `https://www.openbalancer.com`.
5. **Product Description:** `OpenBalancer: Enterprise AI & API Load Balancing Software, High-Availability SLA Support & Consulting Services.`
6. **Customer Facing Business Name:** `OpenBalancer` or `INCONTROL PLUS`.
7. **Statement Descriptor:** `OPENBALANCER` / `INCONTROL+`.
