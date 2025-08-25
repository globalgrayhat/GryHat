import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { AuthService } from '../../frameworks/services/authService';
import { AuthServiceInterface } from '../../app/services/authServicesInterface';
import { StudentsDbInterface } from '../../app/repositories/studentDbRepository';
import { StudentRepositoryMongoDB } from '../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import {
  studentLogin,
  studentRegister,
  signInWithGoogle
} from '../../app/usecases/auth/studentAuth';
import {
  instructorRegister,
  instructorLogin
} from '../../app/usecases/auth/instructorAuth';
import { InstructorDbInterface } from '@src/app/repositories/instructorDbRepository';
import { InstructorRepositoryMongoDb } from '@src/frameworks/database/mongodb/repositories/instructorRepoMongoDb';
import { StudentRegisterInterface } from '@src/types/studentRegisterInterface';
import { GoogleAuthServiceInterface } from '@src/app/services/googleAuthServicesInterface';
import { GoogleAuthService } from '@src/frameworks/services/googleAuthService';
import { InstructorInterface } from '@src/types/instructorInterface';
import { adminLogin } from '../../app/usecases/auth/adminAuth';
import { AdminDbInterface } from '@src/app/repositories/adminDbRepository';
import { AdminRepositoryMongoDb } from '@src/frameworks/database/mongodb/repositories/adminRepoMongoDb';
import { RefreshTokenDbInterface } from '@src/app/repositories/refreshTokenDBRepository';
import { RefreshTokenRepositoryMongoDb } from '@src/frameworks/database/mongodb/repositories/refreshTokenRepoMongoDb';
// Import cloud service interface and implementation (e.g., S3)
import { CloudServiceImpl } from '@src/frameworks/services';
import { CloudServiceInterface } from '@src/app/services/cloudServiceInterface';

/**
 * Factory function to create the auth controller.
 * It accepts all service/repository interfaces and implementations as dependencies.
 * This promotes flexibility and easier testing/mocking.
 */
