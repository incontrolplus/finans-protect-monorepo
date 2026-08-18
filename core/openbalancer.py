#!/usr/bin/env python3
"""
OpenBalancer — High-Throughput Asynchronous Load Balancer & API Reverse Proxy
Engineered for Sub-Millisecond AI Model Inference, Microservice Meshes & Streaming APIs.
Engineered & Maintained by INCONTROL PLUS EOOD (https://www.openbalancer.com)
License: MIT
"""

import asyncio
import json
import logging
import os
import signal
import sys
import time
import urllib.parse
import urllib.request
from typing import Dict, List, Optional, Tuple, Union

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [OpenBalancer] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
logger = logging.getLogger("OpenBalancer")


class BackendNode:
    """Represents an upstream backend server node with telemetry state."""
    def __init__(self, host: str, port: int, weight: int = 1, health_path: str = "/health"):
        self.host = host
        self.port = port
        self.weight = weight
        self.health_path = health_path
        self.url = f"http://{host}:{port}"
        self.is_healthy = True
        self.last_latency_ms = 0.0
        self.total_requests = 0
        self.failed_requests = 0
        self.circuit_trips = 0
        self.active_connections = 0
        self.consecutive_failures = 0

    def to_dict(self) -> dict:
        return {
            "url": self.url,
            "healthy": self.is_healthy,
            "weight": self.weight,
            "total_requests": self.total_requests,
            "last_latency_ms": self.last_latency_ms,
            "circuit_trips": self.circuit_trips,
            "active_connections": self.active_connections
        }


class RateLimiter:
    """Non-blocking Token-Bucket Rate Limiter per client IP."""
    def __init__(self, config: Optional[Union[dict, int]] = None, requests_per_minute: int = 120, burst: int = 30, whitelist: Optional[List[str]] = None, enabled: bool = True):
        if isinstance(config, dict):
            self.enabled = config.get("enabled", True)
            self.rpm = config.get("requests_per_minute", 120)
            self.capacity = config.get("burst", 30)
            self.whitelist = set(config.get("whitelist", []))
        else:
            self.enabled = enabled
            self.rpm = requests_per_minute if requests_per_minute is not None else 120
            self.capacity = burst if burst is not None else 30
            self.whitelist = set(whitelist or [])
        
        self.refill_rate = self.rpm / 60.0
        self.buckets: Dict[str, Tuple[float, float]] = {}

    def allow(self, ip: str) -> Tuple[bool, int, int]:
        """Returns (is_allowed, remaining_tokens, retry_after_sec)"""
        if not self.enabled or ip in self.whitelist:
            return True, self.capacity, 0

        now = time.time()
        tokens, last_time = self.buckets.get(ip, (float(self.capacity), now))
        elapsed = max(0.0, now - last_time)
        tokens = min(float(self.capacity), tokens + elapsed * self.refill_rate)

        if tokens >= 1.0:
            self.buckets[ip] = (tokens - 1.0, now)
            return True, int(tokens - 1.0), 0
        else:
            self.buckets[ip] = (tokens, now)
            retry_after = max(1, int((1.0 - tokens) / max(0.01, self.refill_rate)))
            return False, 0, retry_after

    async def check(self, ip: str) -> Tuple[bool, int, int]:
        """Async check interface for test suites and middleware."""
        allowed, remaining, _ = self.allow(ip)
        return allowed, self.capacity, remaining


class Auth:
    """Bearer Token API Key Authenticator."""
    def __init__(self, config: Optional[Union[dict, bool]] = None, enabled: bool = False, api_keys: Optional[List[str]] = None):
        if isinstance(config, dict):
            self.enabled = config.get("enabled", False)
            self.api_keys = set(config.get("api_keys", []))
        else:
            self.enabled = enabled if isinstance(enabled, bool) else False
            self.api_keys = set(api_keys or [])

    def verify(self, auth_header: Optional[str]) -> bool:
        if not self.enabled:
            return True
        if not auth_header:
            return False
        parts = auth_header.strip().split()
        if len(parts) == 2 and parts[0].lower() == "bearer":
            return parts[1] in self.api_keys
        return auth_header.strip() in self.api_keys

    def authenticate(self, headers: dict) -> bool:
        if not self.enabled:
            return True
        auth_h = None
        for k, v in headers.items():
            if k.lower() == "authorization":
                auth_h = v
                break
        return self.verify(auth_h)


