import ccxt from 'ccxt';

export async function getOHLCV(exchangeId: string, symbol: string, timeframe = '1h', limit = 200) {
  const ex = new (ccxt as any)[exchangeId]({ enableRateLimit: true });
  const data = await ex.fetchOHLCV(symbol, timeframe, undefined, limit);
  return data.map(([ts, o,h,l,c,v]) => ({ t: new Date(ts).toISOString(), o,h,l,c,v }));
}
