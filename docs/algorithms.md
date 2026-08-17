# 📐 Routing Algorithms & Load Balancing Strategies

OpenBalancer supports 4 production routing algorithms optimized for diverse cluster topologies:

---

## 1. Weighted Round-Robin (WRR)
* **Default:** `"algorithm": "round_robin"` / `"algorithm": "weighted_round_robin"`
* **Mechanism:** Cycles through the list of healthy backends proportionally according to their configured `weight` integer ($w_i \in [1, 10]$).
* **Best For:** Heterogeneous clusters where backend nodes have varying GPU or CPU compute capacity (e.g., node 1 has 2x RTX 4090 GPUs with `weight: 2`, while node 2 has 1x GPU with `weight: 1`).

---

## 2. Smooth Least Connections (LC)
* **Algorithm:** `"algorithm": "least_connections"`
* **Mechanism:** Routes each incoming request to the upstream backend with the lowest currently active concurrent connections ($C_i / w_i$).
* **Best For:** Long-lived AI model inference streams where request durations vary widely from 50ms to 30s.

---

## 3. Consistent IP-Hash Ring
* **Algorithm:** `"algorithm": "ip_hash"`
* **Mechanism:** Computes hash of the client IP address modulo the number of healthy nodes:
  $$\text{Target Node} = \text{hash}(\text{Client IP}) \pmod N$$
* **Best For:** State-dependent microservices, session caching, and user affinity without central Redis overhead.

---

## 4. Power-of-Two Random Choices (P2C)
* **Algorithm:** `"algorithm": "power_of_two"`
* **Mechanism:** Randomly picks two healthy candidate nodes and dispatches the request to the one with the lower observed latency or active connections.
* **Best For:** Very large clusters (10+ backends) to avoid synchronized stampeding.
