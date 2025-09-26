import { ok, created, fail, err } from '../../shared/http/respond';
import { StudentsDbInterface } from '../../app/repositories/studentDbRepository';
import { StudentRepositoryMongoDB } from '../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import { AuthService } from '../../frameworks/services/authService';
import { AuthServiceInterface } from '../../app/services/authServicesInterface';
import asyncHandler from 'express-async-handler';
import { Request, Response } from 'express';
import { CustomRequest } from '../../types/customRequest';
import {
  changePasswordU,
  getStudentDetailsU,
  updateProfileU
} from '../../app/usecases/student';
import { StudentUpdateInfo } from '../../types/studentInterface';

import {
  blockStudentU,
  getAllBlockedStudentsU,
  getAllStudentsU,
  unblockStudentU
} from '../../app/usecases/management/studentManagement';
import { RedisClient } from '../../app';
import { CacheRepositoryInterface } from '../../app/repositories/cachedRepoInterface';
import { RedisRepositoryImpl } from '../../frameworks/database/redis/redisCacheRepository';
import { addContactU } from '../../app/usecases/contact';
import { ContactInterface } from '../../types/contact';
import { ContactDbInterface } from '../../app/repositories/contactDbRepository';
import { ContactRepoImpl } from '../../frameworks/database/mongodb/repositories/contactsRepoMongoDb';

const studentController = (
  authServiceInterface: AuthServiceInterface,
  authServiceImpl: AuthService,
  studentDbRepository: StudentsDbInterface,
  studentDbRepositoryImpl: StudentRepositoryMongoDB,
  contactDbRepository: ContactDbInterface,
  contactDbRepositoryImpl: ContactRepoImpl,
  cacheDbRepository: CacheRepositoryInterface,
  cacheDbRepositoryImpl: RedisRepositoryImpl,
  cacheClient: RedisClient
) => {
  const dbRepositoryStudent = studentDbRepository(studentDbRepositoryImpl());
  const dbRepositoryCache = cacheDbRepository(
    cacheDbRepositoryImpl(cacheClient)
  );
  const dbRepositoryContact = contactDbRepository(contactDbRepositoryImpl());

  const authService = authServiceInterface(authServiceImpl());
  const changePassword = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
      const passwordInfo: { currentPassword: string; newPassword: string } =
        req.body;
      const studentId: string | undefined = req.user?.Id;
      await changePasswordU(
        studentId,
        passwordInfo,
        authService,
        dbRepositoryStudent
      );
      ok(res, 'Successfully reset password', null);
    }
  );

  const updateProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
      const studentInfo: StudentUpdateInfo = req.body;
      const studentId: string | undefined = req.user?.Id;
      const profilePic: {
        name: string;
        path: string;
      } = {
        name: req.file?.originalname as string,
        path: req.file?.filename as string
      };
      await updateProfileU(
        studentId,
        studentInfo,
        profilePic,
        dbRepositoryStudent
      );
      await dbRepositoryCache.clearCache(studentId ?? '');
      ok(res, 'Successfully updated your profile', null);
    }
  );

  const getStudentDetails = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
      const studentId: string | undefined = req.user?.Id;
      const studentDetails = await getStudentDetailsU(
        studentId,
        dbRepositoryStudent
      );
      const cacheOptions = {
        key: `${studentId}`,
        expireTimeSec: 600,
        data: JSON.stringify(studentDetails)
      };
      await dbRepositoryCache.setCache(cacheOptions);
      ok(res, 'Successfully retrieved student details', studentDetails);
    }
  );

  const getAllStudents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const students = await getAllStudentsU(dbRepositoryStudent);
    ok(res, 'Successfully retrieved all student details', students);
  });

  const blockStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const studentId: string = req.params.studentId;
    const reason: string = req.body.reason;
    await blockStudentU(studentId, reason, dbRepositoryStudent);
    ok(res, 'Successfully blocked student ', null);
  });

  const unblockStudent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const studentId: string = req.params.studentId;
    await unblockStudentU(studentId, dbRepositoryStudent);
    ok(res, 'Successfully unblocked student ', null);
  });

  const getAllBlockedStudents = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const students = await getAllBlockedStudentsU(dbRepositoryStudent);
      ok(res, 'Successfully unblocked student ', students);
    }
  );

  const addContact = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contactInfo: ContactInterface = req.body;
    await addContactU(contactInfo, dbRepositoryContact);
    ok(res, 'Successfully Submitted your response ', null);
  });

  return {
    changePassword,
    updateProfile,
    getStudentDetails,
    blockStudent,
    unblockStudent,
    getAllStudents,
    getAllBlockedStudents,
    addContact
  };
};

export default studentController;