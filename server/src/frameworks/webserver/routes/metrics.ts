import express from 'express';
import metricsController from '../../../adapters/controllers/metricsController';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';

/**
 * Router exposing performance metrics. Access to this endpoint is
 * restricted to administrators and owners by default. See the
 * roleCheckMiddleware for details of role hierarchy.
 */
const metricsRouter = () => {
  const router = express.Router();
  const controller = metricsController();
  // Only admins and owners are allowed to fetch metrics
  router.get(
    '/',
    roleCheckMiddleware(UserRole.Admin),
    controller.fetchMetrics
  );
  return router;
};

export default metricsRouter;