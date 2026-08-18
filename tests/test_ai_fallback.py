import unittest
import asyncio
from unittest.mock import patch
from core.openbalancer import OpenBalancer, metrics

class TestAIFallback(unittest.IsolatedAsyncioTestCase):
    async def test_fallback_success(self):
        balancer = OpenBalancer()
        balancer.default_backend = "http://primary"
        balancer.fallback_pool = ["http://fallback1"]
        
        async def mock_proxy(self, target, method, path, headers, body):
            if target == "http://primary":
                return 500, {}, b"Internal Error"
            else:
                return 200, {}, b'{"usage":{"prompt_tokens":10,"completion_tokens":20}}'
                
        with patch.object(OpenBalancer, 'proxy_request', new=mock_proxy):
            initial_prompt = metrics.prompt_tokens
            
            class MockReader:
                def __init__(self):
                    self.called = False
                async def read(self, *args):
                    if self.called: return b""
                    self.called = True
                    return b"POST /v1/chat/completions HTTP/1.1\r\nHost: localhost\r\n\r\n{}"
            
            class MockWriter:
                def __init__(self):
                    self.output = b""
                def get_extra_info(self, name):
                    return ("127.0.0.1", 12345)
                def write(self, data):
                    self.output += data
                async def drain(self):
                    pass
                def close(self):
                    pass
                    
            writer = MockWriter()
            reader = MockReader()
            
            await balancer.handle_client(reader, writer)
            
            self.assertIn(b"HTTP/1.1 200 OK", writer.output)
            self.assertTrue(metrics.prompt_tokens > initial_prompt)
            self.assertEqual(metrics.prompt_tokens - initial_prompt, 10)

if __name__ == '__main__':
    unittest.main()
