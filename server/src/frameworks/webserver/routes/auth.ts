<<<<<<< HEAD
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
import { authRateLimiter } from '../middlewares/rateLimit';

const authRouter = () => {
  const router = express.Router();

  const controller = authController(
    authServiceInterface,
    authService,
    studentDbRepository,
    studentRepositoryMongoDB,
    instructorDbRepository,
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    instructorRepoMongoDb,
    googleAuthServiceInterface,
    googleAuthService,
    adminDbRepository,
    adminRepoMongoDb,
    refreshTokenDbRepository,
    refreshTokenRepositoryMongoDB
  );
<<<<<<< HEAD

  /**
   * @swagger
   * /api/auth/student-register:
   *   post:
   *     summary: Register a new student
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       201:
   *         description: Student registered successfully
   */
  router.post('/student-register', controller.registerStudent);

  /**
   * @swagger
   * /api/auth/student-login:
   *   post:
   *     summary: Login as a student
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful login
   */
  router.post('/student-login', authRateLimiter, controller.loginStudent);

  /**
   * @swagger
   * /api/auth/login-with-google:
   *   post:
   *     summary: Login with Google OAuth
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               token:
   *                 type: string
   *     responses:
   *       200:
   *         description: Successful login with Google
   */
  router.post('/login-with-google', controller.loginWithGoogle);

  /**
   * @swagger
   * /api/auth/instructor/instructor-register:
   *   post:
   *     summary: Register a new instructor
   *     tags: [Auth]
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               profilePic:
   *                 type: string
   *                 format: binary
   *               certificates:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       201:
   *         description: Instructor registered successfully
   */
  router.post(
    '/instructor/instructor-register',
    upload.fields([
      { name: 'profilePic', maxCount: 1 },
      { name: 'certificates', maxCount: 10 }
    ]),
    controller.registerInstructor
  );

  /**
   * @swagger
   * /api/auth/instructor/instructor-login:
   *   post:
   *     summary: Login as an instructor
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Instructor logged in successfully
   */
  router.post(
    '/instructor/instructor-login',
    authRateLimiter,
    controller.loginInstructor
  );

  /**
   * @swagger
   * /api/auth/admin/admin-login:
   *   post:
   *     summary: Login as admin
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Admin logged in successfully
   */
  router.post('/admin/admin-login', authRateLimiter, controller.loginAdmin);
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

  return router;
};

export default authRouter;
