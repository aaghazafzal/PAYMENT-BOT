import { PLATFORMS, getPlatformById, getPlan } from '../../config/plans.js';
import { getPlatformsKeyboard, getPlansKeyboard, getCheckoutKeyboard } from '../keyboards.js';
import { Order } from '../../db/models/Order.js';
import { createCashfreeOrder } from '../../services/cashfree.service.js';
import { Subscription } from '../../db/models/Subscription.js';

export async function handlePlatformCallbacks(ctx) {
  const data = ctx.callbackQuery?.data;
  if (!data) return;

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

  // 3. Select Plan -> Generate Cashfree Payment Order
  if (data.startsWith('select_plan:')) {
    const [, platformId, planId] = data.split(':');
    const platform = getPlatformById(platformId);
    const plan = getPlan(platformId, planId);

    if (!platform || !plan) {
      await ctx.answerCallbackQuery({ text: 'Plan invalid or expired!', show_alert: true });
      return;
    }

    await ctx.answerCallbackQuery({ text: 'Creating Cashfree Order...' });

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
`💳 *Checkout Created!*

• *Platform:* ${platform.icon} ${platform.name}
• *Plan:* ${plan.name} (${plan.durationDays} Days)
• *Total Amount:* ₹${plan.amount}
• *Order ID:* \`${orderId}\`

Click the button below to pay via UPI (GPay, PhonePe, Paytm) or Card. Once paid, click *Verify Payment*!`;

    await ctx.editMessageText(checkoutMsg, {
      parse_mode: 'Markdown',
      reply_markup: getCheckoutKeyboard(cfOrder.paymentLink, orderId),
    });
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
