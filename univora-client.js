/**
 * Univora Subscription Client Helper for Ecosystem Bots & Websites
 * Copy this file into your other bots/websites to check premium access in 1 line!
 * 
 * Usage:
 * import { checkUnivoraPremium } from './univora-client.js';
 * 
 * const isVIP = await checkUnivoraPremium('123456789', 'UNIVORA_BOT_A');
 * if (isVIP) { ... }
 */

const UNIVORA_PAYMENT_API_URL = process.env.UNIVORA_API_URL || 'http://localhost:5000';
const UNIVORA_API_SECRET = process.env.ECOSYSTEM_API_SECRET || 'univora_ultra_secret_key_2026';

export async function checkUnivoraPremium(userId, platformId) {
  try {
    const url = `${UNIVORA_PAYMENT_API_URL}/api/v1/ecosystem/subscription?user_id=${encodeURIComponent(userId)}&platform_id=${encodeURIComponent(platformId)}`;
    const response = await fetch(url, {
      headers: {
        'X-Univora-Secret': UNIVORA_API_SECRET
      }
    });

    if (!response.ok) {
      console.error(`⚠️ Univora Subscription API HTTP Error: ${response.status}`);
      return false;
    }

    const json = await response.json();
    return json.data?.isPremium === true;
  } catch (err) {
    console.error('❌ Failed to verify Univora premium status:', err.message);
    return false;
  }
}
