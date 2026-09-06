import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  telegramId: { type: String, required: true, index: true },
  platformId: { type: String, required: true },
  planId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  durationDays: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['CREATED', 'ACTIVE', 'PAID', 'FAILED', 'EXPIRED'], 
    default: 'CREATED',
    index: true
  },
  paymentSessionId: { type: String, default: '' },
  paymentLink: { type: String, default: '' },
  isGatewayOrder: { type: Boolean, default: false },
  targetBot: { type: String },
  callbackUrl: { type: String },
  cfPaymentId: { type: String, default: '' }, // Cashfree payment ID
  paymentMethod: { type: String, default: '' },
  verifiedAt: { type: Date, default: null },
  rawWebhookData: { type: Object, default: null },
  createdAt: { type: Date, default: Date.now, expires: '7d' } // Order record cleanup after 7 days if unpaid
});

export const Order = mongoose.model('Order', orderSchema);