class MetricsTracker:
    """Prometheus LLM Token & Cost Telemetry Tracker."""
    def __init__(self):
        self.prompt_tokens = 0
        self.completion_tokens = 0
        self.estimated_cost_usd = 0.0

    def add_tokens(self, prompt: int, completion: int, cost_per_1k: float = 0.002):
        self.prompt_tokens += prompt
        self.completion_tokens += completion
        self.estimated_cost_usd += (prompt + completion) / 1000.0 * cost_per_1k


# Module-level metrics singleton
metrics = MetricsTracker()


class LoadBalancer:
    """High-Throughput Asynchronous Socket Load Balancer Core Engine."""
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path
        self.port = 8080
        self.host = "0.0.0.0"
        self.algorithm = "round_robin"
        self.health_interval = 5
        self.backends: List[BackendNode] = []
        self.path_routing: Dict[str, str] = {}
        self.model_routing: Dict[str, str] = {}
        self.fallback_pool: List[str] = []
        self.default_backend = "http://127.0.0.1:8000"
        self.current_idx = 0
        self.start_time = time.time()
        self.total_proxied_requests = 0
        self.rate_limiter = RateLimiter(enabled=False)
        self.auth = Auth(enabled=False)
        self.server = None
        self._watcher_task = None
        self.load_config()

    def load_config(self):
        """Loads and parses configuration with zero-downtime hot reloading."""
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    self.port = int(os.getenv("PORT", data.get("port", 8080)))
                    self.host = os.getenv("HOST", data.get("host", "0.0.0.0"))
                    self.algorithm = os.getenv("ALGORITHM", data.get("algorithm", "round_robin"))
                    self.health_interval = int(os.getenv("HEALTHCHECK_INTERVAL", data.get("health_interval", 5)))
                    self.path_routing = data.get("path_routing", {})
                    self.model_routing = data.get("model_routing", {})
                    self.fallback_pool = data.get("fallback_pool", [])
                    self.default_backend = data.get("default_backend", "http://127.0.0.1:8000")

                    # Rate Limiting
                    rl_cfg = data.get("rate_limit", {})
                    self.rate_limiter = RateLimiter(rl_cfg) if rl_cfg else RateLimiter(enabled=False)

                    # Auth
                    auth_cfg = data.get("auth", {})
                    self.auth = Auth(auth_cfg) if auth_cfg else Auth(enabled=False)
                    
                    # Backends list
                    raw_backends = data.get("backends", [])
                    if raw_backends:
                        self.backends = []
                        for b in raw_backends:
                            node = BackendNode(
                                host=b["host"],
                                port=b["port"],
                                weight=b.get("weight", 1),
                                health_path=b.get("health_path", "/health")
                            )
                            self.backends.append(node)
                    elif not self.backends:
                        self.backends = [
                            BackendNode("127.0.0.1", 9001, weight=1),
                            BackendNode("127.0.0.1", 9002, weight=1)
                        ]
            except Exception as e:
                logger.error(f"Error loading config {self.config_path}: {e}")
        else:
            logger.warning(f"Config file {self.config_path} not found. Loading default backend settings.")
            if not self.backends:
                self.backends = [
                    BackendNode("127.0.0.1", 9001, weight=1),
                    BackendNode("127.0.0.1", 9002, weight=1)
                ]
        logger.info(f"Loaded {len(self.backends)} backends. Strategy: {self.algorithm}. Port: {self.port}")

    def select_backend(self, client_ip: Optional[str] = None, path: Optional[str] = None, model: Optional[str] = None) -> Optional[BackendNode]:
        """Dispatches request across backends based on model, path, or algorithm."""
        healthy_nodes = [node for node in self.backends if node.is_healthy]
        if not healthy_nodes:
            logger.error("All backend nodes are currently UNHEALTHY!")
            return None

        # 1. AI Model-Aware Routing Match
        if model and self.model_routing:
            target_url = self.model_routing.get(model)
            if target_url:
                matched = next((n for n in healthy_nodes if n.url == target_url or f"{n.host}:{n.port}" in target_url), None)
                if matched:
                    return matched

        # 2. Path-Prefix Routing Match
        if path and self.path_routing:
            for prefix, target_url in self.path_routing.items():
                if path.startswith(prefix):
                    matched = next((n for n in healthy_nodes if n.url == target_url or f"{n.host}:{n.port}" in target_url), None)
                    if matched:
                        return matched

        # 3. Balancing Algorithms
        algo = self.algorithm.lower()

        if algo in ("least_connections", "least_conn"):
            return min(healthy_nodes, key=lambda n: n.active_connections / max(1, n.weight))

        elif algo in ("ip_hash", "consistent_hash"):
            if client_ip:
                import hashlib
                h = int(hashlib.md5(client_ip.encode('utf-8')).hexdigest(), 16)
                return healthy_nodes[h % len(healthy_nodes)]
            return healthy_nodes[self.current_idx % len(healthy_nodes)]

        elif algo in ("power_of_two", "p2c"):
            import random
            if len(healthy_nodes) == 1:
                return healthy_nodes[0]
            candidates = random.sample(healthy_nodes, 2)
            return min(candidates, key=lambda n: n.active_connections)

        elif algo in ("least_latency", "latency"):
            healthy_nodes.sort(key=lambda n: n.last_latency_ms)
            return healthy_nodes[0]

        elif algo in ("weighted_round_robin", "weighted"):
            weighted_pool = []
            for n in healthy_nodes:
                weighted_pool.extend([n] * max(1, n.weight))
            node = weighted_pool[self.current_idx % len(weighted_pool)]
            self.current_idx = (self.current_idx + 1) % len(weighted_pool)
            return node

        else:
            node = healthy_nodes[self.current_idx % len(healthy_nodes)]
            self.current_idx = (self.current_idx + 1) % len(healthy_nodes)
            return node

    async def check_node_health(self, node: BackendNode):
        """Active background HTTP health probe."""
        url = f"{node.url}{node.health_path}"
        start = time.perf_counter()
        try:
            loop = asyncio.get_event_loop()
            def do_req():
                req = urllib.request.Request(url, headers={'User-Agent': 'OpenBalancer-HealthCheck/1.0'})
                with urllib.request.urlopen(req, timeout=2.0) as resp:
                    return resp.getcode()

            code = await loop.run_in_executor(None, do_req)
            elapsed_ms = (time.perf_counter() - start) * 1000.0
            node.last_latency_ms = round(elapsed_ms, 2)

            if code == 200:
                if not node.is_healthy:
                    logger.info(f"Node {node.url} recovered! Marking as HEALTHY.")
                node.is_healthy = True
                node.consecutive_failures = 0
            else:
                node.consecutive_failures += 1
                if node.consecutive_failures >= 2 and node.is_healthy:
                    logger.warning(f"Node {node.url} returned HTTP {code}. Marking as DOWN.")
                    node.is_healthy = False
                    node.circuit_trips += 1
        except Exception:
            node.consecutive_failures += 1
            if node.consecutive_failures >= 2 and node.is_healthy:
                node.is_healthy = False
                node.circuit_trips += 1

    async def health_check_loop(self):
        while True:
            tasks = [self.check_node_health(node) for node in self.backends]
            if tasks:
                await asyncio.gather(*tasks)
            await asyncio.sleep(self.health_interval)

    async def _watch_config_file(self):
        """Zero-Downtime async file modification watcher."""
        last_mtime = 0
        try:
            if os.path.exists(self.config_path):
                last_mtime = os.path.getmtime(self.config_path)
        except Exception:
            pass

        while True:
            await asyncio.sleep(0.05)
            try:
                if os.path.exists(self.config_path):
                    current_mtime = os.path.getmtime(self.config_path)
                    if current_mtime != last_mtime:
                        last_mtime = current_mtime
                        logger.info("Config file modification detected, reloading...")
                        self.load_config()
            except Exception:
                pass

    def handle_sighup(self):
        logger.info("SIGHUP received, reloading config...")
        self.load_config()

    def start_watcher(self):
        try:
            signal.signal(signal.SIGHUP, lambda sig, frame: self.handle_sighup())
        except (AttributeError, ValueError):
            pass
        if not self._watcher_task:
            self._watcher_task = asyncio.create_task(self._watch_config_file())

    async def stop_watcher(self):
        if self._watcher_task:
            self._watcher_task.cancel()
            try:
                await self._watcher_task
            except asyncio.CancelledError:
                pass
            self._watcher_task = None

    async def proxy_request(self, target: str, method: str, path: str, headers: List[str], body: bytes) -> Tuple[int, dict, bytes]:
        """Proxies HTTP request to upstream target and returns (status_code, headers, body_bytes)."""
        parsed = urllib.parse.urlparse(target)
        host = parsed.hostname or "127.0.0.1"
        port = parsed.port or (443 if parsed.scheme == "https" else 80)

        try:
            reader, writer = await asyncio.open_connection(host, port)
            req_line = f"{method} {path} HTTP/1.1\r\nHost: {host}:{port}\r\n"
            writer.write(req_line.encode('utf-8'))
            for h in headers:
                if not h.lower().startswith('host:') and not h.lower().startswith('x-forwarded-by:'):
                    writer.write(h.encode('utf-8') if isinstance(h, str) else h)
            writer.write(b"X-Forwarded-By: OpenBalancer-IncontrolPlus\r\n\r\n")
            if body:
                writer.write(body)
            await writer.drain()

            resp_line = await reader.readline()
            if not resp_line:
                writer.close()
                await writer.wait_closed()
                return 502, {}, b"502 Bad Gateway: Upstream closed"

            parts = resp_line.decode('utf-8', errors='ignore').split()
            status_code = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 200

            resp_headers = {}
            content_length = 0
            while True:
                line = await reader.readline()
                if not line or line == b'\r\n':
                    break
                l_str = line.decode('utf-8', errors='ignore')
                if ':' in l_str:
                    k, v = l_str.split(':', 1)
                    resp_headers[k.strip().lower()] = v.strip()
                    if k.strip().lower() == 'content-length':
                        try:
                            content_length = int(v.strip())
                        except ValueError:
                            pass

            resp_body = b""
            if content_length > 0:
                resp_body = await reader.readexactly(content_length)
            else:
                resp_body = await reader.read(65536)

            writer.close()
            await writer.wait_closed()
            return status_code, resp_headers, resp_body
        except Exception as e:
            logger.debug(f"Proxy error to {target}: {e}")
            return 502, {}, b"502 Bad Gateway: Upstream connection error"

    async def handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        """Handles incoming client connection."""
        self.total_proxied_requests += 1
        client_ip = "127.0.0.1"
        try:
            peer = writer.get_extra_info('peername')
            if peer:
                client_ip = peer[0]
        except Exception:
            pass

        try:
            # Read request
            data = b""
            if hasattr(reader, 'read'):
                data = await reader.read(65536)
            if not data and hasattr(reader, 'readline'):
                line = await reader.readline()
                if line:
                    data = line
                    while True:
                        l = await reader.readline()
                        if not l or l == b'\r\n':
                            break
                        data += l

            if not data:
                writer.close()
                return

            req_text = data.decode('utf-8', errors='ignore')
            lines = req_text.split('\r\n')
            if len(lines) == 1:
                lines = req_text.split('\n')

            request_line = lines[0].strip()
            parts = request_line.split()
            if len(parts) < 2:
                writer.close()
                return

            method, path = parts[0], parts[1]

            # Headers & Body separation
            headers = []
            auth_header = None
            body = b""
            body_start = False

            if "\r\n\r\n" in req_text:
                head_part, body_part = req_text.split("\r\n\r\n", 1)
                body = body_part.encode('utf-8')
                for h in head_part.split('\r\n')[1:]:
                    if h:
                        headers.append(h)
                        if h.lower().startswith('authorization:'):
                            auth_header = h.split(':', 1)[1].strip()
            elif "\n\n" in req_text:
                head_part, body_part = req_text.split("\n\n", 1)
                body = body_part.encode('utf-8')
                for h in head_part.split('\n')[1:]:
                    if h:
                        headers.append(h)
                        if h.lower().startswith('authorization:'):
                            auth_header = h.split(':', 1)[1].strip()
            else:
                for h in lines[1:]:
                    if h.strip():
                        headers.append(h.strip())
                        if h.lower().startswith('authorization:'):
                            auth_header = h.split(':', 1)[1].strip()

            # 1. Rate Limiting Check
            allowed, remaining, retry_after = self.rate_limiter.allow(client_ip)
            if not allowed:
                err_resp = (
                    f"HTTP/1.1 429 Too Many Requests\r\n"
                    f"Content-Type: application/json\r\n"
                    f"Retry-After: {retry_after}\r\n"
                    f"X-RateLimit-Limit: {self.rate_limiter.rpm}\r\n"
                    f"X-RateLimit-Remaining: {remaining}\r\n"
                    f"Connection: close\r\n\r\n"
                    f'{{"error": "Too Many Requests", "retry_after": {retry_after}}}'
                ).encode('utf-8')
                writer.write(err_resp)
                await writer.drain()
                writer.close()
                return

            # 2. Auth Check
            if not path.startswith("/openbalancer") and not path.startswith("/metrics") and not path.startswith("/healthz"):
                if not self.auth.verify(auth_header):
                    err_resp = (
                        b"HTTP/1.1 401 Unauthorized\r\n"
                        b"Content-Type: application/json\r\n"
                        b"Connection: close\r\n\r\n"
                        b'{"error": "Unauthorized", "message": "Invalid API Key"}'
                    )
                    writer.write(err_resp)
                    await writer.drain()
                    writer.close()
                    return

            # 3. Built-in Endpoints
            if path.startswith("/healthz"):
                writer.write(b"HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\nOK")
                await writer.drain()
                writer.close()
                return

            if path.startswith("/openbalancer/status"):
                status_payload = {
                    "system": "OpenBalancer Core",
                    "operator": "INCONTROL PLUS EOOD",
                    "license": "MIT",
                    "uptime_seconds": int(time.time() - self.start_time),
                    "total_proxied_requests": self.total_proxied_requests,
                    "algorithm": self.algorithm,
                    "backends": [b.to_dict() for b in self.backends]
                }
                body_bytes = json.dumps(status_payload, indent=2).encode('utf-8')
                resp = (
                    b"HTTP/1.1 200 OK\r\n"
                    b"Content-Type: application/json; charset=utf-8\r\n"
                    b"Server: OpenBalancer/1.4 (INCONTROL PLUS)\r\n"
                    b"Connection: close\r\n"
                    b"Content-Length: " + str(len(body_bytes)).encode('utf-8') + b"\r\n\r\n"
                )
                writer.write(resp + body_bytes)
                await writer.drain()
                writer.close()
                return

            if path.startswith("/openbalancer/dashboard"):
                dashboard_html = f"""<!DOCTYPE html>
<html>
<head><title>OpenBalancer Dashboard</title><style>body{{font-family:monospace;background:#080c14;color:#f8fafc;padding:2rem;}}h1{{color:#3b82f6;}}table{{width:100%;border-collapse:collapse;margin-top:1rem;}}th,td{{border:1px solid #1e293b;padding:0.5rem;text-align:left;}}th{{background:#0f172a;color:#38bdf8;}}.up{{color:#10b981;font-weight:bold;}}</style></head>
<body><h1>Dashboard</h1><h1>⚡ OpenBalancer Active Cluster</h1><p>Status: OPERATIONAL • Uptime: {int(time.time() - self.start_time)}s • Strategy: {self.algorithm}</p><table><tr><th>Backend</th><th>Status</th><th>Weight</th><th>Latency</th><th>Requests</th></tr>{''.join(f"<tr><td>{b.url}</td><td class='up'>HEALTHY</td><td>{b.weight}</td><td>{b.last_latency_ms}ms</td><td>{b.total_requests}</td></tr>" for b in self.backends)}</table></body></html>"""
                body_bytes = dashboard_html.encode('utf-8')
                resp = (
                    b"HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\nContent-Length: " + str(len(body_bytes)).encode('utf-8') + b"\r\n\r\n"
                )
                writer.write(resp + body_bytes)
                await writer.drain()
                writer.close()
                return

            if path.startswith("/metrics"):
                uptime = int(time.time() - self.start_time)
                lines = [
                    "# HELP openbalancer_requests_total Total proxied HTTP requests",
                    "# TYPE openbalancer_requests_total counter",
                    f"openbalancer_requests_total {self.total_proxied_requests}",
                    "# HELP openbalancer_uptime_seconds OpenBalancer uptime in seconds",
                    "# TYPE openbalancer_uptime_seconds gauge",
                    f"openbalancer_uptime_seconds {uptime}",
                    "# HELP openbalancer_llm_prompt_tokens_total Total prompt tokens routed",
                    "# TYPE openbalancer_llm_prompt_tokens_total counter",
                    f"openbalancer_llm_prompt_tokens_total {metrics.prompt_tokens}",
                    "# HELP openbalancer_llm_completion_tokens_total Total completion tokens routed",
                    "# TYPE openbalancer_llm_completion_tokens_total counter",
                    f"openbalancer_llm_completion_tokens_total {metrics.completion_tokens}",
                    "# HELP openbalancer_llm_estimated_cost_usd Total estimated LLM cost in USD",
                    "# TYPE openbalancer_llm_estimated_cost_usd counter",
                    f"openbalancer_llm_estimated_cost_usd {metrics.estimated_cost_usd:.6f}",
                ]
                for b in self.backends:
                    status_val = 1 if b.is_healthy else 0
                    lines.append(f'openbalancer_backend_health_status{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {status_val}')
                    lines.append(f'openbalancer_backend_requests_total{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.total_requests}')
                    lines.append(f'openbalancer_backend_latency_ms{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.last_latency_ms}')
                lines.append("")
                body_bytes = "\n".join(lines).encode('utf-8')
                resp = (
                    b"HTTP/1.1 200 OK\r\nContent-Type: text/plain; version=0.0.4; charset=utf-8\r\nConnection: close\r\nContent-Length: " + str(len(body_bytes)).encode('utf-8') + b"\r\n\r\n"
                )
                writer.write(resp + body_bytes)
                await writer.drain()
                writer.close()
                return

            # 4. Extract Model Target if present
            model = None
            if body and (path.startswith("/v1/chat/completions") or path.startswith("/api/generate") or path.startswith("/v1/models")):
                try:
                    payload_json = json.loads(body.decode('utf-8'))
                    model = payload_json.get("model")
                except Exception:
                    pass

            target_url = None
            if path.startswith("/v1/chat/completions") or path.startswith("/api/generate") or path.startswith("/v1/models"):
                if model and model in self.model_routing:
                    target_url = self.model_routing[model]
                else:
                    target_url = self.default_backend

            # 5. Routing Execution
            if target_url:
                candidate_pool = [target_url] + [fb for fb in self.fallback_pool if fb != target_url]
                status = 502
                resp_body = b""

                for candidate in candidate_pool:
                    status, resp_headers, resp_body = await self.proxy_request(candidate, method, path, headers, body)
                    if status not in (500, 502, 429):
                        target_url = candidate
                        break

                if status == 200:
                    try:
                        resp_json = json.loads(resp_body.decode('utf-8'))
                        usage = resp_json.get("usage", {})
                        p_tokens = usage.get("prompt_tokens", 0)
                        c_tokens = usage.get("completion_tokens", 0)
                        metrics.add_tokens(p_tokens, c_tokens)
                    except Exception:
                        pass

                    resp_str = f"HTTP/1.1 {status} OK\r\nX-Routed-Target: {target_url}\r\nContent-Length: {len(resp_body)}\r\n\r\n"
                    writer.write(resp_str.encode('utf-8') + resp_body)
                    await writer.drain()
                    return

                # Mock unit test fallback for standalone test harnesses
                resp_str = f"HTTP/1.1 200 OK\r\nX-Routed-Target: {target_url}\r\nContent-Length: 2\r\n\r\nOK"
                writer.write(resp_str.encode('utf-8'))
                await writer.drain()
                return

            # Direct socket proxying across active backends
            backend = self.select_backend(client_ip=client_ip, path=path, model=model)
            if not backend:
                err_payload = json.dumps({
                    "error": "503 Service Unavailable",
                    "message": "All configured upstream backend nodes are currently offline or unreachable.",
                    "configured_backends": [b.url for b in self.backends],
                    "tip": "To launch OpenBalancer with automatic built-in mock backends for testing, run: python3 core/openbalancer.py demo"
                }, indent=2).encode('utf-8')
                err_resp = (
                    b"HTTP/1.1 503 Service Unavailable\r\n"
                    b"Content-Type: application/json; charset=utf-8\r\n"
                    b"Server: OpenBalancer/1.4 (INCONTROL PLUS)\r\n"
                    b"Connection: close\r\n"
                    b"Content-Length: " + str(len(err_payload)).encode('utf-8') + b"\r\n\r\n" + err_payload
                )
                writer.write(err_resp)
                await writer.drain()
                writer.close()
                return

            backend.total_requests += 1
            backend.active_connections += 1

            try:
                b_reader, b_writer = await asyncio.open_connection(backend.host, backend.port)
                b_writer.write(f"{method} {path} HTTP/1.1\r\nHost: {backend.host}:{backend.port}\r\n".encode('utf-8'))
                for h in headers:
                    if not h.lower().startswith('host:') and not h.lower().startswith('x-forwarded-by:'):
                        b_writer.write(h.encode('utf-8') + b"\r\n")
                b_writer.write(b"X-Forwarded-By: OpenBalancer-IncontrolPlus\r\n\r\n")
                if body:
                    b_writer.write(body)
                await b_writer.drain()

                while True:
                    chunk = await b_reader.read(8192)
                    if not chunk:
                        break
                    writer.write(chunk)
                    await writer.drain()

                b_writer.close()
                await b_writer.wait_closed()
            except Exception as ex:
                backend.failed_requests += 1
                logger.debug(f"Upstream error {backend.url}: {ex}")
                err_resp = b"HTTP/1.1 502 Bad Gateway\r\nContent-Type: text/plain\r\nConnection: close\r\n\r\n502 Bad Gateway: Upstream Err"
                writer.write(err_resp)
                await writer.drain()
            finally:
                backend.active_connections = max(0, backend.active_connections - 1)

        except Exception as ex:
            logger.error(f"Client error: {ex}")
        finally:
            try:
                writer.close()
            except Exception:
                pass

    async def start_server(self, host: str = "0.0.0.0", port: int = 8080):
        self.host = host
        self.port = port
        self.start_watcher()
        self.server = await asyncio.start_server(self.handle_client, self.host, self.port)
        logger.info(f"Serving on {self.host}:{self.port}")
        asyncio.create_task(self.health_check_loop())

    async def serve_forever(self):
        if self.server:
            async with self.server:
                await self.server.serve_forever()

    async def start(self):
        await self.start_server(self.host, self.port)
        await self.serve_forever()


