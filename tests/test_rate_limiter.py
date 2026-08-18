import unittest
import asyncio
from core.openbalancer import RateLimiter

class TestRateLimiter(unittest.IsolatedAsyncioTestCase):
    async def test_rate_limiter_allow(self):
        config = {
            "enabled": True,
            "requests_per_minute": 60,
            "burst": 2,
            "whitelist": []
        }
        limiter = RateLimiter(config)
        allowed, limit, remaining = await limiter.check("127.0.0.1")
        self.assertTrue(allowed)
        self.assertEqual(limit, 2)
        
    async def test_rate_limiter_block(self):
        config = {
            "enabled": True,
            "requests_per_minute": 60,
            "burst": 1,
            "whitelist": []
        }
        limiter = RateLimiter(config)
        # first request allowed
        allowed, _, _ = await limiter.check("127.0.0.1")
        self.assertTrue(allowed)
        
        # second request blocked because burst is 1
        allowed, _, _ = await limiter.check("127.0.0.1")
        self.assertFalse(allowed)

    async def test_rate_limiter_whitelist(self):
        config = {
            "enabled": True,
            "requests_per_minute": 60,
            "burst": 1,
            "whitelist": ["127.0.0.1"]
        }
        limiter = RateLimiter(config)
        allowed, _, _ = await limiter.check("127.0.0.1")
        self.assertTrue(allowed)
        allowed, _, _ = await limiter.check("127.0.0.1")
        self.assertTrue(allowed)

if __name__ == '__main__':
    unittest.main()
