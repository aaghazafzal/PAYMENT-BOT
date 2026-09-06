# 👑 Univora Central Payment & VIP Subscription Bot

Main monetization pillar for the **Univora Ecosystem**. Powered by **Node.js, Grammy, Express, MongoDB Atlas, and Cashfree Payments API v3**.

---

## 🔒 Security Highlights (Zero-Bypass Policy)

1. **HMAC-SHA256 Signature Validation**: Cashfree webhooks are validated using cryptographic HMAC SHA-256 (`x-webhook-signature`). Spoofed payloads are rejected with HTTP 401.
2. **Double Verification Polling**: Status is verified directly from Cashfree servers (`GET /pg/orders/{order_id}`) before granting premium.
3. **Price Matching Guard**: Paid amount is verified against the plan price in DB to stop price manipulation attacks.
4. **Idempotency Locking**: Unique index on `orderId` and `cfPaymentId` prevents duplicate webhook processing.
5. **Ecosystem API Secret**: All subscription queries from downstream bots require `X-Univora-Secret` header authorization.

---

## 🚀 Quick Start Guide

### 1. Configure `.env`
Open `.env` in `c:\ALL FINAL PROJECTS\BOTS\PAYMENT BOT\.env` and fill in your details:

```env
BOT_TOKEN=8825417437:AAG25grq8JHfvzlBUA8I88WlWxyq_2w5On8
ADMIN_IDS=123456789 # Replace with your Telegram User ID

MONGO_URI=mongodb+srv://moneybot:YOUR_PASSWORD@moneybot.0yaxppo.mongodb.net/?appName=moneybot

CASHFREE_APP_ID=YOUR_CASHFREE_CLIENT_ID
CASHFREE_SECRET_KEY=YOUR_CASHFREE_SECRET_KEY
CASHFREE_ENV=TEST # Change to PRODUCTION when going live

PORT=5000
SERVER_URL=http://localhost:5000 # Replace with your public domain / Ngrok URL
ECOSYSTEM_API_SECRET=univora_ultra_secret_key_2026
```

### 2. Start the Bot & Server
```bash
npm start
```

For live development auto-reload:
```bash
npm run dev
```

---

## 🛠️ How to Integrate Other Univora Bots/Websites

Copy `univora-client.js` into your other bot/website projects.

### 1-Line Code in any Bot:
```javascript
import { checkUnivoraPremium } from './univora-client.js';

// Inside your command handler (e.g. /pro_command)
const isVIP = await checkUnivoraPremium(ctx.from.id, 'UNIVORA_BOT_A');

if (isVIP) {
  await ctx.reply('✨ Access granted to VIP feature!');
} else {
  await ctx.reply('🔒 Premium feature! Upgrade via @YourPaymentBot');
}
```

---

## 👑 Admin Telegram Commands

* `/admin` - View dashboard & live statistics (Orders created, paid orders, active VIP users).
* `/grant <user_id> <platform_id> <days>` - Manually grant premium access to any user.
* `/revoke <user_id> <platform_id>` - Manually revoke premium access from a user.
