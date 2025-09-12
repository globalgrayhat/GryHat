// server/src/frameworks/webserver/routes/liveStream.ts

import { Router } from 'express';
import jwtAuthMiddleware from '../middlewares/userAuth';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
// Note: routes live under src/frameworks/webserver/routes, while controllers
// reside in src/adapters/controllers. We need to traverse up three
// directories to reach the root of src and then into adapters.
import { liveStreamController } from '../../../adapters/controllers/liveStreamController';

/**
 * Router for live stream operations. Requires the user to be authenticated
 * for all routes. Additional role checks are applied per endpoint. The
 * controller enforces finer-grained authorisation (e.g. only the
 * creator can start or end a stream).
 */
const liveStreamRouter = () => {
  const router = Router();
  const controller = liveStreamController();

  // Schedule a new live stream. Only instructors, admins or owners
  // may schedule streams.
  router.post(
    '/',
    jwtAuthMiddleware,
    roleCheckMiddleware([UserRole.Instructor, UserRole.Admin, UserRole.Owner]),
    controller.schedule
  );

  // Start a live stream. Authentication and authorisation are
  // performed in the controller (requires instructor owner of
  // stream, admin or owner).
  router.post(
    '/:streamId/start',
    jwtAuthMiddleware,
    roleCheckMiddleware([UserRole.Instructor, UserRole.Admin, UserRole.Owner]),
    controller.start
  );

  // End a live stream. Same roles as start.
  router.post(
    '/:streamId/end',
    jwtAuthMiddleware,
    roleCheckMiddleware([UserRole.Instructor, UserRole.Admin, UserRole.Owner]),
    controller.end
  );

  // Post a chat message. Any authenticated user may chat in a live
  // stream; role checks are enforced in the controller to ensure the
  // stream is live.
  router.post(
    '/:streamId/chat',
    jwtAuthMiddleware,
    controller.chat
  );

  // Get metadata for a stream. Publicly accessible for demonstration.
  router.get('/:streamId', controller.get);

  return router;
};

export default liveStreamRouter;