import express from 'express';
import axios from 'axios';
import { config } from '../../config/env.js';
import { cashfreeWebhookMiddleware } from '../middleware/verifyCashfree.js';
import { Order } from '../../db/models/Order.js';
import { Ticket } from '../../db/models/Ticket.js';
import { getCashfreeOrderStatus } from '../../services/cashfree.service.js';
import { grantSubscription } from '../../services/subscription.service.js';
import { sendPaymentReceipt } from '../../services/notify.service.js';

const router = express.Router();

/**
 * Cashfree Incoming Webhook Endpoint (Zero-Trust HMAC Signature Protected)
 */
router.post('/cashfree', cashfreeWebhookMiddleware, async (req, res) => {
  try {
    const payload = req.body;
    const type = payload.type; // e.g. PAYMENT_SUCCESS_WEBHOOK
    const data = payload.data;

    console.log(`📥 Incoming Cashfree Webhook: Event [${type}] for Order [${data?.order?.order_id}]`);

    if (type === 'PAYMENT_SUCCESS_WEBHOOK' && data?.order?.order_id) {
      const orderId = data.order.order_id;
      const order = await Order.findOne({ orderId });

      if (!order) {
        console.warn(`⚠️ Webhook received for unknown orderId: ${orderId}`);
        return res.status(200).json({ status: 'ignored', message: 'Order not found' });
      }

      // Idempotency check: Already processed?
      if (order.status === 'PAID') {
        console.log(`ℹ️ Order ${orderId} is already marked PAID. Skipping duplicate webhook processing.`);
        return res.status(200).json({ status: 'success', message: 'Already processed.' });
      }

      // Authoritative Double Verification directly from Cashfree Server
      const cfStatus = await getCashfreeOrderStatus(orderId);

      if (cfStatus.success && cfStatus.orderStatus === 'PAID') {
        // Price Matching Guard
        if (cfStatus.orderAmount < order.amount) {
          console.error(`🚨 ALERT: Webhook amount mismatch for order ${orderId}! Expected: ${order.amount}, Received: ${cfStatus.orderAmount}`);
          return res.status(400).json({ status: 'error', message: 'Amount mismatch' });
        }

        order.status = 'PAID';
        order.cfPaymentId = cfStatus.cfPaymentId || data.payment?.cf_payment_id || '';
        order.verifiedAt = new Date();
        order.rawWebhookData = payload;
        await order.save();

        if (order.isGatewayOrder && order.callbackUrl) {
          console.log(`🌐 Dispatching Webhook to Target Bot: ${order.targetBot} at ${order.callbackUrl}`);
          try {
            await axios.post(order.callbackUrl, {
              status: 'SUCCESS',
              orderId: order.orderId,
              userId: order.telegramId,
              planId: order.planId,
              platformId: order.platformId,
              amount: order.amount,
              timestamp: new Date().toISOString()
            }, {
              headers: {
                'x-ecosystem-secret': config.ecosystemSecret
              }
            });
            order.webhookSent = true;
            await order.save();
            console.log(`✅ Outbound Webhook delivered successfully to ${order.targetBot}`);
          } catch (wbhkErr) {
            console.error(`🚨 Failed to deliver webhook to ${order.targetBot}:`, wbhkErr.message);
          }
        } else {
          // Internal Database Update for Payment Bot
          const sub = await grantSubscription({
            telegramId: order.telegramId,
            platformId: order.platformId,
            planId: order.planId,
            orderId: order.orderId,
          });

          // Generate Claim Ticket for Option 2 Ecosystem Setup
          const ticketId = `UNV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const newTicket = new Ticket({
            ticketId,
            telegramId: order.telegramId,
            platformId: order.platformId,
            planId: order.planId,
            orderId: order.orderId,
          });
          await newTicket.save();

          await sendPaymentReceipt({
            telegramId: order.telegramId,
            orderId: order.orderId,
            platformId: order.platformId,
            planId: order.planId,
            amount: order.amount,
            expiresAt: sub.expiresAt,
            ticketId: ticketId
          });
          console.log(`✅ Webhook verified & Premium granted internally to ${order.telegramId} for ${order.platformId}. Ticket: ${ticketId}`);
        }
      }
    }

    // Always respond 200 OK to Cashfree webhooks if signature passed
    return res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('❌ Error handling Cashfree Webhook:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

export default router;
