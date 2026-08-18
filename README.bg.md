# ⚡ OpenBalancer & INCONTROL PLUS Екосистема

<p align="center">
  <a href="README.bg.md"><b>🇧🇬 Българска версия (Bulgarian Version)</b></a> | 
  <a href="README.md"><b>🇬🇧 English Version</b></a>
</p>

[![CI](https://github.com/incontrolplus/openbalancer/actions/workflows/ci.yml/badge.svg)](https://github.com/incontrolplus/openbalancer/actions/workflows/ci.yml)
[![Docker Build](https://github.com/incontrolplus/openbalancer/actions/workflows/docker.yml/badge.svg)](https://github.com/incontrolplus/openbalancer/actions/workflows/docker.yml)
[![License: MIT](https://img.shields.io/badge/Лиценз-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12-3776AB?logo=python&logoColor=white)](core/openbalancer.py)
[![Cloudflare Pages](https://img.shields.io/badge/Cloudflare%20Pages-Активен-F38020?logo=cloudflare&logoColor=white)](https://openbalancer.pages.dev)
[![Enterprise Support](https://img.shields.io/badge/Enterprise-SLA%20Поддръжка-10b981)](https://www.openbalancer.com/#enterprise)
[![Оператор](https://img.shields.io/badge/Оператор-ИНКОНТРОЛ%20ПЛЮС%20ЕООД-3b82f6)](https://www.openbalancer.com)

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

## 🌟 Основни Функционалности

* **⚡ Неблокиращ асинхронен I/O**: Изчистено Python асинхронно прокси с минимално забавяне (p50 < 4.7ms).
* **🧠 Оптимизирано за AI & LLM инференс**: Нулево буфериране на стрийминг токени и SSE (Server-Sent Events) препращане.
* **🛡️ Активен Health Probing & Circuit Breaker**: Автоматичен фонов мониторинг, изолиране на деградирали възли и мигновен failover.
* **🎯 6 Алгоритъма за балансиране**: `round_robin`, `weighted_round_robin`, `least_connections`, `least_latency`, `ip_hash`, `power_of_two`.
* **📊 Двойно API за наблюдение (Observability)**:
  * JSON Status Endpoint: `/openbalancer/status`
  * Prometheus Plaintext Metrics Exporter: `/metrics`
* **📈 Официален Grafana Дашборд**: Готов за импортиране шаблон в `telemetry/grafana-openbalancer-dashboard.json`.
* **🐳 Docker & Kubernetes готовност**: Олекотен мултиплатформен контейнер (<45MB).

---

## 🚀 Бърз Старт

### 1. Моментален Интерактивен Демо Сандбокс (Без допълнителна настройка)
Стартирайте OpenBalancer заедно с 3 вградени тестови сървъра (ALPHA, BETA, GAMMA) само с 1 команда:
```bash
python3 core/openbalancer.py demo
# Или на потребителски порт:
python3 core/openbalancer.py demo -p 8088
```

В друг терминал изпратете тестова заявка:
```bash
# Балансирана заявка през ALPHA, BETA, GAMMA:
curl -s http://localhost:8088/

# Преглед на телеметрията в реално време:
curl -s http://localhost:8088/openbalancer/status | jq .
curl -s http://localhost:8088/metrics
```

### 2. Стандартен Продукционен Режим (С Ваши Услуги)
```bash
# Валидиране на конфигурация
python3 core/openbalancer.py validate -c core/config.json

# Стартиране на OpenBalancer
python3 core/openbalancer.py start -c core/config.json
```

Или бърза инсталация с 1 команда:
```bash
curl -fsSL https://www.openbalancer.com/install.sh | bash
```

### 3. Готов Docker Mesh Стек (OpenBalancer + Prometheus + Grafana)
```bash
docker compose -f docker-compose.mesh.yml up -d
```

### 4. Стартиране на Стрес-Тест Бенчмарк (5,300+ Заявки/сек)
```bash
python3 benchmark/run_benchmark.py
```
Вижте пълния доклад: [benchmark/BENCHMARK_RESULTS.md](benchmark/BENCHMARK_RESULTS.md).

### 3. Стартиране на Тестовия Пакет
```bash
python3 -m unittest discover -s tests -p "test_*.py" -v
python3 core/test_balancer.py
```

### 4. Мониторинг с Prometheus & Grafana
OpenBalancer експортира стандартни Prometheus метрики на `/metrics`:
```bash
curl http://localhost:8088/metrics
curl http://localhost:8088/openbalancer/status
```
Импортирайте [`telemetry/grafana-openbalancer-dashboard.json`](telemetry/grafana-openbalancer-dashboard.json) в Grafana за наблюдение на трафика и здравето на възлите в реално време.

---

## 📚 Техническа Документация

Разгледайте пълната документация в [`docs/`](docs/):
* [Архитектура & Event Loop](docs/architecture.md)
* [Алгоритми за балансиране](docs/algorithms.md)
* [Конфигурационна схема](docs/configuration.md)
* [Телеметрия & Prometheus API](docs/telemetry-api.md)
* [Продукционно разгръщане](docs/deployment.md)

---

## 🏢 Корпоративна Поддръжка & SLA Гаранции

OpenBalancer се поддържа и оперира от **ИНКОНТРОЛ ПЛЮС ЕООД** (гр. София, България). Предлагаме:
* **99.9% Гарантиран месечен ъптайм SLA**
* **Под 15 минути реакция при критични инциденти**
* **Net-14 Корпоративно фактуриране & Stripe плащания с карта**
* **Разработка на специализирани модули за AI маршрутизация**
* **Управлявани инфраструктурни внедрявания до ключ**

За запитвания: **support@openbalancer.com** или посетете **[https://www.openbalancer.com](https://www.openbalancer.com)**.

---

## 📜 Лиценз и Правна Съвместимост

* **Лиценз на софтуера**: Разпространява се под [MIT License](LICENSE).
* **Опериращо дружество**: ИНКОНТРОЛ ПЛЮС ЕООД, гр. София, ЕИК 204882190.
* **Съвместимост**: Пълно съответствие с GDPR, Stripe KYB и европейското законодателство.
