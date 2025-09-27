import { StorageConfigDbRepository } from '../../repositories/storageConfigDbRepository';
import { StorageConfig } from '../../../types/storageConfig';

export const getStorageConfigU = async (
  storageConfigDbRepository: StorageConfigDbRepository
) => {
  return await storageConfigDbRepository.getConfig();
};

export const updateStorageConfigU = async (
  configData: Partial<StorageConfig>,
  storageConfigDbRepository: StorageConfigDbRepository
) => {
  const existingConfig = await storageConfigDbRepository.getConfig();
  
  if (existingConfig) {
    // existingConfig is a Mongoose Document which does not expose `_id` on its
    // TypeScript interface (StorageConfig). Cast to any to access the `_id` property
    // safely. Then convert it to string for the repository update.
    const id: string | undefined = (existingConfig as any)._id
      ? (existingConfig as any)._id.toString()
      : undefined;
    if (!id) {
      throw new Error('Unable to locate storage configuration ID');
    }
    return await storageConfigDbRepository.updateConfig(id, configData);
  } else {
    return await storageConfigDbRepository.createConfig(configData);
  }
};
