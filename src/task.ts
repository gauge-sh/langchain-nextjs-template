import type { LDAIAgentConfig, LDAIAgentConfigDefault } from '@launchdarkly/server-sdk-ai';
import { RecordingProvider } from './provider.js';

export const fallback: LDAIAgentConfigDefault = { enabled: false };

export function respond(config: LDAIAgentConfig, provider: RecordingProvider, tool?: string) {
  if (!config.enabled) return { response: 'Agent unavailable', enabled: false };
  const result = provider.invoke({ instructions: config.instructions ?? '', model: config.model?.name ?? '', tool });
  if (result.toolCall) {
    // Dispatch currently relies on the local registry and argument validation.
    provider.dispatch(result.toolCall.name, result.toolCall.arguments);
  }
  config.createTracker().trackTokens(result.usage);
  return { response: result.text, enabled: true };
}
