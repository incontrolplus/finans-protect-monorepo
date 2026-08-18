# Reddit Post: r/selfhosted & r/LocalLLaMA & r/homelab

**Suggested Title:** `[Self-Hosted] OpenBalancer: Lightweight Async Load Balancer & Reverse Proxy for AI Clusters & Homelabs (MIT, <20MB RAM, SSE Streaming)`

---

### Post Body:

Hey r/selfhosted!

I wanted to share **OpenBalancer**, a lightweight, open-source asynchronous reverse proxy and load balancer we've built and released under the MIT license.

* **GitHub:** https://github.com/incontrolplus/openbalancer
* **Live Visualizer & Docs:** https://www.openbalancer.com

### 💡 Why we built this:
If you run homelabs with multiple local AI inference workers (e.g. Ollama, vLLM, LocalAI across multiple GPUs/machines) or small microservice clusters, traditional reverse proxies often require verbose configs, have heavy base memory footprints, or buffer Server-Sent Events (SSE) by default, causing jerky token streaming in WebUIs.

### 🌟 Key Highlights:
1. **Zero-Buffer SSE Streaming:** Non-blocking async token streaming designed specifically for OpenAI-compatible chat completions and WebSockets.
2. **Ultralight Footprint:** <20MB RAM RSS in production (Alpine Docker container is <45MB total).
3. **Automated Health Probes & Circuit Breakers:** Continuously health-checks upstream backends and reroutes failed requests in <50ms (great for when an inference node OOMs or is restarted).
4. **Built-in Dual Observability:**
   - Real-time JSON telemetry: `/openbalancer/status` (live latency per backend, active connections, circuit trips).
   - Prometheus metrics endpoint: `/metrics` (includes ready-to-import Grafana dashboard).
5. **Balancing Strategies:** Weighted Round-Robin, Least Connections, Least Latency, IP Hash (sticky sessions), and Power-of-Two Random Choices (P2C).

---

### 🐳 Quick Start with Docker Compose:

```yaml
version: '3.8'

services:
  openbalancer:
    image: ghcr.io/incontrolplus/openbalancer:latest
    container_name: openbalancer
    restart: unless-stopped
    ports:
      - "8088:8088"
    volumes:
      - ./config.json:/app/config.json:ro
```

Sample `config.json` for balancing two local Ollama / vLLM instances:
```json
{
  "host": "0.0.0.0",
  "port": 8088,
  "algorithm": "least_latency",
  "backends": [
    { "url": "http://192.168.1.100:11434", "weight": 2 },
    { "url": "http://192.168.1.101:11434", "weight": 1 }
  ],
  "health_check": {
    "interval": 5,
    "path": "/api/tags",
    "timeout": 2
  }
}
```

---

### ⚡ 5-Second CLI Sandbox (PyPI):
```bash
pip install openbalancer
openbalancer demo
```

### 🤝 Feedback & Roadmap:
OpenBalancer is completely open source under the MIT license (no features locked behind enterprise paywalls in the core engine). 

We'd love your feedback on features you'd like to see next (e.g. dynamic TLS cert management, HTTP/3, WebAssembly plugins). Check out the repository, give it a star if you find it useful, and feel free to open issues or PRs!

