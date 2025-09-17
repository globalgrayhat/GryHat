import { StudentsDbInterface } from '../repositories/studentDbRepository';
import AppError from '../../utils/appError';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import { AuthServiceInterface } from '../services/authServicesInterface';
import dotenv from 'dotenv';
dotenv.config();
import {
  StudentInterface,
  StudentUpdateInfo
} from '../../types/studentInterface';

export const changePasswordU = async (
  id: string | undefined,
  password: { currentPassword: string; newPassword: string },
  authService: ReturnType<AuthServiceInterface>,
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!id) {
    throw new AppError('Invalid student', HttpStatusCodes.BAD_REQUEST);
  }
  if (!password.currentPassword) {
    throw new AppError(
      'Please provide current password',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const student: StudentInterface | null = await studentDbRepository.getStudent(
    id
  );
  if (!student) {
    throw new AppError('Unauthorized user', HttpStatusCodes.NOT_FOUND);
  }
  const isPasswordCorrect = await authService.comparePassword(
    password.currentPassword,
<<<<<<< HEAD
    student?.password || ''
=======
    student?.password
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      'Sorry, your current password is incorrect.',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (!password.newPassword) {
    throw new AppError(
      'new password cannot be empty',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const hashedPassword = await authService.hashPassword(password.newPassword);
  await studentDbRepository.changePassword(id, hashedPassword);
};

export const updateProfileU = async (
  id: string | undefined,
  studentInfo: StudentUpdateInfo,
  profilePic: {
    name: string;
<<<<<<< HEAD
=======
    key: string;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    path: string;
  },
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!id) {
    throw new AppError('Invalid student', HttpStatusCodes.BAD_REQUEST);
  }
  if (Object.keys(studentInfo).length === 0) {
    throw new AppError(
      'At least update a single field',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (profilePic) {
    console.log('profilePic', profilePic);
    const FinalStudentInfo = {
      ...studentInfo,
      profilePic: {
        name: profilePic.name,
<<<<<<< HEAD
        url: profilePic.path
      }
    };
    console.log('FinalStudentInfo', FinalStudentInfo);
    const response = await studentDbRepository
      .updateProfile(id, FinalStudentInfo)
      .then((res) => {
        console.log('res', res);
      });
=======
        key: profilePic.key,
        url: `http://localhost:${process.env.PORT}/${profilePic.path}`
      }
    };
    console.log('FinalStudentInfo', FinalStudentInfo);
    const response = await studentDbRepository.updateProfile(
      id,
      FinalStudentInfo
    );
    console.log('response', response);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    return response;
  }
  return await studentDbRepository.updateProfile(id, studentInfo);
};

export const getStudentDetailsU = async (
  id: string | undefined,
  studentDbRepository: ReturnType<StudentsDbInterface>
) => {
  if (!id) {
    throw new AppError(
      'Please provide a valid student id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const studentDetails: StudentInterface | null =
    await studentDbRepository.getStudent(id);
  if (studentDetails?.profilePic?.url) {
    studentDetails.profilePic.url = `http://localhost:${process.env.PORT}/uploads/${studentDetails.profilePic.url}`;
  }
  if (studentDetails) {
    studentDetails.password = 'no password';
  }
  return studentDetails;
};
