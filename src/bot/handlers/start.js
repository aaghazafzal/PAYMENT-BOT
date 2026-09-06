import { User } from '../../db/models/User.js';
import { getMainMenuKeyboard, getPlatformsKeyboard } from '../keyboards.js';

export async function handleStart(ctx) {
  const tgUser = ctx.from;
  if (!tgUser) return;

  // Save/update user profile in DB
  await User.findOneAndUpdate(
    { telegramId: String(tgUser.id) },
    {
      telegramId: String(tgUser.id),
      username: tgUser.username || '',
      firstName: tgUser.first_name || '',
      lastName: tgUser.last_name || '',
    },
    { upsert: true }
  );

  // If user is trying to claim a ticket (Option 2 Deep Link) e.g. /start claim_UNV-1234
  const payload = ctx.match;
  if (payload && payload.startsWith('claim_')) {
    // We let the target bots handle ticket claiming via Deep Links, 
    // Payment bot doesn't need to claim its own tickets usually, but we can safely ignore or redirect.
    // For now, if they somehow get here, we just show the normal start.
  }

  const firstName = tgUser.first_name.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&');
  const botUsername = ctx.me.username;

  const welcomeMessage = 
`👋 Welcome [${firstName}](tg://user?id=${tgUser.id}) to [PAYMENT BOT [UNIVORA]](https://t.me/${botUsername})! 👑

Elevate your experience across the entire *Univora Ecosystem*. Securely unlock premium access for all our Telegram Bots and Web Apps!

⚡ *What you can do here:*
• Buy VIP passes for any Univora Bot
• Instant & Automated Activation
• Manage your active subscriptions

👇 *Choose an option below to get started:*`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    reply_markup: getMainMenuKeyboard(),
  });
}

export async function handleShowPlatforms(ctx) {
  const msg = `👇 *Select a platform to choose your plan:*`;
  const kb = getPlatformsKeyboard();

  if (ctx.callbackQuery) {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(msg, { parse_mode: 'Markdown', reply_markup: kb });
  } else {
    await ctx.reply(msg, { parse_mode: 'Markdown', reply_markup: kb });
  }
}
