import express from "express";
import {studentDbRepository} from '../../../app/repositories/studentDbRepository'
import {studentRepositoryMongoDB} from '../../../frameworks/database/mongodb/repositories/studentsRepoMongoDb'
import authController from "../../../adapters/controllers/authController";
import { authServiceInterface } from "../../../app/services/authServicesInterface";
import { authService } from "../../services/authService";
import {googleAuthService} from "../../../frameworks/services/googleAuthService"
import { googleAuthServiceInterface } from "../../../app/services/googleAuthServicesInterface";
import {instructorDbRepository} from "../../../app/repositories/instructorDbRepository"
import {instructorRepoMongoDb} from "../../../frameworks/database/mongodb/repositories/instructorRepoMongoDb"
import { adminDbRepository } from "../../../app/repositories/adminDbRepository";
import { adminRepoMongoDb } from "../../../frameworks/database/mongodb/repositories/adminRepoMongoDb";
import { refreshTokenDbRepository } from "../../../app/repositories/refreshTokenDBRepository";
import { refreshTokenRepositoryMongoDB } from "../../../frameworks/database/mongodb/repositories/refreshTokenRepoMongoDb";
import { CloudServiceImpl } from '../../../frameworks/services';
import { cloudServiceInterface } from "../../../app/services/cloudServiceInterface";
import upload from "../middlewares/multer";
// Import rate limiter middleware to protect login routes
import { authRateLimiter } from '../middlewares/rateLimit';
const authRouter = () => {     
  const router = express.Router();
  
  const controller = authController(
    authServiceInterface,
    authService,
    cloudServiceInterface,
    CloudServiceImpl,
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
  //* Student
  router.post("/student-register",controller.registerStudent)
  // Apply rate limiter on student login to prevent brute force attacks
  router.post("/student-login", authRateLimiter, controller.loginStudent);
  router.post("/login-with-google",controller.loginWithGoogle)
  
  //* Instructor
  router.post("/instructor/instructor-register",upload.array('images'), controller.registerInstructor)
  // Rate limit instructor login as well
  router.post("/instructor/instructor-login", authRateLimiter, controller.loginInstructor)

  //* Admin 
  // Protect admin login with rate limiting
  router.post("/admin/admin-login", authRateLimiter, controller.loginAdmin)

  return router;
};

export default authRouter;
