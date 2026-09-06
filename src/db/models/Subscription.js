import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, index: true },
  platformId: { type: String, required: true, index: true },
  planId: { type: String, required: true },
  isPremium: { type: Boolean, default: true, index: true },
  startsAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true, index: true },
  lastOrderId: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
});

// Composite unique index: One subscription entry per user per platform
subscriptionSchema.index({ telegramId: 1, platformId: 1 }, { unique: true });

export const Subscription = mongoose.model('Subscription', subscriptionSchema);
