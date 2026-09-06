import express from 'express';
import cors from 'cors';
import { config } from '../config/env.js';
import paymentRoutes from './routes/payment.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import ecosystemRoutes from './routes/ecosystem.routes.js';
import pagesRoutes from './routes/pages.routes.js';

export function createServer() {
  const app = express();

  app.use(cors());

  // Middleware to preserve raw body for Cashfree HMAC signature verification
  app.use(express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    }
  }));
  app.use(express.urlencoded({ extended: true }));

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'Univora Payment Engine', timestamp: new Date() });
  });

  // Mount API Routes
  app.use('/api/v1/payment', paymentRoutes);
  app.use('/api/v1/webhook', webhookRoutes);
  app.use('/api/v1/ecosystem', ecosystemRoutes);
  
  // Public UI Routes
  app.use('/terms', pagesRoutes);

  return app;
}

export function startServer() {
  const app = createServer();
  return app.listen(config.port, () => {
    console.log(`🚀 Univora Payment Server listening on port ${config.port}`);
    console.log(`🌐 Server URL: ${config.serverUrl}`);
  });
}
