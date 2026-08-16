# Ръководство за Разгръщане в Cloudflare Pages & Конфигурация на DNS

**Цел:** 100% безплатен, бърз глобален CDN хостинг с автоматичен SSL сертификат, DDoS защита и непрекъсната интеграция (CI/CD) през GitHub за `openbalancer.com`.

---

## 1. Регистрация и Добавяне на Домейна в Cloudflare

1. Влезте в [Cloudflare.com](https://www.cloudflare.com) и се регистрирайте с фирмения имейл на Incontrol Plus.
2. В контролния панел (Dashboard) изберете **Add a Site**.
3. Въведете домейна: `openbalancer.com`.
4. Изберете **Free Plan** (Напълно безплатен план, осигуряващ неограничен трафик, SSL и WAF).
5. Cloudflare ще сканира съществуващите DNS записи и ще ви предостави два Nameserver адреса (напр. `ada.ns.cloudflare.com` и `bob.ns.cloudflare.com`).

---

## 2. Промяна на Nameservers при вашия Домейн Регистрар

1. Влезте в контролния панел на регистрара, откъдето е закупен домейнът `openbalancer.com` (напр. SuperHosting, Namecheap, GoDaddy, Porkbun).
2. Отворете секцията за управление на DNS / Nameservers.
3. Превключете от Custom/Default DNS към **Custom Nameservers** и въведете точно двата Nameservers, дадени от Cloudflare.
4. Запазете промените. Делегирането на DNS обикновено отнема от 5 минути до няколко часа.

---

## 3. Свързване на GitHub Хранилището с Cloudflare Pages

1. В Cloudflare Dashboard отворете менюто **Workers & Pages** -> **Create application** -> **Pages**.
2. Изберете **Connect to Git**.
3. Оторизирайте вашия GitHub акаунт / организация `Incontrol-Plus` или `OpenBalancer`.
4. Изберете хранилището `openbalancer-website`.
5. Попълнете настройките за Build & Deployment:
   - **Project name:** `openbalancer` (или `openbalancer-website`)
   - **Production branch:** `main`
   - **Framework preset:** `None` (Static HTML/CSS/JS)
   - **Build command:** *Оставете празно*
   - **Build output directory:** `.` (или `website/` ако целият проект е в едно моно-хранилище)
6. Натиснете **Save and Deploy**.
7. Cloudflare Pages ще компилира и публикува сайта на безплатен поддомейн (напр. `openbalancer.pages.dev`).

---

## 4. Свързване на Вашия Собствен Домейн (Custom Domain)

1. В страницата на вашия Cloudflare Pages проект отидете на таб **Custom domains**.
2. Натиснете **Set up a custom domain**.
3. Въведете `openbalancer.com` и потвърдете.
4. Повторете за `www.openbalancer.com`.
5. Cloudflare автоматично ще конфигурира CNAME записите и ще издаде безплатен Universal SSL сертификат.

---

## 5. Препоръчителни Настройки за Сигурност & SSL в Cloudflare

1. **SSL/TLS Encryption Mode:** Задайте на **Full** или **Full (strict)**.
2. **Always Use HTTPS:** Включено (**ON**).
3. **Automatic HTTPS Rewrites:** Включено (**ON**).
4. **Minimum TLS Version:** TLS 1.2 или TLS 1.3.
5. **Early Hints & HTTP/3 (with QUIC):** Включено (**ON**).

След тази настройка сайтът `openbalancer.com` ще бъде 100% онлайн с нулев месечен разход, максимална скорост в цял свят и перфектно съответствие за верификацията на Stripe!
