import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import {
  SavedInstructorInterface,
  InstructorInterface
} from '@src/types/instructorInterface';
import AppError from '../../../utils/appError';
import { InstructorDbInterface } from '../../../app/repositories/instructorDbRepository';
import { AuthServiceInterface } from '../../../app/services/authServicesInterface';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';
import { CloudServiceInterface } from '@src/app/services/cloudServiceInterface';
import { UserRole } from '../../../constants/enums';

// 👇 Helper: Upload a file if it exists
const uploadFileIfExists = async (
  file: Express.Multer.File | undefined,
  cloudService: ReturnType<CloudServiceInterface>
) => {
  return file ? await cloudService.upload(file) : null;
};

export const instructorRegister = async (
  instructor: InstructorInterface,
  files: {
    profilePic?: Express.Multer.File[];
    certificates?: Express.Multer.File[];
  },
  instructorRepository: ReturnType<InstructorDbInterface>,
  authService: ReturnType<AuthServiceInterface>,
  cloudService: ReturnType<CloudServiceInterface>
) => {
  instructor.certificates = [];

  const { password = '', email = '' } = instructor;
  instructor.email = email.toLowerCase();

  // ✅ Check if email already exists
  const isEmailAlreadyRegistered = await instructorRepository.getInstructorByEmail(instructor.email);
  if (isEmailAlreadyRegistered) {
    throw new AppError(
      'Instructor with the same email already exists..!',
      HttpStatusCodes.CONFLICT
    );
  }

  // ✅ Upload profile picture
  const profileFile = files.profilePic?.[0];
  const uploadedProfile = await uploadFileIfExists(profileFile, cloudService);
  instructor.profilePic = uploadedProfile || { name: '', url: '' };

  // ✅ Upload certificates
  const certificateFiles = files.certificates || [];
  for (const cert of certificateFiles) {
    const uploadedCert = await cloudService.upload(cert);
    instructor.certificates.push(uploadedCert);
  }

  // ✅ Hash password
  if (password) {
    instructor.password = await authService.hashPassword(password);
  }

  // ✅ Save instructor to DB
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
    await instructorRepository.getInstructorByEmail(email.toLowerCase());

  if (!instructor) {
    throw new AppError(
      "Instructor doesn't exist, please register",
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  if (!instructor.isVerified) {
    throw new AppError(
      'Your details are under verification. Please try again later.',
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  const isPasswordCorrect = await authService.comparePassword(
    password,
    instructor.password
  );

  if (!isPasswordCorrect) {
    throw new AppError(
      'Incorrect password. Please try again.',
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
  const expirationDate = authService.decodedTokenAndReturnExpireDate(refreshToken);

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
