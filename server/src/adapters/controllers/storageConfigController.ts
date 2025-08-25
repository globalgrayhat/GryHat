import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { StorageProvider } from '../../constants/enums';
import {
  updateStorageConfigU,
  getStorageConfigU
} from '../../app/usecases/admin/updateStorageConfig';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { StorageConfig } from '../../types/storageConfig';

/**
 * Controller responsible for managing media storage settings (S3, local, etc.).
 * This controller should be restricted to administrators only.
 */
export const storageConfigController = () => {
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  /**
   * Helper to send a standardized JSON response.
   */
  const sendResponse = (
    res: Response,
    data: any,
    message = 'Success',
    statusCode = 200
  ) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  };

  /**
   * Update storage configuration (e.g. switch between S3 or local).
   * Required: `provider` (from StorageProvider enum)
   * Optional: `credentials` object (depends on provider)
   */
  const updateConfig = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { provider, credentials } = req.body as StorageConfig;

      // Validate the provider input
      if (!Object.values(StorageProvider).includes(provider)) {
        res.status(400).json({
          status: 'fail',
          message: `Invalid storage provider: ${provider}`,
          data: null
        });
        return;
      }

      const config: StorageConfig = {
        provider,
        credentials
      };

      const saved = await updateStorageConfigU(config, repository);
      sendResponse(res, saved, 'Storage configuration updated');
    }
  );

  /**
   * Get the currently active storage configuration.
   * If nothing is set, defaults to 'local' provider.
   */
  const getConfig = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const config = await getStorageConfigU(repository);
      sendResponse(res, config, 'Current storage configuration');
    }
  );

  return {
    updateConfig,
    getConfig
  };
};
