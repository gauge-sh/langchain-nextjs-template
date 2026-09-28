export class RecordingProvider {
  requests = [];
  handlerCalls = [];
  invoke(request) {
    this.requests.push(structuredClone(request));
    return { text: 'How can I help with your order?', usage: { input: 11, output: 7, total: 18 },
      toolCall: request.tool ? { name: request.tool, arguments: { orderId: 'test-order' } } : undefined };
  }
  dispatch(name, args) {
    if (!['lookup_order', 'refund_order'].includes(name)) throw new Error('Unknown tool');
    if (args.orderId !== 'test-order') throw new Error('Invalid order');
    this.handlerCalls.push({ name, args: structuredClone(args) });
    return { simulated: true, orderId: args.orderId, status: name === 'lookup_order' ? 'shipped' : 'refunded' };
  }
}
