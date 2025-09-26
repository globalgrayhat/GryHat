import { ok, created, fail, err } from '../../shared/http/respond';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { UserDbRepository } from '../../app/repositories/userDbRepository';
import { userRepoMongoDb } from '../../frameworks/database/mongodb/repositories/userRepoMongoDb';
import { userDbRepository } from '../../app/repositories/userDbRepository';
import { promoteUser } from '../../app/usecases/management/roleManagement';

/**
 * Controller for user management operations such as promoting roles and
 * retrieving all users. Access to these endpoints is restricted via
 * middleware (see routing configuration). Each handler is wrapped with
 * asyncHandler to gracefully propagate errors to the error handler.
 */
const userManagementController = () => {
  const repo = userDbRepository(userRepoMongoDb());

  // Promote a user to a new role
  const promote = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, role } = req.body as { userId: string; role: string };
    const result = await promoteUser(userId, role, repo);
    ok(res, 'User role updated successfully', result);
  });

  // Retrieve a list of all users
  const listUsers = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const users = await repo.getAllUsers();
    ok(res, 'Users fetched successfully', users);
  });

  return {
    promote,
    listUsers
  };
};

export default userManagementController;