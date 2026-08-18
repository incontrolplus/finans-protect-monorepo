"""
OpenBalancer — High-Throughput Asynchronous Load Balancer & API Reverse Proxy
Engineered for Sub-Millisecond AI Model Inference, Microservice Meshes & Streaming APIs.
Engineered & Maintained by INCONTROL PLUS EOOD (https://www.openbalancer.com)
License: MIT
"""

try:
    from core.openbalancer import (
        LoadBalancer,
        BackendNode,
        RateLimiter,
        Auth,
        MetricsTracker,
        metrics,
        main,
        __version__,
    )
except ImportError:
    from .openbalancer import (
        LoadBalancer,
        BackendNode,
        RateLimiter,
        Auth,
        MetricsTracker,
        metrics,
        main,
        __version__,
    )

# OpenBalancer alias for LoadBalancer
OpenBalancer = LoadBalancer

__all__ = [
    "LoadBalancer",
    "OpenBalancer",
    "BackendNode",
    "RateLimiter",
    "Auth",
    "MetricsTracker",
    "metrics",
    "main",
    "__version__",
]
