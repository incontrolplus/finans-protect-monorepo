# ⚙️ Configuration Schema & Tuning Reference

OpenBalancer is configured via a standard JSON file (default `config.json` or path passed via `-c / --config`).

---

## 1. Complete `openbalancer.json` Schema

```json
{
  "host": "0.0.0.0",
  "port": 8888,
  "algorithm": "round_robin",
  "health_interval": 5,
  "tls": {
    "enabled": true,
    "cert_file": "certs/server.crt",
    "key_file": "certs/server.key",
    "min_version": "TLSv1.2",
    "ciphers": "DEFAULT"
  },
  "path_routing": {
    "/windows": "http://100.70.181.127:8006",
    "/vm/windows": "http://100.70.181.127:8006",
    "/novnc": "http://100.70.181.127:8006",
    "/qemu": "http://100.70.181.127:8006",
    "/storage/philips-ssd": "http://100.70.181.127:18795/storage",
    "/backup/status": "http://100.70.181.127:18795/backup/status"
  },
  "model_routing": {
    "llama3": "http://mock-ai-llama:8000",
    "qwen": "http://mock-ai-qwen:8000",
    "mistral": "http://mock-ai-mistral:8000"
  },
  "default_backend": "http://mock-ai-default:8000",
  "backends": [
    {
      "host": "100.70.181.127",
      "port": 8006,
      "weight": 2,
      "health_path": "/"
    },
    {
      "host": "100.70.181.127",
      "port": 18795,
      "weight": 1,
      "health_path": "/health"
    }
  ],
  "rate_limit": {
    "enabled": true,
    "requests_per_minute": 6000,
    "burst": 200,
    "whitelist": ["127.0.0.1", "100.83.83.8", "100.70.181.127"]
  }
}
```

---

## 2. Field Specifications

| Property | Type | Default | Description |
|---|---|---|---|
| `host` | `string` | `"0.0.0.0"` | Network interface to bind the load balancer. |
| `port` | `integer` | `8888` | Port to accept incoming client traffic. |
| `algorithm` | `string` | `"round_robin"` | `round_robin`, `least_connections`, `ip_hash`, `power_of_two`, `least_latency`. |
| `health_interval`| `integer` | `5` | Background health probe interval in seconds. |
| `tls.enabled` | `boolean` | `false` | Enables TLS / HTTPS termination on the listen port. |
| `tls.cert_file`| `string` | `certs/server.crt` | Path to TLS public certificate file (PEM format). |
| `tls.key_file` | `string` | `certs/server.key` | Path to TLS private key file (PEM format). |
| `tls.min_version`| `string` | `"TLSv1.2"` | Minimum allowed TLS protocol version (`TLSv1.2` or `TLSv1.3`). |
| `path_routing` | `object` | `{}` | Key-value mapping of URL path prefixes to target upstream URLs. |
| `model_routing`| `object` | `{}` | Key-value mapping of AI model names to target inference node URLs. |
| `backends` | `array` | `[]` | List of upstream target backend nodes. |
| `backends[].host` | `string` | Required | Upstream hostname or IP address (e.g. `100.70.181.127`). |
| `backends[].port` | `integer` | Required | Upstream target TCP port (e.g. `8006`, `8000`). |
| `backends[].weight`| `integer` | `1` | Relative load weight ($1 \le w \le 10$). |
| `backends[].health_path`| `string` | `"/health"` | HTTP endpoint for proactive health probing. |
