# Show HN: OpenBalancer v1.5.0 – Lightweight async load balancer with live visualizer & SSE streaming

**Website & Visualizer:** https://openbalancer.com  
**Documentation:** https://openbalancer.com/docs  
**GitHub Repository:** https://github.com/incontrolplus/openbalancer  

---

### Suggested Submission Title:
`Show HN: OpenBalancer v1.5.0 – Lightweight async load balancer with live visualizer & SSE streaming`

### Post Text / Comment:

Hi HN,

We built **OpenBalancer v1.5.0** (https://github.com/incontrolplus/openbalancer) because we needed a lightweight, zero-dependency async reverse proxy and load balancer specifically tailored for LLM token streaming (SSE / WebSockets chunking) and microservice routing where heavy config reloads and huge RAM footprints were overkill.

### Why another load balancer?
While battle-tested tools like NGINX, HAProxy, and Envoy are industry standards, setting them up for local LLM clusters (vLLM, Ollama, TGI) often involves complex buffering configurations, external health check sidecars, or high base memory overhead.

OpenBalancer was engineered around a few core priorities:
1. **Zero-Buffer SSE / Token Streaming:** Powered by native Python `asyncio` stream pipelines, OpenBalancer streams tokens chunk-by-chunk with constant O(1) memory overhead (~18MB base RSS).
2. **AI Inference Failover & Circuit Breaking:** Automatically trips unhealthy backends when inference nodes run out of VRAM (OOM) or time out, instantly rerouting traffic in <50ms without dropping active streaming clients.
3. **Dual Observability Out-of-the-Box:** 
   - Clean JSON telemetry endpoint: `/openbalancer/status` (live latency, circuit breaker trips, backend health).
   - Prometheus metrics exporter: `/metrics` (ready for Grafana with our included pre-built dashboard).
4. **Adaptive Load Balancing Strategies:**
   - Round-Robin & Weighted Round-Robin
   - Least Connections & Least Latency
   - Consistent IP Hash (for sticky session states)
   - Power-of-Two Random Choices (P2C)
5. **Zero-Dependency Quickstart:** Run as a standalone Python CLI, PyPI package, or ultralight Alpine container (<45MB).

### 🚀 10-Second Quickstart:
```bash
# Install via pip
pip install openbalancer

# Launch interactive demo sandbox with 3 mock backends:
openbalancer demo

# Or run via Docker:
docker run -d -p 8088:8088 ghcr.io/incontrolplus/openbalancer:v1.5.0
```

You can also try the interactive traffic simulator and visualizer directly in your browser on our landing page: https://openbalancer.com (Docs: https://openbalancer.com/docs)

OpenBalancer v1.5.0 is 100% open-source under the MIT license. We’d love to hear your thoughts, feedback on our async event-loop architecture, HTTP/3 roadmap, and real-world AI inference routing use cases!

