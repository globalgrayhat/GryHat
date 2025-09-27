import { StorageProvider } from '../../../constants/enums';
import { StorageConfig, StorageCredentials } from '../../../types/storageConfig';
import { StorageConfigDbRepository } from '../../repositories/storageConfigDbRepository';

/**
 * Use case for updating the storage configuration. Only administrators should
 * invoke this operation. The caller is responsible for validating the
 * credentials (e.g. verifying that access keys correspond to a real
 * provider) before passing them here.
 *
 * @param config The new storage configuration to persist.
 * @param repository The storage configuration repository.
 * @returns The persisted configuration.
 */
export const updateStorageConfigU = async (
  config: StorageConfig,
  repository: StorageConfigDbRepository
): Promise<StorageConfig> => {
  const normalizedConfig: Partial<StorageConfig> = {
    provider: config.provider,
    credentials:
      config.provider === StorageProvider.Local ? undefined : config.credentials
  };

  return await repository.upsertConfig(normalizedConfig);
};

/**
 * Use case for retrieving the current storage configuration. This may be
 * necessary for displaying the current settings in an admin UI. If no
 * configuration exists, null is returned so the caller can decide on
 * defaults.
 */
export const getStorageConfigU = async (
  repository: StorageConfigDbRepository
): Promise<StorageConfig | null> => {
  return await repository.getConfig();
};