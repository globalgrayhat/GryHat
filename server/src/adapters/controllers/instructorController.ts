import { ok } from '../../shared/http/respond';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getAllInstructorRequests,
  acceptInstructorRequest,
  rejectInstructorRequest,
  getAllInstructors,
  blockInstructors,
  unblockInstructors,
  getBlockedInstructors,
  getInstructorByIdUseCase
} from '../../app/usecases/management/instructorManagement';
import { SendEmailService } from '../../frameworks/services/sendEmailService';
import { SendEmailServiceInterface } from '../../app/services/sendEmailServiceInterface';
import { InstructorDbInterface } from '../../app/repositories/instructorDbRepository';
import { InstructorRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/instructorRepoMongoDb';
import { CustomRequest } from '../../types/customRequest';
import {
  changePasswordU,
  getStudentsForInstructorsU,
  updateProfileU
} from '../../app/usecases/instructor';
import { localStorageService } from '../../frameworks/services/localStorageService';
import { AuthServiceInterface } from '../../app/services/authServicesInterface';
import { AuthService } from '../../frameworks/services/authService';
import { CourseRepositoryMongoDbInterface } from '@src/frameworks/database/mongodb/repositories/courseReposMongoDb';
import { CourseDbRepositoryInterface } from '@src/app/repositories/courseDbRepository';

/**
 * Instructor controller: management + profile/security endpoints.
 * Uniform responses via respond.ts; thin delegates to use-cases.
 */
const instructorController = (
  authServiceInterface: AuthServiceInterface,
  authServiceImpl: AuthService,
  instructorDbRepository: InstructorDbInterface,
  instructorDbRepositoryImpl: InstructorRepositoryMongoDb,
  courseDbRepository: CourseDbRepositoryInterface,
  courseDbRepositoryImpl: CourseRepositoryMongoDbInterface,
  emailServiceInterface: SendEmailServiceInterface,
  emailServiceImpl: SendEmailService
) => {
  const authService = authServiceInterface(authServiceImpl());
  const dbRepositoryInstructor = instructorDbRepository(instructorDbRepositoryImpl());
  const dbRepositoryCourse = courseDbRepository(courseDbRepositoryImpl());
  const emailService = emailServiceInterface(emailServiceImpl());

  /** -------- Management -------- */

  const getInstructorRequests = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const response = await getAllInstructorRequests(dbRepositoryInstructor);
    ok(res, 'Instructor requests retrieved', response);
  });

  const verifyInstructor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const instructorId = req.params.instructorId;
    const response = await acceptInstructorRequest(instructorId, dbRepositoryInstructor, emailService);
    ok(res, 'Instructor request accepted', response);
  });

  const rejectRequest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { instructorId, reason } = req.body as { instructorId: string; reason: string };
    const response = await rejectInstructorRequest(instructorId, reason, dbRepositoryInstructor, emailService);
    ok(res, 'Instructor request rejected', response);
  });

  const getAllInstructor = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const instructors = await getAllInstructors(dbRepositoryInstructor);
    ok(res, 'All instructors retrieved', instructors);
  });

  const blockInstructor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { instructorId, reason } = req.body as { instructorId: string; reason: string };
    const response = await blockInstructors(instructorId, reason, dbRepositoryInstructor);
    ok(res, 'Instructor blocked', response);
  });

  const unblockInstructor = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const instructorId = req.params.instructorId;
    const response = await unblockInstructors(instructorId, dbRepositoryInstructor);
    ok(res, 'Instructor unblocked', response);
  });

  const getBlockedInstructor = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const response = await getBlockedInstructors(dbRepositoryInstructor);
    ok(res, 'Blocked instructors retrieved', response);
  });

  const getInstructorById = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.params.instructorId;
    const response = await getInstructorByIdUseCase(instructorId, dbRepositoryInstructor);
    ok(res, 'Instructor info retrieved', response);
  });

  /** -------- Profile / Security -------- */

  const updateProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.user?.Id;
    const instructorInfo = req.body;
    const profilePic = req.file as Express.Multer.File | undefined;

    // Always keep profile pics local (not S3)
    if (profilePic) {
      const localService = localStorageService();
      const uploaded = await localService.uploadAndGetUrl(profilePic);
      instructorInfo.profilePic = uploaded;
    }

    await updateProfileU(instructorId, instructorInfo, undefined, dbRepositoryInstructor);
    ok(res, 'Profile updated', null);
  });

  const changePassword = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const passwordInfo = req.body as { currentPassword: string; newPassword: string };
    const instructorId = req.user?.Id;
    await changePasswordU(instructorId, passwordInfo, authService, dbRepositoryInstructor);
    ok(res, 'Password reset successfully', null);
  });

  const getStudentsForInstructors = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.user?.Id;
    const students = await getStudentsForInstructorsU(instructorId, dbRepositoryCourse);
    ok(res, 'Instructor students retrieved', students);
  });

  const getInstructorDetails = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.user?.Id ?? '';
    const instructor = await getInstructorByIdUseCase(instructorId, dbRepositoryInstructor);
    ok(res, 'Instructor details retrieved', instructor);
  });

  return {
    getInstructorRequests,
    verifyInstructor,
    rejectRequest,
    getAllInstructor,
    blockInstructor,
    unblockInstructor,
    getBlockedInstructor,
    getInstructorById,
    updateProfile,
    changePassword,
    getStudentsForInstructors,
    getInstructorDetails
  };
};

export default instructorController;
