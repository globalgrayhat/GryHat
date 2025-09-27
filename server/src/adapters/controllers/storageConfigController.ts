import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import {
  getStorageConfigU,
  updateStorageConfigU
} from '../../app/usecases/storageConfig/storageConfigManagement';

import { StorageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { StorageConfigRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';

/**
 * Storage configuration controller
 *
 * @param storageConfigDbRepository - High-level repository (with upsert logic)
 * @param storageConfigDbRepositoryImpl - MongoDB-specific repository
 */
const storageConfigController = (
  storageConfigDbRepository: StorageConfigDbRepository,
  storageConfigDbRepositoryImpl: StorageConfigRepositoryMongoDb  
) => {
  const getConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const config = await getStorageConfigU(storageConfigDbRepository);
    res.json({
      status: 'success',
      message: 'Storage configuration retrieved successfully',
      data: config
    });
  });

  const updateConfig = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const configData = req.body;
    const updatedConfig = await updateStorageConfigU(configData, storageConfigDbRepository);
    res.json({
      status: 'success',
      message: 'Storage configuration updated successfully',
      data: updatedConfig
    });
  });

  return {
    getConfig,
    updateConfig
  };
};

export default storageConfigController;
