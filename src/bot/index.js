import { Bot } from 'grammy';
import { config } from '../config/env.js';
import { handleStart } from './handlers/start.js';
import { handlePlatformCallbacks } from './handlers/platform.js';
import { handleVerifyPayment } from './handlers/verify.js';
import { handleAdminCommands } from './handlers/admin.js';

export let bot = null;

export function initBot() {
  if (!config.botToken) {
    console.error('❌ Cannot initialize Telegram Bot: BOT_TOKEN missing in .env!');
    return null;
  }

  bot = new Bot(config.botToken);

  // Register command handlers
  bot.command('start', handleStart);

  // Register admin handlers
  handleAdminCommands(bot);

  // Register callback query handlers
  bot.on('callback_query:data', async (ctx) => {
    const data = ctx.callbackQuery.data;
    if (data.startsWith('verify_pay:')) {
      await handleVerifyPayment(ctx);
    } else {
      await handlePlatformCallbacks(ctx);
    }
  });

  bot.catch((err) => {
    console.error('❌ Telegram Bot Handler Error:', err.error || err);
  });

  return bot;
}

export async function startBot() {
  const instance = initBot();
  if (instance) {
    instance.start({
      onStart: (botInfo) => {
        console.log(`🤖 Telegram Payment Bot (@${botInfo.username}) is active and polling!`);
      },
    });
  }
}
