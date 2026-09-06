import { config } from '../../config/env.js';

export function ecosystemAuthMiddleware(req, res, next) {
  const secretHeader = req.headers['x-univora-secret'] || req.headers['authorization'];
  
  if (!secretHeader || secretHeader.replace('Bearer ', '') !== config.ecosystemSecret) {
    return res.status(401).json({
      status: 'error',
      message: 'Unauthorized: Invalid or missing X-Univora-Secret header.'
    });
  }
  
  next();
}
