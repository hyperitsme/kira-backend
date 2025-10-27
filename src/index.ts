import 'dotenv/config';
import { createServer } from './server.js';
import { startLivePricesWS } from './ws/livePrices.js';
import { scheduleFourHourlySummary } from './schedulers/fourHourlySummary.js';

const port = process.env.PORT ? Number(process.env.PORT) : 8080;

const app = await createServer();
const server = app.listen(port, () => {
  console.log(`[KiraAI] API listening on :${port} base=${process.env.BASE_PATH || ''}`);
});

// WS: live prices
startLivePricesWS(server);

// 4-hour Telegram summary
scheduleFourHourlySummary();
