import { StorageConfig } from '../../types/storageConfig';

/**
 * Repository interface for persisting and retrieving the storage configuration.
 * Use dependency injection to pass in a concrete implementation at runtime.
 */
export type StorageConfigDbRepository = {
  /** Returns the current storage configuration or null if none exists. */
  getConfig: () => Promise<StorageConfig | null>;
  /** Inserts or updates the storage configuration. */
  upsertConfig: (config: StorageConfig) => Promise<StorageConfig>;
};

/**
 * Factory for creating the repository from a concrete implementation. This
 * indirection enables mocking during testing and decouples usecases from
 * database-specific details.
 */
export const storageConfigDbRepository = (
  repository: {
    getConfig: () => Promise<StorageConfig | null>;
    upsertConfig: (config: StorageConfig) => Promise<StorageConfig>;
  }
): StorageConfigDbRepository => {
  return {
    getConfig: repository.getConfig,
    upsertConfig: repository.upsertConfig
  };
};