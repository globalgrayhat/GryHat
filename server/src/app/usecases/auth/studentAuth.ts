import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { StudentInterface } from '../../../types/studentInterface';
import AppError from '../../../utils/appError';
import { StudentsDbInterface } from '../../repositories/studentDbRepository';
import { AuthServiceInterface } from '../../services/authServicesInterface';
import { StudentRegisterInterface } from '../../../types/studentRegisterInterface';
import { GoogleAuthServiceInterface } from '../../../app/services/googleAuthServicesInterface';
import { UserRole } from '../../../constants/enums';
import { RefreshTokenDbInterface } from '../../../app/repositories/refreshTokenDBRepository';
export const studentRegister = async (
  student: StudentRegisterInterface,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  student.email = student?.email?.toLowerCase();
  const isEmailAlreadyRegistered = await studentRepository.getStudentByEmail(
    student.email
  );
  if (isEmailAlreadyRegistered) {
    throw new AppError(
      'User with same email already exists...!',
      HttpStatusCodes.CONFLICT
    );
  }
  if (student.password) {
    student.password = await authService.hashPassword(student.password);
  }
  if (student.interests) {
    const interests: Array<string> = [];
    student.interests.map((interest: any) => interests.push(interest.label));
    student.interests = interests;
  }

  // Save the new student and explicitly cast the result so we can safely
  // access typed properties like email. Mongoose returns a Document,
  // which does not include our typed fields by default, so we cast to
  // any and convert the _id to a string for JWT compatibility.
  const createdStudent: any = await studentRepository.addStudent(student);
  const studentId: string = createdStudent._id.toString();
  const email = createdStudent.email;
  const payload = {
    Id: studentId,
    email,
    role: UserRole.Student
  } as const;
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);
  await refreshTokenRepository.saveRefreshToken(
    studentId,
    refreshToken,
    expirationDate
  );
  return { accessToken, refreshToken };
};

export const studentLogin = async (
  email: string,
  password: string,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  const student: StudentInterface | null =
    await studentRepository.getStudentByEmail(email);
  if (!student) {
    throw new AppError("this user doesn't exist", HttpStatusCodes.NOT_FOUND);
  }
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
  // Convert the MongoDB ObjectId into a string to satisfy the
  // JwtPayload type definition. Without this conversion, TypeScript
  // complains that ObjectId is not assignable to string. We also
  // explicitly remove any existing refresh token before issuing a new
  // one.
  const payload = {
    Id: student._id.toString(),
    email: student.email,
    role: UserRole.Student
  } as const;
  await refreshTokenRepository.deleteRefreshToken(student._id.toString());
  const accessToken = authService.generateToken(payload);
  const refreshToken = authService.generateRefreshToken(payload);
  const expirationDate =
    authService.decodedTokenAndReturnExpireDate(refreshToken);
  await refreshTokenRepository.saveRefreshToken(
    student._id.toString(),
    refreshToken,
    expirationDate
  );

  return { accessToken, refreshToken };
};

export const signInWithGoogle = async (
  credential: string,
  googleAuthService: ReturnType<GoogleAuthServiceInterface>,
  studentRepository: ReturnType<StudentsDbInterface>,
  refreshTokenRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  const user = await googleAuthService.verify(credential);
  const isUserExist = await studentRepository.getStudentByEmail(user.email);
  if (isUserExist) {
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
    // When a new Google user registers, cast the saved document to any
    // to access its typed properties. Convert the ObjectId to a string
    // for the JWT payload and refresh token repository.
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
