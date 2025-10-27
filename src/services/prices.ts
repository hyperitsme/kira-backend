export const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'];

export function toBinancePair(sym: string) {
  return sym.replace(/[-/]/g, '').toUpperCase();
}
