# Show HN: OpenBalancer – Lightweight async load balancer with live visualizer & sub-ms latency

**Link:** https://www.openbalancer.com  
**GitHub:** https://github.com/incontrolplus/openbalancer  

---

### Post Text:

Hi HN,

We built **OpenBalancer** (https://github.com/incontrolplus/openbalancer) because we needed a lightweight, zero-dependency async reverse proxy and load balancer specifically tailored for LLM token streaming (SSE / WebSockets) and microservice routing where heavy config reloads and huge RAM footprints were overkill.

### Why not just NGINX / HAProxy?
- **Zero-Buffer SSE Streaming:** By leveraging native non-blocking Python `asyncio` streams, OpenBalancer proxies tokens directly with O(1) constant memory (18MB RSS footprint).
- **Embedded Telemetry & Status:** Built-in `/openbalancer/status` endpoint delivering real-time JSON metrics, dynamic latency tracking, and health probing without external sidecars.
- **Dynamic Routing:** Out-of-the-box Weighted Round-Robin, Least Connections, Consistent IP Hash, and Power-of-Two Random Choices.
- **Standalone 1-Line Setup:** No C compilers or complex dependencies required. Can be run via Docker, standalone script, or `curl -fsSL https://www.openbalancer.com/install.sh | bash`.

We also created an interactive web visualizer and live configuration builder on our landing page (https://www.openbalancer.com) where you can test traffic balancing in real-time and export production `openbalancer.json` configs.

OpenBalancer is 100% open-source under the MIT license. We'd love feedback from the HN community on routing strategies, HTTP/3 roadmap, and benchmarks!
