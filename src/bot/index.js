import { Bot } from 'grammy';
import { config } from '../config/env.js';
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
  const { handleStart, handleShowPlatforms } = await import('./handlers/start.js');
  bot.command('start', handleStart);
  bot.command(['buy', 'premium', 'plans', 'subscribe'], handleShowPlatforms);

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

  // Handle Telegram Stars Pre-Checkout
  bot.on('pre_checkout_query', async (ctx) => {
    // Answer the pre-checkout query so Telegram knows we are ready to process the payment
    await ctx.answerPreCheckoutQuery(true).catch(console.error);
  });

  // Handle Telegram Stars Successful Payment
  bot.on('message:successful_payment', async (ctx) => {
    const payment = ctx.message.successful_payment;
    const orderId = payment.invoice_payload; // This is the orderId we sent in replyWithInvoice

    try {
      // Import here to avoid circular dependencies if any
      const { Order } = await import('../db/models/Order.js');
      const { grantSubscription } = await import('../services/subscription.service.js');
      const { sendPaymentReceipt } = await import('../services/notify.service.js');
      const { Ticket } = await import('../db/models/Ticket.js');

      const order = await Order.findOne({ orderId });
      
      if (!order) {
        return ctx.reply("❌ Order not found in database.");
      }
      
      if (order.status === 'PAID') {
        return ctx.reply("ℹ️ This order is already processed.");
      }

      order.status = 'PAID';
      order.verifiedAt = new Date();
      order.paymentMethod = 'TELEGRAM_STARS';
      order.rawWebhookData = payment; // Store telegram payment info
      await order.save();

      // Grant internal subscription
      const sub = await grantSubscription({
        telegramId: order.telegramId,
        platformId: order.platformId,
        planId: order.planId,
        orderId: order.orderId,
      });

      // Generate Ticket for Option 2
      const ticketId = `UNV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const newTicket = new Ticket({
        ticketId,
        telegramId: order.telegramId,
        platformId: order.platformId,
        planId: order.planId,
        orderId: order.orderId,
      });
      await newTicket.save();

      // Send Receipt
      await sendPaymentReceipt({
        telegramId: order.telegramId,
        orderId: order.orderId,
        platformId: order.platformId,
        planId: order.planId,
        amount: order.amount,
        expiresAt: sub.expiresAt,
        ticketId: ticketId
      });

    } catch (err) {
      console.error('❌ Error processing Stars payment:', err);
      await ctx.reply("❌ Error processing your Stars payment. Please contact support.");
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
