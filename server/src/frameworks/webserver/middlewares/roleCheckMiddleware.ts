import { NextFunction, Response } from 'express';
import { CustomRequest } from '../../../types/customRequest';
import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { UserRole } from '../../../constants/enums';

// Define a simple hierarchy for roles. Lower values correspond to higher
// privileges. Owners outrank admins, who outrank instructors, who outrank
// students. When adding new roles ensure they are represented in this map
// with appropriate ordering. Note that 'owner' is not part of the original
// UserRole enum but is included here to support the Owner discriminator.
const ROLE_HIERARCHY: Record<string, number> = {
  owner: 0,
  [UserRole.Admin]: 1,
  [UserRole.Instructor]: 2,
  [UserRole.Student]: 3
};

/**
 * Middleware that restricts access to routes based on a required role. By
 * accepting a `UserRole` enum value instead of a raw string, the compiler can
 * warn about invalid roles at development time. If the authenticated user's
 * role matches the provided role, the request is allowed to proceed.
 */
/**
 * Middleware that restricts access to routes based on one or more roles.
 * When multiple roles are provided, the user must match any one of
 * those roles (or have a higher privilege according to the
 * `ROLE_HIERARCHY`). This enables flexible restrictions such as
 * allowing both instructors and admins to access a route. Roles are
 * compared using their numeric ranking defined in ROLE_HIERARCHY.
 *
 * @param roles A single role or an array of roles that are allowed to
 *              access the route.
 */
const roleCheckMiddleware = (
  roles: keyof typeof ROLE_HIERARCHY | Array<keyof typeof ROLE_HIERARCHY>
) => {
  return (req: CustomRequest, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!userRole) {
      return next(
        new AppError('Unable to determine user role', HttpStatusCodes.UNAUTHORIZED)
      );
    }
    const userRank = ROLE_HIERARCHY[userRole];
    if (userRank === undefined) {
      return next(new AppError('Unknown user role', HttpStatusCodes.UNAUTHORIZED));
    }
    // Normalize roles into an array for unified processing
    const roleArray = Array.isArray(roles) ? roles : [roles];
    // Determine the highest permitted rank (i.e. lowest numeric value)
    const permittedRank = roleArray
      .map((r) => ROLE_HIERARCHY[r])
      .reduce((min, rank) => (rank < min ? rank : min), Number.MAX_SAFE_INTEGER);
    // Allow if the user's rank is equal to or higher privilege (lower
    // number) than the highest permitted rank
    if (userRank <= permittedRank) {
      return next();
    }
    return next(new AppError('Unauthorized role', HttpStatusCodes.UNAUTHORIZED));
  };
};

export default roleCheckMiddleware;