import { connectDB } from './db/connect.js';
import { startServer } from './api/server.js';
import { startBot } from './bot/index.js';
import { config } from './config/env.js';
import axios from 'axios';

async function bootstrap() {
  console.log('🚀 Starting Univora Central Payment & VIP Subscription Engine...');

  // 1. Connect to MongoDB Atlas
  const dbConnected = await connectDB();
  if (!dbConnected) {
    console.warn('⚠️ Server running without active MongoDB connection. Set valid MONGO_URI in .env!');
  }

  // 2. Start Express API & Webhook Server
  startServer();

  // 3. Start Telegram Bot
  await startBot();

  // 4. Start Self-Ping Keep-Alive for Free Hosting (Render)
  // Hits the server every 6 minutes (360000 ms) so it never goes to sleep.
  setInterval(async () => {
    try {
      if (config.serverUrl.includes('localhost') || config.serverUrl.includes('loca.lt')) return; // Skip if local
      await axios.get(`${config.serverUrl}/health`);
      console.log(`[Self-Ping] 🟢 Server kept alive: ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      console.error(`[Self-Ping] 🔴 Failed:`, error.message);
    }
  }, 6 * 60 * 1000);
}

bootstrap().catch((err) => {
  console.error('❌ Fatal error during bootstrap:', err);
});
