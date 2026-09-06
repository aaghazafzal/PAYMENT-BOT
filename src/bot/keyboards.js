import { InlineKeyboard } from 'grammy';
import { PLATFORMS, getPlatformById } from '../config/plans.js';

/**
 * Returns platform selection keyboard
 */
export function getPlatformsKeyboard() {
  const kb = new InlineKeyboard();
  
  PLATFORMS.forEach(p => {
    kb.text(`${p.icon} ${p.name}`, `select_platform:${p.id}`).row();
  });
  
  kb.text('💳 My Subscriptions', 'my_subscriptions').row();
  return kb;
}

/**
 * Returns plan selection keyboard for a chosen platform
 */
export function getPlansKeyboard(platformId) {
  const platform = getPlatformById(platformId);
  const kb = new InlineKeyboard();

  if (platform && platform.plans) {
    platform.plans.forEach(plan => {
      kb.text(`⭐ ${plan.name} - ₹${plan.amount}`, `select_plan:${platformId}:${plan.id}`).row();
    });
  }

  kb.text('🔙 Back to Platforms', 'back_to_platforms');
  return kb;
}

/**
 * Returns checkout keyboard with payment link and manual verify button
 */
export function getCheckoutKeyboard(paymentLink, orderId) {
  const kb = new InlineKeyboard();
  
  kb.url('💳 Pay via UPI / Cards (Cashfree)', paymentLink).row();
  kb.text('🔄 Verify Payment', `verify_pay:${orderId}`).row();
  kb.text('🔙 Main Menu', 'back_to_platforms');
  
  return kb;
}
