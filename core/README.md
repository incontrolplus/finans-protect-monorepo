# ⚡ OpenBalancer Core

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](Dockerfile)
[![Python](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?logo=python&logoColor=white)](openbalancer.py)
[![Enterprise Support](https://img.shields.io/badge/Enterprise-SLA%20Available-10b981)](https://openbalancer.com/#enterprise)
[![Operated by](https://img.shields.io/badge/Operated%20by-INCONTROL%20PLUS-3b82f6)](https://openbalancer.com)

**OpenBalancer** is an ultra-fast, lightweight, asynchronous load balancer and API reverse proxy engineered for modern AI inference clusters, high-throughput microservices, and mission-critical webhooks.

---

## 🌟 Key Features

* **🧠 AI & Inference Aware Routing:** Optimized for streaming LLM requests, OpenAI/Claude proxies, Ollama, and vLLM clusters.
* **⚡ Sub-Millisecond Proxying:** Asynchronous non-blocking I/O with zero unnecessary dependencies.
* **🛡️ Active Health Checks:** Continuous automated background polling with instant degradation detection and automatic failover.
* **🎯 Multiple Load Balancing Algorithms:**
  * `round_robin` (Default)
  * `weighted` (Capacity-weighted traffic distribution)
  * `least_latency` (Routes traffic to the fastest responding node)
* **📊 Built-in Live Status & Metrics Endpoint:** Exposes JSON telemetry at `/openbalancer/status` for monitoring and Prometheus integration.
* **🔒 100% Self-Hosted & Private:** Complete data sovereignty without vendor lock-in.

---

## 🏢 Enterprise Support & Commercial SLAs

> ### **Need 24/7 Guaranteed Uptime & Managed Private Deployment?**
> **OpenBalancer** is backed and commercially supported by **INCONTROL PLUS ЕООД**.  
> We provide formal **B2B Master Services Agreements (MSAs)**, **99.9% Uptime SLAs**, sub-15 minute emergency incident response, and turnkey infrastructure management.
>
> 🌐 **Website:** [https://openbalancer.com](https://openbalancer.com)  
> ✉️ **Enterprise Inquiries:** [support@openbalancer.com](mailto:support@openbalancer.com)  
> 🏢 **Operator:** INCONTROL PLUS ЕООД, Sofia, Bulgaria

---

## 🚀 Quickstart

### Option 1: Docker (Fastest)

```bash
docker run -d \
  --name openbalancer \
  -p 8080:8080 \
  -v $(pwd)/config.json:/app/config.json \
  openbalancer/core:latest
```

### Option 2: Docker Compose (Full Cluster Test)

Clone the repository and spin up OpenBalancer alongside two upstream backend services:

```bash
git clone https://github.com/incontrol-plus/openbalancer.git
cd openbalancer
docker-compose up -d
```

Test the cluster:
```bash
curl http://localhost:8080/
```

Check telemetry and status:
```bash
curl http://localhost:8080/openbalancer/status
```

### Option 3: Standalone Python (Zero Dependencies)

```bash
python3 openbalancer.py config.json
```

---

## ⚙️ Configuration (`config.json`)

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

### Environment Variable Overrides

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | Listening port for client traffic | `8080` |
| `HOST` | Listening host IP | `0.0.0.0` |
| `ALGORITHM` | `round_robin`, `weighted`, `least_latency` | `round_robin` |
| `HEALTHCHECK_INTERVAL` | Seconds between active health check probes | `5` |

---

## 📈 Status API Output (`/openbalancer/status`)

```json
{
  "system": "OpenBalancer Core",
  "operator": "INCONTROL PLUS EOOD",
  "license": "MIT",
  "uptime_seconds": 3600,
  "total_proxied_requests": 284910,
  "algorithm": "round_robin",
  "backends": [
    {
      "url": "http://127.0.0.1:9001",
      "healthy": true,
      "weight": 1,
      "total_requests": 142455,
      "last_latency_ms": 1.24
    },
    {
      "url": "http://127.0.0.1:9002",
      "healthy": true,
      "weight": 1,
      "total_requests": 142455,
      "last_latency_ms": 1.18
    }
  ]
}
```

---

## 📄 License

OpenBalancer is licensed under the [MIT License](LICENSE).  
Copyright © 2026 **INCONTROL PLUS ЕООД**. All rights reserved.
