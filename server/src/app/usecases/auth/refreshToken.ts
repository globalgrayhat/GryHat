import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { RefreshTokenDbInterface } from '../../repositories/refreshTokenDBRepository';
import { AuthServiceInterface } from '../../services/authServicesInterface';
// NOTE: This file lives three directories deep under src/app/usecases/auth.
// We need to traverse up three levels to reach src/types/common and
// src/constants/enums. Using the wrong relative path causes runtime
// resolution failures in the compiled output.
import { JwtPayload } from '../../../types/common';
import { UserRole } from '../../../constants/enums';

export const refreshTokenU = async (
  refreshToken: string,
  refreshDbRepository: ReturnType<RefreshTokenDbInterface>,
  authService: ReturnType<AuthServiceInterface>
) => {
  if (!refreshToken) {
    throw new AppError('Refresh token not found', HttpStatusCodes.NOT_FOUND);
  }
  const existingToken = await refreshDbRepository.findRefreshToken(
    refreshToken
  );

  if (!existingToken) {
    throw new AppError(
      'Refresh token not exists',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const expirationDate = new Date(existingToken.expiresAt);
  if (new Date() > expirationDate) {
    throw new AppError(
      'Refresh token has expired',
      HttpStatusCodes.UNAUTHORIZED
    );
  }
  const decoded = authService.decodeToken(existingToken.token);
  // Initialize with default values; default role set to Student to satisfy
  // the JwtPayload type. This value will be overwritten if decode succeeds.
  const payload: JwtPayload = {
    Id: '',
    email: '',
    role: UserRole.Student
  };
  if (decoded) {
    payload.Id = decoded?.payload?.Id;
    payload.email = decoded?.payload?.email;
    // Ensure the role from the decoded token matches the UserRole enum
    // or fallback to Student if undefined
    payload.role = decoded?.payload?.role as UserRole ?? UserRole.Student;
  }
  const accessToken = authService.generateToken(payload);

  return accessToken;
};
