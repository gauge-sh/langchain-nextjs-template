# LaunchDarkly token-usage task fixture

Record the deterministic provider usage through the tracker for the evaluated config once. Capture records show SDK track calls, not proof of dashboard ingestion.

## Starting app

This is a small TypeScript server with the real LaunchDarkly Node server SDK 9.13.7 and AI SDK 2.0.7. The model adapter is deliberately deterministic: it records requests and returns 11 input and 7 output tokens. Tool handlers are local test stubs. No model-provider key or refund account is needed. Each task has its own revision and intentionally incomplete behavior only where the task requires implementation.

## Run

Use Node 22 (`nvm use`), then `npm ci`, `npm run typecheck`, and `npm test`. Supply `LAUNCHDARKLY_SDK_KEY` securely through the runner connection. Run `npm run preflight`, then `npm start`. Send a request with `curl 'http://127.0.0.1:3000/request?org=standard-org'`, or use `org=beta-org`. The JSON response records the process ID, evaluated configuration, provider request, handler call counts, and captured SDK tracking calls.

For changes without redeployment, keep this process running while changing targeting and repeat the request after propagation. Do not substitute a local JSON edit for a LaunchDarkly targeting update.

## Environment readiness

Live verification is blocked. `launchdarkly-fixture.json` lists the required isolated remote resources and expected starting state. Project/environment identifiers and control access are not yet supplied. The existing Gauge credential returned HTTP 403 on September 28, 2026. Do not treat local tests as a live product pass. If preflight fails, report an environment blocker and stop. Do not use production resources or log credentials.

`npm test` checks the real SDK using LaunchDarkly TestData, with network event delivery disabled; it verifies fixture plumbing, not the task outcome. Captured tracking calls establish SDK event submission, not receipt in LaunchDarkly's dashboard. Remote state must be reset before each sample. Until per-run resources exist, run sequentially only.

## References

- https://launchdarkly.com/docs/sdk/features/agentcontrol-config
- https://launchdarkly.com/docs/sdk/features/ai-metrics
