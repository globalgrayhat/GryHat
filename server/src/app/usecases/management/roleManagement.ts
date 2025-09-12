import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { UserRole } from '../../../constants/enums';

/**
 * Promote a user to a new role. Only valid role transitions are
 * permitted. The caller must ensure that the acting user has
 * sufficient privileges to perform the change (enforced at the
 * controller level via middleware). For example, only owners can
 * promote an admin to owner, while admins may promote students
 * to instructors.
 */
export const promoteUser = async (
  userId: string,
  newRole: string,
  userRepository: ReturnType<any>
) => {
  // Validate new role
  const allowedRoles = [
    UserRole.Admin,
    UserRole.Instructor,
    UserRole.Student,
    'owner'
  ];
  if (!allowedRoles.includes(newRole as any)) {
    throw new AppError('Invalid role provided', HttpStatusCodes.BAD_REQUEST);
  }
  // Update role in database
  await userRepository.updateRole(userId, newRole);
  return { userId, newRole };
};