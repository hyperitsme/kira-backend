import { RSI, EMA, ATR, ADX } from 'technicalindicators';

export function computeIndicators(closes: number[], highs: number[], lows: number[]) {
  const rsi = RSI.calculate({ values: closes, period: 14 }).at(-1);
  const ema20 = EMA.calculate({ values: closes, period: 20 }).at(-1);
  const ema50 = EMA.calculate({ values: closes, period: 50 }).at(-1);
  const atr14 = ATR.calculate({ close: closes, high: highs, low: lows, period: 14 }).at(-1);
  const adx14 = ADX.calculate({ close: closes, high: highs, low: lows, period: 14 }).at(-1)?.adx;
  return { rsi, ema20, ema50, atr14, adx14 };
}

export function humanNarrative(symbol: string, tf: string, indicators: any, lastClose: number) {
  const lines: string[] = [];
  if (indicators.ema20 && indicators.ema50) {
    const trend = indicators.ema20 > indicators.ema50 ? 'uptrend' : 'downtrend';
    lines.push(`${symbol} on ${tf}: ${trend} (EMA20 ${indicators.ema20?.toFixed(2)} vs EMA50 ${indicators.ema50?.toFixed(2)}).`);
  }
  if (indicators.rsi) {
    if (indicators.rsi > 70) lines.push(`Momentum overheated (RSI ${indicators.rsi.toFixed(1)}).`);
    else if (indicators.rsi < 30) lines.push(`Momentum depressed (RSI ${indicators.rsi.toFixed(1)}).`);
    else lines.push(`Neutral momentum (RSI ${indicators.rsi.toFixed(1)}).`);
  }
  if (indicators.adx14) lines.push(`Regime strength ADX ${Number(indicators.adx14).toFixed(1)}.`);
  lines.push(`Last close: ${lastClose}.`);
  return lines.join(' ');
}
