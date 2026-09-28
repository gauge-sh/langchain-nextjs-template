# LaunchDarkly model-switch task fixture

Switch the agent from baseline to candidate by changing LaunchDarkly targeting. Both variations use the same instructions and deterministic provider.

## Starting app

This is a small TypeScript server with the real LaunchDarkly Node server SDK 9.13.7 and AI SDK 2.0.7. The model adapter is deliberately deterministic: it records requests and returns 11 input and 7 output tokens. Tool handlers are local test stubs. No model-provider key or refund account is needed. Each task has its own revision and intentionally incomplete behavior only where the task requires implementation.

## Run

Use Node 22 (`nvm use`), then `npm ci`, `npm run typecheck`, and `npm test`. Supply `LAUNCHDARKLY_SDK_KEY` securely through the runner connection. Run `npm run preflight`, then `npm start`. Send a request with `curl 'http://127.0.0.1:3000/request?org=standard-org'`, or use `org=beta-org`. The JSON response records the process ID, evaluated configuration, provider request, handler call counts, and captured SDK tracking calls.

For changes without redeployment, keep this process running while changing targeting and repeat the request after propagation. Do not substitute a local JSON edit for a LaunchDarkly targeting update.

## Environment readiness

Live SDK access and the initial configuration state were verified on September 28, 2026. Use project `default` (Gauge Test), environment `test`, and only the config named in `launchdarkly-fixture.json`. `live-verification.json` records both organization contexts. Run `npm run preflight` before the task. If the state differs, stop and report an environment blocker; do not silently reset or alter other resources.

Model-switch, beta-targeting, and rollback receive `LAUNCHDARKLY_API_KEY` for targeting changes at `https://app.launchdarkly.com/api/v2/projects/default/ai-configs/{configKey}/targeting`, using `Authorization: <token>` with no Bearer prefix. The JSON semantic patch includes environmentKey `test`. Use official API documentation to determine the required action. Only the designated config may be changed. Preserve its variations. The other cases require only SDK access. Never print credentials.

`npm test` checks the real SDK using LaunchDarkly TestData, with network event delivery disabled; it verifies fixture plumbing, not the task outcome. Captured tracking calls establish SDK event submission, not receipt in LaunchDarkly's dashboard. Remote state must be reset before each sample. Until per-run resources exist, run sequentially only.

## References

- https://launchdarkly.com/docs/sdk/features/agentcontrol-config
- https://launchdarkly.com/docs/sdk/features/ai-metrics
