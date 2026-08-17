# 🏗️ OpenBalancer Architecture & Event Loop Deep Dive

**Engineered & Maintained by:** INCONTROL PLUS ЕООД (https://www.openbalancer.com)  
**License:** MIT

---

## 1. Executive Design Philosophy

OpenBalancer is built from the ground up to solve the specific bottlenecks of modern high-throughput API gateways and AI inference pipelines:

1. **Zero Runtime Dependencies in the Hot Path:** The core engine runs on standard Python 3.10+ asynchronous sockets (`asyncio`) and non-blocking I/O event loops.
2. **Bufferless SSE / WebSockets Token Passthrough:** Traditional reverse proxies buffer response bodies before forwarding them to downstream clients. OpenBalancer implements chunk-level streaming with zero buffering for `text/event-stream` and `application/grpc`, guaranteeing O(1) constant memory usage regardless of prompt length or generation size.
3. **Sub-Millisecond Routing Overhead:** Average internal routing latency is p99 < 0.8ms, consuming <18MB RSS in production workloads.

---

## 2. Ingress & Egress Socket Pipeline

```
  [ Client Ingress ]
          │  TCP Connection (HTTP/1.1, HTTP/2, SSE, WebSockets)
          ▼
┌─────────────────────────────────────────────────────────────┐
│                 OpenBalancer Async Core                     │
│                                                             │
│  1. Ingress Parser ──► 2. Algorithm Selector (WRR / P2C)   │
│                                 │                           │
│  4. Telemetry Metric Stream ◄── 3. Health & Circuit Breaker │
└─────────────────────────────────────────────────────────────┘
          │  Non-blocking Async Pipe (Zero Buffer)
          ▼
  [ Upstream AI Model / API Cluster (vLLM, Ollama, Microservices) ]
```

---

## 3. Asynchronous Non-Blocking Event Loop

OpenBalancer utilizes `asyncio.start_server` to bind to incoming client sockets:
* Each connection creates an asynchronous bidirectional pipe between `client_reader`/`client_writer` and `upstream_reader`/`upstream_writer`.
* Chunks are transferred asynchronously via `reader.read(65536)` and `writer.write(chunk)` with `await writer.drain()`, preventing buffer bloat on slow client connections.
* TCP keep-alive and graceful socket closing prevent connection leaks.
