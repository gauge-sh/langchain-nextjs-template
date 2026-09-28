# LaunchDarkly fallback task fixture

Set a disabled fallback for the nonexistent config key. The SDK client must initialize successfully first.

## Starting app

This is a small TypeScript server with the real LaunchDarkly Node server SDK 9.13.7 and AI SDK 2.0.7. The model adapter is deliberately deterministic: it records requests and returns 11 input and 7 output tokens. Tool handlers are local test stubs. No model-provider key or refund account is needed. Each task has its own revision and intentionally incomplete behavior only where the task requires implementation.

## Run

Use Node 22 (`nvm use`), then `npm ci`, `npm run typecheck`, and `npm test`. Supply `LAUNCHDARKLY_SDK_KEY` securely through the runner connection. Run `npm run preflight`, then `npm start`. Send a request with `curl 'http://127.0.0.1:3000/request?org=standard-org'`, or use `org=beta-org`. The JSON response records the process ID, evaluated configuration, provider request, handler call counts, and captured SDK tracking calls.

For changes without redeployment, keep this process running while changing targeting and repeat the request after propagation. Do not substitute a local JSON edit for a LaunchDarkly targeting update.

## Environment readiness

SDK authentication was verified on September 28, 2026 using the Gauge connection `launchdarkly-sdk`. This case deliberately requires no existing AgentControl configuration and no control-plane write access. The project/environment fields are informational and not needed to evaluate the absent key. Run `npm run preflight` to confirm successful SDK initialization and FLAG_NOT_FOUND for the key in `launchdarkly-fixture.json`. If that check fails, report an environment blocker and stop. Do not create this key, use production resources, or log credentials.

`npm test` checks the real SDK using LaunchDarkly TestData, with network event delivery disabled; it verifies fixture plumbing, not the task outcome. Captured tracking calls establish SDK event submission, not receipt in LaunchDarkly's dashboard. Remote state must be reset before each sample. Until per-run resources exist, run sequentially only.

## References

- https://launchdarkly.com/docs/sdk/features/agentcontrol-config
- https://launchdarkly.com/docs/sdk/features/ai-metrics
