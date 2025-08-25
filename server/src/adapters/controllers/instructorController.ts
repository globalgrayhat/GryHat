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

type InstructorActionPayload = {
  instructorId: string;
  reason: string;
};

const sendResponse = (res: Response, message: string, data: any = null): void => {
  res.json({
    status: 'success',
    message,
    data
  });
};

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

  const getInstructorRequests = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const response = await getAllInstructorRequests(dbRepositoryInstructor);
      sendResponse(res, 'Successfully retrieved all instructor requests', response);
    }
  );

  const verifyInstructor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const instructorId: string = req.params.instructorId;
      const response = await acceptInstructorRequest(
        instructorId,
        dbRepositoryInstructor,
        emailService
      );
      sendResponse(res, 'Successfully accepted instructor request', response);
    }
  );

  const rejectRequest = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { instructorId, reason }: InstructorActionPayload = req.body;
      const response = await rejectInstructorRequest(
        instructorId,
        reason,
        dbRepositoryInstructor,
        emailService
      );
      sendResponse(res, 'Successfully rejected instructor request', response);
    }
  );

  const getAllInstructor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const instructors = await getAllInstructors(dbRepositoryInstructor);
      sendResponse(res, 'Successfully fetched all instructor information', instructors);
    }
  );

  const blockInstructor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { instructorId, reason }: InstructorActionPayload = req.body;
      const response = await blockInstructors(instructorId, reason, dbRepositoryInstructor);
      sendResponse(res, 'Successfully blocked the instructor', response);
    }
  );

  const unblockInstructor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const instructorId: string = req.params.instructorId;
      const response = await unblockInstructors(instructorId, dbRepositoryInstructor);
      sendResponse(res, 'Successfully unblocked the instructor', response);
    }
  );

  const getBlockedInstructor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const response = await getBlockedInstructors(dbRepositoryInstructor);
      sendResponse(res, 'Successfully fetched blocked instructors', response);
    }
  );

  const getInstructorById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const instructorId = req.params.instructorId;
      const response = await getInstructorByIdUseCase(instructorId, dbRepositoryInstructor);
      sendResponse(res, 'Successfully fetched instructor info', response);
    }
  );

  const updateProfile = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const instructorId = req.user?.Id;
      if (!instructorId) {
        res.status(400).json({
          status: 'fail',
          message: 'Instructor ID missing in request user',
          data: null
        });
        return;
      }

      const instructorInfo = req.body;
      const profilePic: Express.Multer.File = req.file as Express.Multer.File;

      if (profilePic) {
        const localService = localStorageService();
        const uploaded = await localService.uploadAndGetUrl(profilePic);
        instructorInfo.profilePic = uploaded;
      }

      await updateProfileU(instructorId, instructorInfo, undefined, dbRepositoryInstructor);
      sendResponse(res, 'Successfully updated profile');
    }
  );

  const changePassword = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const passwordInfo: { currentPassword: string; newPassword: string } = req.body;
      const instructorId: string | undefined = req.user?.Id;

      if (!instructorId) {
        res.status(400).json({
          status: 'fail',
          message: 'Instructor ID missing in request user',
          data: null
        });
        return;
      }

      await changePasswordU(instructorId, passwordInfo, authService, dbRepositoryInstructor);
      sendResponse(res, 'Successfully reset password');
    }
  );

  const getStudentsForInstructors = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const instructorId: string | undefined = req.user?.Id;

      if (!instructorId) {
        res.status(400).json({
          status: 'fail',
          message: 'Instructor ID missing in request user',
          data: null
        });
        return;
      }

      const students = await getStudentsForInstructorsU(instructorId, dbRepositoryCourse);
      sendResponse(res, 'Successfully retrieved all students', students);
    }
  );

  const getInstructorDetails = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const instructorId = req.user?.Id;

      if (!instructorId) {
        res.status(400).json({
          status: 'fail',
          message: 'Instructor ID missing in request user',
          data: null
        });
        return;
      }

      const instructor = await getInstructorByIdUseCase(instructorId, dbRepositoryInstructor);
      sendResponse(res, 'Successfully retrieved instructor details', instructor);
    }
  );

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