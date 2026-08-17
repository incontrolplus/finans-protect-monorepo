# ⚡ OpenBalancer Core (Сърцевина)

<p align="center">
  <a href="README.bg.md"><b>🇧🇬 Българска версия</b></a> | 
  <a href="README.md"><b>🇬🇧 English Version</b></a>
</p>

[![License: MIT](https://img.shields.io/badge/Лиценз-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Готов-2496ED?logo=docker&logoColor=white)](Dockerfile)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?logo=python&logoColor=white)](openbalancer.py)
[![Enterprise Support](https://img.shields.io/badge/Enterprise-SLA%20Наличен-10b981)](https://openbalancer.com/#enterprise)
[![Опериран от](https://img.shields.io/badge/Опериран%20от-INCONTROL%20PLUS-3b82f6)](https://openbalancer.com)

**OpenBalancer** е ултрабърз, олекотен, асинхронен балансьор на натоварването и API reverse proxy, оптимизиран за модерни AI клъстери, стрийминг на големи езикови модели (LLM inference), високочестотни микросървиси и надеждни уебхук потоци.

---

## 🌟 Ключови Възможности

* **🧠 AI & Inference Aware Routing:** Оптимизиран за HTTP chunked стрийминг заявки, OpenAI/Claude проксита, Ollama и vLLM клъстери.
* **⚡ Под-милисекундно проксиране:** Асинхронен неблокиращ I/O механизъм без външни тежки библиотеки.
* **🛡️ Активен Health Check:** Автоматизирана фонова проверка на възлите с мигновено откриване на деградация и автоматичен failover.
* **🎯 Алгоритми за Балансиране:**
  * `round_robin` (По подразбиране)
  * `weighted` (Разпределение според зададения капацитет/тежест на сървъра)
  * `least_latency` (Препращане към възела с най-ниска латентност)
* **📊 Вграден Telemetry & Status Ендпоинт:** Пълна JSON телеметрия на `/openbalancer/status`.
* **🔒 100% Self-Hosted & Частен:** Пълен суверенитет над данните без vendor lock-in.

---

## 🏢 Корпоративна Поддръжка & SLAs (Enterprise)

> ### **Търсите 24/7 гарантирано работно време и управлявана инфраструктура?**
> **OpenBalancer** е комерсиално поддържан от **ИНКОНТРОЛ ПЛЮС ЕООД**.  
> Предлагаме официални **B2B Master Services Agreements (MSAs)**, **99.9% Uptime SLAs**, реакция при аварии под 15 минути и цялостен инфраструктурен мениджмънт.
>
> 🌐 **Уебсайт:** [https://openbalancer.com](https://openbalancer.com)  
> ✉️ **Запитвания за Enterprise:** [support@openbalancer.com](mailto:support@openbalancer.com)  
> 🏢 **Оператор:** ИНКОНТРОЛ ПЛЮС ЕООД, София, България

---

## 🚀 Бърз Старт

### Вариант 1: Чрез Docker (Най-бързо)

```bash
docker run -d \
  --name openbalancer \
  -p 8080:8080 \
  -v $(pwd)/config.json:/app/config.json \
  openbalancer/core:latest
```

### Вариант 2: Чрез Docker Compose (Цялостен тестов клъстер)

```bash
git clone https://github.com/incontrolplus/openbalancer.git
cd openbalancer
docker-compose -f core/docker-compose.yml up -d
```

Тест на балансирането:
```bash
curl http://localhost:8080/
```

Проверка на телеметрията:
```bash
curl http://localhost:8080/openbalancer/status
```

### Вариант 3: Стартиране с Python (Чист Python без зависимости)

```bash
python3 openbalancer.py config.json
```

---

## ⚙️ Конфигурационен Файл (`config.json`)

```json
{
  "host": "0.0.0.0",
  "port": 8080,
  "algorithm": "round_robin",
  "health_interval": 5,
  "backends": [
    {
      "host": "10.0.0.1",
      "port": 9001,
      "weight": 2,
      "health_path": "/health"
    },
    {
      "host": "10.0.0.2",
      "port": 9002,
      "weight": 1,
      "health_path": "/health"
    }
  ]
}
```

---

## 🧪 Автоматизирани Тестове

За стартиране на пълния набор от тестове:
```bash
python3 test_balancer.py
```
Тестът валидира стартирането на mock сървъри, разпределението на заявките, изчисляването на латентността и обновяването на броячите в телеметрията.
