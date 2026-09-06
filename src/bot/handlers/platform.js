import { PLATFORMS, getPlatformById, getPlan } from '../../config/plans.js';
import { getPlatformsKeyboard, getPlansKeyboard, getCheckoutKeyboard } from '../keyboards.js';
import { Order } from '../../db/models/Order.js';
import { createCashfreeOrder } from '../../services/cashfree.service.js';
import { Subscription } from '../../db/models/Subscription.js';

export async function handlePlatformCallbacks(ctx) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

  if (data === 'show_platforms') {
    const { handleShowPlatforms } = await import('./start.js');
    return handleShowPlatforms(ctx);
  }

  if (data === 'help_menu') {
    await ctx.answerCallbackQuery();
    const helpMsg = 
`❓ *Help & Support*

*How to buy premium?*
1. Click "Buy Subscription".
2. Select the bot you want premium for.
3. Choose your plan.
4. Pay securely via Telegram Stars or Online (Cards/UPI).

*How to activate?*
If you pay with Telegram Stars or Online natively, you will get an Activation Ticket (UNV-XXXX). Send that ticket to the respective bot to instantly claim your premium!

If you face any issues, contact our support team in the Official Channel.`;
    
    const { InlineKeyboard } = await import('grammy');
    const kb = new InlineKeyboard().text('🔙 Back to Menu', 'back_to_menu');
    await ctx.editMessageText(helpMsg, { parse_mode: 'Markdown', reply_markup: kb });
    return;
  }

  if (data === 'back_to_menu') {
    const { handleStart } = await import('./start.js');
    await ctx.answerCallbackQuery();
    await ctx.deleteMessage().catch(() => {});
    return handleStart(ctx); // Re-send the welcome message
  }

  // 1. Back to Platforms
  if (data === 'back_to_platforms') {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText('👇 *Select a platform to choose your plan:*', {
      parse_mode: 'Markdown',
      reply_markup: getPlatformsKeyboard(),
    });
    return;
  }

  // 2. Select Platform -> Show Plans
  if (data.startsWith('select_platform:')) {
    const platformId = data.split(':')[1];
    const platform = getPlatformById(platformId);

    if (!platform) {
      await ctx.answerCallbackQuery({ text: 'Platform not found!', show_alert: true });
      return;
    }

    await ctx.answerCallbackQuery();
    const msg = 
`${platform.icon} *${platform.name}*
_${platform.description}_

Select your desired plan below:`;

    await ctx.editMessageText(msg, {
      parse_mode: 'Markdown',
      reply_markup: getPlansKeyboard(platformId),
    });
    return;
  }

  // 3. Select Plan -> Ask for Payment Method
  if (data.startsWith('select_plan:')) {
    const [, platformId, planId] = data.split(':');
    const platform = getPlatformById(platformId);
    const plan = getPlan(platformId, planId);

    if (!platform || !plan) {
      await ctx.answerCallbackQuery({ text: 'Plan invalid or expired!', show_alert: true });
      return;
    }

    await ctx.answerCallbackQuery();
    
    // Convert INR to Stars (Assume 1 INR = 1 Star for simplicity/safety against Apple 30% tax)
    const starPrice = plan.amount; 

    const methodMsg = 
`💳 *Checkout Created!*

• *Platform:* ${platform.icon} ${platform.name}
• *Plan:* ${plan.name} (${plan.durationDays} Days)
• *Amount:* ₹${plan.amount} (or ⭐️ ${starPrice} Stars)

${plan.features ? plan.features + '\n\n' : ''}_Please choose your preferred payment method below:_`;

    const { getPaymentMethodKeyboard } = await import('../keyboards.js');
    await ctx.editMessageText(methodMsg, {
      parse_mode: 'Markdown',
      reply_markup: getPaymentMethodKeyboard(platformId, planId, plan.amount),
    });
    return;
  }

  // 3A. Pay Online (Cashfree Flow)
  if (data.startsWith('pay_online:')) {
    const [, platformId, planId] = data.split(':');
    const platform = getPlatformById(platformId);
    const plan = getPlan(platformId, planId);

    if (!platform || !plan) return;

    await ctx.answerCallbackQuery({ text: 'Generating Secure Payment Link...' });

    const telegramId = String(ctx.from.id);
    const orderId = `univora_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderId,
      telegramId,
      platformId,
      planId,
      amount: plan.amount,
      durationDays: plan.durationDays,
      status: 'CREATED',
    });
    await order.save();

    const cfOrder = await createCashfreeOrder({
      orderId,
      amount: plan.amount,
      customerId: telegramId,
    });

    if (!cfOrder.success) {
      order.status = 'FAILED';
      await order.save();
      await ctx.reply(`❌ Order creation failed: ${cfOrder.error}`);
      return;
    }

    order.paymentSessionId = cfOrder.paymentSessionId;
    order.paymentLink = cfOrder.paymentLink;
    order.status = 'ACTIVE';
    await order.save();

    const checkoutMsg = 
`🌐 *Online Checkout Ready!*

• *Platform:* ${platform.icon} ${platform.name}
• *Plan:* ${plan.name} (${plan.durationDays === 36500 ? 'Lifetime' : plan.durationDays + ' Days'})
• *Amount:* ₹${plan.amount}

${plan.features ? plan.features + '\n\n' : ''}Click the button below to pay via UPI (GPay, PhonePe, Paytm) or Card.
_Once paid, click Verify Payment._`;

    await ctx.editMessageText(checkoutMsg, {
      parse_mode: 'Markdown',
      reply_markup: getCheckoutKeyboard(cfOrder.paymentLink, orderId),
    });
    return;
  }

  // 3B. Pay with Stars (Telegram Native Flow)
  if (data.startsWith('pay_stars:')) {
    const [, platformId, planId] = data.split(':');
    const platform = getPlatformById(platformId);
    const plan = getPlan(platformId, planId);

    if (!platform || !plan) return;

    await ctx.answerCallbackQuery({ text: 'Preparing Telegram Stars Invoice...' });

    const telegramId = String(ctx.from.id);
    const orderId = `stars_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const starPrice = plan.amount; // 1 INR = 1 Star

    const order = new Order({
      orderId,
      telegramId,
      platformId,
      planId,
      amount: plan.amount, // INR Equivalent amount saved in DB
      paymentMethod: 'TELEGRAM_STARS',
      durationDays: plan.durationDays,
      status: 'CREATED',
    });
    await order.save();

    const title = `${platform.name} Premium`;
    const description = `Activate ${plan.name} (${plan.durationDays} Days) for ${platform.name} via Telegram Stars.`;
    const payload = orderId; // We will use this payload to identify the order upon successful payment
    const currency = 'XTR'; // Telegram Stars Currency
    const prices = [{ label: plan.name, amount: starPrice }];

    // Send the native Telegram invoice
    try {
      await ctx.deleteMessage(); // Delete the current message
      await ctx.replyWithInvoice(
        title,
        description,
        payload,
        currency,
        prices,
        { provider_token: "" } // Explicitly empty for XTR
      );
    } catch (err) {
      console.error('Failed to send invoice:', err);
      await ctx.reply("❌ Error generating Telegram Stars invoice.");
    }
    return;
  }

  // 4. View My Subscriptions
  if (data === 'my_subscriptions') {
    await ctx.answerCallbackQuery();
    const telegramId = String(ctx.from.id);
    const now = new Date();

    const subs = await Subscription.find({
      telegramId,
      isPremium: true,
      expiresAt: { $gt: now },
    });

    if (subs.length === 0) {
      await ctx.editMessageText('❌ You currently have no active premium subscriptions.', {
        reply_markup: getPlatformsKeyboard(),
      });
      return;
    }

    let msg = `👑 *Your Active Subscriptions:* \n\n`;
    subs.forEach(s => {
      const p = getPlatformById(s.platformId);
      const expiry = new Date(s.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      msg += `• ${p ? p.icon : '⭐'} *${p ? p.name : s.platformId}*: Valid until ${expiry}\n`;
    });

    await ctx.editMessageText(msg, {
      parse_mode: 'Markdown',
      reply_markup: getPlatformsKeyboard(),
    });
    return;
  }
}
