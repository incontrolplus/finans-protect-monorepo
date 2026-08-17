# 🌐 Уебсайт и Правни Страници на OpenBalancer

<p align="center">
  <a href="README.bg.md"><b>🇧🇬 Българска версия</b></a> | 
  <a href="README.md"><b>🇬🇧 English Version</b></a>
</p>

Тази директория съдържа статичния производствен уебсайт за **[openbalancer.com](https://openbalancer.com)**, оптимизиран за хостинг в **Cloudflare Pages**.

---

## 📂 Структура и Страници

* `index.html` — Главна страница с интерактивен визуализатор на балансирането на трафик в реално време, ценови планове за SLA поддръжка, казус с FinansProtect и представяне на възможностите.
* `terms.html` — Общи условия за ползване (Terms of Service) на софтуера и услугите на ИНКОНТРОЛ ПЛЮС ЕООД.
* `privacy.html` — Политика за защита на личните данни (GDPR съвместима).
* `refunds.html` — Политика за възстановяване на суми и компенсации при нарушаване на SLA.
* `contact.html` — Страница за фирмена идентификация (Legal Impressum) и контакти.
* `css/style.css` — Високопроизводителен Vanilla CSS дизайн с тъмна тема и плавни анимации.
* `js/main.js` — JavaScript логика за динамичната симулация на трафика.
* `_headers` — HTTP заглавия за сигурност (CSP, HSTS, X-Content-Type-Options).

---

## 🚀 Локален Преглед (Local Preview)

Стартирайте локален уеб сървър:
```bash
python3 -m http.server 3000 --directory website/
```
Отворете `http://localhost:3000` в браузъра.
