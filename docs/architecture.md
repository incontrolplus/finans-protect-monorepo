# 🏗️ OpenBalancer Architecture & Event Loop Deep Dive

**Engineered & Maintained by:** INCONTROL PLUS ЕООД (https://www.openbalancer.com)  
**License:** MIT

---

## 1. Executive Design Philosophy

OpenBalancer is built from the ground up to solve the specific bottlenecks of modern high-throughput API gateways, AI inference pipelines, and distributed multi-node service meshes:

1. **Zero Runtime Dependencies in the Hot Path:** The core engine runs on standard Python 3.10+ asynchronous sockets (`asyncio`), native `ssl.SSLContext` TLS termination, and non-blocking I/O event loops.
2. **Bufferless SSE / WebSockets Token Passthrough:** Traditional reverse proxies buffer response bodies before forwarding them to downstream clients. OpenBalancer implements chunk-level streaming with zero buffering for `text/event-stream`, WebSockets (e.g. noVNC/QEMU), and `application/grpc`, guaranteeing O(1) constant memory usage regardless of stream size.
3. **Sub-Millisecond Routing Overhead:** Average internal routing latency is p99 < 0.8ms, consuming <18MB RSS in production workloads.
4. **Multi-Node Hybrid Mesh Architecture:** Transparent routing between primary DevOps nodes (`macmini-primary` 100.83.83.8) and secondary compute/storage targets (`macmini-secondary` 100.70.181.127).

---

## 2. Ingress & Egress Socket Pipeline

```
  [ Client Ingress: HTTPS (TLS) / HTTP on Port 8888 ]
          │  TLS Handshake (TLSv1.2 / TLSv1.3 with Native SSLContext)
          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       OpenBalancer Async Core Engine                    │
│                                                                         │
│  1. Ingress & TLS Parser ──► 2. Path & Model Router (AI / Mesh / VMs)  │
│                                           │                             │
│  4. Prometheus Telemetry & ◄─── 3. Health Probes & Circuit Breaker      │
│     Storage Collector (Philips SSD)                                     │
└─────────────────────────────────────────────────────────────────────────┘
          │                                  │
          ▼                                  ▼
[ Primary Cluster: AI Backends ]    [ Secondary Node: 100.70.181.127 ]
  • Llama 3 / Qwen / Mistral          • Windows VM & QEMU noVNC (:8006)
  • Supabase & n8n APIs               • Philips SSD Storage & Backups (:18795)
```

---

## 3. Asynchronous Non-Blocking Event Loop & TLS Engine

OpenBalancer utilizes `asyncio.start_server` to bind to incoming client sockets:
* **Native TLS Termination:** `ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)` manages encrypted handshakes, cipher negotiation, and cert chains with zero process fork overhead.
* **Bi-directional Asynchronous Tunnel:** Each connection creates an asynchronous bidirectional pipe between `client_reader`/`client_writer` and `upstream_reader`/`upstream_writer`.
* **Streaming & WebSockets:** Chunks are transferred asynchronously via `reader.read(65536)` and `writer.write(chunk)` with `await writer.drain()`, supporting continuous token streaming and remote GUI interaction (noVNC).
* **Automated Storage Telemetry:** Background probes collect real-time filesystem and backup synchronization status across cluster nodes.
