import StorageConfig from '../models/storageConfig';
import { StorageConfig as StorageConfigType } from '@src/types/storageConfig';

export const storageConfigRepoMongoDb = () => {
  const getConfig = async (): Promise<StorageConfigType | null> => {
    return await StorageConfig.findOne({ isActive: true });
  };

  const createConfig = async (config: Partial<StorageConfigType>) => {
    return await StorageConfig.create(config);
  };

  const updateConfig = async (id: string, updates: Partial<StorageConfigType>) => {
    return await StorageConfig.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  };

  return {
    getConfig,
    createConfig,
    updateConfig
  };
};

export type StorageConfigRepositoryMongoDb = typeof storageConfigRepoMongoDb;