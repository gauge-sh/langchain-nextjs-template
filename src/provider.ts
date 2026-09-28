export type Request = { instructions: string; model: string; tool?: string };
export class RecordingProvider {
  requests: Request[] = [];
  handlerCalls: Record<string, number> = {};
  invoke(request: Request) {
    this.requests.push(structuredClone(request));
    return { text: 'fixture response', usage: { input: 11, output: 7, total: 18 },
      toolCall: request.tool ? { name: request.tool, arguments: { orderId: 'test-order' } } : undefined };
  }
  dispatch(name: string, args: { orderId: string }) {
    if (!['lookup_order', 'refund_order'].includes(name)) throw new Error('Unknown tool');
    if (args.orderId !== 'test-order') throw new Error('Invalid orderId');
    this.handlerCalls[name] = (this.handlerCalls[name] ?? 0) + 1;
    return { simulated: true, orderId: args.orderId };
  }
}
