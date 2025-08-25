import { StorageConfig } from '../../types/storageConfig';

/**
 * Abstract interface for accessing the storage configuration repository.
 * Used by use cases to avoid hardcoding the DB implementation.
 */
export type StorageConfigDbRepository = {
  /**
   * Get the current storage configuration.
   * Returns `null` if no config is found.
   */
  getConfig: () => Promise<StorageConfig | null>;

  /**
   * Insert or update the current storage configuration.
   */
  upsertConfig: (config: StorageConfig) => Promise<StorageConfig>;
};

/**
 * Factory function that wraps a concrete implementation (e.g., MongoDB).
 * Promotes loose coupling and easier testing/mocking.
 */
export const storageConfigDbRepository = (repository: {
  getConfig: () => Promise<StorageConfig | null>;
  upsertConfig: (config: StorageConfig) => Promise<StorageConfig>;
}): StorageConfigDbRepository => ({
  getConfig: repository.getConfig,
  upsertConfig: repository.upsertConfig
});
