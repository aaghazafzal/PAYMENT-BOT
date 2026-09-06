import { User } from '../../db/models/User.js';
import { getPlatformsKeyboard } from '../keyboards.js';

export async function handleStart(ctx) {
  const tgUser = ctx.from;
  if (!tgUser) return;

  // Save/update user profile in DB
  await User.findOneAndUpdate(
    { telegramId: String(tgUser.id) },
    {
      telegramId: String(tgUser.id),
      username: tgUser.username || '',
      firstName: tgUser.first_name || '',
      lastName: tgUser.last_name || '',
    },
    { upsert: true }
  );

  const welcomeMessage = 
`👋 *Welcome to Univora Central Payment & VIP Hub!*

Elevate your experience across the entire *Univora Ecosystem*. Securely unlock premium access for Telegram Bots, Web Hubs, and Exclusive Apps.

⚡ *Features:*
• Instant UPI, QR Code & Card Checkout via Cashfree
• Real-time Automated Verification & Instant Activation
• Multi-Platform Pass Options

👇 *Select a platform below to choose your plan:*`;

  await ctx.reply(welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: getPlatformsKeyboard(),
  });
}