const authController = (
  authServiceInterface: AuthServiceInterface,
  authServiceImpl: AuthService,
  cloudServiceInterface: CloudServiceInterface,
  CloudServiceImpl: CloudServiceImpl,
  studentDbRepository: StudentsDbInterface,
  studentDbRepositoryImpl: StudentRepositoryMongoDB,
  instructorDbRepository: InstructorDbInterface,
  instructorDbRepositoryImpl: InstructorRepositoryMongoDb,
  googleAuthServiceInterface: GoogleAuthServiceInterface,
  googleAuthServiceImpl: GoogleAuthService,
  adminDbRepository: AdminDbInterface,
  adminDbRepositoryImpl: AdminRepositoryMongoDb,
  refreshTokenDbRepository: RefreshTokenDbInterface,
  refreshTokenDbRepositoryImpl: RefreshTokenRepositoryMongoDb
) => {
  // Instantiate repositories and services using the passed implementations
  const dbRepositoryUser = studentDbRepository(studentDbRepositoryImpl());
  const dbRepositoryInstructor = instructorDbRepository(instructorDbRepositoryImpl());
  const dbRepositoryAdmin = adminDbRepository(adminDbRepositoryImpl());
  const dbRepositoryRefreshToken = refreshTokenDbRepository(refreshTokenDbRepositoryImpl());

  const authService = authServiceInterface(authServiceImpl());
  const cloudService = cloudServiceInterface(CloudServiceImpl());
  const googleAuthService = googleAuthServiceInterface(googleAuthServiceImpl());

  /**
   * Unified response sender to reduce code duplication.
   * Sends JSON response with standardized format.
   *
   * @param res - Express Response object
   * @param statusCode - HTTP status code
   * @param message - Message describing the response
   * @param data - Additional data to include in the response (e.g., tokens)
   */
  const sendResponse = (
    res: Response,
    statusCode: number,
    message: string,
    data: Record<string, any> = {}
  ) => {
    return res.status(statusCode).json({
      status: statusCode >= 400 ? 'error' : 'success',
      message,
      ...data
    });
  };

  /**
   * Helper function to handle login logic for student, instructor, and admin.
   * This avoids duplicating the same login flow.
   *
   * @param req - Express Request object
   * @param res - Express Response object
   * @param loginFn - The login use case function to call
   * @param userRepo - The relevant user repository
   * @param successMessage - Message to send on successful login
   */
  const handleLogin = async (
    req: Request,
    res: Response,
    loginFn: (
      email: string,
      password: string,
      userRepo: any,
      refreshTokenRepo: any,
      authService: any
    ) => Promise<{ accessToken: string; refreshToken: string }>,
    userRepo: any,
    successMessage: string
  ) => {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken } = await loginFn(
        email,
        password,
        userRepo,
        dbRepositoryRefreshToken,
        authService
      );
      sendResponse(res, 200, successMessage, { accessToken, refreshToken });
    } catch (error) {
      sendResponse(res, 500, 'Error during login', { error: error.message });
    }
  };

  // ================= STUDENT =================

  /**
   * Register a new student.
   * Calls the studentRegister use case and sends back tokens on success.
   */
  const registerStudent = asyncHandler(async (req: Request, res: Response) => {
    const student: StudentRegisterInterface = req.body;
    const { accessToken, refreshToken } = await studentRegister(
      student,
      dbRepositoryUser,
      dbRepositoryRefreshToken,
      authService
    );
    sendResponse(res, 200, 'Successfully registered the user', {
      accessToken,
      refreshToken
    });
  });

  /**
   * Student login handler using unified login helper.
   */
  const loginStudent = asyncHandler(async (req: Request, res: Response) =>
    handleLogin(req, res, studentLogin, dbRepositoryUser, 'User logged in successfully')
  );

  /**
   * Login with Google for student.
   * Uses Google Auth service and returns tokens.
   */
  const loginWithGoogle = asyncHandler(async (req: Request, res: Response) => {
    const { credential }: { credential: string } = req.body;
    if (!credential) {
      sendResponse(res, 400, 'Google login credential is missing');
      return;
    }

    try {
      const { accessToken, refreshToken } = await signInWithGoogle(
        credential,
        googleAuthService,
        dbRepositoryUser,
        dbRepositoryRefreshToken,
        authService
      );
      sendResponse(res, 200, 'Successfully logged in with Google', {
        accessToken,
        refreshToken
      });
    } catch (error) {
      sendResponse(res, 500, 'Error during Google login', { error: error.message });
    }
  });

  // =============== INSTRUCTOR ===============

  /**
   * Register a new instructor.
   * Handles file uploads and calls instructorRegister use case.
   * Sends a pending verification message.
   */
  const registerInstructor = asyncHandler(async (req: Request, res: Response) => {
    const files = req.files as {
      profilePic?: Express.Multer.File[];
      certificates?: Express.Multer.File[];
    };

    if (!files || !files.profilePic || !files.certificates) {
      sendResponse(res, 400, 'Profile picture and certificates are required');
      return;
    }

    const instructor: InstructorInterface = req.body;

    try {
      // رفع الصورة الشخصية
      const profilePicUpload = await cloudService.uploadAndGetUrl(files.profilePic[0]);

      // رفع الشهادات بشكل متوازي
      const certificatesUploads = await Promise.all(
        files.certificates.map(cert => cloudService.uploadAndGetUrl(cert))
      );

      await instructorRegister(
        instructor,
        files,
        dbRepositoryInstructor,
        authService,
        cloudService
      );

      sendResponse(
        res,
        200,
        'Your registration is pending verification by the administrators. You will receive an email once your registration is approved'
      );
    } catch (error) {
      sendResponse(res, 500, 'Error during instructor registration', { error: error.message });
    }
  });

  /**
   * Instructor login handler using unified login helper.
   */
  const loginInstructor = asyncHandler(async (req: Request, res: Response) =>
    handleLogin(req, res, instructorLogin, dbRepositoryInstructor, 'Instructor logged in successfully')
  );

  // ================== ADMIN ==================

  /**
   * Admin login handler using unified login helper.
   */
  const loginAdmin = asyncHandler(async (req: Request, res: Response) =>
    handleLogin(req, res, adminLogin, dbRepositoryAdmin, 'Successfully logged in')
  );

  // Export controller methods
  return {
    loginStudent,
    registerStudent,
    loginWithGoogle,
    registerInstructor,
    loginInstructor,
    loginAdmin
  };
};

export default authController;
