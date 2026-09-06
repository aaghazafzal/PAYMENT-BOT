import dotenv from 'dotenv';
dotenv.config();

export const config = {
  botToken: process.env.BOT_TOKEN || '',
  adminIds: (process.env.ADMIN_IDS || '').split(',').map(id => id.trim()).filter(Boolean),
  mongoUri: process.env.MONGO_URI || '',
  cashfree: {
    appId: process.env.CASHFREE_APP_ID || '',
    secretKey: process.env.CASHFREE_SECRET_KEY || '',
    env: (process.env.CASHFREE_ENV || 'TEST').toUpperCase(),
    apiVersion: process.env.CASHFREE_API_VERSION || '2023-08-01',
  },
  port: parseInt(process.env.PORT || '5000', 10),
  serverUrl: (process.env.SERVER_URL || 'http://localhost:5000').replace(/\/$/, ''),
  ecosystemSecret: process.env.ECOSYSTEM_API_SECRET || 'univora_ultra_secret_key_2026',
};

// Log warning if key variables are default or missing
if (!config.botToken) {
  console.warn('⚠️ WARNING: BOT_TOKEN is missing in .env!');
}
if (!config.mongoUri || config.mongoUri.includes('YOUR_DB_PASSWORD')) {
  console.warn('⚠️ WARNING: MONGO_URI needs valid password in .env!');
}
