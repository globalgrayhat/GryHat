import { Application } from 'express';
import authRouter from './auth';
import adminRouter from './admin';
import courseRouter from './course';
import instructorRouter from './instructor';
import { RedisClient } from '../../../app';
import jwtAuthMiddleware from '../middlewares/userAuth';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
import videoStreamRouter from './videoStream';
import refreshRouter from './refresh';
import paymentRouter from './payment';
import categoryRouter from './category';
import studentRouter from './student';
import storageConfigRouter from './storageConfig';

/**
 * @swagger
 * tags:
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
 *   - name: Payment
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

  /**
   * @swagger
   * /api/admin:
   *   description: Admin routes, accessible only to Admin users
   *   security:
   *     - bearerAuth: []
   *   tags: [Admin]
   */
  app.use(
    '/api/admin',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    adminRouter()
  );

  /**
   * @swagger
   * /api/category:
   *   description: Category management routes (public or restricted based on implementation)
   *   tags: [Category]
   */
  app.use('/api/category', categoryRouter());

  /**
   * @swagger
   * /api/courses:
   *   description: Courses related routes
   *   tags: [Course]
   */
  app.use('/api/courses', courseRouter(redisClient));

  /**
   * @swagger
   * /api/video-streaming:
   *   description: Video streaming related routes
   *   tags: [VideoStreaming]
   */
  app.use('/api/video-streaming', videoStreamRouter());

  /**
   * @swagger
   * /api/instructors:
   *   description: Instructor related routes
   *   tags: [Instructor]
   */
  app.use('/api/instructors', instructorRouter());

  /**
   * @swagger
   * /api/payments:
   *   description: Payment related routes, secured with JWT
   *   security:
   *     - bearerAuth: []
   *   tags: [Payment]
   */
  app.use('/api/payments', jwtAuthMiddleware, paymentRouter());

  /**
   * @swagger
   * /api/students:
   *   description: Student related routes, may use redis client for caching or data
   *   tags: [Student]
   */
  app.use('/api/students', studentRouter(redisClient));

  /**
   * @swagger
   * /api/storage-config:
   *   description: Storage configuration routes, secured with JWT
   *   security:
   *     - bearerAuth: []
   *   tags: [StorageConfig]
   */
  app.use('/api/storage-config', jwtAuthMiddleware, storageConfigRouter);
};

export default routes;
