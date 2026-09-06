// ==========================================
// UNIVORA ECOSYSTEM PAYMENT CLIENT
// Drop this file into your other bots (CinemaHub, ShareBox, etc.)
// ==========================================

import axios from 'axios';

// Required environment variables for target bot
const PAYMENT_SERVER_URL = process.env.PAYMENT_SERVER_URL || 'https://payment.univora.website';
const ECOSYSTEM_SECRET = process.env.ECOSYSTEM_API_SECRET || 'univora_ultra_secret_key_2026_change_me';

const api = axios.create({
  baseURL: `${PAYMENT_SERVER_URL}/api/v1/ecosystem`,
  headers: {
    'x-ecosystem-secret': ECOSYSTEM_SECRET
  }
});

/**
 * METHOD 1 (Read-Only Check): Check if user has active premium
 */
export async function checkPremium(userId, platformId) {
  try {
    const res = await api.get(`/subscription?user_id=${userId}&platform_id=${platformId}`);
    return res.data?.data?.active || false;
  } catch (err) {
    console.error('[UnivoraClient] Premium Check Failed:', err.message);
    return false;
  }
}

/**
 * METHOD 2 (Option 1 - Gateway Flow): Create a Checkout Link for a user natively in your bot.
 * When the user pays, Payment Bot will send a POST request to your callbackUrl.
 */
export async function createCheckout(targetBot, userId, planId, amount, callbackUrl) {
  try {
    const res = await api.post(`/create-checkout`, {
      targetBot, userId, planId, amount, callbackUrl
    });
    return res.data?.data?.checkoutUrl || null;
  } catch (err) {
    console.error('[UnivoraClient] Create Checkout Failed:', err.message);
    return null;
  }
}

/**
 * METHOD 3 (Option 2 - Ticket Flow): Claim a Ticket passed via Deep Link.
 * Call this when user clicks /start claim_UNV-1234
 */
export async function claimTicket(ticketId, platformId, telegramId) {
  try {
    const res = await api.post(`/verify-ticket`, {
      ticketId, platformId, telegramId
    });
    // Returns: { status: 'success', data: { planId, orderId, telegramId } }
    return res.data;
  } catch (err) {
    console.error('[UnivoraClient] Claim Ticket Failed:', err.response?.data?.message || err.message);
    return { status: 'error', message: err.response?.data?.message || err.message };
  }
}
