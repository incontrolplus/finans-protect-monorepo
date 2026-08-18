"""
OpenBalancer — High-Throughput Asynchronous Load Balancer & API Reverse Proxy
Engineered for Sub-Millisecond AI Model Inference, Microservice Meshes & Streaming APIs.
Engineered & Maintained by INCONTROL PLUS EOOD (https://www.openbalancer.com)
License: MIT
"""

from core.openbalancer import (
    OpenBalancer,
    LoadBalancer,
    BackendNode,
    RateLimiter,
    Auth,
    MetricsTracker,
    metrics,
    main,
    run_demo,
    start_mock_backend
)

__version__ = "1.4.2"
__author__ = "INCONTROL PLUS EOOD"
__license__ = "MIT"
__all__ = [
    "OpenBalancer",
    "LoadBalancer",
    "BackendNode",
    "RateLimiter",
    "Auth",
    "MetricsTracker",
    "metrics",
    "main",
    "run_demo",
    "start_mock_backend"
]
