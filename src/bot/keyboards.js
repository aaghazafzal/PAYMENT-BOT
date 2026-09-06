import { InlineKeyboard } from 'grammy';
import { PLATFORMS, getPlatformById } from '../config/plans.js';

/**
 * Returns the Main Menu keyboard (for /start)
 */
export function getMainMenuKeyboard() {
  const kb = new InlineKeyboard();
  kb.text('💎 Buy Subscription', 'show_platforms').row();
  kb.url('📢 Official Channel', 'https://t.me/univora88').row();
  kb.url('🌐 Visit Website', 'https://univora.website').row();
  kb.text('❓ Help & Support', 'help_menu').row();
  return kb;
}

/**
 * Returns platform selection keyboard
 */
export function getPlatformsKeyboard() {
  const kb = new InlineKeyboard();
  
  PLATFORMS.forEach(p => {
    kb.text(p.name, `select_platform:${p.id}`).row();
  });
  
  kb.text('💳 My Subscriptions', 'my_subscriptions').row();
  kb.text('🔙 Back to Main Menu', 'back_to_menu').row();
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
 * Returns terms & conditions agreement keyboard
 */
export function getTermsKeyboard(platformId, planId, termsUrl) {
  const kb = new InlineKeyboard();
  kb.url('📄 View Terms & Conditions', termsUrl).row();
  kb.text('✅ Yes, I Agree', `agree_terms:${platformId}:${planId}`).row();
  kb.text('🔙 Back to Plans', `select_platform:${platformId}`);
  return kb;
}

/**
 * Returns payment method selection keyboard
 */
export function getPaymentMethodKeyboard(platformId, planId, amount) {
  const kb = new InlineKeyboard();
  kb.text(`⭐️ Pay with Telegram Stars (XTR)`, `pay_stars:${platformId}:${planId}`).row();
  kb.text(`🌐 Pay Online (UPI / Cards)`, `pay_online:${platformId}:${planId}`).row();
  kb.text('🔙 Back to Plans', `select_platform:${platformId}`);
  return kb;
}

/**
 * Returns checkout keyboard with payment link and manual verify button
 */
export function getCheckoutKeyboard(paymentLink, orderId) {
  const kb = new InlineKeyboard();
  
  kb.url('💳 Pay Online (UPI, Cards, Wallets)', paymentLink).row();
  kb.text('🔄 Verify Payment', `verify_pay:${orderId}`).row();
  kb.text('❌ Cancel / Main Menu', 'back_to_platforms');
  
  return kb;
}
