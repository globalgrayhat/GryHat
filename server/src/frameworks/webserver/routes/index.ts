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

import jwtAuthMiddleware from '../middlewares/userAuth';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
import { RedisClient } from '../../../app';

/**
 * @swagger
 * tags:
 *   - name: GrayHat
 *     description: GrayHat platform root & health endpoints
 *   - name: Auth
 *     description: Authentication routes
 *   - name: Admin
 *     description: Admin panel routes
 *   - name: Category
 *     description: Category management
 *   - name: Course
 *     description: Course management
 *   - name: VideoStreaming
 *     description: Video streaming
 *   - name: Instructor
 *     description: Instructor related routes
 *   - name: Payments
 *     description: Payment routes
 *   - name: Student
 *     description: Student related routes
 *   - name: StorageConfig
 *     description: Storage configuration
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []
 */

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

  // ---------- Auth ----------
  /**
   * @swagger
   * /api/auth:
   *   description: Authentication related routes (login, register, logout)
   *   tags: [Auth]
   */
  app.use('/api/auth', authRouter());

  /**
   * @swagger
   * /api/all/refresh-token:
   *   description: Refresh JWT token endpoint
   *   tags: [Auth]
   */
  app.use('/api/all/refresh-token', refreshRouter());

  // ---------- Admin ----------
  /**
   * @swagger
   * /api/admin:
   *   description: Admin routes, accessible only to Admin users
   *   tags: [Admin]
   *   security:
   *     - bearerAuth: []
   */
  app.use(
    '/api/admin',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    adminRouter()
  );

  // ---------- Category ----------
  /**
   * @swagger
   * /api/category:
   *   description: Category management routes
   *   tags: [Category]
   */
  app.use('/api/category', categoryRouter());

  // ---------- Courses ----------
  /**
   * @swagger
   * /api/courses:
   *   description: Courses related routes
   *   tags: [Course]
   */
  app.use('/api/courses', courseRouter(redisClient));

  // ---------- Video Streaming ----------
  /**
   * @swagger
   * /api/video-streaming:
   *   description: Video streaming related routes
   *   tags: [VideoStreaming]
   */
  app.use('/api/video-streaming', videoStreamRouter());

  // ---------- Instructors ----------
  /**
   * @swagger
   * /api/instructors:
   *   description: Instructor related routes
   *   tags: [Instructor]
   */
  app.use('/api/instructors', instructorRouter());

  // ---------- Payments ----------
  /**
   * @swagger
   * /api/payments:
   *   description: Payment related routes, secured with JWT
   *   tags: [Payments]
   *   security:
   *     - bearerAuth: []
   */
  app.use('/api/payments', jwtAuthMiddleware, paymentRouter);

  // ---------- Students ----------
  /**
   * @swagger
   * /api/students:
   *   description: Student related routes
   *   tags: [Student]
   */
  app.use('/api/students', studentRouter(redisClient));

  // ---------- Storage Config ----------
  /**
   * @swagger
   * /api/storage-config:
   *   description: Storage configuration routes
   *   tags: [StorageConfig]
   *   security:
   *     - bearerAuth: []
   */
  app.use('/api/storage-config', jwtAuthMiddleware, storageConfigRouter);
};

export default routes;
