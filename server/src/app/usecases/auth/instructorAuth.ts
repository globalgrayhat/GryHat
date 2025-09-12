import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import {
  SavedInstructorInterface,
  InstructorInterface
} from '../../../types/instructorInterface';
import AppError from '../../../utils/appError';
import { InstructorDbInterface } from '../../../app/repositories/instructorDbRepository';
import { AuthServiceInterface } from '../../../app/services/authServicesInterface';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';
import { UserRole } from '../../../constants/enums';

export const instructorRegister = async (
  instructor: InstructorInterface,
  files: { [fieldname: string]: Express.Multer.File[] },
  instructorRepository: ReturnType<InstructorDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  instructor.certificates = [];
  const { password = '', email = '' }: InstructorInterface = instructor;
  instructor.email = email.toLowerCase();
  const isEmailAlreadyRegistered =
    await instructorRepository.getInstructorByEmail(instructor.email);

  if (isEmailAlreadyRegistered) {
    throw new AppError(
      'Instructor with the same email already exists..!',
      HttpStatusCodes.CONFLICT
    );
  }

  if (files.profilePic && files.profilePic.length > 0) {
    const profilePicFile = files.profilePic[0];
    instructor.profilePic = {
      name: profilePicFile.originalname,
      url: `http://localhost:${process.env.PORT}/uploads/registration/anonymous/profile-pics/${profilePicFile.filename}`
    };
  }

  if (files.certificates && files.certificates.length > 0) {
    for (const certificateFile of files.certificates) {
      instructor.certificates.push({
        name: certificateFile.originalname,
        url: `http://localhost:${process.env.PORT}/uploads/registration/anonymous/certificates/${certificateFile.filename}`
      });
    }
  }

  if (password) {
    instructor.password = await authService.hashPassword(password);
  }

  const response = await instructorRepository.addInstructor(instructor);

  return response
    ? { status: true, message: 'Successfully registered!' }
    : { status: false, message: 'Failed to register!' };
};

export const instructorLogin = async (
  email: string,
  password: string,
  instructorRepository: ReturnType<InstructorDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  const instructor: SavedInstructorInterface | null =
    await instructorRepository.getInstructorByEmail(email);
  if (!instructor) {
    throw new AppError(
      "Instructor doesn't exist, please register",
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  if (!instructor.isVerified) {
    throw new AppError(
      'Your details is under verification please try again later',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const isPasswordCorrect = await authService.comparePassword(
    password,
    instructor.password
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      'Sorry, your password is incorrect. Please try again',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const payload = {
    Id: instructor._id,
    email: instructor.email,
    role: UserRole.Instructor
  };
  await refreshTokenRepository.deleteRefreshToken(instructor._id);
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);
  await refreshTokenRepository.saveRefreshToken(
    instructor._id,
    refreshToken,
    expirationDate
  );
  return {
    accessToken,
    refreshToken
  };
};
