import express from 'express';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
import { storageConfigController } from '../../../adapters/controllers/storageConfigController';

/**
 * @swagger
 * tags:
 *   name: StorageConfig
 *   description: API for managing storage configuration (Admin only)
 */

const router = express.Router();

const controller = storageConfigController();

/**
 * @swagger
 * /api/storage-config:
 *   get:
 *     summary: Get current storage configuration
 *     tags: [StorageConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Returns the current storage configuration.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 storageType:
 *                   type: string
 *                   description: The type of storage configured (e.g., 'local', 's3').
 *                 bucketName:
 *                   type: string
 *                   description: Name of the storage bucket if applicable.
 *                 region:
 *                   type: string
 *                   description: Storage region (if applicable).
 *       401:
 *         description: Unauthorized - user not authenticated.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
router.get('/', roleCheckMiddleware(UserRole.Admin), controller.getConfig);

/**
 * @swagger
 * /api/storage-config:
 *   put:
 *     summary: Update storage configuration
 *     tags: [StorageConfig]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: New storage configuration data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storageType:
 *                 type: string
 *                 example: "s3"
 *               bucketName:
 *                 type: string
 *                 example: "my-bucket"
 *               region:
 *                 type: string
 *                 example: "us-east-1"
 *     responses:
 *       200:
 *         description: Storage configuration updated successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized - user not authenticated.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
router.put('/', roleCheckMiddleware(UserRole.Admin), controller.updateConfig);

export default router;
