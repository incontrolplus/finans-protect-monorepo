"""
OpenBalancer core engine package.
"""
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
