import express, { type Express } from 'express';
import { authRouter } from './modules/auth.routes.js';
import { posRouter } from './modules/pos.routes.js';
import { errorHandler } from './shared/errors.js';
import { authOptional } from './shared/session.js';

export function createApp(): Express {
  const app = express();
  const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5350';

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsOrigin);
    res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Client-Op-Id');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  app.use(express.json({ limit: '2mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'bodepos-api' });
  });

  app.use(authOptional);
  app.use('/auth', authRouter);
  app.use('/', posRouter);
  app.use('/api/auth', authRouter);
  app.use('/api', posRouter);

  app.use(errorHandler);
  return app;
}
