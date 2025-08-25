import express from 'express';
import { studentDbRepository } from '../../../app/repositories/studentDbRepository';
import { studentRepositoryMongoDB } from '../../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import authController from '../../../adapters/controllers/authController';
import { authServiceInterface } from '../../../app/services/authServicesInterface';
import { authService } from '../../services/authService';
import { googleAuthService } from '../../../frameworks/services/googleAuthService';
import { googleAuthServiceInterface } from '../../../app/services/googleAuthServicesInterface';
import { instructorDbRepository } from '../../../app/repositories/instructorDbRepository';
import { instructorRepoMongoDb } from '../../../frameworks/database/mongodb/repositories/instructorRepoMongoDb';
import { adminDbRepository } from '../../../app/repositories/adminDbRepository';
import { adminRepoMongoDb } from '../../../frameworks/database/mongodb/repositories/adminRepoMongoDb';
import { refreshTokenDbRepository } from '../../../app/repositories/refreshTokenDBRepository';
import { refreshTokenRepositoryMongoDB } from '../../../frameworks/database/mongodb/repositories/refreshTokenRepoMongoDb';
import upload from '../middlewares/multer';
// Import rate limiter middleware to protect login routes
import { authRateLimiter } from '../middlewares/rateLimit';
const authRouter = () => {
  const router = express.Router();

  const controller = authController(
    authServiceInterface,
    authService,
    studentDbRepository,
    studentRepositoryMongoDB,
    instructorDbRepository,
    instructorRepoMongoDb,
    googleAuthServiceInterface,
    googleAuthService,
    adminDbRepository,
    adminRepoMongoDb,
    refreshTokenDbRepository,
    refreshTokenRepositoryMongoDB
  );

  router.post('/student-register', controller.registerStudent);
  router.post('/student-login', authRateLimiter, controller.loginStudent);
  router.post('/login-with-google', controller.loginWithGoogle);

  router.post(
    '/instructor/instructor-register',
    upload.fields([
      { name: 'profilePic', maxCount: 1 },
      { name: 'certificates', maxCount: 10 }
    ]),
    controller.registerInstructor
  );
  router.post(
    '/instructor/instructor-login',
    authRateLimiter,
    controller.loginInstructor
  );

  router.post('/admin/admin-login', authRateLimiter, controller.loginAdmin);

  return router;
};

export default authRouter;
