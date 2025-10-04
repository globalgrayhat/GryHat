// server/src/adapters/controllers/authController.ts

import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { AuthService } from '../../frameworks/services/authService';
import { AuthServiceInterface } from '../../app/services/authServicesInterface';

import { StudentsDbInterface } from '../../app/repositories/studentDbRepository';
import { StudentRepositoryMongoDB } from '../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';

import { studentLogin, studentRegister, signInWithGoogle } from '../../app/usecases/auth/studentAuth';

import { instructorRegister, instructorLogin } from '../../app/usecases/auth/instructorAuth';
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

import { ok } from '../../shared/http/respond';

/**
 * Auth controller
 * - Keeps handlers thin, returns unified responses.
 * - IMPORTANT: handlers return Promise<void> (no Response return) to satisfy Express types.
 * - Routes remain unchanged.
 */
const authController = (
  authServiceInterface: AuthServiceInterface,
  authServiceImpl: AuthService,
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
  // Wire dependencies
  const dbRepositoryUser = studentDbRepository(studentDbRepositoryImpl());
  const dbRepositoryInstructor = instructorDbRepository(instructorDbRepositoryImpl());
  const dbRepositoryAdmin = adminDbRepository(adminDbRepositoryImpl());
  const dbRepositoryRefreshToken = refreshTokenDbRepository(refreshTokenDbRepositoryImpl());
  const authService = authServiceInterface(authServiceImpl());
  const googleAuthService = googleAuthServiceInterface(googleAuthServiceImpl());

  /** ---------------------- STUDENT ---------------------- */

  const registerStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const student: StudentRegisterInterface = req.body;
    const { accessToken, refreshToken } = await studentRegister(
      student,
      dbRepositoryUser,
      dbRepositoryRefreshToken,
      authService
    );
    ok(res, 'Successfully registered the user', { accessToken, refreshToken });
  });

  const loginStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken } = await studentLogin(
      email,
      password,
      dbRepositoryUser,
      dbRepositoryRefreshToken,
      authService
    );
    ok(res, 'User logged in successfully', { accessToken, refreshToken });
  });

  const loginWithGoogle = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { credential } = req.body as { credential: string };
    const { accessToken, refreshToken } = await signInWithGoogle(
      credential,
      googleAuthService,
      dbRepositoryUser,
      dbRepositoryRefreshToken,
      authService
    );
    ok(res, 'Successfully logged in with Google', { accessToken, refreshToken });
  });

  /** -------------------- INSTRUCTOR --------------------- */

  const registerInstructor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Files (multer memory storage)
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};
    const instructor: InstructorInterface = req.body;
  
    // Delegate everything (including uploads) to the use-case (DRY)
    await instructorRegister(instructor, files, dbRepositoryInstructor, authService);
  
    ok(
      res,
      'Your registration is pending verification by the administrators. You will receive an email once your registration is approved',
      null
    );
  });

  const loginInstructor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken } = await instructorLogin(
      email,
      password,
      dbRepositoryInstructor,
      dbRepositoryRefreshToken,
      authService
    );
    ok(res, 'Instructor logged in successfully', { accessToken, refreshToken });
  });

  /** ----------------------- ADMIN ----------------------- */

  const loginAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body as { email: string; password: string };
    const { accessToken, refreshToken } = await adminLogin(
      email,
      password,
      dbRepositoryAdmin,
      dbRepositoryRefreshToken,
      authService
    );
    ok(res, 'Successfully logged in', { accessToken, refreshToken });
  });

  return {
    // Student
    loginStudent,
    registerStudent,
    loginWithGoogle,
    // Instructor
    registerInstructor,
    loginInstructor,
    // Admin
    loginAdmin
  };
};

export default authController;
