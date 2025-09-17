import express, { Application, NextFunction } from 'express';
<<<<<<< HEAD
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import connectToMongoDb from './frameworks/database/mongodb/connection';
import connection from './frameworks/database/redis/connection';
import { createTusServer } from './frameworks/webserver/middlewares/tusServer';
import serverConfig from './frameworks/webserver/server';
import expressConfig from './frameworks/webserver/express';
import routes from './frameworks/webserver/routes';
import errorHandlingMiddleware from './frameworks/webserver/middlewares/errorHandling';
import jwtAuthMiddleware  from './frameworks/webserver/middlewares/userAuth';

import socketConfig from './frameworks/websocket/socket';
import { authService } from './frameworks/services/authService';

import configKeys from './config';

// Swagger (mounted conditionally)
import { swaggerUi, swaggerSpec } from './swagger';

// Use colors.ts with HEX
import colors from 'colors.ts';
const colorHEX = (hex: string, text: string): string => {
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
=======
import connectToMongoDb from './frameworks/database/mongodb/connection';
import http from 'http';
import serverConfig from './frameworks/webserver/server';
import expressConfig from './frameworks/webserver/express';
import routes from './frameworks/webserver/routes';
import connection from './frameworks/database/redis/connection';
import colors from 'colors.ts';
import errorHandlingMiddleware from './frameworks/webserver/middlewares/errorHandling';
import configKeys from './config'; 
import AppError from './utils/appError';
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './types/socketInterfaces';
import { Server } from 'socket.io';
import socketConfig from './frameworks/websocket/socket';
import { authService } from './frameworks/services/authService';

colors?.enable();
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

const app: Application = express();
const server = http.createServer(app);

<<<<<<< HEAD
// Helper: build full docs URL from env (protocol/host/port + path)
const buildDocsUrl = (req?: express.Request): string => {
  const protocol =
    (process.env.SWAGGER_SERVER_PROTOCOL || process.env.PROTOCOL) ||
    (req?.protocol ?? 'http');
  const host = (process.env.SWAGGER_SERVER_HOST || process.env.HOST) ||
    (req?.hostname ?? 'localhost');
  const port = Number(configKeys.PORT) || 5000;
  const path = (configKeys.SWAGGER_PATH || '/api-docs').startsWith('/')
    ? (configKeys.SWAGGER_PATH || '/api-docs')
    : `/${configKeys.SWAGGER_PATH}`;
  return `${protocol}://${host}:${port}${path}`;
};

// --- DRY helper: mount swagger only if enabled ---
const mountSwagger = (app: Application) => {
  const enabled = String(configKeys.SWAGGER_ENABLED || '').toLowerCase() === 'true';
  if (!enabled) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(colorHEX('#FFC107', '[Swagger] Disabled (SWAGGER_ENABLED != "true")'));
    }
    return;
  }
  const path = configKeys.SWAGGER_PATH || '/api-docs';
  app.use(path, swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  console.log(colorHEX('#00C853', `[Swagger] UI mounted at ${buildDocsUrl()}`));

  // Optional: raw JSON of the OpenAPI spec (useful for tooling)
  app.get(`${path}.json`, (_req, res) => res.status(200).json(swaggerSpec));
};
app.use(express.static(path.join(__dirname, 'public')));
// Create TUS server
const tusServer = createTusServer();

// Add TUS upload endpoint with authentication
app.use('/api/uploads', jwtAuthMiddleware, (req: any, res: any) => {
  tusServer.handle(req, res);
});
//* web socket connection
const io = new Server(server, {
  cors: {
    origin: configKeys.ORIGIN_PORT,
    methods: ['GET', 'POST'],
  },
});
socketConfig(io, authService());

//* connecting mongoDb
=======
//* web socket connection
const io = new Server<ClientToServerEvents,ServerToClientEvents,InterServerEvents,SocketData>(server,{
  cors:{
      origin:configKeys.ORIGIN_PORT,
      methods:["GET","POST"]
  } 
});


socketConfig(io,authService())  

//* connecting mongoDb 
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
connectToMongoDb();

//* connection to redis
const redisClient = connection().createRedisClient();

//* express config connection
expressConfig(app);

<<<<<<< HEAD
//* docs (conditionally)
mountSwagger(app);

//* routes for each endpoint
routes(app, redisClient);

//* route that returns docs URL (always available)
app.get('/api/docs', (req, res) => {
  const enabled = String(configKeys.SWAGGER_ENABLED || '').toLowerCase() === 'true';
  res.status(200).json({
    platform: 'GrayHat',
    swaggerEnabled: enabled,
    docsUrl: enabled ? buildDocsUrl(req) : null,
    path: configKeys.SWAGGER_PATH || '/api-docs'
  });
});

=======
//* routes for each endpoint
routes(app, redisClient);

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
//* handles server side errors
app.use(errorHandlingMiddleware);

//* catch 404 and forward to error handler
<<<<<<< HEAD
import AppError from './utils/appError';
app.all('*', (req, _res, next: NextFunction) => {
  next(new AppError(`Not found: ${req.method} ${req.originalUrl}`, 404));
=======
app.all('*', (req, res, next: NextFunction) => {
  next(new AppError('Not found', 404));
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
});

//* starting the server with server config
serverConfig(server).startServer();

export type RedisClient = typeof redisClient;
