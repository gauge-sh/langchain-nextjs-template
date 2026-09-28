import type { LDAIAgentConfig, LDAIAgentConfigDefault } from '@launchdarkly/server-sdk-ai';
import { RecordingProvider } from './provider.js';

export const fallback: LDAIAgentConfigDefault = { enabled: true, instructions: 'Fallback instructions', model: { name: 'baseline' }, provider: { name: 'fixture' } };

export function respond(config: LDAIAgentConfig, provider: RecordingProvider, tool?: string) {
  if (!config.enabled) return { response: 'Agent unavailable', enabled: false };
  const result = provider.invoke({ instructions: config.instructions ?? '', model: config.model?.name ?? '', tool });
  if (result.toolCall) {
    if (!Object.hasOwn(config.tools ?? {}, result.toolCall.name)) return { response: 'Tool denied', enabled: true };
    provider.dispatch(result.toolCall.name, result.toolCall.arguments);
  }
  config.createTracker().trackTokens(result.usage);
  return { response: result.text, enabled: true };
}
