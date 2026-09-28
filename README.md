# Support workflow starter

A working Node.js support service with hardcoded agent settings and no LaunchDarkly packages or integration. Each eval begins independently from this same commit. Implement only the requested workflow.

Use Node 24 (Node 22 is also supported). Run `npm ci`, `npm test`, then `npm start`. Record the actual Node and installed SDK versions in your verification. The original test checks starter behavior; adapt it when the requested behavior changes.

- `GET /request?org=standard-org` records the provider request and returns its response.
- `GET /request?org=beta-org&tool=lookup_order` also executes a local simulated tool. `refund_order` is another registered local tool.
- `GET /chat?org=standard-org` exposes the existing chat feature.

The RecordingProvider is deliberately deterministic. Keep its request recording, usage counts, and local tool handlers; do not replace it with real model calls or real refunds. It lets verification inspect the model, instructions, context, and actual handler calls without a provider credential. You may add dependency injection and test helpers.

## LaunchDarkly test environment

The attached `LAUNCHDARKLY_SDK_KEY` is for project `default` (Gauge Test), environment `test`. Keep it private. Resources are read-only for these workflows. No management API credential or remote write is needed. Choose the config associated with the task in `resources.json`; do not hardcode the values recorded there into application behavior.

The controlled SDK baseline is `@launchdarkly/node-server-sdk@9.13.7` and, for AgentControl cases, `@launchdarkly/server-sdk-ai@2.0.7`. Install these when implementing. This suite measures that API generation; the newer `js-ai-sdk` family is a separate migration/onboarding track. Relevant docs: https://launchdarkly.com/docs/sdk/features/agentcontrol-config and https://launchdarkly.com/docs/sdk/features/ai-metrics .

Live verification must successfully initialize the real SDK and establish that the named resource exists. Default/fallback values following failed initialization are not live evidence. If access or resource state is wrong, report the environment blocker clearly. Local SDK TestData is appropriate for controlled on/off, missing-key, and update tests; label it as local. Do not claim a local update demonstrates remote propagation. No remote changes are required.

The beta-targeting resource currently serves candidate to beta-org and baseline to standard-org. This state was verified in the preceding pilot; recheck it before using it as evidence. Other AI resources were verified during setup. Shared remote state may change, so run-time verification remains necessary.

Keep the live SDK client reusable across requests and close it during shutdown. Provide concise commands and actual outputs for the checks requested by the task.
