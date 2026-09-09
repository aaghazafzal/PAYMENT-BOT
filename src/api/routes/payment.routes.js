import express from 'express';
import { config } from '../../config/env.js';
import { Order } from '../../db/models/Order.js';
import { createCashfreeOrder, getCashfreeOrderStatus } from '../../services/cashfree.service.js';
import { grantSubscription } from '../../services/subscription.service.js';
import { sendPaymentReceipt } from '../../services/notify.service.js';
import { getPlan } from '../../config/plans.js';

const router = express.Router();

/**
 * Creates a Cashfree payment order for a Telegram user
 */
router.post('/create-order', async (req, res) => {
  try {
    const { telegramId, platformId, planId } = req.body;

    if (!telegramId || !platformId || !planId) {
      return res.status(400).json({ status: 'error', message: 'Missing telegramId, platformId, or planId.' });
    }

    const plan = getPlan(platformId, planId);
    if (!plan) {
      return res.status(400).json({ status: 'error', message: 'Invalid platform or plan ID.' });
    }

    const orderId = `univora_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const order = new Order({
      orderId,
      telegramId: String(telegramId),
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
      return res.status(500).json({ status: 'error', message: cfOrder.error });
    }

    order.paymentSessionId = cfOrder.paymentSessionId;
    order.paymentLink = cfOrder.paymentLink;
    order.status = 'ACTIVE';
    await order.save();

    return res.json({
      status: 'success',
      data: {
        orderId,
        paymentLink: cfOrder.paymentLink,
        amount: plan.amount,
        planName: plan.name,
      },
    });
  } catch (err) {
    console.error('❌ Error in /create-order:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Direct Double-Verification of an order from Cashfree Servers
 */
router.get('/verify-order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });

    if (!order) {
      return res.status(404).json({ status: 'error', message: 'Order not found.' });
    }

    if (order.status === 'PAID') {
      return res.json({
        status: 'success',
        message: 'Order is already paid & premium activated.',
        isPaid: true,
      });
    }

    // Direct Server-to-Server Cashfree Status Polling
    const cfStatus = await getCashfreeOrderStatus(orderId);

    if (cfStatus.success && cfStatus.orderStatus === 'PAID') {
      // Amount Security Integrity Check
      if (cfStatus.orderAmount < order.amount) {
        console.error(`🚨 ALERT: Amount mismatch for order ${orderId}! Expected: ${order.amount}, Got: ${cfStatus.orderAmount}`);
        return res.status(400).json({ status: 'error', message: 'Payment amount mismatch detected.' });
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
          const { sendPaymentReceipt } = await import('../../services/notify.service.js');
          await sendPaymentReceipt({
            telegramId: order.telegramId,
            orderId: order.orderId,
            platformId: order.platformId,
            planId: order.planId,
            amount: order.amount,
            expiresAt: sub.expiresAt,
            ticketId: ''
          });

      await sendPaymentReceipt({
        telegramId: order.telegramId,
        orderId: order.orderId,
        platformId: order.platformId,
        planId: order.planId,
        amount: order.amount,
        expiresAt: sub.expiresAt,
      });

      return res.json({
        status: 'success',
        message: 'Payment verified! Premium access granted.',
        isPaid: true,
        expiresAt: sub.expiresAt,
      });
    }

    return res.json({
      status: 'pending',
      message: `Payment status is ${cfStatus.orderStatus || 'PENDING'}. Please complete payment.`,
      isPaid: false,
    });
  } catch (err) {
    console.error(`❌ Error verifying order ${req.params.orderId}:`, err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * Cashfree SDK v3 Hosted Checkout Launcher Endpoint
 */
router.get('/checkout', (req, res) => {
  const { session_id } = req.query;
  const envMode = config.cashfree.env === 'PRODUCTION' ? 'production' : 'sandbox';
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Univora VIP Payment Gateway</title>
      <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
      <style>
        body { background: #0a0a0a; color: #fff; font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .card { background: #141414; border: 1px solid #ff6b00; padding: 2rem; border-radius: 12px; text-align: center; max-width: 380px; box-shadow: 0 8px 24px rgba(255,107,0,0.2); }
        .spinner { border: 4px solid #222; border-top: 4px solid #ff6b00; border-radius: 50%; width: 44px; height: 44px; animation: spin 1s linear infinite; margin: 0 auto 15px; }
        h2 { color: #ff6b00; margin: 0 0 10px 0; font-size: 1.25rem; }
        p { color: #aaa; font-size: 0.9rem; margin: 0; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="spinner"></div>
        <h2>Opening Cashfree Payment Gateway...</h2>
        <p>Connecting securely to Cashfree for Univora VIP Access.</p>
      </div>
      <script>
        try {
          const cashfree = Cashfree({ mode: "${envMode}" });
          cashfree.checkout({
            paymentSessionId: "${session_id}",
            redirectTarget: "_self"
          });
        } catch (err) {
          document.body.innerHTML = '<h3 style="color:red">Checkout initialization error. Please try again.</h3>';
        }
      </script>
    </body>
    </html>
  `);
});

