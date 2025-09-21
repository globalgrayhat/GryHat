import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { StudentInterface } from '../../../types/studentInterface';
import AppError from '../../../utils/appError';
import { StudentsDbInterface } from '../../repositories/studentDbRepository';
import { AuthServiceInterface } from '../../services/authServicesInterface';
import { Interest, StudentRegisterInterface } from '../../../types/studentRegisterInterface';
import { GoogleAuthServiceInterface } from '../../../app/services/googleAuthServicesInterface';
import { UserRole } from '../../../constants/enums';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';

// ==================== Student Register ====================
export const studentRegister = async (
  student: StudentRegisterInterface,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  // Ensure the email is lowercase for consistency
  student.email = student?.email?.toLowerCase();

  // Check if the email is already registered
  const isEmailAlreadyRegistered = await studentRepository.getStudentByEmail(
    student.email
  );
  if (isEmailAlreadyRegistered) {
    throw new AppError(
      'User with same email already exists...!',
      HttpStatusCodes.CONFLICT
    );
  }

  // Hash the password if provided (non-Google users)
  if (student.password) {
    student.password = await authService.hashPassword(student.password);
  }

  // Normalize student interests: extract only labels
  if (student.interests) {
    student.interests = student.interests.map((interest: any) =>
      typeof interest === 'string' ? interest : interest.value || interest.label || ''
    );
  }
  
  

  // Save the new student
  // Cast to "any" because Mongoose documents don’t expose typed fields directly
  const createdStudent: any = await studentRepository.addStudent(student);
  const studentId: string = createdStudent._id.toString();
  const email = createdStudent.email;

  // Prepare JWT payload
  const payload = {
    Id: studentId,
    email,
    role: UserRole.Student
  } as const;

  // Generate access and refresh tokens
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);

  // Decode expiration date for refresh token storage
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);

  // Save refresh token in DB
  await refreshTokenRepository.saveRefreshToken(
    studentId,
    refreshToken,
    expirationDate
  );

  return { accessToken, refreshToken };
};

// ==================== Student Login ====================
export const studentLogin = async (
  email: string,
  password: string,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  // Find student by email
  const student: StudentInterface | null =
    await studentRepository.getStudentByEmail(email);

  if (!student) {
    throw new AppError("this user doesn't exist", HttpStatusCodes.NOT_FOUND);
  }

  // Compare provided password with hashed password in DB
  const isPasswordCorrect = await authService.comparePassword(
    password,
    student.password || ''
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      'Sorry, your password is incorrect. Please try again',
      HttpStatusCodes.UNAUTHORIZED
    );
  }

  // Prepare JWT payload
  // Convert MongoDB ObjectId into string for JWT compatibility
  const payload = {
    Id: student._id.toString(),
    email: student.email,
    role: UserRole.Student
  } as const;

  // Remove old refresh token before issuing a new one
  await refreshTokenRepository.deleteRefreshToken(student._id.toString());

  // Generate new tokens
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);

  // Save refresh token
  await refreshTokenRepository.saveRefreshToken(
    student._id.toString(),
    refreshToken,
    expirationDate
  );

  return { accessToken, refreshToken };
};

// ==================== Google Sign-In ====================
export const signInWithGoogle = async (
  credential: string,
  googleAuthService: ReturnType<GoogleAuthServiceInterface>,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  // Verify the Google credential and extract user info
  const user = await googleAuthService.verify(credential);

  // Check if user already exists
  const isUserExist = await studentRepository.getStudentByEmail(user.email);

  if (isUserExist) {
    // Existing user: issue new tokens and remove old refresh token
    const payload = {
      Id: isUserExist._id.toString(),
      email: isUserExist.email,
      role: UserRole.Student
    } as const;

    await refreshTokenRepository.deleteRefreshToken(isUserExist._id.toString());

    const accessToken = authService.generateToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    const expirationDate =
      authService.decodedTokenAndReturnExpireDate(refreshToken);

    await refreshTokenRepository.saveRefreshToken(
      isUserExist._id.toString(),
      refreshToken,
      expirationDate
    );

    return { accessToken, refreshToken };
  } else {
    // New Google user: create new student entry
    const createdUser: any = await studentRepository.addStudent(user);
    const userId: string = createdUser._id.toString();
    const email = createdUser.email;

    const payload = { Id: userId, email, role: UserRole.Student } as const;

    const accessToken = authService.generateToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    const expirationDate =
      authService.decodedTokenAndReturnExpireDate(refreshToken);

    await refreshTokenRepository.saveRefreshToken(
      userId,
      refreshToken,
      expirationDate
    );

    return { accessToken, refreshToken };
  }
};
