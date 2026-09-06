import { Subscription } from '../db/models/Subscription.js';
import { Order } from '../db/models/Order.js';
import { getPlan } from '../config/plans.js';

/**
 * Grants or extends a user's subscription for a given platform.
 */
export async function grantSubscription({ telegramId, platformId, planId, orderId = '' }) {
  const plan = getPlan(platformId, planId);
  if (!plan) {
    throw new Error(`Plan configuration not found for platform: ${platformId}, plan: ${planId}`);
  }

  const durationMs = plan.durationDays * 24 * 60 * 60 * 1000;
  const now = new Date();

  let subscription = await Subscription.findOne({ telegramId, platformId });

  let startsAt = now;
  let expiresAt = new Date(now.getTime() + durationMs);

  if (subscription && subscription.expiresAt > now) {
    // Extend existing active subscription
    startsAt = subscription.startsAt;
    expiresAt = new Date(subscription.expiresAt.getTime() + durationMs);
  }

  subscription = await Subscription.findOneAndUpdate(
    { telegramId, platformId },
    {
      telegramId,
      platformId,
      planId,
      isPremium: true,
      startsAt,
      expiresAt,
      lastOrderId: orderId,
      updatedAt: now,
    },
    { upsert: true, new: true }
  );

  // Update order status if orderId provided
  if (orderId) {
    await Order.findOneAndUpdate(
      { orderId },
      { status: 'PAID', verifiedAt: now }
    );
  }

  return subscription;
}

/**
 * Checks if a user has an active subscription for a specific platform.
 * Supports All-Access Pass check automatically.
 */
export async function checkSubscriptionStatus(telegramId, platformId) {
  const now = new Date();

  // First check platform-specific subscription
  let sub = await Subscription.findOne({
    telegramId,
    platformId,
    isPremium: true,
    expiresAt: { $gt: now },
  });

  // If not found, check if user has active ALL-ACCESS PASS
  if (!sub && platformId !== 'UNIVORA_ALL_ACCESS') {
    sub = await Subscription.findOne({
      telegramId,
      platformId: 'UNIVORA_ALL_ACCESS',
      isPremium: true,
      expiresAt: { $gt: now },
    });
  }

  if (!sub) {
    return {
      isPremium: false,
      telegramId,
      platformId,
      expiresAt: null,
      daysRemaining: 0,
    };
  }

  const msRemaining = sub.expiresAt.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  return {
    isPremium: true,
    telegramId,
    platformId: sub.platformId,
    planId: sub.planId,
    startsAt: sub.startsAt,
    expiresAt: sub.expiresAt,
    daysRemaining,
  };
}

/**
 * Revokes a user's subscription (Admin tool)
 */
export async function revokeSubscription(telegramId, platformId) {
  return await Subscription.findOneAndUpdate(
    { telegramId, platformId },
    { isPremium: false, expiresAt: new Date(0) },
    { new: true }
  );
}
