import { StorageProvider } from '../../constants/enums';
import { s3Service } from './s3CloudService';
import { localStorageService } from './localStorageService';
import { storageConfigRepoMongoDb } from '../database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';

/**
 * Factory function that returns a dynamic storage service. Unlike the
 * previous implementation which relied on an environment variable, this
 * version consults the storage configuration stored in the database on
 * each operation. This enables administrators to change the storage
 * provider and credentials at runtime without restarting the application.
 */
export const CloudServiceImpl = () => {
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  /**
   * Helper to determine which concrete implementation to use based on the
   * persisted configuration. Defaults to S3 when no configuration is
   * available. For local provider we return the local storage service
   * directly. For S3 provider we instantiate the service with the saved
   * credentials.
   */
  const selectService = async () => {
    const config = await repository.getConfig();
    if (!config || config.provider === StorageProvider.S3) {
      // Use S3; if credentials are provided use them, otherwise fall back to
      // environment variables through s3Service(undefined).
      return s3Service(config?.credentials);
    }
    if (config.provider === StorageProvider.Local) {
      return localStorageService();
    }
    // For providers that don't support uploading (e.g. YouTube/Vimeo), throw
    // an error so that callers know to handle this case separately. The UI
    // should prevent file uploads when these providers are selected.
    throw new Error(`Storage provider ${config.provider} does not support uploads`);
  };

  return {
    uploadFile: async (file: Express.Multer.File) => {
      const service = await selectService();
      return await service.uploadFile(file);
    },
    uploadAndGetUrl: async (file: Express.Multer.File) => {
      const service = await selectService();
      return await service.uploadAndGetUrl(file);
    },
    getFile: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (!config || config.provider === StorageProvider.S3) {
        const service = s3Service(config?.credentials);
        return await service.getFile(fileKey);
      }
      if (config.provider === StorageProvider.Local) {
        const service = localStorageService();
        return await service.getFile(fileKey);
      }
      // For YouTube/Vimeo, the fileKey is expected to be a URL; simply return it.
      return fileKey;
    },
    getVideoStream: async (key: string): Promise<NodeJS.ReadableStream> => {
      const config = await repository.getConfig();
      if (!config || config.provider === StorageProvider.S3) {
        const service = s3Service(config?.credentials);
        return await service.getVideoStream(key);
      }
      if (config.provider === StorageProvider.Local) {
        const service = localStorageService();
        return await service.getVideoStream(key);
      }
      throw new Error('Video streaming is not supported for this provider');
    },
    getCloudFrontUrl: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (!config || config.provider === StorageProvider.S3) {
        const service = s3Service(config?.credentials);
        return await service.getCloudFrontUrl(fileKey);
      }
      if (config.provider === StorageProvider.Local) {
        const service = localStorageService();
        return await service.getCloudFrontUrl(fileKey);
      }
      // For remote providers that use external URLs (e.g. YouTube/Vimeo), the
      // fileKey itself should already be a URL.
      return fileKey;
    },
    removeFile: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (!config || config.provider === StorageProvider.S3) {
        const service = s3Service(config?.credentials);
        return await service.removeFile(fileKey);
      }
      if (config.provider === StorageProvider.Local) {
        const service = localStorageService();
        return await service.removeFile(fileKey);
      }
      // Nothing to remove for providers using external URLs.
      return;
    }
  };
};

export type CloudServiceImpl = typeof CloudServiceImpl;