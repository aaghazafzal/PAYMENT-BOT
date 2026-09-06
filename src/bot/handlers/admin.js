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
  // 4. /broadcast (reply to a message)
  bot.command('broadcast', async (ctx) => {
    if (!isAdmin(ctx.from?.id)) return;
    
    if (!ctx.message.reply_to_message) {
      return ctx.reply('⚠️ Please reply to the message you want to broadcast with `/broadcast`', { parse_mode: 'Markdown' });
    }

    const messageIdToCopy = ctx.message.reply_to_message.message_id;
    const adminId = ctx.from.id;

    broadcastState.set(adminId, messageIdToCopy);

    const { InlineKeyboard } = await import('grammy');
    const kb = new InlineKeyboard();
    kb.text('📌 Yes, Pin it', `br_start:pin`).row();
    kb.text('📤 No, Just Send', `br_start:nopin`).row();
    kb.text('❌ Cancel', `br_cancel`);

    await ctx.reply('📢 *Broadcast Ready*\n\nDo you want to automatically pin this message for all users when they receive it?', {
      parse_mode: 'Markdown',
      reply_markup: kb
    });
  });
}

const broadcastState = new Map(); // AdminId -> MessageId

export async function handleAdminCallbacks(ctx) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  const adminId = ctx.from.id;
  if (!isAdmin(adminId)) {
    return ctx.answerCallbackQuery('⛔ Unauthorized.');
  }

  if (data === 'br_cancel') {
    broadcastState.delete(adminId);
    await ctx.editMessageText('❌ Broadcast Cancelled.');
    return;
  }

  if (data.startsWith('br_start:')) {
    const shouldPin = data.split(':')[1] === 'pin';
    const messageId = broadcastState.get(adminId);
    
    if (!messageId) {
      return ctx.editMessageText('❌ Broadcast state expired or invalid. Please reply to the message with /broadcast again.');
    }

    await ctx.editMessageText('⏳ *Broadcast is running...*', { parse_mode: 'Markdown' });
    
    // Import User model
    const { User } = await import('../../db/models/User.js');
    const users = await User.find({}, 'telegramId');
    
    let success = 0, failed = 0, blocked = 0, deleted = 0;
    const startTime = Date.now();
    const total = users.length;

    // Send asynchronously in chunks to prevent blocking
    // In a real large-scale prod app, you would use a bull queue, 
    // but for 2-5k users, this simple loop with a small delay works fine.
    for (const user of users) {
      try {
        const sentMsg = await ctx.api.copyMessage(user.telegramId, ctx.chat.id, messageId);
        
        if (shouldPin && sentMsg.message_id) {
          try {
            await ctx.api.pinChatMessage(user.telegramId, sentMsg.message_id, { disable_notification: false });
          } catch (e) {
            // ignore pin errors
          }
        }
        success++;
      } catch (err) {
        const desc = err.description || '';
        if (desc.includes('bot was blocked by the user')) blocked++;
        else if (desc.includes('user is deactivated') || desc.includes('deleted')) deleted++;
        else failed++;
      }
      
      // Prevent flood limits (approx 30 msgs / sec)
      await new Promise(res => setTimeout(res, 35));
    }

    const timeSecs = Math.floor((Date.now() - startTime) / 1000);
    broadcastState.delete(adminId);

    const summary = 
`✅ *Broadcast Completed.*

🕒 Time: ${timeSecs}s
👥 Total: ${total}
📬 Success: ${success}
⛔ Blocked: ${blocked}
🗑️ Deleted: ${deleted}
❌ Failed: ${failed}`;

    await ctx.editMessageText(summary, { parse_mode: 'Markdown' });
  }
}
