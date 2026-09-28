export async function answer({ org, tool }, provider) {
  const result = provider.invoke({ model: 'local-model', instructions: 'Answer order questions.', org, tool });
  const toolResult = result.toolCall ? provider.dispatch(result.toolCall.name, result.toolCall.arguments) : undefined;
  return { response: result.text, toolResult };
}

export async function openChat({ org }) {
  return { available: true, org, message: 'Chat is ready' };
}
