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

import jwtAuthMiddleware from '../middlewares/userAuth';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';

import type { RedisClient } from '../../../app';

const routes = (app: Application, redisClient: RedisClient) => {
  // Auth
  app.use('/api/auth', authRouter());

  // Admin
  app.use('/api/admin', jwtAuthMiddleware, roleCheckMiddleware(UserRole.Admin), adminRouter());

  // Courses (factory needs redisClient)
  app.use('/api/courses', courseRouter(redisClient));

  // Instructors
  app.use('/api/instructors', jwtAuthMiddleware, instructorRouter());

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
