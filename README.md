# Coordinate multiple agents

Working local triage/specialist handlers; workflow routing is hardcoded.

Existing handlers cover triage, billing, and orders with deterministic responses. Model calls are simulated. The pinned AI SDK 2.0.7 exposes agentGraph and AgentGraphDefinition. Setup also verified remote topology resolution using @launchdarkly/ai-server@0.3.0; either supported integration is acceptable. The current hardcoded workflow is the behavior to migrate.

## Working environment

Node 24 (also supports Node 22). `npm ci`, `npm test`, and `LD_TEST_DATA=1 npm start` reproduce the local starting state. HTTP routes: /dashboard, /search, /checkout, /signup, /orders and /chat; organization is supplied as `?org=beta-org` or standard-org. AI cases use the same request handler interface. Tests assert the initial state, including deliberately broken behavior in troubleshooting cases; update affected assertions when fixing it.

The supplied `@launchdarkly/node-server-sdk` 9.13.7 and legacy AI SDK 2.0.7 dependencies are locked. The local client uses real SDK TestData with event delivery disabled. Local simulation is not evidence of remote configuration or ingestion. `npm start` without LD_TEST_DATA uses the attached LAUNCHDARKLY_SDK_KEY; `npm run preflight` checks live resource evaluation. Never disclose credential values.

`resources.json` names this case's data and dedicated resources. `environment-plan.json` records prerequisites. No live prerequisite is claimed verified by a local test. If required resources or entitlements are unavailable, report the environment blocker. Do not change unrelated flags or production. Only remote-control cases receive LAUNCHDARKLY_API_KEY for app.launchdarkly.com, as a raw Authorization header. API key attachment does not establish resource permissions or plan entitlement.

The measured task is in the user prompt. These files provide starting context, not additional scored tasks. Choose suitable verification; no particular command sequence is required.
