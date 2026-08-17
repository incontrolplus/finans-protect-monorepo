# 📊 Telemetry API & Prometheus Metrics Integration

OpenBalancer embeds an observability endpoint at `/openbalancer/status` that delivers real-time JSON metrics without requiring external agents.

---

## 1. `/openbalancer/status` Endpoint

### Request:
```bash
curl -s http://127.0.0.1:8088/openbalancer/status
```

### JSON Response:
```json
{
  "system": "OpenBalancer Core",
  "operator": "INCONTROL PLUS EOOD",
  "license": "MIT",
  "uptime_seconds": 3600,
  "total_proxied_requests": 142850,
  "algorithm": "round_robin",
  "backends": [
    {
      "url": "http://10.0.1.10:8000",
      "healthy": true,
      "weight": 2,
      "total_requests": 95233,
      "last_latency_ms": 11.85
    },
    {
      "url": "http://10.0.1.11:8000",
      "healthy": true,
      "weight": 1,
      "total_requests": 47617,
      "last_latency_ms": 14.20
    }
  ]
}
```

---

## 2. Prometheus Scrape Configuration (`prometheus.yml`)

```yaml
scrape_configs:
  - job_name: 'openbalancer'
    metrics_path: '/openbalancer/status'
    static_configs:
      - targets: ['127.0.0.1:8088']
    scrape_interval: 5s
```
