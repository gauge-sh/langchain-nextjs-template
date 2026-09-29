#!/usr/bin/env python3
"""Run an application against a deterministic, loopback-only chat provider."""
import argparse
import json
import os
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

RESPONSE = 'I can help with the sample request. [local-provider-fixture]'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--receipt', required=True, type=Path)
    parser.add_argument('command', nargs=argparse.REMAINDER)
    args = parser.parse_args()
    command = args.command[1:] if args.command[:1] == ['--'] else args.command
    if not command:
        parser.error('Provide an application command after --')
    args.receipt.parent.mkdir(parents=True, exist_ok=True)
    lock = threading.Lock()
    count = 0
    with args.receipt.open('x', encoding='utf-8') as receipt:
        class Handler(BaseHTTPRequestHandler):
            def log_message(self, *_args):
                pass

            def reply(self, status, data):
                body = json.dumps(data).encode()
                self.send_response(status)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', str(len(body)))
                self.end_headers()
                self.wfile.write(body)

            def do_POST(self):
                nonlocal count
                if self.path != '/v1/chat/completions':
                    self.reply(404, {'error': {'message': 'Unknown local fixture endpoint'}})
                    return
                try:
                    size = int(self.headers.get('Content-Length', '0'))
                    if not 0 < size <= 1_048_576:
                        raise ValueError()
                    body = json.loads(self.rfile.read(size))
                    if not isinstance(body, dict):
                        raise ValueError()
                    model, messages = body.get('model'), body.get('messages')
                    if not isinstance(model, str) or not model.strip():
                        raise ValueError()
                    if not isinstance(messages, list) or not messages:
                        raise ValueError()
                    if any(not isinstance(m, dict) or not isinstance(m.get('role'), str) or not isinstance(m.get('content'), str) for m in messages):
                        raise ValueError()
                    if body.get('stream'):
                        raise ValueError()
                except (ValueError, TypeError, UnicodeError):
                    self.reply(400, {'error': {'message': 'Fixture requires model and text messages with streaming disabled'}})
                    return
                with lock:
                    count += 1
                    request_id = f'chatcmpl-local-fixture-{count}'
                    record = {'fixture': 'launchdarkly-example-provider-v1', 'id': request_id,
                              'model': model, 'messages': messages,
                              'parameters': {k: body[k] for k in ['temperature', 'max_tokens', 'max_completion_tokens'] if k in body}}
                    receipt.write(json.dumps(record) + '\n')
                    receipt.flush()
                self.reply(200, {
                    'id': request_id, 'object': 'chat.completion', 'created': int(time.time()), 'model': model,
                    'choices': [{'index': 0, 'message': {'role': 'assistant', 'content': RESPONSE}, 'finish_reason': 'stop'}],
                    'usage': {'prompt_tokens': 17, 'completion_tokens': 9, 'total_tokens': 26},
                })

        server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        env = os.environ.copy()
        env['OPENAI_BASE_URL'] = f'http://127.0.0.1:{server.server_port}/v1'
        env['OPENAI_API_KEY'] = 'fixture-only-not-a-real-key'
        print(f'Local provider started; request receipt: {args.receipt}', flush=True)
        try:
            code = subprocess.run(command, env=env).returncode
        finally:
            server.shutdown()
            server.server_close()
            thread.join()
        print(f'Local provider received {count} completion request(s).', flush=True)
        if code == 0 and count == 0:
            print('The example exited without calling the local provider.', file=sys.stderr)
            return 1
        return code if code >= 0 else 128 - code


if __name__ == '__main__':
    raise SystemExit(main())