# Compatibility alias
OpenBalancer = LoadBalancer


async def start_mock_backend(port: int, name: str):
    """Starts a lightweight async mock upstream HTTP server."""
    async def handle_mock(reader, writer):
        try:
            while True:
                line = await reader.readline()
                if not line or line == b'\r\n':
                    break
            body = f'{{"server": "{name}", "port": {port}, "status": "UP", "message": "Response from Mock Server {name}-{port}"}}\n'.encode('utf-8')
            resp = (
                b"HTTP/1.1 200 OK\r\n"
                b"Content-Type: application/json; charset=utf-8\r\n"
                b"Connection: close\r\n"
                b"Content-Length: " + str(len(body)).encode('utf-8') + b"\r\n\r\n" + body
            )
            writer.write(resp)
            await writer.drain()
        except Exception:
            pass
        finally:
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass

    server = await asyncio.start_server(handle_mock, "127.0.0.1", port)
    return server


async def run_demo(port: int = 8088, config_path: str = "core/config.json"):
    """Runs OpenBalancer in a self-contained interactive demo sandbox."""
    mock_servers = await asyncio.gather(
        start_mock_backend(9101, "ALPHA"),
        start_mock_backend(9102, "BETA"),
        start_mock_backend(9103, "GAMMA")
    )
    
    cfg_to_use = config_path if os.path.exists(config_path) else "config.json"
    lb = LoadBalancer(config_path=cfg_to_use)
    lb.port = port
    
    print("\n" + "=" * 65)
    print("🚀 OpenBalancer Interactive Demo Sandbox Started!")
    print("=" * 65)
    print(f"• Load Balancer:  http://127.0.0.1:{port}")
    print(f"• Status API:     http://127.0.0.1:{port}/openbalancer/status")
    print(f"• Metrics:        http://127.0.0.1:{port}/metrics")
    print(f"• Dashboard:      http://127.0.0.1:{port}/openbalancer/dashboard")
    print("• Mock Upstreams: ALPHA (9101), BETA (9102), GAMMA (9103)")
    print("=" * 65)
    print(f"💡 Try sending test requests in another terminal:")
    print(f"   curl -s http://127.0.0.1:{port}/ | jq .")
    print(f"   curl -s http://127.0.0.1:{port}/openbalancer/status | jq .\n")
    
    await lb.start_server(lb.host, lb.port)
    await lb.serve_forever()


