import express, { Application } from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import configKeys from '../../config';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import requestMonitorMiddleware from './middlewares/requestMonitor';

// Basic rate limiter to protect public endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again later.',
  keyGenerator: (req) => String(req.headers['x-real-ip'] || req.ip || '')
});

/**
 * Global Express middleware setup.
 * Keep this file focused on middleware only (no routes, no server start).
 */
const expressConfig = (app: Application) => {
  // Dev logging
  if (configKeys.NODE_ENV === 'development') app.use(morgan('dev'));

  // Observe request duration early in the chain
  app.use(requestMonitorMiddleware);

  // Honour X-Forwarded-* when behind a proxy
  app.set('trust proxy', true);

  // CORS
  const origins = String(configKeys.CORS_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  const corsOptions: cors.CorsOptions = {
    origin: origins.length ? origins : true,
    credentials: String(configKeys.CORS_CREDENTIALS || 'true').toLowerCase() === 'true',
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','X-Requested-With','Accept','Origin'],
    exposedHeaders: ['Content-Length','Content-Range'],
    maxAge: 86400
  };
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  // Parsers & security
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(limiter);
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        imgSrc: ["'self'", 'data:'],
        frameSrc: ["'self'", 'https:'] // allow YouTube/Vimeo/Swagger frames over https
      }
    })
  );
  app.use(mongoSanitize());

  // Static exposure for local storage provider
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
};

export default expressConfig;
