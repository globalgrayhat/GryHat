import { StorageConfigRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { StorageConfig } from '../../types/storageConfig';

export const storageConfigDbRepository = (
  repository: ReturnType<StorageConfigRepositoryMongoDb>
) => {
  const getConfig = async (): Promise<StorageConfig | null> => {
    return await repository.getConfig();
  };

  const createConfig = async (config: Partial<StorageConfig>) => {
    return await repository.createConfig(config);
  };

  const updateConfig = async (id: string, updates: Partial<StorageConfig>) => {
    return await repository.updateConfig(id, updates);
  };

  return {
    getConfig,
    createConfig,
    updateConfig
  };
};

export type StorageConfigDbRepository = typeof storageConfigDbRepository;