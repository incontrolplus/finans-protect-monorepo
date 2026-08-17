# 🌐 OpenBalancer Website & Compliance Pages

<p align="center">
  <a href="README.bg.md"><b>🇧🇬 Българска версия</b></a> | 
  <a href="README.md"><b>🇬🇧 English Version</b></a>
</p>

This directory contains the production static website for **[openbalancer.com](https://openbalancer.com)**, designed for direct deployment on **Cloudflare Pages**.

---

## 📂 Structure & Pages

* `index.html` — High-converting landing page featuring an interactive, real-time traffic balancing simulator, pricing retainers, enterprise features, and live architecture showcase.
* `terms.html` — Commercial Terms of Service for INCONTROL PLUS EOOD and OpenBalancer.
* `privacy.html` — GDPR-compliant Privacy Policy with data processor definitions.
* `refunds.html` — SLA Refund and Service Credit Policy.
* `contact.html` — Corporate Impressum and Legal Verification page.
* `css/style.css` — High-performance Vanilla CSS theme with dark mode aesthetics and responsive layout.
* `js/main.js` — Client-side simulation logic for the interactive load balancer visualizer.
* `_headers` — HTTP Security Headers (Content-Security-Policy, HSTS, X-Content-Type-Options).

---

## 🚀 Local Preview

Simply run any lightweight static web server:
```bash
python3 -m http.server 3000 --directory website/
```
Open `http://localhost:3000` in your browser.
