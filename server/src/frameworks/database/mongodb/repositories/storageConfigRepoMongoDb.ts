import StorageConfigModel, {
  StorageConfigDocument
} from '../models/storageConfig';
import { StorageProvider } from '../../../../constants/enums';
import { StorageConfig, StorageCredentials } from '../../../../types/storageConfig';

/**
 * MongoDB repository for interacting with the storage configuration. The
 * configuration is stored as a single document in the `StorageConfig` collection.
 * These helper functions encapsulate the persistence logic and hide
 * implementation details from the rest of the application.
 */
export const storageConfigRepoMongoDb = () => {
  /**
   * Retrieves the current storage configuration. If no configuration has been
   * explicitly saved, a default is returned. The default uses the S3 provider
   * and pulls credentials from environment variables via the config module.
   */
  const getConfig = async (): Promise<StorageConfig | null> => {
    const doc = await StorageConfigModel.findOne().lean<StorageConfigDocument | null>();
    if (!doc) {
      return null;
    }
    return {
      provider: doc.provider as StorageProvider,
      credentials: doc.credentials ?? undefined
    };
  };

  /**
   * Creates or updates the storage configuration. Only one configuration
   * document is stored, so subsequent calls will overwrite the previous
   * configuration. When updating, all fields are replaced to ensure
   * consistency. Partial updates should be performed by the caller prior to
   * invocation.
   *
   * @param config The new storage configuration to persist.
   */
  const upsertConfig = async (config: StorageConfig): Promise<StorageConfig> => {
    await StorageConfigModel.findOneAndUpdate(
      {},
      {
        provider: config.provider,
        credentials: config.credentials ?? {}
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return config;
  };

  return {
    getConfig,
    upsertConfig
  };
};

export type StorageConfigRepoMongoDb = typeof storageConfigRepoMongoDb;