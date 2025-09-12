// server/src/frameworks/webserver/routes/storageConfig.ts
import express from 'express';
import storageConfigController from '../../../adapters/controllers/storageConfigController';
import { storageConfigDbRepository } from '../../../app/repositories/storageConfigDbRepository';
import { storageConfigRepoMongoDb } from '../../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';

const storageConfigRouter = express.Router();

const controller = storageConfigController(
  storageConfigDbRepository,
  storageConfigRepoMongoDb
);

/**
 * @swagger
 * /api/storage-config:
 *   get:
 *     summary: Get current storage configuration
 *     tags: [Storage Configuration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Storage configuration retrieved successfully
 */
storageConfigRouter.get(
  '/',
  roleCheckMiddleware(UserRole.Admin),
  controller.getConfig
);

/**
 * @swagger
 * /api/storage-config:
 *   put:
 *     summary: Update storage configuration
 *     tags: [Storage Configuration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [local, s3, google_drive, dropbox, vimeo]
 *               credentials:
 *                 type: object
 *                 properties:
 *                   accessKeyId:
 *                     type: string
 *                   secretAccessKey:
 *                     type: string
 *                   region:
 *                     type: string
 *                   bucketName:
 *                     type: string
 *                   cloudFrontDistributionId:
 *                     type: string
 *                   cloudFrontDomainName:
 *                     type: string
 *     responses:
 *       200:
 *         description: Storage configuration updated successfully
 */
storageConfigRouter.put(
  '/',
  roleCheckMiddleware(UserRole.Admin),
  controller.updateConfig
);

export default storageConfigRouter;