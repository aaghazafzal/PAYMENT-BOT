import express from 'express';
import { ecosystemAuthMiddleware } from '../middleware/auth.js';
import { checkSubscriptionStatus } from '../../services/subscription.service.js';
import { PLATFORMS } from '../../config/plans.js';

const router = express.Router();

// Apply Ecosystem Secret Key protection to all ecosystem endpoints
router.use(ecosystemAuthMiddleware);

/**
 * Check if a user has active premium status for a platform
 * GET /api/v1/ecosystem/subscription?user_id=123456789&platform_id=UNIVORA_HUB
 */
router.get('/subscription', async (req, res) => {
  try {
    const { user_id, platform_id } = req.query;

    if (!user_id || !platform_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing user_id or platform_id query parameters.'
      });
    }

    const sub = await checkSubscriptionStatus(String(user_id), String(platform_id));

    return res.json({
      status: 'success',
      data: sub
    });
  } catch (err) {
    console.error('❌ Error in /ecosystem/subscription:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

/**
 * List all configured platforms & plans
 * GET /api/v1/ecosystem/platforms
 */
router.get('/platforms', (req, res) => {
  return res.json({
    status: 'success',
    data: PLATFORMS
  });
});

export default router;
