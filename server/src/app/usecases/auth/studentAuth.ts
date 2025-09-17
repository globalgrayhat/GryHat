import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { StudentInterface } from '../../../types/studentInterface';
import AppError from '../../../utils/appError';
import { StudentsDbInterface } from '../../repositories/studentDbRepository';
import { AuthServiceInterface } from '../../services/authServicesInterface';
<<<<<<< HEAD
import { Interest, StudentRegisterInterface } from '../../../types/studentRegisterInterface';
import { GoogleAuthServiceInterface } from '../../../app/services/googleAuthServicesInterface';
import { UserRole } from '../../../constants/enums';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';

// ==================== Student Register ====================
=======
import { StudentRegisterInterface } from '../../../types/studentRegisterInterface';
import { GoogleAuthServiceInterface } from '../../../app/services/googleAuthServicesInterface';
import { UserRole } from '../../../constants/enums';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
export const studentRegister = async (
  student: StudentRegisterInterface,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
<<<<<<< HEAD
  // Ensure the email is lowercase for consistency
  student.email = student?.email?.toLowerCase();

  // Check if the email is already registered
=======
  student.email = student?.email?.toLowerCase();
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  const isEmailAlreadyRegistered = await studentRepository.getStudentByEmail(
    student.email
  );
  if (isEmailAlreadyRegistered) {
    throw new AppError(
      'User with same email already exists...!',
      HttpStatusCodes.CONFLICT
    );
  }
<<<<<<< HEAD

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
=======
  if (student.password) {
    student.password = await authService.hashPassword(student.password);
  }
  if (student.interests) {
    const interests: Array<string> = [];
    student.interests.map((interest: any) => interests.push(interest.label));
    student.interests = interests;
  }

  const { _id: studentId, email } = await studentRepository.addStudent(student);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  const payload = {
    Id: studentId,
    email,
    role: UserRole.Student
<<<<<<< HEAD
  } as const;

  // Generate access and refresh tokens
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);

  // Decode expiration date for refresh token storage
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);

  // Save refresh token in DB
=======
  };
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  await refreshTokenRepository.saveRefreshToken(
    studentId,
    refreshToken,
    expirationDate
  );
<<<<<<< HEAD

  return { accessToken, refreshToken };
};

// ==================== Student Login ====================
=======
  return { accessToken, refreshToken };
};

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
export const studentLogin = async (
  email: string,
  password: string,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
<<<<<<< HEAD
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
=======
  const student: StudentInterface | null =
    await studentRepository.getStudentByEmail(email);
  if (!student) {
    throw new AppError("this user doesn't exist", HttpStatusCodes.NOT_FOUND);
  }
  const isPasswordCorrect = await authService.comparePassword(
    password,
    student.password
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  );
  if (!isPasswordCorrect) {
    throw new AppError(
      'Sorry, your password is incorrect. Please try again',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
<<<<<<< HEAD

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
=======
  const payload = {
    Id: student._id,
    email: student.email,
    role: UserRole.Student
  };
  await refreshTokenRepository.deleteRefreshToken(student._id);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);
<<<<<<< HEAD

  // Save refresh token
  await refreshTokenRepository.saveRefreshToken(
    student._id.toString(),
=======
  await refreshTokenRepository.saveRefreshToken(
    student._id,
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    refreshToken,
    expirationDate
  );

  return { accessToken, refreshToken };
};

<<<<<<< HEAD
// ==================== Google Sign-In ====================
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
export const signInWithGoogle = async (
  credential: string,
  googleAuthService: ReturnType<GoogleAuthServiceInterface>,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
<<<<<<< HEAD
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

=======
  const user = await googleAuthService.verify(credential);
  const isUserExist = await studentRepository.getStudentByEmail(user.email);
  if (isUserExist) {
    const payload = {
      Id: isUserExist._id,
      email: isUserExist.email,
      role: UserRole.Student
    };
    await refreshTokenRepository.deleteRefreshToken(isUserExist._id);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    const accessToken = authService.generateToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    const expirationDate =
      authService.decodedTokenAndReturnExpireDate(refreshToken);
<<<<<<< HEAD

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

=======
    await refreshTokenRepository.saveRefreshToken(
      isUserExist._id,
      refreshToken,
      expirationDate
    );
    return { accessToken, refreshToken };
  } else {
    const { _id: userId, email } = await studentRepository.addStudent(user);
    const payload = { Id: userId, email, role: UserRole.Student };
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    const accessToken = authService.generateToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    const expirationDate =
      authService.decodedTokenAndReturnExpireDate(refreshToken);
<<<<<<< HEAD

=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    await refreshTokenRepository.saveRefreshToken(
      userId,
      refreshToken,
      expirationDate
    );
<<<<<<< HEAD

=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    return { accessToken, refreshToken };
  }
};
