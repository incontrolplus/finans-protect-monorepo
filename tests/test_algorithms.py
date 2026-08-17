#!/usr/bin/env python3
"""
Unit Tests for OpenBalancer Routing Algorithms
"""

import unittest
from core.openbalancer import BackendNode, LoadBalancer


class TestRoutingAlgorithms(unittest.TestCase):
    def setUp(self):
        self.lb = LoadBalancer()
        self.b1 = BackendNode("127.0.0.1", 9001, weight=3)
        self.b2 = BackendNode("127.0.0.1", 9002, weight=1)
        self.lb.backends = [self.b1, self.b2]

    def test_round_robin_selection(self):
        self.lb.algorithm = "round_robin"
        selected = [self.lb.select_backend() for _ in range(4)]
        self.assertEqual(selected[0], self.b1)
        self.assertEqual(selected[1], self.b2)
        self.assertEqual(selected[2], self.b1)
        self.assertEqual(selected[3], self.b2)

    def test_least_connections_selection(self):
        self.lb.algorithm = "least_connections"
        self.b1.active_connections = 10
        self.b2.active_connections = 2
        selected = self.lb.select_backend()
        self.assertEqual(selected, self.b2)

    def test_ip_hash_selection(self):
        self.lb.algorithm = "ip_hash"
        node_a = self.lb.select_backend(client_ip="192.168.1.50")
        node_b = self.lb.select_backend(client_ip="192.168.1.50")
        self.assertEqual(node_a, node_b)  # Same IP must hash to identical backend

    def test_all_backends_down(self):
        self.b1.is_healthy = False
        self.b2.is_healthy = False
        selected = self.lb.select_backend()
        self.assertIsNone(selected)


if __name__ == "__main__":
    unittest.main()
