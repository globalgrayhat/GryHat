import { StorageConfig } from '../../types/storageConfig';
import { StorageConfigDocument } from '../../types/storageConfigDocument';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { StorageConfigModel } from '../../frameworks/database/mongodb/models/storageConfig';

export const storageConfigDbRepository = (
  repository: ReturnType<typeof storageConfigRepoMongoDb>
) => {
  const getConfig = async (): Promise<StorageConfigDocument | null> => {
    const config = await StorageConfigModel.findOne();
    return config ? config.toObject() as StorageConfigDocument : null;
  };

  const createConfig = async (config: Partial<StorageConfig>) => {
    return await repository.createConfig(config);
  };

  const updateConfig = async (id: string, updates: Partial<StorageConfig>) => {
    return await repository.updateConfig(id, updates);
  };

  const upsertConfig = async (config: Partial<StorageConfig>): Promise<StorageConfig> => {
    const existing = await getConfig();

    if (existing) {
      await updateConfig(existing._id.toString(), {
        ...config,
        updatedAt: new Date()
      });
      return {
        ...existing,
        ...config,
        updatedAt: new Date()
      };
    } else {
      const created = await createConfig({
        ...config,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true
      });
      return created as StorageConfig;
    }
  };

  return {
    getConfig,
    createConfig,
    updateConfig,
    upsertConfig
  };
};

export type StorageConfigDbRepository = ReturnType<typeof storageConfigDbRepository>;
