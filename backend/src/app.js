import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { env } from './config/env.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { attachRequestContext } from './middleware/fraudMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import giveawayRoutes from './routes/giveawayRoutes.js';
import participationRoutes from './routes/participationRoutes.js';
import winnerRoutes from './routes/winnerRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';

export function createApp() {
  const app = express();

  // Needed so req.ip is the real client address behind a proxy (Render, Railway, Nginx...).
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin(origin, callback) {
        // Allow same-origin / server-to-server calls (no Origin header) and configured clients
        if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
        // Also allow all *.vercel.app domains and local dev
        if (/^https:\/\/.*\.vercel\.app$/.test(origin) || origin.startsWith('http://localhost:')) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Device-Id', 'X-Request-Id'],
    }),
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(mongoSanitize()); // strips $ and . operators from user input
  if (!env.isProduction) app.use(morgan('dev'));

  app.use(attachRequestContext);
  app.get('/api/health', (_req, res) => res.json({ data: { status: 'ok', time: new Date() } }));
  app.use('/api', apiLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/giveaways', giveawayRoutes);
  app.use('/api/giveaways', participationRoutes);
  app.use('/api/giveaways', winnerRoutes);
  app.use('/api/giveaways', claimRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
