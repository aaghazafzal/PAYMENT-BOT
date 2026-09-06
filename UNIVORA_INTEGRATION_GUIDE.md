# 🌐 Univora Ecosystem Integration Guide

This guide explains how to connect your other bots and websites (like CinemaHub, ShareBox) to the **Central Univora Payment Bot** using the `univora-client.js` file.

## 🛠️ Step 1: Initial Setup (For Any Bot/Website)

1. Copy the `univora-client.js` file from the Payment Bot folder and paste it into the folder of your Target Bot (e.g., CinemaHub).
2. Install `axios` in your Target Bot if you haven't already:
   ```bash
   npm install axios
   ```
3. Add these two lines to your Target Bot's `.env` file:
   ```env
   PAYMENT_SERVER_URL=https://payment.univora.website
   ECOSYSTEM_API_SECRET=univora_ultra_secret_key_2026_change_me
   ```

---

## 🔒 Feature 1: Checking Premium Status (Read-Only)
Before letting a user download a movie or use a VIP feature, you must check if their subscription is active.

**Where to use:** Inside any command like `/download` or `/vip`.

```javascript
import { checkPremium } from './univora-client.js';

bot.command('download', async (ctx) => {
    const userId = ctx.from.id;
    
    // Check if user has active premium for CINEMAHUB
    const isVIP = await checkPremium(userId, 'CINEMAHUB');
    
    if (!isVIP) {
        return ctx.reply("❌ This is a VIP feature. Please buy premium!");
    }
    
    ctx.reply("✅ Movie is downloading...");
});
```

---

## 💳 Feature 2: Taking Payments (Choose Option 1 or Option 2)

When a user wants to buy premium, you have two ways to do it.

### Option 1: Gateway Flow (Best for Web-Connected Bots)
**How it works:** The user stays inside CinemaHub. CinemaHub generates a payment link. When paid, the Payment Server sends a webhook to CinemaHub to activate the plan.

*Requirement: Your Target Bot must have an Express server running to receive the webhook.*

**1. Generating the Link (Inside CinemaHub Bot):**
```javascript
import { createCheckout } from './univora-client.js';

bot.command('upgrade', async (ctx) => {
    // Generate a unique checkout link for 1_MONTH plan
    const checkoutUrl = await createCheckout(
        'CINEMAHUB', 
        ctx.from.id, 
        '1_MONTH', 
        39, // Amount in INR
        'https://cinemahub.univora.website/webhook/payment-success' // Your Webhook URL
    );
    
    ctx.reply("Buy 1 Month Premium for ₹39:", {
        reply_markup: { inline_keyboard: [[{ text: 'Pay Now', url: checkoutUrl }]] }
    });
});
```

**2. Receiving the Webhook (Inside CinemaHub's Express Server):**
```javascript
app.post('/webhook/payment-success', express.json(), (req, res) => {
    const secret = req.headers['x-ecosystem-secret'];
    if (secret !== process.env.ECOSYSTEM_API_SECRET) {
        return res.status(403).send("Unauthorized");
    }

    const { userId, planId, status } = req.body;
    
    if (status === 'SUCCESS') {
        // Update CinemaHub Database! Give user Premium!
        // db.activatePremium(userId, planId);
        
        // Send a message to the user
        bot.api.sendMessage(userId, "🎉 Your Premium is now Active!");
    }
    res.send("OK");
});
```

---

### Option 2: Ticket Protocol (Best for Simple Telegram Bots)
**How it works:** The user buys the plan directly in `@PAYMENT_UNIVORABOT`. The payment bot gives them a "Magic Link" (`t.me/CinemaHubBot?start=claim_UNV-123`). The user clicks it, goes to CinemaHub, and CinemaHub verifies the ticket.

*Requirement: None! Very easy to implement. No webhooks needed.*

**1. Claiming the Ticket (Inside CinemaHub Bot):**
```javascript
import { claimTicket } from './univora-client.js';

bot.command('start', async (ctx) => {
    const text = ctx.message.text; // e.g., "/start claim_UNV-X89J-2KL9"
    
    if (text.includes('claim_')) {
        const ticketId = text.split('_')[1];
        
        ctx.reply("⏳ Verifying your premium ticket...");
        
        // Verify with Payment Server
        const result = await claimTicket(ticketId, 'CINEMAHUB', ctx.from.id);
        
        if (result.status === 'success') {
            const planId = result.data.planId; // e.g., "1_MONTH"
            
            // Update CinemaHub Database! Give user Premium!
            // db.activatePremium(ctx.from.id, planId);
            
            ctx.reply(`🎉 Success! Your ${planId} Premium is now Active!`);
        } else {
            ctx.reply(`❌ Failed: ${result.message}`);
        }
    } else {
        ctx.reply("Welcome to CinemaHub!");
    }
});
```

---

## 📝 Managing Plans & Prices
The `Payment Bot` has a file called `src/config/plans.js`. This is the **Master List**. 
If you want to add a new 1-Year plan for ShareBox, you only need to add it inside `src/config/plans.js` in the Payment Bot. 

Whenever you call `createCheckout`, make sure the `planId` and `amount` you pass match what you want to offer to the user!
