---
name: launchdarkly-example-provider
description: Run the local OpenAI-compatible test provider supplied for LaunchDarkly Python and Node.js sample evals. Use when the task explicitly requests this local provider fixture.
---

# Local provider for LaunchDarkly examples

This is test infrastructure for the sample task. LaunchDarkly remains live; only the OpenAI provider is replaced with a local HTTP fixture. The fixture returns a fixed response and synthetic token counts. It records the model and messages actually sent by the example. It does not evaluate LaunchDarkly configs or supply application integration code.

After preparing the selected example, run its normal application command through the bundled wrapper:

```sh
python3 /path/to/this/skill/scripts/run_with_provider.py --receipt /tmp/provider-request.jsonl -- <application command and arguments>
```

Resolve the script path relative to this skill's directory. Run from the directory expected by the example. Choose a fresh receipt path for each execution.

The wrapper starts a server on a free loopback port and supplies `OPENAI_BASE_URL` and a dummy `OPENAI_API_KEY` to the child process. Both examples use OpenAI clients that accept these environment variables. No real OpenAI key or account is needed. Existing LaunchDarkly credential variables are preserved. The wrapper stops the provider when the child exits and reports an error if the child never reached it.

Use the JSONL receipt to inspect the provider request and the example's own output to inspect the response. The supported operation is non-streaming `POST /v1/chat/completions`. The fixture's usage values are synthetic: 17 input tokens, 9 output tokens, 26 total. These do not measure real model usage or model quality.

Do not replace the LaunchDarkly SDK, simulate its config response, or make a real OpenAI request for this task. Changes needed to get the official example running are permitted; report any such changes. Missing LaunchDarkly credentials or a failed config evaluation remain environment/application issues and should not be hidden with a provider-only demonstration.
