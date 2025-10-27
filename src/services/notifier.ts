import { Telegraf } from 'telegraf';

const bot = process.env.TELEGRAM_BOT_TOKEN ? new Telegraf(process.env.TELEGRAM_BOT_TOKEN) : null;
const chatId = process.env.TELEGRAM_CHAT_ID;

// Catatan: Telegraf v4+ pakai link_preview_options, bukan disable_web_page_preview.
export async function notifyTelegram(text: string) {
  if (!bot || !chatId) return;
  try {
    // gunakan any agar tetap kompatibel lintas versi telegraf/telegram API
    const opts: any = { link_preview_options: { is_disabled: true } };
    await bot!.telegram.sendMessage(chatId!, text, opts);
  } catch (e) {
    console.error('Telegram error', e);
  }
}
