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
  const dbRepositoryCache = cacheDbRepository(cacheDbRepositoryImpl(cacheClient));
  const dbRepositoryContact = contactDbRepository(contactDbRepositoryImpl());
  const authService = authServiceInterface(authServiceImpl());

  const wrapAsync = (
    fn: (req: Request | CustomRequest, res: Response) => Promise<{ message: string; data?: any }>
  ) => {
    return asyncHandler(async (req, res) => {
      const result = await fn(req, res);
      res.status(200).json({
        status: 'success',
        message: result.message,
        data: result.data ?? null
      });
    });
  };

  const changePassword = wrapAsync(async (req: CustomRequest) => {
    const passwordInfo = req.body as { currentPassword: string; newPassword: string };
    const studentId = req.user?.Id;
    await changePasswordU(studentId, passwordInfo, authService, dbRepositoryStudent);
    return { message: 'Successfully reset password' };
  });

  const updateProfile = wrapAsync(async (req: CustomRequest) => {
    const studentInfo = req.body as StudentUpdateInfo;
    const studentId = req.user?.Id;
    const profilePic = req.file
      ? {
          name: req.file.originalname,
          key: req.file.filename,
          path: `uploads/${req.file.filename}`
        }
      : undefined;
    if (profilePic) {
      await updateProfileU(studentId, studentInfo, profilePic, dbRepositoryStudent);
    } else {
      await updateProfileU(studentId, studentInfo, { name: '', key: '', path: '' }, dbRepositoryStudent);
    }
    await dbRepositoryCache.clearCache(studentId ?? '');
    return { message: 'Successfully updated your profile' };
  });

  const getStudentDetails = wrapAsync(async (req: CustomRequest) => {
    const studentId = req.user?.Id;
    const studentDetails = await getStudentDetailsU(studentId, dbRepositoryStudent);
    await dbRepositoryCache.setCache({
      key: `${studentId}`,
      expireTimeSec: 600,
      data: JSON.stringify(studentDetails)
    });
    return { message: 'Successfully retrieved student details', data: studentDetails };
  });

  const getAllStudents = wrapAsync(async () => {
    const students = await getAllStudentsU(dbRepositoryStudent);
    return { message: 'Successfully retrieved all student details', data: students };
  });

  const blockStudent = wrapAsync(async (req: Request) => {
    const studentId = req.params.studentId;
    const reason = req.body.reason;
    await blockStudentU(studentId, reason, dbRepositoryStudent);
    return { message: 'Successfully blocked student' };
  });

  const unblockStudent = wrapAsync(async (req: Request) => {
    const studentId = req.params.studentId;
    await unblockStudentU(studentId, dbRepositoryStudent);
    return { message: 'Successfully unblocked student' };
  });

  const getAllBlockedStudents = wrapAsync(async () => {
    const students = await getAllBlockedStudentsU(dbRepositoryStudent);
    return { message: 'Successfully retrieved all blocked students', data: students };
  });

  const addContact = wrapAsync(async (req: Request) => {
    const contactInfo = req.body as ContactInterface;
    await addContactU(contactInfo, dbRepositoryContact);
    return { message: 'Successfully submitted your response' };
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
