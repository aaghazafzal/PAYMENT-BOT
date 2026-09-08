import { PLATFORMS, getPlatformById } from '../config/plans.js';

/**
 * Returns the Main Menu keyboard (for /start)
 */
export function getMainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '💎 Buy Subscription', callback_data: 'show_platforms', style: 'primary' }],
      [
        { text: '📢 Official Channel', url: 'https://t.me/UnivoraOfficial', style: 'primary' },
        { text: '🌐 Visit Website', url: 'https://univora.website', style: 'primary' }
      ],
      [
        { text: '❓ Help & Support', callback_data: 'help_menu', style: 'success' },
        { text: '🐞 Report Issue', callback_data: 'report_issue', style: 'danger' }
      ]
    ]
  };
}

/**
 * Returns platform selection keyboard
 */
export function getPlatformsKeyboard() {
  const inline_keyboard = [];
  
  PLATFORMS.forEach(p => {
    inline_keyboard.push([{ text: p.name, callback_data: `select_platform:${p.id}`, style: 'primary' }]);
  });
  
  inline_keyboard.push([{ text: '🔙 Back to Main Menu', callback_data: 'back_to_menu', style: 'danger' }]);
  
  return { inline_keyboard };
}

/**
 * Returns plan selection keyboard for a chosen platform
 */
export function getPlansKeyboard(platformId) {
  const platform = getPlatformById(platformId);
  const inline_keyboard = [];

  if (platform && platform.plans) {
    platform.plans.forEach(plan => {
      inline_keyboard.push([{ text: `⭐ ${plan.name} - ₹${plan.amount}`, callback_data: `select_plan:${platformId}:${plan.id}`, style: 'success' }]);
    });
  }

  inline_keyboard.push([{ text: '🔙 Back to Platforms', callback_data: 'back_to_platforms', style: 'danger' }]);
  
  return { inline_keyboard };
}

/**
 * Returns terms & conditions agreement keyboard
 */
export function getTermsKeyboard(platformId, planId, termsUrl) {
  return {
    inline_keyboard: [
      [{ text: '📄 View Terms & Conditions', web_app: { url: termsUrl }, style: 'primary' }],
      [{ text: '✅ Yes, I Agree', callback_data: `agree_terms:${platformId}:${planId}`, style: 'success' }],
      [{ text: '🔙 Back to Plans', callback_data: `select_platform:${platformId}`, style: 'danger' }]
    ]
  };
}

/**
 * Returns payment method selection keyboard
 */
export function getPaymentMethodKeyboard(platformId, planId, amount) {
  return {
    inline_keyboard: [
      [{ text: `⭐️ Pay with Telegram Stars (XTR)`, callback_data: `pay_stars:${platformId}:${planId}`, style: 'primary' }],
      [{ text: `🌐 Pay Online (UPI / Cards)`, callback_data: `pay_online:${platformId}:${planId}`, style: 'success' }],
      [{ text: '🔙 Back to Plans', callback_data: `select_platform:${platformId}`, style: 'danger' }]
    ]
  };
}

/**
 * Returns checkout keyboard with payment link and manual verify button
 */
export function getCheckoutKeyboard(paymentLink, orderId) {
  return {
    inline_keyboard: [
      [{ text: '💳 Pay Online (UPI, Cards, Wallets)', url: paymentLink, style: 'success' }],
      [{ text: '🔄 Verify Payment', callback_data: `verify_pay:${orderId}`, style: 'primary' }],
      [{ text: '❌ Cancel / Main Menu', callback_data: 'back_to_platforms', style: 'danger' }]
    ]
  };
}
