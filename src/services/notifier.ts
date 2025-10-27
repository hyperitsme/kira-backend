import { Telegraf } from 'telegraf';

const bot = process.env.TELEGRAM_BOT_TOKEN ? new Telegraf(process.env.TELEGRAM_BOT_TOKEN) : null;
const chatId = process.env.TELEGRAM_CHAT_ID;

export async function notifyTelegram(text: string) {
  if (!bot || !chatId) return;
  try { await bot.telegram.sendMessage(chatId, text, { disable_web_page_preview: true }); }
  catch (e) { console.error('Telegram error', e); }
}
