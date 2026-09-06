import { bot } from '../bot/index.js';
import { getPlatformById, getPlan } from '../config/plans.js';

/**
 * Sends payment success receipt and active subscription details to the user via Telegram Bot.
 */
export async function sendPaymentReceipt({ telegramId, orderId, platformId, planId, amount, expiresAt, ticketId }) {
  if (!bot) return;

  const platform = getPlatformById(platformId);
  const plan = getPlan(platformId, planId);

  const expiryFormatted = new Date(expiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // Decide the username of the target bot based on platform (Hardcoded examples, adjust as needed)
  let targetBotUsername = '';
  if (platformId === 'CINEMAHUB') targetBotUsername = 'CinemaHubBot';
  if (platformId === 'SHAREBOX') targetBotUsername = 'ShareBoxBot';
  if (platformId === 'FORWARD') targetBotUsername = 'ForwardBot';

  let ticketText = '';
  if (ticketId && targetBotUsername) {
    ticketText = `\n\n🎯 *Action Required:*\nClick the link below to instantly activate this plan in ${platform ? platform.name : platformId}:\n👉 [Click to Activate!](https://t.me/${targetBotUsername}?start=claim_${ticketId})`;
  } else if (ticketId) {
    ticketText = `\n\n🎯 *Activation Ticket:*\nUse this code in the target bot to activate: \`${ticketId}\``;
  }

  const message = 
`🎉 *Payment Successful!*

✨ *Order Details:*
• *Order ID:* \`${orderId}\`
• *Platform:* ${platform ? platform.name : platformId}
• *Plan:* ${plan ? plan.name : planId}
• *Amount Paid:* ₹${amount}
• *Valid Until:* *${expiryFormatted}*${ticketText}

🚀 Thank you for choosing Univora.`;

  try {
    await bot.api.sendMessage(telegramId, message, { parse_mode: 'Markdown' });
  } catch (err) {
    console.error(`❌ Failed to send Telegram receipt to ${telegramId}:`, err.message);
  }
}
