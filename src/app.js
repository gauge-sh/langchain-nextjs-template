export const handlers={
  triage: input=>({route:input.includes('bill')?'billing':'orders'}),
  billing: input=>({response:'Billing specialist response',input}),
  orders: input=>({response:'Order specialist response',input}),
};
export function createApp(client) {
  return async (path,input={})=>{
    const text=input.message||'Where is my order?';
    const decision=handlers.triage(text);
    return {visited:['triage',decision.route],...handlers[decision.route](text)};
  };
}
