import express from "express";
import { studentDbRepository } from '../../../app/repositories/studentDbRepository';
import { studentRepositoryMongoDB } from '../../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import authController from "../../../adapters/controllers/authController";
import { authServiceInterface } from "../../../app/services/authServicesInterface";
import { authService } from "../../services/authService";
import { googleAuthService } from "../../../frameworks/services/googleAuthService";
import { googleAuthServiceInterface } from "../../../app/services/googleAuthServicesInterface";
import { instructorDbRepository } from "../../../app/repositories/instructorDbRepository";
import { instructorRepoMongoDb } from "../../../frameworks/database/mongodb/repositories/instructorRepoMongoDb";
import { adminDbRepository } from "../../../app/repositories/adminDbRepository";
import { adminRepoMongoDb } from "../../../frameworks/database/mongodb/repositories/adminRepoMongoDb";
import { refreshTokenDbRepository } from "../../../app/repositories/refreshTokenDBRepository";
import { refreshTokenRepositoryMongoDB } from "../../../frameworks/database/mongodb/repositories/refreshTokenRepoMongoDb";
import { CloudServiceImpl } from '../../../frameworks/services';
import { cloudServiceInterface } from "../../../app/services/cloudServiceInterface";
import multer from 'multer';
import { authRateLimiter } from '../middlewares/rateLimit';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); 
  }
});

const upload = multer({ storage }).fields([
  { name: 'profilePic', maxCount: 1 },
  { name: 'certificates', maxCount: 5 }
]);

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

  router.post("/student-register", controller.registerStudent);
  router.post("/student-login", authRateLimiter, controller.loginStudent);
  router.post("/login-with-google", controller.loginWithGoogle);

  router.post('/instructor/instructor-register', upload, controller.registerInstructor);


  router.post("/instructor/instructor-login", authRateLimiter, controller.loginInstructor);
  router.post("/admin/admin-login", authRateLimiter, controller.loginAdmin);

  return router;
};

export default authRouter;
