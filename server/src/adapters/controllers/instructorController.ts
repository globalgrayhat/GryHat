<<<<<<< HEAD
import { ok } from '../../shared/http/respond';
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
<<<<<<< HEAD

/**
 * Instructor controller: management + profile/security endpoints.
 * Uniform responses via respond.ts; thin delegates to use-cases.
 */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
<<<<<<< HEAD
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

=======
  const dbRepositoryInstructor = instructorDbRepository(
    instructorDbRepositoryImpl()
  );
  const dbRepositoryCourse = courseDbRepository(courseDbRepositoryImpl());
  const emailService = emailServiceInterface(emailServiceImpl());

  //? INSTRUCTOR MANAGEMENT
  const getInstructorRequests = asyncHandler(
    async (req: Request, res: Response) => {
      const response = await getAllInstructorRequests(dbRepositoryInstructor);
      res.json({
        status: 'success',
        message: 'Successfully retrieved all instructor requests',
        data: response
      });
    }
  );

  const verifyInstructor = asyncHandler(async (req: Request, res: Response) => {
    const instructorId: string = req.params.instructorId;
    const response = await acceptInstructorRequest(
      instructorId,
      dbRepositoryInstructor,
      emailService
    );
    res.json({
      status: 'success',
      message: 'Successfully accepted instructor request',
      data: response
    });
  });

  const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
    const { instructorId, reason }: { instructorId: string; reason: string } =
      req.body;
    const response = await rejectInstructorRequest(
      instructorId,
      reason,
      dbRepositoryInstructor,
      emailService
    );
    res.json({
      status: 'success',
      message: 'Successfully rejected instructor request',
      data: response
    });
  });

  const getAllInstructor = asyncHandler(async (req: Request, res: Response) => {
    const instructors = await getAllInstructors(dbRepositoryInstructor);
    res.json({
      status: 'success',
      message: 'Successfully fetched all instructor information',
      data: instructors
    });
  });

  const blockInstructor = asyncHandler(async (req: Request, res: Response) => {
    const { instructorId, reason }: { instructorId: string; reason: string } =
      req.body;
    const response = await blockInstructors(
      instructorId,
      reason,
      dbRepositoryInstructor
    );
    res.json({
      status: 'success',
      message: 'Successfully blocked the instructor',
      data: response
    });
  });

  const unblockInstructor = asyncHandler(
    async (req: Request, res: Response) => {
      const instructorId: string = req.params.instructorId;
      const response = await unblockInstructors(
        instructorId,
        dbRepositoryInstructor
      );
      res.json({
        status: 'success',
        message: 'Successfully unblocked the instructor',
        data: response
      });
    }
  );

  const getBlockedInstructor = asyncHandler(
    async (req: Request, res: Response) => {
      const response = await getBlockedInstructors(dbRepositoryInstructor);
      res.json({
        status: 'success',
        message: 'Successfully fetched blocked instructors',
        data: response
      });
    }
  );

  const getInstructorById = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      let instructorId = req.params.instructorId;
      const response = await getInstructorByIdUseCase(
        instructorId,
        dbRepositoryInstructor
      );
      res.json({
        status: 'success',
        message: 'Successfully fetched instructor info',
        data: response
      });
    }
  );

  const updateProfile = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const instructorId = req.user?.Id;
      const instructorInfo = req.body;
      const profilePic: Express.Multer.File = req.file as Express.Multer.File;
      // Always store instructor profile pictures locally regardless of the
      // configured storage provider. This prevents profile photos from
      // being uploaded to remote storage such as AWS S3. If a picture is
      // provided, upload it using the local storage service and attach
      // the resulting metadata to the instructorInfo.profilePic field.
      if (profilePic) {
        // Use the local storage service directly to store the profile
        // picture locally. UploadAndGetUrl returns name, key, and url.
        const localService = localStorageService();
        const uploaded = await localService.uploadAndGetUrl(profilePic);
        instructorInfo.profilePic = uploaded;
      }
      // Pass undefined for profilePic so that the usecase does not attempt
      // to upload the picture again using the cloudService.
      await updateProfileU(
        instructorId,
        instructorInfo,
        undefined,
        dbRepositoryInstructor
      );
      res.json({
        status: 'success',
        message: 'Successfully updated profile',
        data: null
      });
    }
  );

  const changePassword = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const passwordInfo: { currentPassword: string; newPassword: string } =
        req.body;
      const instructorId: string | undefined = req.user?.Id;
      await changePasswordU(
        instructorId,
        passwordInfo,
        authService,
        dbRepositoryInstructor
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully reset password',
        data: null
      });
    }
  );

  const getStudentsForInstructors = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const instructorId: string | undefined = req.user?.Id;
      const students = await getStudentsForInstructorsU(
        instructorId,
        dbRepositoryCourse
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved all students',
        data: students
      });
    }
  );

  const getInstructorDetails = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const instructorId = req.user?.Id;
      const instructor = await getInstructorByIdUseCase(
        instructorId ?? '',
        dbRepositoryInstructor
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved instructor details...',
        data: instructor
      });
    }
  );

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
