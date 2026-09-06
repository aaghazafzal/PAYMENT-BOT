import { bot } from '../bot/index.js';
import { getPlatformById, getPlan } from '../config/plans.js';

/**
 * Sends payment success receipt and active subscription details to the user via Telegram Bot.
 */
export async function sendPaymentReceipt({ telegramId, orderId, platformId, planId, amount, expiresAt }) {
  if (!bot) return;

  const platform = getPlatformById(platformId);
  const plan = getPlan(platformId, planId);

  const expiryFormatted = new Date(expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const message = 
`🎉 *Payment Successful & Premium Activated!*

✨ *Order Details:*
• *Order ID:* \`${orderId}\`
• *Platform:* ${platform ? platform.name : platformId}
• *Plan:* ${plan ? plan.name : planId}
• *Amount Paid:* ₹${amount}
• *Valid Until:* *${expiryFormatted}*

🚀 Your premium access has been enabled across the Univora ecosystem!
Thank you for choosing Univora.`;

  try {
    await bot.api.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`❌ Failed to send Telegram receipt to ${telegramId}:`, err.message);
  }
}
