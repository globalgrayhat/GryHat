import StorageConfigModel from '../models/storageConfig';
import { StorageProvider } from '../../../../constants/enums';
import { StorageConfig } from '../../../../types/storageConfig';

/**
 * MongoDB-based implementation of the storage configuration repository.
 * Ensures a single configuration document is managed centrally.
 * Automatically defaults to `local` storage if no configuration is present.
 */
export const storageConfigRepoMongoDb = () => {
  /**
   * Fetch the current storage configuration from the database.
   * If no configuration exists, defaults to `local` provider with no credentials.
   *
   * @returns Storage configuration object.
   */
  const getConfig = async (): Promise<StorageConfig> => {
    const doc = await StorageConfigModel.findOne().lean();

    return {
      provider: doc?.provider ?? StorageProvider.Local,
      credentials: doc?.credentials ?? undefined
    };
  };

  /**
   * Insert or update the storage configuration.
   * If a config already exists, it will be completely replaced with the new one.
   *
   * @param config The new configuration object to save.
   * @returns The saved configuration object.
   */
  const upsertConfig = async (config: StorageConfig): Promise<StorageConfig> => {
    await StorageConfigModel.findOneAndUpdate(
      {}, // Always operate on the single config document
      {
        provider: config.provider,
        credentials: config.provider === StorageProvider.Local ? undefined : config.credentials
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    return config;
  };

  return {
    getConfig,
    upsertConfig
  };
};

export type StorageConfigRepoMongoDb = ReturnType<typeof storageConfigRepoMongoDb>;
