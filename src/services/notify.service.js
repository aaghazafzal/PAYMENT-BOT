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
  let autoActivationSuccess = false;
  
  if (platformId === 'STREAMDROP' || platformId === 'CINEMAHUB' || platformId === 'EXTRACT_X' || platformId === 'SHARE_BOX') {
    try {
        const { config } = await import('../config/env.js');
        const axios = (await import('axios')).default;
        
        let webhookUrl = '';
        if (platformId === 'STREAMDROP') {
          webhookUrl = 'https://streamdrop.site/webhook/payment-success';
        } else if (platformId === 'CINEMAHUB') {
          webhookUrl = 'https://bot.cinemahub.biz/webhook/payment-success';
        } else if (platformId === 'EXTRACT_X') {
          webhookUrl = 'http://140.245.217.183/extractx/webhook/payment-success';
        } else if (platformId === 'SHARE_BOX') {
          webhookUrl = process.env.SHARE_BOX_WEBHOOK || 'http://localhost:9090/webhook/payment-success';
        }
        
        await axios.post(webhookUrl, {
          status: 'SUCCESS',
          orderId: orderId,
          userId: telegramId,
          planId: planId,
          platformId: platformId,
          amount: amount,
          timestamp: new Date().toISOString()
        }, {
          headers: { 'x-ecosystem-secret': config.ecosystemSecret },
          timeout: 5000
        });
        console.log(`✅ Auto-Activation Webhook sent to ${platformId}!`);
        autoActivationSuccess = true;
    } catch (err) {
        console.error(`🚨 Failed to auto-activate ${platformId}:`, err.message);
    }
  }

  if (autoActivationSuccess) {
    ticketText = `\n\n✅ <b>Automatic Activation:</b>\nYour plan has been automatically activated in ${platform.name}! You can now return to the bot and start using your premium features.`;
  } else if (ticketId && targetBotUsername) {
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
