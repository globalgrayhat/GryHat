import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { StorageProvider } from '../../constants/enums';
import { updateStorageConfigU, getStorageConfigU } from '../../app/usecases/admin/updateStorageConfig';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { StorageConfig } from '../../types/storageConfig';

/**
 * Controller responsible for managing storage configuration. Only
 * administrators should be able to invoke these handlers. They are
 * intentionally kept simple: input validation occurs at the middleware
 * layer or within the route definition, and this controller orchestrates
 * between the usecases and the HTTP layer.
 */
export const storageConfigController = () => {
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  /**
   * Updates the storage configuration. The request body should contain
   * `provider` (string) and an optional `credentials` object if needed by
   * the provider. Credentials are stored exactly as provided.
   */
  const updateConfig = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { provider, credentials } = req.body as StorageConfig;
      const config: StorageConfig = {
        provider: provider as StorageProvider,
        credentials
      };
      const saved = await updateStorageConfigU(config, repository);
      res.status(200).json({
        status: 'success',
        message: 'Storage configuration updated',
        data: saved
      });
    }
  );

  /**
   * Retrieves the current storage configuration. If none exists, an empty
   * response is returned with data set to null. This endpoint can be used by
   * the admin UI to display existing settings.
   */
  const getConfig = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const config = await getStorageConfigU(repository);
      res.status(200).json({
        status: 'success',
        message: 'Current storage configuration',
        data: config
      });
    }
  );

  return {
    updateConfig,
    getConfig
  };
};