/**
 * Return URL landing page after checkout
 */
router.get('/callback', async (req, res) => {
  const { order_id } = req.query;
  try {
    const order = await Order.findOne({ orderId: order_id });
    if (!order) {
      return res.send('<h2>Order not found</h2>');
    }

    let isPaid = order.status === 'PAID';
    
    // Fallback Verification if webhook missed
    if (!isPaid) {
      const cfStatus = await getCashfreeOrderStatus(order_id);
      if (cfStatus.success && cfStatus.orderStatus === 'PAID') {
        order.status = 'PAID';
        order.cfPaymentId = cfStatus.cfPaymentId || '';
        order.verifiedAt = new Date();
        await order.save();

        if (order.isGatewayOrder && order.callbackUrl) {
          const axios = (await import('axios')).default;
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
              headers: { 'x-ecosystem-secret': (await import('../../config/env.js')).config.ecosystemSecret }
            });
            order.webhookSent = true;
            await order.save();
          } catch (e) {
            console.error('Webhook fail in callback:', e.message);
          }
        } else {
          const sub = await grantSubscription({
            telegramId: order.telegramId,
            platformId: order.platformId,
            planId: order.planId,
            orderId: order.orderId,
          });
        }
        isPaid = true;
      }
    }

    // Redirect to the Bot
    let targetBotUsername = "PAYMENT_UNIVORABOT";
    if (order.targetBot === "STREAMDROP") targetBotUsername = "STREAM_DROP_BOT";
    else if (order.targetBot === "CINEMAHUB") targetBotUsername = "CinemaHubBot"; // fallback guess
    
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful</title>
        <script>
          setTimeout(() => {
            window.location.href = "tg://resolve?domain=${targetBotUsername}";
          }, 1500);
        </script>
        <style>
          body { background: #0a0a0a; color: #fff; font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; }
          .card { background: #141414; border: 1px solid #00ff00; padding: 2rem; border-radius: 12px; }
          h1 { color: #00ff00; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>✅ Payment Verified!</h1>
          <p>Redirecting back to Telegram...</p>
          <a style="color: #00ff00" href="tg://resolve?domain=${targetBotUsername}">Click here if not redirected</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    res.send('<h2>Error verifying payment</h2>');
  }
});

/**
 * Cashfree Server-to-Server Webhook
 * Automatically activates subscription as soon as payment succeeds
 */
router.post('/webhook', async (req, res) => {
  try {
    // req.body is already parsed by express.json()
    const payload = req.body;
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    // Check webhook signature if implemented:
    // const { verifyCashfreeWebhookSignature } = await import('../../services/cashfree.service.js');
    // if (!verifyCashfreeWebhookSignature(req.rawBody, signature, timestamp)) return res.status(403).send('Invalid Signature');

    if (payload && payload.data && payload.data.order) {
      const orderId = payload.data.order.order_id;
      const orderAmount = payload.data.order.order_amount;
      
      const order = await Order.findOne({ orderId });
      if (order && order.status !== 'PAID') {
        const cfStatus = await getCashfreeOrderStatus(orderId);
        
        if (cfStatus.success && cfStatus.orderStatus === 'PAID') {
          order.status = 'PAID';
          order.cfPaymentId = cfStatus.cfPaymentId || '';
          order.verifiedAt = new Date();
          await order.save();

          if (order.isGatewayOrder && order.callbackUrl) {
            const axios = (await import('axios')).default;
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
                headers: { 'x-ecosystem-secret': (await import('../../config/env.js')).config.ecosystemSecret }
              });
              order.webhookSent = true;
              await order.save();
            } catch (e) {
              console.error('Webhook fail in S2S webhook:', e.message);
            }
          } else {
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
          }
          console.log(`✅ Webhook verified & activated order: ${orderId}`);
        }
      }
    }
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Webhook Error');
  }
});

export default router;
