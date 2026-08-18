#!/usr/bin/env python3
"""
=============================================================================
 OpenBalancer Core — High-Performance Asynchronous AI & API Load Balancer
 Maintained & Backed by INCONTROL PLUS ЕООД (https://openbalancer.com)
 Licensed under the MIT License
=============================================================================
"""

import asyncio
import json
import logging
import os
import sys
import time
from typing import Dict, List, Optional
import urllib.request
import urllib.parse
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] [OpenBalancer] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger("OpenBalancer")


class BackendNode:
    def __init__(self, host: str, port: int, weight: int = 1, health_path: str = "/health"):
        self.host = host
        self.port = port
        self.weight = weight
        self.health_path = health_path
        self.is_healthy = True
        self.active_connections = 0
        self.total_requests = 0
        self.failed_requests = 0
        self.last_latency_ms = 0.0
        self.consecutive_failures = 0
        self.circuit_trips = 0

    @property
    def url(self) -> str:
        return f"http://{self.host}:{self.port}"

    def __repr__(self):
        status = "HEALTHY" if self.is_healthy else "DOWN"
        return f"<BackendNode {self.url} [{status}] weight={self.weight} reqs={self.total_requests}>"


class LoadBalancer:
    def __init__(self, config_path: str = "config.json"):
        self.config_path = config_path
        self.port = 8080
        self.host = "0.0.0.0"
        self.algorithm = "round_robin"  # round_robin, weighted, least_latency, random
        self.health_interval = 5
        self.backends: List[BackendNode] = []
        self.path_routing: Dict[str, str] = {}
        self.model_routing: Dict[str, str] = {}
        self.current_idx = 0
        self.start_time = time.time()
        self.total_proxied_requests = 0
        self.load_config()

    def load_config(self):
        if os.path.exists(self.config_path):
            with open(self.config_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.port = int(os.getenv("PORT", data.get("port", 8080)))
                self.host = os.getenv("HOST", data.get("host", "0.0.0.0"))
                self.algorithm = os.getenv("ALGORITHM", data.get("algorithm", "round_robin"))
                self.health_interval = int(os.getenv("HEALTHCHECK_INTERVAL", data.get("health_interval", 5)))
                self.path_routing = data.get("path_routing", {})
                self.model_routing = data.get("model_routing", {})
                
                self.backends = []
                for b in data.get("backends", []):
                    node = BackendNode(
                        host=b["host"],
                        port=b["port"],
                        weight=b.get("weight", 1),
                        health_path=b.get("health_path", "/health")
                    )
                    self.backends.append(node)
        else:
            logger.warning(f"Config file {self.config_path} not found. Loading default backend settings.")
            self.backends = [
                BackendNode("127.0.0.1", 9001, weight=1),
                BackendNode("127.0.0.1", 9002, weight=1)
            ]
        logger.info(f"Loaded {len(self.backends)} backends. Strategy: {self.algorithm}. Port: {self.port}")

    def select_backend(self, client_ip: Optional[str] = None, path: Optional[str] = None, model: Optional[str] = None) -> Optional[BackendNode]:
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

        # 2. Path-Prefix Routing Match (e.g. /webhook, /rest/v1, /v1/crawl)
        if path and self.path_routing:
            for prefix, target_url in self.path_routing.items():
                if path.startswith(prefix):
                    matched = next((n for n in healthy_nodes if n.url == target_url or f"{n.host}:{n.port}" in target_url), None)
                    if matched:
                        return matched

        # 3. Algorithmic Balancing Strategies
        algo = self.algorithm.lower()

        if algo in ("least_connections", "least_conn"):
            # Select healthy node with the lowest active connections (weighted)
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
            # Default standard round robin
            node = healthy_nodes[self.current_idx % len(healthy_nodes)]
            self.current_idx = (self.current_idx + 1) % len(healthy_nodes)
            return node

    async def check_node_health(self, node: BackendNode):
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
        except Exception as e:
            node.consecutive_failures += 1
            if node.consecutive_failures >= 2 and node.is_healthy:
                logger.warning(f"Health check failed for {node.url}: {e}. Marking as DOWN.")
                node.is_healthy = False
                node.circuit_trips += 1

    async def health_check_loop(self):
        while True:
            tasks = [self.check_node_health(node) for node in self.backends]
            if tasks:
                await asyncio.gather(*tasks)
            await asyncio.sleep(self.health_interval)

    async def handle_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        self.total_proxied_requests += 1
        try:
            # Read HTTP request header line
            request_line = await reader.readline()
            if not request_line:
                writer.close()
                await writer.wait_closed()
                return

            line_str = request_line.decode('utf-8', errors='ignore').strip()
            parts = line_str.split()
            if len(parts) < 2:
                writer.close()
                await writer.wait_closed()
                return

            method, path = parts[0], parts[1]

            # Read all request headers
            headers = []
            content_length = 0
            while True:
                header_line = await reader.readline()
                if not header_line or header_line == b'\r\n':
                    break
                h_str = header_line.decode('utf-8', errors='ignore')
                headers.append(h_str)
                if h_str.lower().startswith('content-length:'):
                    try:
                        content_length = int(h_str.split(':')[1].strip())
                    except ValueError:
                        pass

            body = b""
            if content_length > 0:
                body = await reader.readexactly(content_length)

            # Internal Status & Metrics Endpoint (JSON)
            if path.startswith("/openbalancer/status"):
                status_payload = {
                    "system": "OpenBalancer Core",
                    "operator": "INCONTROL PLUS EOOD",
                    "license": "MIT",
                    "uptime_seconds": int(time.time() - self.start_time),
                    "total_proxied_requests": self.total_proxied_requests,
                    "algorithm": self.algorithm,
                    "backends": [
                        {
                            "url": b.url,
                            "healthy": b.is_healthy,
                            "weight": b.weight,
                            "total_requests": b.total_requests,
                            "last_latency_ms": b.last_latency_ms,
                            "circuit_trips": b.circuit_trips
                        }
                        for b in self.backends
                    ]
                }
                body_bytes = json.dumps(status_payload, indent=2).encode('utf-8')
                response_header = (
                    b"HTTP/1.1 200 OK\r\n"
                    b"Content-Type: application/json; charset=utf-8\r\n"
                    b"Server: OpenBalancer/1.0 (INCONTROL PLUS)\r\n"
                    b"Connection: close\r\n"
                    b"Content-Length: " + str(len(body_bytes)).encode('utf-8') + b"\r\n\r\n"
                )
                writer.write(response_header + body_bytes)
                await writer.drain()
                writer.close()
                await writer.wait_closed()
                return

            # Prometheus Metrics Endpoint (text/plain format)
            if path == "/metrics" or path.startswith("/metrics?"):
                uptime = int(time.time() - self.start_time)
                lines = [
                    "# HELP openbalancer_requests_total Total number of proxied HTTP requests",
                    "# TYPE openbalancer_requests_total counter",
                    f"openbalancer_requests_total {self.total_proxied_requests}",
                    "",
                    "# HELP openbalancer_uptime_seconds OpenBalancer uptime in seconds",
                    "# TYPE openbalancer_uptime_seconds gauge",
                    f"openbalancer_uptime_seconds {uptime}",
                    "",
                    "# HELP openbalancer_backend_health_status Health status of backend node (1=healthy, 0=down)",
                    "# TYPE openbalancer_backend_health_status gauge",
                ]
                for b in self.backends:
                    status_val = 1 if b.is_healthy else 0
                    lines.append(f'openbalancer_backend_health_status{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {status_val}')

                lines.extend([
                    "",
                    "# HELP openbalancer_backend_requests_total Total requests routed to backend node",
                    "# TYPE openbalancer_backend_requests_total counter",
                ])
                for b in self.backends:
                    lines.append(f'openbalancer_backend_requests_total{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.total_requests}')

                lines.extend([
                    "",
                    "# HELP openbalancer_backend_latency_ms Last probed health check latency in milliseconds",
                    "# TYPE openbalancer_backend_latency_ms gauge",
                ])
                for b in self.backends:
                    lines.append(f'openbalancer_backend_latency_ms{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.last_latency_ms}')

                lines.extend([
                    "",
                    "# HELP openbalancer_backend_failed_requests_total Total failed requests for backend node",
                    "# TYPE openbalancer_backend_failed_requests_total counter",
                ])
                for b in self.backends:
                    lines.append(f'openbalancer_backend_failed_requests_total{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.failed_requests}')

                lines.extend([
                    "",
                    "# HELP openbalancer_circuit_breaker_trips_total Total circuit breaker trip events due to consecutive health probe failures",
                    "# TYPE openbalancer_circuit_breaker_trips_total counter",
                ])
                for b in self.backends:
                    lines.append(f'openbalancer_circuit_breaker_trips_total{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.circuit_trips}')

                lines.extend([
                    "",
                    "# HELP openbalancer_backend_consecutive_failures Current consecutive health check failure count",
                    "# TYPE openbalancer_backend_consecutive_failures gauge",
                ])
                for b in self.backends:
                    lines.append(f'openbalancer_backend_consecutive_failures{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.consecutive_failures}')

                lines.extend([
                    "",
                    "# HELP openbalancer_backend_active_connections Number of active connections on backend node",
                    "# TYPE openbalancer_backend_active_connections gauge",
                ])
                for b in self.backends:
                    lines.append(f'openbalancer_backend_active_connections{{backend="{b.url}",host="{b.host}",port="{b.port}"}} {b.active_connections}')

                lines.append("")
                body_bytes = "\n".join(lines).encode('utf-8')
                response_header = (
                    b"HTTP/1.1 200 OK\r\n"
                    b"Content-Type: text/plain; version=0.0.4; charset=utf-8\r\n"
                    b"Server: OpenBalancer/1.0 (INCONTROL PLUS)\r\n"
                    b"Connection: close\r\n"
                    b"Content-Length: " + str(len(body_bytes)).encode('utf-8') + b"\r\n\r\n"
                )
                writer.write(response_header + body_bytes)
                await writer.drain()
                writer.close()
                await writer.wait_closed()
                return

            # Extract client IP
            client_ip = None
            try:
                peer = writer.get_extra_info('peername')
                if peer:
                    client_ip = peer[0]
            except Exception:
                pass

            # Extract AI Model if JSON payload
            model = None
            if body and (path.startswith("/v1/chat/completions") or path.startswith("/api/generate") or path.startswith("/v1/models")):
                try:
                    payload_json = json.loads(body.decode('utf-8'))
                    model = payload_json.get("model")
                except Exception:
                    pass

            # Select backend node (considering model, path prefix, and algorithm)
            backend = self.select_backend(client_ip=client_ip, path=path, model=model)
            if not backend:
                err_resp = (
                    b"HTTP/1.1 503 Service Unavailable\r\n"
                    b"Content-Type: text/plain\r\n"
                    b"Server: OpenBalancer/1.0 (INCONTROL PLUS)\r\n"
                    b"Connection: close\r\n"
                    b"Content-Length: 35\r\n\r\n"
                    b"503 Service Unavailable: No Backends"
                )
                writer.write(err_resp)
                await writer.drain()
                writer.close()
                await writer.wait_closed()
                return

            backend.total_requests += 1

            # Forward to backend
            try:
                b_reader, b_writer = await asyncio.open_connection(backend.host, backend.port)
                
                # Forward request line and headers
                b_writer.write(request_line)
                for h in headers:
                    # Inject proxy forwarded headers
                    if not h.lower().startswith('x-forwarded-by:'):
                        b_writer.write(h.encode('utf-8'))
                b_writer.write(b"X-Forwarded-By: OpenBalancer-IncontrolPlus\r\n")
                b_writer.write(b"\r\n")
                if body:
                    b_writer.write(body)
                await b_writer.drain()

                # Stream response back to client
                while True:
                    chunk = await b_reader.read(8192)
                    if not chunk:
                        break
                    writer.write(chunk)
                    await writer.drain()

                b_writer.close()
                await b_writer.wait_closed()
            except Exception as e:
                logger.error(f"Error forwarding request to {backend.url}: {e}")
                backend.failed_requests += 1
                err_resp = (
                    b"HTTP/1.1 502 Bad Gateway\r\n"
                    b"Content-Type: text/plain\r\n"
                    b"Server: OpenBalancer/1.0 (INCONTROL PLUS)\r\n"
                    b"Connection: close\r\n"
                    b"Content-Length: 29\r\n\r\n"
                    b"502 Bad Gateway: Upstream Err"
                )
                writer.write(err_resp)
                await writer.drain()

        except Exception as ex:
            logger.error(f"Client handling exception: {ex}")
        finally:
            try:
                writer.close()
                await writer.wait_closed()
            except Exception:
                pass

    async def start(self):
        server = await asyncio.start_server(self.handle_client, self.host, self.port)
        logger.info(f"OpenBalancer active and listening on http://{self.host}:{self.port}")
        logger.info(f"Status Dashboard API: http://{self.host}:{self.port}/openbalancer/status")
        
        asyncio.create_task(self.health_check_loop())
        async with server:
            await server.serve_forever()


def main():
    import argparse
    # Check if first argument is a json file or flag
    first_arg = sys.argv[1] if len(sys.argv) > 1 else None
    if first_arg and (first_arg.endswith('.json') or os.path.isfile(first_arg)):
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

    # Start Command
    start_parser = subparsers.add_parser("start", help="Start OpenBalancer service")
    start_parser.add_argument("-c", "--config", default="config.json", help="Path to config.json file (default: config.json)")
    start_parser.add_argument("-p", "--port", type=int, default=None, help="Override listen port")
    start_parser.add_argument("-a", "--algorithm", choices=["round_robin", "weighted_round_robin", "least_connections", "ip_hash", "power_of_two"], default=None, help="Override routing algorithm")

    # Validate Command
    val_parser = subparsers.add_parser("validate", help="Validate configuration file")
    val_parser.add_argument("-c", "--config", default="config.json", help="Path to config.json file")

    # Status Command
    status_parser = subparsers.add_parser("status", help="Query live OpenBalancer status")
    status_parser.add_argument("-u", "--url", default="http://127.0.0.1:8088/openbalancer/status", help="URL of status endpoint")

    # Version Command
    subparsers.add_parser("version", help="Show version and build information")

    args = parser.parse_args()

    if args.subcommand == "version":
        print("OpenBalancer v1.4.2 (Enterprise AI & API Load Balancer)")
        print("Engineered & Maintained by INCONTROL PLUS ЕООД (https://www.openbalancer.com)")
        print("License: MIT")
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
        # Default or 'start'
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
