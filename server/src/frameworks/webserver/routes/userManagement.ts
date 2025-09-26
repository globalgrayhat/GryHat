import express from 'express';
import userManagementController from '../../../adapters/controllers/userManagementController';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import jwtAuthMiddleware from '../middlewares/userAuth';
import { UserRole } from '../../../constants/enums';

/**
 * Router for user management operations such as promotion and listing.
 * Promotion is restricted to owners only, whereas listing may be
 * accessible to admins and owners. Authentication is enforced via
 * jwtAuthMiddleware. See roleCheckMiddleware for hierarchical role
 * evaluation.
 */
const userManagementRouter = () => {
  const router = express.Router();
  const controller = userManagementController();
  // List all users – admin and owner can access
  router.get(
    '/list',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    controller.listUsers
  );
  // Promote a user – only owners can perform this action
  router.post(
    '/promote',
    jwtAuthMiddleware,
    roleCheckMiddleware('owner' as any),
    controller.promote
  );
  return router;
};

export default userManagementRouter;