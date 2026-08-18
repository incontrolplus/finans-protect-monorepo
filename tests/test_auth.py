import unittest
from core.openbalancer import Auth

class TestAuth(unittest.TestCase):
    def test_auth_disabled(self):
        config = {"enabled": False, "api_keys": ["secret123"]}
        auth = Auth(config)
        self.assertTrue(auth.authenticate({}))

    def test_auth_enabled_valid_key(self):
        config = {"enabled": True, "api_keys": ["secret123"]}
        auth = Auth(config)
        self.assertTrue(auth.authenticate({"Authorization": "Bearer secret123"}))

    def test_auth_enabled_invalid_key(self):
        config = {"enabled": True, "api_keys": ["secret123"]}
        auth = Auth(config)
        self.assertFalse(auth.authenticate({"Authorization": "Bearer invalid"}))

    def test_auth_enabled_missing_key(self):
        config = {"enabled": True, "api_keys": ["secret123"]}
        auth = Auth(config)
        self.assertFalse(auth.authenticate({}))

if __name__ == '__main__':
    unittest.main()
