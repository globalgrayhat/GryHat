import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { SendEmailService } from '@src/frameworks/services/sendEmailService';
import { InstructorDbInterface } from '@src/app/repositories/instructorDbRepository';

export const getAllInstructorRequests = async (
  instructorRepository: ReturnType<InstructorDbInterface>
) => {
  const allRequests = await instructorRepository.getInstructorRequests();
  if (allRequests.length === 0) {
    return null;
  }
  return allRequests;
};

export const acceptInstructorRequest = async (
  instructorId: string,
  instructorRepository: ReturnType<InstructorDbInterface>,
  emailService: ReturnType<SendEmailService>
) => {
  if (!instructorId) {
    throw new AppError('Invalid instructor id', HttpStatusCodes.BAD_REQUEST);
  }
  const response = await instructorRepository.acceptInstructorRequest(
    instructorId
  );
  // Mongoose models return Document instances which do not expose custom
  // properties like `email` on the type. Cast to any to access these fields
  // safely. Optionally call toObject() when available to get a plain object.
  const responseObj: any = response && typeof (response as any).toObject === 'function'
    ? (response as any).toObject()
    : (response as any);
  if (responseObj) {
    // Use the casted object to access the email property
    await emailService.sendEmail(
      responseObj.email,
      'Successfully verified your profile',
      'You are verified'
    );
  }
  return responseObj;
};

export const rejectInstructorRequest = async (
  instructorId: string,
  reason: string,
  instructorRepository: ReturnType<InstructorDbInterface>,
  emailService: ReturnType<SendEmailService>
) => {
  if (!instructorId || !reason) {
    throw new AppError(
      'InstructorId or reason cannot be empty',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const rejected = await instructorRepository.checkRejected(instructorId);
  if (rejected) {
    throw new AppError(
      'Already rejected this request',
      HttpStatusCodes.CONFLICT
    );
  }
  const response = await instructorRepository.rejectInstructorRequest(
    instructorId,
    reason
  );
  const responseObj: any = response && typeof (response as any).toObject === 'function'
    ? (response as any).toObject()
    : (response as any);
  if (responseObj) {
    await emailService.sendEmail(
      responseObj.email,
      'Sorry your request is rejected',
      reason
    );
  }
  return responseObj;
};

export const getAllInstructors = async (
  instructorRepository: ReturnType<InstructorDbInterface>
) => {
  const instructors = await instructorRepository.getAllInstructors();
  // Convert each instructor document into a plain object to access dynamic
  // properties like profilePic and assign computed profileUrl. Without this
  // cast TypeScript complains that these properties do not exist on the
  // Document type returned by Mongoose.
  const instructorsObj = instructors.map((inst) => {
    const instructor: any = typeof (inst as any).toObject === 'function'
      ? (inst as any).toObject()
      : (inst as any);
    if (instructor.profilePic) {
      instructor.profileUrl = instructor.profilePic.url;
    }
    return instructor;
  });
  return instructorsObj;
};

export const blockInstructors = async (
  instructorId: string,
  reason: string,
  instructorRepository: ReturnType<InstructorDbInterface>
) => {
  if (!instructorId || !reason) {
    throw new AppError(
      'Please provide instructor id and reason',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const response = await instructorRepository.blockInstructors(
    instructorId,
    reason
  );
  return response;
};

export const unblockInstructors = async (
  instructorId: string,
  instructorRepository: ReturnType<InstructorDbInterface>
) => {
  if (!instructorId) {
    throw new AppError('Invalid instructor id', HttpStatusCodes.BAD_REQUEST);
  }
  const response = await instructorRepository.unblockInstructors(instructorId);
  return response;
};

export const getBlockedInstructors = async (
  instructorRepository: ReturnType<InstructorDbInterface>
) => {
  const blockedInstructors = await instructorRepository.getBlockedInstructors();
  const blockedObjs = blockedInstructors.map((inst) => {
    const instructor: any = typeof (inst as any).toObject === 'function'
      ? (inst as any).toObject()
      : (inst as any);
    if (instructor.profilePic) {
      instructor.profileUrl = instructor.profilePic.url ?? '';
    }
    return instructor;
  });
  return blockedObjs;
};

export const getInstructorByIdUseCase = async (
  instructorId: string,
  instructorRepository: ReturnType<InstructorDbInterface>
) => {
  if (!instructorId) {
    throw new AppError('Invalid instructor id', HttpStatusCodes.BAD_REQUEST);
  }
  const result = await instructorRepository.getInstructorById(instructorId);
  const instructor: any = result && typeof (result as any).toObject === 'function'
    ? (result as any).toObject()
    : (result as any);
  if (instructor?.profilePic) {
    instructor.profileUrl = instructor.profilePic.url;
  }
  if (instructor) {
    instructor.password = 'no password';
  }
  return instructor;
};
