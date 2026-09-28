import type { LDAIAgentConfig, LDAIAgentConfigDefault } from '@launchdarkly/server-sdk-ai';
import { RecordingProvider } from './provider.js';

export const fallback: LDAIAgentConfigDefault = { enabled: false };

export function respond(config: LDAIAgentConfig, provider: RecordingProvider, tool?: string) {
  // Disabled-state handling belongs here. Existing unavailable response: Agent unavailable.
  const result = provider.invoke({ instructions: config.instructions ?? '', model: config.model?.name ?? '', tool });
  if (result.toolCall) {
    if (!Object.hasOwn(config.tools ?? {}, result.toolCall.name)) return { response: 'Tool denied', enabled: true };
    provider.dispatch(result.toolCall.name, result.toolCall.arguments);
  }
  config.createTracker().trackTokens(result.usage);
  return { response: result.text, enabled: true };
}
