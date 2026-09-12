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

export async function handleReport(ctx) {
  const reportMsg = 
`🐞 <b>Report a Bug or Issue</b>

We strive to provide the best experience across the Univora Ecosystem. However, if you are facing any issues, errors, or bugs while using our bots or services, we are here to help!

<b>What you can report:</b>
• Payment or checkout failures
• Premium activation issues
• Bot not responding or errors
• General feedback or suggestions

Click the button below to reach our official Support & Report Bot, where our team will assist you directly!`;

  const kb = {
    inline_keyboard: [
      [{ text: '💬 REPORT [UNIVORA]', url: 'https://t.me/UNIVORA_REPORTBOT', style: 'primary' }]
    ]
  };

  await ctx.reply(reportMsg, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: kb,
  });
}

export async function handleMySubscriptions(ctx) {
  const telegramId = String(ctx.from?.id);
  if (!telegramId) return;

  const { Subscription } = await import('../../db/models/Subscription.js');
  const { getPlatformById } = await import('../../config/plans.js');
  const now = new Date();

  const subs = await Subscription.find({
    telegramId,
    isPremium: true,
    expiresAt: { $gt: now },
  });

  if (subs.length === 0) {
    await ctx.reply('❌ You currently have no active premium subscriptions.');
    return;
  }

  let msg = `👑 <b>Your Active Subscriptions:</b> \n\n`;
  const { Ticket } = await import('../../db/models/Ticket.js');

  for (const s of subs) {
    const p = getPlatformById(s.platformId);
    const expiry = new Date(s.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const pName = p ? `<a href="https://t.me/${p.botUsername}">${p.name}</a>` : `<b>${s.platformId}</b>`;
    
    let ticket = await Ticket.findOne({ telegramId, platformId: s.platformId, status: 'UNUSED' });
    if (!ticket) {
      ticket = await Ticket.create({
        ticketId: `UNV-${Math.floor(1000000 + Math.random() * 9000000)}`,
        telegramId,
        platformId: s.platformId,
        planId: s.planId,
        orderId: s.lastOrderId || `manual_${Date.now()}`
      });
    }

    msg += `• ${pName}: Valid until ${expiry}\n`;
    if (p && p.botUsername) {
      msg += `  👉 <a href="https://t.me/${p.botUsername}?start=claim_${ticket.ticketId}">Click here to Sync/Activate in bot</a>\n\n`;
    } else {
      msg += `  🎟 Ticket: <code>${ticket.ticketId}</code>\n\n`;
    }
  }

  await ctx.reply(msg, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
  });
}

export async function handlePrivacy(ctx) {
  const { config } = await import('../../config/env.js');
  
  const msg = `🛡️ <b>Privacy Policy & Terms</b>\n\nPlease read our Privacy Policy and Terms & Conditions to understand how we handle your data, usage limits, and refund policies.`;
  
  const kb = {
    inline_keyboard: [
      [{ text: '📄 View Privacy Policy', web_app: { url: `${config.serverUrl}/terms` }, style: 'primary' }]
    ]
  };
  
  await ctx.reply(msg, {
    parse_mode: 'HTML',
    reply_markup: kb
  });
}
