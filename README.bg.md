# ⚡ OpenBalancer & INCONTROL PLUS Екосистема

<p align="center">
  <a href="README.bg.md"><b>🇧🇬 Българска версия (Bulgarian Version)</b></a> | 
  <a href="README.md"><b>🇬🇧 English Version</b></a>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Готов-2496ED?logo=docker&logoColor=white)](core/Dockerfile)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?logo=python&logoColor=white)](core/openbalancer.py)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare-Pages%20Ready-F38020?logo=cloudflare&logoColor=white)](cloudflare/Cloudflare_Pages_and_DNS_Deployment_Guide.md)
[![Enterprise Support](https://img.shields.io/badge/Enterprise-SLA%20Наличен-10b981)](https://openbalancer.com/#enterprise)
[![Опериран от](https://img.shields.io/badge/Опериран%20от-INCONTROL%20PLUS-3b82f6)](https://openbalancer.com)

**OpenBalancer** е модерен, високопроизводителен, асинхронен балансьор на натоварването (load balancer), reverse proxy и инфраструктурен софтуерен пакет с отворен код, създаден и поддържан от **ИНКОНТРОЛ ПЛЮС ЕООД (INCONTROL PLUS EOOD)**. Проектиран специално за AI клъстери, високочестотни микросървиси и критично важни уебхуци и API маршрутизация.

---

## 🏗️ Архитектура на Хранилището

```
openbalancer/
├── README.md                                # Главна документация (English)
├── README.bg.md                             # Главна документация (Български)
├── LICENSE                                  # MIT лиценз за отворен код
├── core/                                    # Сърцевина на OpenBalancer & Тестове
│   ├── openbalancer.py                      # Асинхронен Python Load Balancer & Proxy
│   ├── config.json                          # Примерна конфигурация на възли и алгоритми
│   ├── Dockerfile                           # Олекотен Alpine Docker образ
│   ├── docker-compose.yml                   # Локална клъстерна тестова среда с mock бекенди
│   ├── test_balancer.py                     # Автоматизиран тестов пакет за валидация
│   ├── awesome-selfhosted-pr.md             # PR предложение за awesome-selfhosted
│   └── README.md                            # Специфична документация за енджина
├── website/                                 # Официален уебсайт (Cloudflare Pages)
│   ├── index.html                           # Главна страница с интерактивен симулатор на трафик
│   ├── css/style.css                        # Модерен Vanilla CSS дизайн и анимации
│   ├── js/main.js                           # Логика за визуализация на балансирането в реално време
│   ├── terms.html                           # Общи условия (Terms of Service)
│   ├── privacy.html                         # Политика за поверителност (GDPR съвместима)
│   ├── refunds.html                         # Политика за възстановяване на суми и SLA неустойки
│   ├── contact.html                         # Фирмена верификация и Индентификация (Impressum)
│   └── _headers                             # Защитни HTTP заглавия (CSP, HSTS, X-Frame)
├── compliance/                              # Правна рамка и Търговски договори
│   ├── Brand_Isolation_Legal_Matrix.md      # Тристепенна правна йерархия (Anti-Fronting)
│   ├── B2B_Master_Services_Agreement_Template.md # Рамков B2B договор за услуги (MSA)
│   ├── B2B_Statement_Of_Work_SLA_Template.md     # Спецификация на услугата с 99.9% SLA
│   ├── Stripe_Onboarding_Step_by_Step_Guide.md  # Наръчник за верификация и одобрение в Stripe
│   └── FinansProtect_B2B_Billing_Workflow.md    # Модел на фактуриране за външни клиенти
├── cloudflare/                              # Нулев разход за хостинг и DNS
│   └── Cloudflare_Pages_and_DNS_Deployment_Guide.md # Ръководство за Cloudflare Pages CI/CD
└── social/                                  # Дигитален отпечатък и Социално присъствие
    ├── LinkedIn_Company_Page_Copy.md        # Текстове за фирмената страница на INCONTROL PLUS
    ├── LinkedIn_Product_Page_Copy.md        # Текстове за продуктовата страница на OpenBalancer
    ├── Twitter_Launch_Strategy.md           # Стартова кампания и туитове
    └── Discord_Community_Setup.md           # Структура на Discord общността за съпорт
```

---

## 🌟 Основни Възможности на Ядрото

* **⚡ Неблокиращ Асинхронен I/O**: Чист Python async proxy с под-милисекундно забавяне (overhead).
* **🧠 Оптимизиран за AI и LLM Inference**: Поддържа стрийминг на HTTP chunked заявки и Server-Sent Events (SSE).
* **🛡️ Активен Health Check Мониторинг**: Автоматична проверка на състоянието на бекенд възлите и мигновен failover при деградация.
* **🎯 Стратегии за Балансиране**:
  * `round_robin` — Равномерно циклично разпределение на трафика.
  * `weighted` — Разпределение, пропорционално на зададения капацитет (тегло) на всяка нода.
  * `least_latency` — Динамично пренасочване към възела с най-ниско измерено време за отговор.
* **📊 Вградено Telemetry API**: Мониторинг и метрики в реално време на `/openbalancer/status`.
* **🐳 Docker Контейнеризация**: Ултралек образ (<45MB) на базата на Alpine Linux.

---

## 🚀 Бърз Старт (Quickstart)

### 1. Стартиране с чист Python (Без допълнителни библиотеки)
```bash
python3 core/openbalancer.py core/config.json
```

### 2. Стартиране на автоматичните тестове
```bash
python3 core/test_balancer.py
```

### 3. Стартиране на клъстер чрез Docker Compose
```bash
docker-compose -f core/docker-compose.yml up -d
```

Проверка на телеметрията и състоянието:
```bash
curl http://localhost:8080/openbalancer/status
```

---

## 🏢 Корпоративна Поддръжка и SLAs (Enterprise)

**OpenBalancer** се управлява и поддържа комерсиално от **ИНКОНТРОЛ ПЛЮС ЕООД (INCONTROL PLUS EOOD)**, София, България. Предлагаме:
* **Гарантирано 99.9% месечно работно време (Uptime SLA)**
* **Гарантирано време за реакция при критични инциденти под 15 минути**
* **Персонализирана разработка на AI routing и балансиращи модули**
* **Цялостен мениджмънт и поддръжка на инфраструктурата "до ключ"**

За бизнес запитвания: **support@openbalancer.com** или посетете **[https://openbalancer.com](https://openbalancer.com)**.

---

## 📜 Лиценз и Съвместимост

* **Софтуерен Лиценз**: Разпространява се под [MIT License](LICENSE).
* **Юридическо лице / Оператор**: ИНКОНТРОЛ ПЛЮС ЕООД, София, България.
* **Съответствие**: 100% GDPR, Stripe KYB/KYC и европейски стандарти за защита на потребителите.
