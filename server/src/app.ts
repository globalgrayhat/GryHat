import express, { Application, NextFunction } from 'express';
import http from 'http';
import path from 'path';

import connectToMongoDb from './frameworks/database/mongodb/connection';
import connection from './frameworks/database/redis/connection';

import serverConfig from './frameworks/webserver/server';
import expressConfig from './frameworks/webserver/express';
import routes from './frameworks/webserver/routes';
import errorHandlingMiddleware from './frameworks/webserver/middlewares/errorHandling';

import configKeys from './config';
import { swaggerUi, swaggerSpec } from './swagger';

import colors from 'colors.ts';
const colorHEX = (hex: string, text: string) => {
  try {
    const c: any = colors as any;
    if (typeof c?.enable === 'function') c.enable();
    if (typeof c?.hex === 'function') return c.hex(hex)(text);
  } catch {}
  const m = hex.replace('#', '').trim();
  const r = parseInt(m.slice(0, 2), 16) || 255;
  const g = parseInt(m.slice(2, 4), 16) || 255;
  const b = parseInt(m.slice(4, 6), 16) || 255;
  return `\x1b[38;2;${r};${g};${b}m${text}\x1b[0m`;
};

const app: Application = express();
const { createRedisClient } = connection();
const redisClient = createRedisClient();
const server = http.createServer(app);

/** Mount Swagger only when enabled to avoid noisy prod setups. */
const mountSwagger = (app: Application) => {
  const enabled = String(configKeys.SWAGGER_ENABLED || '').toLowerCase() === 'true';
  if (!enabled) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(colorHEX('#FFC107', '[Swagger] Disabled (SWAGGER_ENABLED != "true")'));
    }
    return;
  }
  const docsPath = configKeys.SWAGGER_PATH || '/api-docs';
  app.use(docsPath, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  console.log(colorHEX('#00C853', `[Swagger] UI mounted at ${docsPath}`));
};

// Public assets (favicon, landing assets, etc.)
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Boot sequence:
 * 1) Connect DBs
 * 2) Global middleware
 * 3) Docs (optional)
 * 4) Routes
 * 5) Errors & 404
 * 6) Start HTTP server
 */
(async () => {
  await connectToMongoDb();
  expressConfig(app);
  mountSwagger(app);

  // Attach all API routes (pass redis client where needed)
  routes(app, redisClient);

  // Helper endpoint to advertise docs location
  app.get('/api/docs', (req, res) => {
    const enabled = String(configKeys.SWAGGER_ENABLED || '').toLowerCase() === 'true';
    res.status(200).json({
      platform: 'GrayHat',
      swaggerEnabled: enabled,
      docsUrl: enabled ? (configKeys.SWAGGER_PATH || '/api-docs') : null,
      path: configKeys.SWAGGER_PATH || '/api-docs'
    });
  });

  // Centralized error handling
  app.use(errorHandlingMiddleware);

  // 404 handler at the very end
  // (kept inline to avoid circular import in some TS setups)
  app.all('*', (req, _res, next: NextFunction) => {
    const AppError = require('./utils/appError').default;
    next(new AppError(`Not found: ${req.method} ${req.originalUrl}`, 404));
  });

  serverConfig(server).startServer();
})().catch((err) => {
  console.error(colorHEX('#FF5252', `[BOOT] Failed to start: ${err?.message || err}`));
  process.exit(1);
});

export type RedisClient = ReturnType<typeof createRedisClient>;
