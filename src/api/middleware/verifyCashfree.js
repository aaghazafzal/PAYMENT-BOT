import { verifyCashfreeWebhookSignature } from '../../services/cashfree.service.js';

export function cashfreeWebhookMiddleware(req, res, next) {
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  if (!signature || !timestamp) {
    return res.status(400).json({ status: 'error', message: 'Missing Cashfree signature headers.' });
  }

  const isValid = verifyCashfreeWebhookSignature(rawBody, signature, timestamp);
  if (!isValid) {
    console.warn('🚨 ALERT: Invalid Webhook Signature received from IP:', req.ip);
    return res.status(401).json({ status: 'error', message: 'Invalid webhook signature.' });
  }

  next();
}
