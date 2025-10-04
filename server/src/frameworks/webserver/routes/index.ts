import { Application } from 'express';
import authRouter from './auth';
import adminRouter from './admin';
import courseRouter from './course';
import instructorRouter from './instructor';
import videoStreamRouter from './videoStream';
import refreshRouter from './refresh';
import paymentRouter from './payment';
import categoryRouter from './category';
import studentRouter from './student';
import storageConfigRouter from './storageConfig';
import metricsRouter from './metrics';
import userManagementRouter from './userManagement';
import liveStreamRouter from './liveStream';
import uploadsRouter from './uploads';

import jwtAuthMiddleware from '../middlewares/userAuth';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';

import type { RedisClient } from '../../../app';

const routes = (app: Application, redisClient: RedisClient) => {
  
  // ---------- Root ----------
  /**
   * @swagger
   * /:
   *   get:
   *     tags: [GrayHat]
   *     summary: GrayHat root
   *     description: Returns GrayHat platform banner and basic info.
   *     responses:
   *       200:
   *         description: Root info
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 platform:
   *                   type: string
   *                   example: GrayHat
   *                 status:
   *                   type: string
   *                   example: ok
   *                 version:
   *                   type: string
   *                   example: "1.0"
   */
  app.get('/', (_req, res) => {
    res.status(200).json({
      platform: 'GrayHat',
      status: 'ok',
      version: '1.0',
    });
  });

  /**
   * @swagger
   * /api/health:
   *   get:
   *     tags: [GrayHat]
   *     summary: GrayHat health check
   *     description: Simple liveness probe for GrayHat platform.
   *     responses:
   *       200:
   *         description: Service is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 platform:
   *                   type: string
   *                   example: GrayHat
   *                 status:
   *                   type: string
   *                   example: healthy
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   */
  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      platform: 'GrayHat',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth
  app.use('/api/auth', authRouter());

  // Admin
  app.use('/api/admin', jwtAuthMiddleware, roleCheckMiddleware(UserRole.Admin), adminRouter());

  // Courses (factory needs redisClient)
  app.use('/api/courses', courseRouter(redisClient));

  // Instructors
  app.use('/api/instructors', instructorRouter());

  // Students (factory needs redisClient)
  app.use('/api/students', jwtAuthMiddleware, studentRouter(redisClient));

  // Categories
  app.use('/api/category', categoryRouter());

  // Storage configuration (plain router)
  app.use('/api/storage', jwtAuthMiddleware, roleCheckMiddleware(UserRole.Admin), storageConfigRouter);

  // Payments (plain router)
  app.use('/api/payments', paymentRouter);

  // Video streaming
  app.use('/api/videos', videoStreamRouter());

  // Refresh token
  app.use('/api/refresh', refreshRouter());

  // Live streams
  app.use('/api/live-streams', liveStreamRouter());

  // Metrics
  app.use('/api/metrics', jwtAuthMiddleware, metricsRouter());

  // Users management
  app.use('/api/users', userManagementRouter());
};

export default routes;
