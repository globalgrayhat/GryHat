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

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // maximum requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  keyGenerator: (req) => {
    const xRealIp = req.headers['x-real-ip'];
    return xRealIp ? String(xRealIp) : req.ip;
  }
});

const expressConfig = (app: Application) => {
  // Development logging
  if (configKeys.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Monitor the duration of all incoming requests. Must be registered early to
  // capture as much processing time as possible. Logs slow requests to
  // facilitate performance tuning.
  app.use(requestMonitorMiddleware);
  app.set('trust proxy', true); // Enable trust for X-Forwarded-* headers
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(limiter);
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        imgSrc: ["'self'", 'data:'],
        frameSrc: ["'self'", 'https:']
      }
    })
  );
  app.use(mongoSanitize());

  // When using the local storage provider, expose the uploads directory as a
  // static resource so that clients can download files directly. The path is
  // resolved relative to the project root. For S3 this middleware has no
  // effect because files are served via CloudFront.
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));
};

export default expressConfig;
