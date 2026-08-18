#!/usr/bin/env python3
"""
Unit Tests for OpenBalancer CLI Subcommands
"""

import unittest
import subprocess
import sys
import os


class TestOpenBalancerCLI(unittest.TestCase):
    def setUp(self):
        self.root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.script = os.path.join(self.root_dir, "core", "openbalancer.py")
        self.config = os.path.join(self.root_dir, "core", "config.json")

    def test_cli_version(self):
        res = subprocess.run([sys.executable, self.script, "version"], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("OpenBalancer v1.", res.stdout)
        self.assertIn("INCONTROL PLUS", res.stdout)

    def test_cli_validate_success(self):
        res = subprocess.run([sys.executable, self.script, "validate", "-c", self.config], capture_output=True, text=True)
        self.assertEqual(res.returncode, 0)
        self.assertIn("is valid JSON", res.stdout)


if __name__ == "__main__":
    unittest.main()
