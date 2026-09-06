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

  const targetBotUsername = platform ? platform.botUsername : '';

  let ticketText = '';
  if (ticketId && targetBotUsername) {
    ticketText = `\n\n🎯 <b>Action Required:</b>\nClick the link below to instantly activate this plan in <a href="https://t.me/${targetBotUsername}">${platform.name}</a>:\n👉 <a href="https://t.me/${targetBotUsername}?start=claim_${ticketId}">Click to Activate!</a>`;
  } else if (ticketId) {
    ticketText = `\n\n🎯 <b>Activation Ticket:</b>\nUse this code in the target bot to activate: <code>${ticketId}</code>`;
  }

  const pName = platform ? `<a href="https://t.me/${platform.botUsername}">${platform.name}</a>` : platformId;

  const message = 
`🎉 <b>Payment Successful!</b>

✨ <b>Order Details:</b>
• <b>Order ID:</b> <code>${orderId}</code>
• <b>Platform:</b> ${pName}
• <b>Plan:</b> ${plan ? plan.name : planId}
• <b>Amount Paid:</b> ₹${amount}
• <b>Valid Until:</b> <b>${expiryFormatted}</b>${ticketText}

🚀 Thank you for choosing Univora.`;

  try {
    await bot.api.sendMessage(telegramId, message, { parse_mode: 'HTML', disable_web_page_preview: true });
  } catch (err) {
    console.error(`❌ Failed to send Telegram receipt to ${telegramId}:`, err.message);
  }
}
