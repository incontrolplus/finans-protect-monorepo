# ⚙️ Configuration Schema & Tuning Reference

OpenBalancer is configured via a standard JSON file (default `config.json` or path passed as first CLI argument).

---

## 1. Complete `openbalancer.json` Schema

```json
{
  "host": "0.0.0.0",
  "port": 8088,
  "algorithm": "round_robin",
  "health_interval": 5,
  "timeout_ms": 250,
  "circuit_breaker": {
    "error_threshold": 3,
    "recovery_time_sec": 15
  },
  "backends": [
    {
      "host": "10.0.1.10",
      "port": 8000,
      "weight": 2,
      "health_path": "/health"
    },
    {
      "host": "10.0.1.11",
      "port": 8000,
      "weight": 1,
      "health_path": "/health"
    }
  ]
}
```

---

## 2. Field Specifications

| Property | Type | Default | Description |
|---|---|---|---|
| `host` | `string` | `"0.0.0.0"` | Network interface to bind the load balancer. |
| `port` | `integer` | `8088` | Port to accept incoming client traffic. |
| `algorithm` | `string` | `"round_robin"` | `round_robin`, `least_connections`, `ip_hash`, `power_of_two`. |
| `health_interval`| `integer` | `5` | Background health probe interval in seconds. |
| `timeout_ms` | `integer` | `250` | Maximum socket connection timeout in milliseconds before triggering failover. |
| `backends` | `array` | `[]` | List of upstream target backend nodes. |
| `backends[].host` | `string` | Required | Upstream hostname or IP address. |
| `backends[].port` | `integer` | Required | Upstream target TCP port. |
| `backends[].weight`| `integer` | `1` | Relative load weight ($1 \le w \le 10$). |
| `backends[].health_path`| `string` | `"/health"` | HTTP endpoint for proactive health probing. |
