export function baseline(currency) { return {currency,completed:true}; }
export function candidate(currency) { if(currency !== 'USD') throw new Error('unsupported currency '+currency); return {currency,completed:true}; }
