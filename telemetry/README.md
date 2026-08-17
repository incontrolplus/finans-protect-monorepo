# 📊 OpenBalancer Telemetry & Observability Suite

[![Prometheus Ready](https://img.shields.io/badge/Prometheus-v2.45+-E6522C?logo=prometheus&logoColor=white)](https://prometheus.io)
[![Grafana Ready](https://img.shields.io/badge/Grafana-v10.0+-F46800?logo=grafana&logoColor=white)](https://grafana.com)
[![Alertmanager Ready](https://img.shields.io/badge/Alertmanager-Rules_Active-4C1?logo=alertmanager)](https://prometheus.io/docs/alerting/latest/alertmanager/)
[![Engineered by INCONTROL PLUS](https://img.shields.io/badge/Maintained_by-INCONTROL_PLUS_EOOD-blue)](https://openbalancer.com)

Official, enterprise-ready **Prometheus** metrics scraping and **Grafana** dashboard monitoring assets for **OpenBalancer** (`openbalancer.com`).

---

## 📁 Repository Structure

```tree
telemetry/
├── grafana-openbalancer-dashboard.json   # Official Grafana JSON dashboard (UID: openbalancer-cluster-overview)
├── alerts.yml                           # Prometheus Alertmanager rules (HighLatency, BackendDown, etc.)
└── README.md                            # Setup guide & integration instructions
```

---

## ⚡ 1. Native Metrics Overview

OpenBalancer natively exposes Prometheus metrics over HTTP at `/metrics` (standard plaintext format) and JSON telemetry at `/openbalancer/status`.

### Key Metrics Catalog

| Metric Name | Type | Description |
| :--- | :--- | :--- |
| `openbalancer_requests_total` | Counter | Total number of HTTP requests proxied across the cluster. |
| `openbalancer_uptime_seconds` | Gauge | Uptime in seconds of the running OpenBalancer process. |
| `openbalancer_backend_health_status` | Gauge | Node health state (`1` = Healthy, `0` = Down/Tripped). |
| `openbalancer_backend_requests_total` | Counter | Cumulative requests dispatched to a specific backend upstream. |
| `openbalancer_backend_latency_ms` | Gauge | Last recorded round-trip health/routing latency per backend. |
| `openbalancer_backend_failed_requests_total` | Counter | Number of failed proxy attempts / upstream connection drops. |
| `openbalancer_circuit_breaker_trips_total` | Counter | Total circuit breaker tripping events triggered by probe failures. |
| `openbalancer_backend_consecutive_failures` | Gauge | Current consecutive probe failure counter for active failover logic. |
| `openbalancer_backend_active_connections` | Gauge | Concurrent in-flight connections on each upstream node. |

---

## 🔌 2. Connecting Prometheus

### Step 1: Add Scrape Job to `prometheus.yml`

In your Prometheus configuration (`/etc/prometheus/prometheus.yml` or Docker mount), configure OpenBalancer as a scrape target:

```yaml
scrape_configs:
  - job_name: 'openbalancer'
    metrics_path: '/metrics'
    scrape_interval: 5s
    scrape_timeout: 3s
    static_configs:
      - targets: ['127.0.0.1:8088']
        labels:
          environment: 'production'
          cluster: 'core-lb-01'
```

> **Note:** If running OpenBalancer inside Docker, replace `127.0.0.1:8088` with `openbalancer:8088` or `host.docker.internal:8088`.

### Step 2: Load Alertmanager Rules

Add `alerts.yml` into your Prometheus configuration `rule_files` directive:

```yaml
rule_files:
  - 'telemetry/alerts.yml'

alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

### Pre-configured Alert Rules

1. **`OpenBalancerHighLatency`**: Triggers when upstream latency exceeds `200ms` for >30s (Severity: `warning`).
2. **`OpenBalancerBackendDown`**: Triggers when consecutive health checks fail and a backend is marked down (Severity: `critical`).
3. **`OpenBalancerAllBackendsDown`**: Triggers when all backends are unavailable, leading to 503 errors (Severity: `page`).
4. **`OpenBalancerCircuitBreakerTripping`**: Triggers if a node trips >=3 times in 5 minutes (Severity: `warning`).
5. **`OpenBalancerHighErrorRate`**: Triggers if 5xx upstream failure rate exceeds 5% (Severity: `warning`).

---

## 📈 3. Importing the Dashboard into Grafana

### Method A: UI Import (Recommended)

1. Open your Grafana instance (`http://localhost:3000`).
2. Navigate to **Dashboards** > **New** > **Import**.
3. Click **Upload JSON file** and select [`grafana-openbalancer-dashboard.json`](file:///Users/diokarabaz/.gemini/antigravity/scratch/openbalancer/telemetry/grafana-openbalancer-dashboard.json) (or paste the JSON text directly into the box).
4. Select your Prometheus Data Source from the dropdown.
5. Click **Import**.
6. The dashboard will load immediately with UID `openbalancer-cluster-overview`.

---

### Method B: Automated Provisioning (Infrastructure as Code)

To automatically load the dashboard when launching Grafana containers:

1. Copy `grafana-openbalancer-dashboard.json` to `/var/lib/grafana/dashboards/openbalancer.json`.
2. Configure `/etc/grafana/provisioning/dashboards/openbalancer.yml`:

```yaml
apiVersion: 1

providers:
  - name: 'OpenBalancer Monitoring'
    orgId: 1
    folder: 'Network & Proxy'
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

---

### Method C: Grafana HTTP API Upload

```bash
curl -X POST \
  http://admin:admin@localhost:3000/api/dashboards/db \
  -H "Content-Type: application/json" \
  -d "{\"dashboard\": $(cat telemetry/grafana-openbalancer-dashboard.json), \"overwrite\": true}"
```

---

## 🖥️ 4. Included Dashboard Panels

The official OpenBalancer dashboard features the following pre-built panels:

```
+---------------------------------------------------------------------------------------------------+
|  [ Cluster RPS: 2,450 req/s ]  [ P99 Latency: 12.4ms (Gauge) ]  [ Healthy Nodes: 3/3 ]  [ Trips: 0 ] |
+---------------------------------------------------------------------------------------------------+
|  📈 Total Proxied RPS & Backend Distribution (Timeseries)  |  ⏱️ Backend Latency Breakdown (ms)    |
+---------------------------------------------------------------------------------------------------+
|  🛡️ Active Backend Health Statuses (State Timeline)       |  ⚡ Circuit Breaker Trip History (Bars)|
+---------------------------------------------------------------------------------------------------+
|  📋 Comprehensive Backend Node Inventory & Health Telemetry Table                                 |
+---------------------------------------------------------------------------------------------------+
```

1. **Total Proxied RPS & Throughput**: Live multi-series traffic graphs comparing cluster aggregate RPS vs individual backend rates.
2. **P99 Latency Gauge**: Radial threshold needle gauge highlighting real-time routing latency (<50ms Green, 50-200ms Orange, >200ms Red).
3. **Active Backend Health Statuses**: State timeline tracking exact uptime/downtime transitions across all upstreams.
4. **Circuit Breaker Trip History**: Bar chart displaying isolated node events over rolling 5-minute windows.
5. **Backend Node Inventory Table**: Full tabular breakdown with live color-coded status badges, request counters, and error stats.

---

## 🐳 5. 1-Click Observability Docker Compose

Spin up a complete local stack with OpenBalancer, Prometheus, Alertmanager, and Grafana:

```yaml
version: '3.8'

services:
  openbalancer:
    build: .
    ports:
      - "8088:8088"
    environment:
      - PORT=8088
      - ALGORITHM=least_latency
    restart: unless-stopped

  prometheus:
    image: prom/prometheus:v2.45.0
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./telemetry/alerts.yml:/etc/prometheus/alerts.yml:ro
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'

  alertmanager:
    image: prom/alertmanager:v0.25.0
    ports:
      - "9093:9093"

  grafana:
    image: grafana/grafana:10.0.3
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - ./telemetry/grafana-openbalancer-dashboard.json:/var/lib/grafana/dashboards/openbalancer.json:ro
```

Run:
```bash
docker compose up -d
```
Then visit **Grafana** at `http://localhost:3000` (User: `admin` / Password: `admin`).

---

## 🏢 Enterprise Support

Maintained and backed by **INCONTROL PLUS EOOD** (UIC 204882190).
* Official Website: [https://openbalancer.com](https://openbalancer.com)
* Technical Inquiries: `enterprise@openbalancer.com`
