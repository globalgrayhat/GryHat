import { StorageProvider } from '../../../constants/enums';
import { StorageConfig } from '../../../types/storageConfig';
import { StorageConfigDbRepository } from '../../repositories/storageConfigDbRepository';

/**
 * Use case for updating the media storage configuration.
 * This operation should only be invoked by system administrators.
 * 
 * @param config - New storage settings to persist.
 * @param repository - The storage config repository (injected).
 * @returns The saved configuration after normalization.
 */
export const updateStorageConfigU = async (
  config: StorageConfig,
  repository: StorageConfigDbRepository
): Promise<StorageConfig> => {
  const isLocal = config.provider === StorageProvider.Local;

  // Avoid persisting unnecessary credentials for local storage.
  const normalizedConfig: StorageConfig = {
    provider: config.provider,
    credentials: isLocal ? undefined : config.credentials
  };

  return await repository.upsertConfig(normalizedConfig);
};

/**
 * Use case for retrieving the currently active storage configuration.
 * This is useful for admin dashboards, upload services, or diagnostics.
 * 
 * @param repository - The storage config repository (injected).
 * @returns The active storage configuration, or null if none exists.
 */
export const getStorageConfigU = async (
  repository: StorageConfigDbRepository
): Promise<StorageConfig | null> => {
  return await repository.getConfig();
};
