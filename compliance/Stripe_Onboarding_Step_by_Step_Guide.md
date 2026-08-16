# Stripe KYB/KYC Onboarding & Verification Blueprint

**Цел:** 100% успешно преминаване на проверката на Stripe без блокиране на профила, спазване на европейските регулации за търговци и гарантиране на нулеви рискове от затваряне на сметката.

---

## 1. Задължителни Предварителни Условия (Pre-Flight Checklist)

Преди да натиснете бутона "Submit" в Stripe:
- [x] Сайтът `openbalancer.com` е онлайн (качен през Cloudflare Pages) и се отваря през HTTPS с активен SSL сертификат.
- [x] Футърът на сайта съдържа точните адресни и фирмени данни на `INCONTROL PLUS` (съвпадащи на 100% с данните от търговския регистър).
- [x] Правните страници (`/terms.html`, `/privacy.html`, `/refunds.html`, `/contact.html`) са достъпни и активни.
- [x] Фирменият имейл `support@openbalancer.com` е активен и готов да приема съобщения от Stripe.
- [x] Банковата сметка (IBAN в Revolut Business, Wise или българска банка) е на името на юридическото лице **„ИНКОНТРОЛ ПЛЮС“ ЕООД**.

---

## 2. Точни Данни за Попълване в Stripe Onboarding Формуляра

### 2.1. Business Structure (Правна форма)
* **Country:** Bulgaria (България)
* **Type of Entity:** Company / Single-member LLC (ЕООД / Дружество с ограничена отговорност)

### 2.2. Business Details (Фирмени данни)
* **Legal Business Name:** `INCONTROL PLUS` (или `INCONTROL PLUS EOOD` / `ИНКОНТРОЛ ПЛЮС ЕООД`)
* **Company Registration Number / Tax ID (ЕИК / ДДС):** [Въведете вашия ЕИК номер от Търговския регистър]
* **VAT Number (ако е регистрирана по ЗДДС):** `BG[Вашият ЕИК]`
* **Doing Business As (DBA) / Trading Name:** `OpenBalancer` (или `Incontrol Plus`)
* **Registered Business Address:**
  - **Street Address:** `р-н Овча купел, ул. Кукуряк № 28-Б, ет. 7, ап. 1-А`
  - **City:** `София` (Sofia)
  - **Postal Code:** `1000`
  - **Country:** `Bulgaria`
* **Business Phone Number:** `+359 87 725 3017`

### 2.3. Industry & Business Website (Индустрия и Уебсайт)
* **Industry:** `Software / IT Support` (или `Software as a Service (SaaS)` / `Other IT & Computer Services`)
* **Business Website:** `https://www.openbalancer.com`

### 2.4. Product Description (Описание на дейността — Копирайте дословно!)
> *"INCONTROL PLUS is a B2B agency operating the open-source infrastructure project OpenBalancer. We provide IT consulting, setup services, and Enterprise Service-Level Agreements (SLAs) for businesses. We charge our B2B clients via invoices either upon project completion or via monthly retainers for ongoing support."*

### 2.5. Statement Descriptor (Извлечение по банкови карти)
* **Statement Descriptor (22 chars max):** `OPENBALANCER` (или `INCONTROL PLUS`)
* **Shortened Descriptor (10 chars max):** `OPENBALANC`
* **Customer Support Phone:** `+359 87 725 3017`
* **Customer Support Email:** `support@openbalancer.com`
* **Customer Support URL:** `https://www.openbalancer.com/contact.html`

### 2.6. Bank Account (Банкова сметка за изплащане / Payouts)
* **Currency:** EUR или BGN
* **Account Holder Name:** `INCONTROL PLUS EOOD`
* **IBAN:** [Въведете фирмения IBAN от Revolut Business / Wise / BG Банка]

---

## 3. Конфигурация на Stripe Invoicing за B2B Клиенти

1. Влезте в Stripe Dashboard -> **Invoicing** -> **Settings**.
2. **Default payment terms:** Задайте **Net 14** (или Net 30).
3. **Accepted payment methods:** Включете:
   - Card payments (Visa, Mastercard)
   - SEPA Direct Debit / Bank Transfer
4. **Automatic payment reminders:** Включете автоматични напомняния 3 дни преди падежа и на датата на падежа.
5. **Invoice PDF Branding:**
   - Logo: Качете логото на OpenBalancer / Incontrol Plus.
   - Accent Color: `#3B82F6` (OpenBalancer Blue).
   - Memo / Footer note: *"Thank you for your business. For support inquiries regarding your SLA, contact support@openbalancer.com."*

---

## 4. Какво да направите, ако Stripe поиска допълнителни документи (KYB Review)

Ако Stripe стартира ръчна проверка:
1. **Certificate of Good Standing / Търговски регистър:** Прикачете актуално удостоверение за регистрация на фирмата от Агенция по вписванията.
2. **Proof of Address (Доказателство за адрес):** Банково извлечение на фирмата от Revolut Business / българска банка, където адресът съвпада точно с `р-н Овча купел, Кукуряк, 28-Б...`.
3. **Contract / SOW:** Прикачете подписания **B2B Master Services Agreement (MSA)** и **Statement of Work (SOW)** за клиент като FinansProtect.
4. **Website Proof:** Посочете активния сайт `openbalancer.com` с видими футър данни и MIT хранилището в GitHub.