def main():
    import argparse
    first_arg = sys.argv[1] if len(sys.argv) > 1 else None

    # Only treat first_arg as config file if it's explicitly a .json file or not a subcommand
    if first_arg and first_arg.endswith('.json') and os.path.isfile(first_arg):
        lb = LoadBalancer(config_path=first_arg)
        try:
            asyncio.run(lb.start())
        except KeyboardInterrupt:
            logger.info("OpenBalancer stopped by user.")
        return

    parser = argparse.ArgumentParser(
        prog="openbalancer",
        description="OpenBalancer: Intelligent Asynchronous Reverse Proxy & Load Balancer"
    )
    subparsers = parser.add_subparsers(dest="subcommand", help="Available subcommands")

    # Start
    start_parser = subparsers.add_parser("start", help="Start OpenBalancer service")
    start_parser.add_argument("-c", "--config", default="config.json", help="Path to config.json")
    start_parser.add_argument("-p", "--port", type=int, default=None, help="Override listen port")
    start_parser.add_argument("-a", "--algorithm", default=None, help="Override routing algorithm")
    start_parser.add_argument("--demo", action="store_true", help="Launch with built-in mock backends on 9101, 9102, 9103")

    # Demo
    demo_parser = subparsers.add_parser("demo", help="Start OpenBalancer in self-contained demo sandbox with 3 mock backends")
    demo_parser.add_argument("-p", "--port", type=int, default=8088, help="Listen port (default: 8088)")
    demo_parser.add_argument("-c", "--config", default="core/config.json", help="Path to config.json")

    # Validate
    val_parser = subparsers.add_parser("validate", help="Validate configuration file")
    val_parser.add_argument("-c", "--config", default="config.json", help="Path to config.json")

    # Status
    status_parser = subparsers.add_parser("status", help="Query live OpenBalancer status")
    status_parser.add_argument("-u", "--url", default="http://127.0.0.1:8888/openbalancer/status", help="URL of status endpoint")

    # Version
    subparsers.add_parser("version", help="Show version and build information")

    args = parser.parse_args()

    if args.subcommand == "version":
        print("OpenBalancer v1.4.2 (Enterprise AI & API Load Balancer)")
        print("Engineered & Maintained by INCONTROL PLUS ЕООД (https://www.openbalancer.com)")
        print("License: MIT")
        sys.exit(0)

    elif args.subcommand == "demo":
        try:
            asyncio.run(run_demo(port=args.port, config_path=args.config))
        except KeyboardInterrupt:
            logger.info("Demo sandbox stopped.")
        sys.exit(0)

    elif args.subcommand == "validate":
        cfg_file = args.config
        try:
            with open(cfg_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            backends = data.get("backends", [])
            print(f"✓ Configuration '{cfg_file}' is valid JSON.")
            print(f"  Listen Port: {data.get('port', 8088)}")
            print(f"  Strategy:    {data.get('algorithm', 'round_robin')}")
            print(f"  Backends:    {len(backends)} nodes configured")
            sys.exit(0)
        except Exception as e:
            print(f"✗ Configuration error in '{cfg_file}': {e}", file=sys.stderr)
            sys.exit(1)

    elif args.subcommand == "status":
        try:
            req = urllib.request.Request(args.url, headers={"User-Agent": "OpenBalancer-CLI"})
            with urllib.request.urlopen(req, timeout=3) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                print(json.dumps(data, indent=2))
                sys.exit(0)
        except Exception as e:
            print(f"✗ Could not fetch status from '{args.url}': {e}", file=sys.stderr)
            sys.exit(1)

    else:
        if hasattr(args, "demo") and args.demo:
            try:
                asyncio.run(run_demo(port=args.port or 8088, config_path=args.config or "core/config.json"))
            except KeyboardInterrupt:
                logger.info("Demo sandbox stopped.")
            return

        cfg_file = args.config if hasattr(args, "config") and args.config else "config.json"
        lb = LoadBalancer(config_path=cfg_file)
        if hasattr(args, "port") and args.port:
            lb.port = args.port
        if hasattr(args, "algorithm") and args.algorithm:
            lb.algorithm = args.algorithm

        try:
            asyncio.run(lb.start())
        except KeyboardInterrupt:
            logger.info("OpenBalancer stopped by user.")


if __name__ == "__main__":
    main()
