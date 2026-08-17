#!/usr/bin/env python3
"""
Unit Tests for OpenBalancer Circuit Breaking & Failover Logic
"""

import unittest
from core.openbalancer import BackendNode, LoadBalancer


class TestCircuitBreaker(unittest.TestCase):
    def setUp(self):
        self.lb = LoadBalancer()
        self.b1 = BackendNode("127.0.0.1", 9001, weight=1)
        self.b2 = BackendNode("127.0.0.1", 9002, weight=1)
        self.lb.backends = [self.b1, self.b2]

    def test_node_failure_trip(self):
        self.assertTrue(self.b1.is_healthy)
        self.b1.consecutive_failures = 3
        self.b1.is_healthy = False
        
        # When b1 is tripped down, LB must route 100% to b2
        self.lb.algorithm = "round_robin"
        for _ in range(5):
            self.assertEqual(self.lb.select_backend(), self.b2)

    def test_node_recovery(self):
        self.b1.is_healthy = False
        self.b1.consecutive_failures = 3
        
        # Recovery probe simulates 200 OK
        self.b1.consecutive_failures = 0
        self.b1.is_healthy = True
        
        # Both nodes now participate
        selected = [self.lb.select_backend() for _ in range(2)]
        self.assertIn(self.b1, selected)
        self.assertIn(self.b2, selected)


if __name__ == "__main__":
    unittest.main()
