import { NextFunction, Response } from 'express';
import { CustomRequest } from '../../../types/customRequest';
import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { UserRole } from '../../../constants/enums';

/**
 * Middleware that restricts access to routes based on a required role. By
 * accepting a `UserRole` enum value instead of a raw string, the compiler can
 * warn about invalid roles at development time. If the authenticated user's
 * role matches the provided role, the request is allowed to proceed.
 */
const roleCheckMiddleware = (roleToCheck: UserRole) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (role === roleToCheck) {
      next();
    } else {
      throw new AppError('Unauthorized role', HttpStatusCodes.UNAUTHORIZED);
    }
  };
};

export default roleCheckMiddleware;