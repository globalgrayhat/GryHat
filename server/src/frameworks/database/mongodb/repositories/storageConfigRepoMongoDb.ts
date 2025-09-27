import { StorageConfigModel } from '../models/storageConfig';
import { StorageConfig as StorageConfigType } from '@src/types/storageConfig';

export const storageConfigRepoMongoDb = () => {
  const getConfig = async (): Promise<StorageConfigType | null> => {
    return await StorageConfigModel.findOne({ isActive: true });
  };

  const createConfig = async (config: Partial<StorageConfigType>) => {
    return await StorageConfigModel.create(config);
  };

  const updateConfig = async (id: string, updates: Partial<StorageConfigType>) => {
    return await StorageConfigModel.findByIdAndUpdate(
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

export type StorageConfigRepositoryMongoDb = ReturnType<typeof storageConfigRepoMongoDb>;
