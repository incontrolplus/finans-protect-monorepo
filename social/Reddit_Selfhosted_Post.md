# Reddit Post: r/selfhosted & r/devops

**Title:** [Self-Hosted] OpenBalancer: Lightweight Async Load Balancer & API Reverse Proxy with Built-in Telemetry

---

### Body:

Hey r/selfhosted and r/devops!

I wanted to share **OpenBalancer**, a lightweight, open-source asynchronous reverse proxy and load balancer we've built and open-sourced under the MIT license.

* **GitHub:** https://github.com/incontrolplus/openbalancer
* **Website & Live Visualizer:** https://www.openbalancer.com

### Why OpenBalancer?
If you're running home labs, AI inference clusters (Ollama, vLLM, LocalAI), or containerized microservices:
1. **Lightweight (<20MB RAM):** Runs on Python 3.10+ async sockets or Alpine Docker without heavy runtime bloat.
2. **Native Health Probes & Circuit Breakers:** Continuously monitors upstream backends and reroutes failed traffic in <50ms.
3. **Built-in Status Telemetry:** Ships with a native `/openbalancer/status` endpoint that outputs live latency per backend and proxied request counts in clean JSON.
4. **Adaptive Balancing Strategies:**
   * Weighted Round-Robin
   * Least Connections
   * Consistent IP Hash (for sticky sessions)
   * Power-of-Two Random Choices (P2C)

### 🚀 Quick Start (Docker):
```bash
docker run -d \
  --name openbalancer \
  -p 8088:8088 \
  ghcr.io/incontrolplus/openbalancer:latest
```

Or 1-line script:
```bash
curl -fsSL https://www.openbalancer.com/install.sh | bash
```

Let me know what you think and what features you'd like to see next! Pull requests and issues are very welcome!
