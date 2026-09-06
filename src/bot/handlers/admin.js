import { config } from '../../config/env.js';
import { grantSubscription, revokeSubscription } from '../../services/subscription.service.js';
import { Subscription } from '../../db/models/Subscription.js';
import { Order } from '../../db/models/Order.js';

function isAdmin(telegramId) {
  if (!config.adminIds.length) return true; // Default allow if no admin IDs configured yet
  return config.adminIds.includes(String(telegramId));
}

export async function handleAdminCommands(bot) {
  // 1. /admin stats
  bot.command('admin', async (ctx) => {
    if (!isAdmin(ctx.from?.id)) {
      return ctx.reply('⛔ Unauthorized: Admin access only.');
    }

    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ status: 'PAID' });
    const activeSubs = await Subscription.countDocuments({ isPremium: true, expiresAt: { $gt: new Date() } });

    const msg = 
`📊 *Univora Admin Dashboard*

• *Total Orders Created:* ${totalOrders}
• *Successful Payments:* ${paidOrders}
• *Active Premium Users:* ${activeSubs}

*Admin Commands:*
• \`/grant <user_id> <platform_id> <days>\` - Manually grant premium
• \`/revoke <user_id> <platform_id>\` - Manually revoke premium`;

    await ctx.reply(msg, { parse_mode: 'Markdown' });
  });

  // 2. /grant <user_id> <platform_id> <days>
  bot.command('grant', async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return ctx.reply('⛔ Unauthorized.');

    const parts = ctx.message?.text?.split(' ').slice(1);
    if (!parts || parts.length < 3) {
      return ctx.reply('Usage: `/grant <user_id> <platform_id> <days>`', { parse_mode: 'Markdown' });
    }

    const [telegramId, platformId, daysStr] = parts;
    const days = parseInt(daysStr, 10) || 30;

    // Standardize plan ID
    const planId = 'MANUAL_GRANT';
    const durationMs = days * 24 * 60 * 60 * 1000;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMs);

    await Subscription.findOneAndUpdate(
      { telegramId, platformId },
      { telegramId, platformId, planId, isPremium: true, startsAt: now, expiresAt, updatedAt: now },
      { upsert: true }
    );

    await ctx.reply(`✅ Granted *${days} days* of VIP access to user \`${telegramId}\` for platform *${platformId}*.`, { parse_mode: 'Markdown' });
  });

  // 3. /revoke <user_id> <platform_id>
  bot.command('revoke', async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return ctx.reply('⛔ Unauthorized.');

    const parts = ctx.message?.text?.split(' ').slice(1);
    if (!parts || parts.length < 2) {
      return ctx.reply('Usage: `/revoke <user_id> <platform_id>`', { parse_mode: 'Markdown' });
    }

    const [telegramId, platformId] = parts;
    await revokeSubscription(telegramId, platformId);

    await ctx.reply(`❌ Revoked VIP access for user \`${telegramId}\` on platform *${platformId}*.`, { parse_mode: 'Markdown' });
  });
}
