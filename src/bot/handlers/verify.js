import { Order } from '../../db/models/Order.js';
import { getCashfreeOrderStatus } from '../../services/cashfree.service.js';
import { grantSubscription } from '../../services/subscription.service.js';
import { sendPaymentReceipt } from '../../services/notify.service.js';

export async function handleVerifyPayment(ctx) {
  const data = ctx.callbackQuery?.data;
  if (!data || !data.startsWith('verify_pay:')) return;

  const orderId = data.split(':')[1];
  await ctx.answerCallbackQuery({ text: 'Verifying payment with Cashfree...' });

  const order = await Order.findOne({ orderId });
  if (!order) {
    await ctx.reply('❌ Order not found or expired.');
    return;
  }

  if (order.status === 'PAID') {
    await ctx.reply('✅ Payment is already verified! Your VIP subscription is active.');
    return;
  }

  // Direct Server-to-Server Double Check API Call
  const cfStatus = await getCashfreeOrderStatus(orderId);

  if (cfStatus.success && cfStatus.orderStatus === 'PAID') {
    // Amount Integrity Check
    if (cfStatus.orderAmount < order.amount) {
      await ctx.reply('🚨 Payment verification failed: Amount paid does not match plan price.');
      return;
    }

    order.status = 'PAID';
    order.cfPaymentId = cfStatus.cfPaymentId;
    order.verifiedAt = new Date();
    await order.save();

    const sub = await grantSubscription({
      telegramId: order.telegramId,
      platformId: order.platformId,
      planId: order.planId,
      orderId: order.orderId,
    });

    await sendPaymentReceipt({
      telegramId: order.telegramId,
      orderId: order.orderId,
      platformId: order.platformId,
      planId: order.planId,
      amount: order.amount,
      expiresAt: sub.expiresAt,
    });

    await ctx.reply('🎉 *Payment Verified Successfully!* Your subscription is now active.', { parse_mode: 'Markdown' });
  } else {
    await ctx.reply(`⚠️ Payment status: *${cfStatus.orderStatus || 'PENDING'}*. Please complete the payment on Cashfree first!`, { parse_mode: 'Markdown' });
  }
}
