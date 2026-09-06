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

  // Simple escaping for HTML to prevent injection
  const escapeHtml = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const firstName = escapeHtml(tgUser.first_name);
  const botUsername = escapeHtml(ctx.me.username);
  const botName = escapeHtml('PAYMENT BOT [UNIVORA]'); // Now it won't break because HTML doesn't care about brackets

  const welcomeMessage = 
`👋 Welcome <a href="tg://user?id=${tgUser.id}">${firstName}</a> to <a href="https://t.me/${botUsername}">${botName}</a>! 👑

Elevate your experience across the entire <b>Univora Ecosystem</b>. Securely unlock premium access for all our Telegram Bots and Web Apps!

⚡ <b>What you can do here:</b>
• Buy VIP passes for any Univora Bot
• Instant &amp; Automated Activation
• Manage your active subscriptions

👇 <b>Choose an option below to get started:</b>`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'HTML',
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
