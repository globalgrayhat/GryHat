import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  getStorageConfigU,
  updateStorageConfigU
} from '../../app/usecases/storageConfig/storageConfigManagement';
import { StorageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { StorageConfigRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';

const storageConfigController = (
  storageConfigDbRepository: StorageConfigDbRepository,
  storageConfigDbRepositoryImpl: StorageConfigRepositoryMongoDb
) => {
  const dbRepository = storageConfigDbRepository(storageConfigDbRepositoryImpl());

  const getConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = await getStorageConfigU(dbRepository);
    res.json({
      status: 'success',
      message: 'Storage configuration retrieved successfully',
      data: config
    });
  });

  const updateConfig = asyncHandler(async (req: Request, res: Response) => {
    const configData = req.body;
    const updatedConfig = await updateStorageConfigU(configData, dbRepository);
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