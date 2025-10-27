import cron from 'node-cron';
import { getSpotPrice } from '../services/prices.js';
import { notifyTelegram } from '../services/notifier.js';

export function scheduleFourHourlySummary() {
  cron.schedule('0 */4 * * *', async () => {
    try {
      const [btc, eth, sol] = await Promise.all([
        getSpotPrice('BTCUSDT'),
        getSpotPrice('ETHUSDT'),
        getSpotPrice('SOLUSDT')
      ]);
      const msg = `🛰️ Kira AI — 4h Snapshot
BTC: ${btc.price}
ETH: ${eth.price}
SOL: ${sol.price}`;
      await notifyTelegram(msg);
    } catch (e) { console.error('4h summary failed', e); }
  });
}
