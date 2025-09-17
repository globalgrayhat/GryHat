<<<<<<< HEAD
import { ok, created, fail, err } from '../../shared/http/respond';
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
<<<<<<< HEAD
  const changePassword = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
=======
  const changePassword = asyncHandler(
    async (req: CustomRequest, res: Response) => {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
      const passwordInfo: { currentPassword: string; newPassword: string } =
        req.body;
      const studentId: string | undefined = req.user?.Id;
      await changePasswordU(
        studentId,
        passwordInfo,
        authService,
        dbRepositoryStudent
      );
<<<<<<< HEAD
      ok(res, 'Successfully reset password', null);
    }
  );

  const updateProfile = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
=======
      res.status(200).json({
        status: 'success',
        message: 'Successfully reset password',
        data: null
      });
    }
  );

  const updateProfile = asyncHandler(
    async (req: CustomRequest, res: Response) => {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
      const studentInfo: StudentUpdateInfo = req.body;
      const studentId: string | undefined = req.user?.Id;
      const profilePic: {
        name: string;
<<<<<<< HEAD
        path: string;
      } = {
        name: req.file?.originalname as string,
        path: req.file?.filename as string
=======
        key: string;
        path: string;
      } = {
        name: req.file?.originalname as string,
        key: req.file?.filename as string,
        path: `uploads/${req.file?.filename as string}`
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
      };
      await updateProfileU(
        studentId,
        studentInfo,
        profilePic,
        dbRepositoryStudent
      );
      await dbRepositoryCache.clearCache(studentId ?? '');
<<<<<<< HEAD
      ok(res, 'Successfully updated your profile', null);
    }
  );

  const getStudentDetails = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
=======
      res.status(200).json({
        status: 'success',
        message: 'Successfully updated your profile',
        data: null
      });
    }
  );

  const getStudentDetails = asyncHandler(
    async (req: CustomRequest, res: Response) => {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
<<<<<<< HEAD
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
=======
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved student details',
        data: studentDetails
      });
    }
  );

  const getAllStudents = asyncHandler(async (req: Request, res: Response) => {
    const students = await getAllStudentsU(dbRepositoryStudent);
    res.status(200).json({
      status: 'success',
      message: 'Successfully retrieved all student details',
      data: students
    });
  });

  const blockStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId: string = req.params.studentId;
    const reason: string = req.body.reason;
    await blockStudentU(studentId, reason, dbRepositoryStudent);
    res.status(200).json({
      status: 'success',
      message: 'Successfully blocked student ',
      data: null
    });
  });

  const unblockStudent = asyncHandler(async (req: Request, res: Response) => {
    const studentId: string = req.params.studentId;
    await unblockStudentU(studentId, dbRepositoryStudent);
    res.status(200).json({
      status: 'success',
      message: 'Successfully unblocked student ',
      data: null
    });
  });

  const getAllBlockedStudents = asyncHandler(
    async (req: Request, res: Response) => {
      const students = await getAllBlockedStudentsU(dbRepositoryStudent);
      res.status(200).json({
        status: 'success',
        message: 'Successfully unblocked student ',
        data: students
      });
    }
  );

  const addContact = asyncHandler(async (req: Request, res: Response) => {
    const contactInfo: ContactInterface = req.body;
    await addContactU(contactInfo, dbRepositoryContact);
    res.status(200).json({
      status: 'success',
      message: 'Successfully Submitted your response ',
      data: null
    });
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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

<<<<<<< HEAD
export default studentController;
=======
export default studentController;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
