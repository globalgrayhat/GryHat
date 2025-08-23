import express from 'express';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
import { storageConfigController } from '../../../adapters/controllers/storageConfigController';

/**
 * Defines routes for managing storage configuration. Only administrators are
 * permitted to read or update the configuration. These routes should be
 * mounted under an appropriate prefix, e.g. `/api/storage-config`, in the
 * main router.
 */
const router = express.Router();

const controller = storageConfigController();

// GET /storage-config - return the current configuration
router.get('/', roleCheckMiddleware(UserRole.Admin), controller.getConfig);

// PUT /storage-config - update the configuration
router.put('/', roleCheckMiddleware(UserRole.Admin), controller.updateConfig);

export default router;