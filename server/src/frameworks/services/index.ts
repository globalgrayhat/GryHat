import { StorageProvider } from '../../constants/enums';
import { s3Service } from './s3CloudService';
import { localStorageService } from './localStorageService';
import { storageConfigRepoMongoDb } from '../database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';

/**
<<<<<<< HEAD
 * Dynamic storage factory. Uses DB config to pick Local or S3 on each call.
 * IMPORTANT: Default is LOCAL to avoid DNS/ENOTFOUND errors in dev.
=======
 * Factory function that returns a dynamic storage service. Unlike the
 * previous implementation which relied on an environment variable, this
 * version consults the storage configuration stored in the database on
 * each operation. This enables administrators to change the storage
 * provider and credentials at runtime without restarting the application.
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
 */
export const CloudServiceImpl = () => {
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

<<<<<<< HEAD
  const selectService = async () => {
    const config = await repository.getConfig();

    if (!config) return localStorageService();

    if (config.provider === StorageProvider.Local) {
      return localStorageService();
    }

    if (config.provider === StorageProvider.S3) {
      // Only use S3 if credentials look valid; else fallback to Local
      if (config.credentials?.region && config.credentials?.bucketName) {
        return s3Service(config.credentials);
      }
      return localStorageService();
    }

    // For external-only providers (e.g., YouTube/Vimeo), uploading files
    // is not supported. Fallback to Local to keep API functional.
    return localStorageService();
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
<<<<<<< HEAD
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.getFile(fileKey);
      }
      // Local or external: for external (YouTube/Vimeo) the "key" is a URL already.
      const service = localStorageService();
      return await service.getFile(fileKey);
    },
    getVideoStream: async (fileKey: string): Promise<NodeJS.ReadableStream> => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.getVideoStream(fileKey);
      }
      const service = localStorageService();
      return await service.getVideoStream(fileKey);
    },
    getCloudFrontUrl: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.getCloudFrontUrl(fileKey);
      }
      const service = localStorageService();
      return await service.getCloudFrontUrl(fileKey);
    },
    removeFile: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.removeFile(fileKey);
      }
      const service = localStorageService();
      return await service.removeFile(fileKey);
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    }
  };
};

<<<<<<< HEAD
export type CloudServiceImpl = typeof CloudServiceImpl;

export { vimeoService } from './vimeoService';
export { youtubeService } from './youtubeService';
export { liveStreamService } from './liveStreamService';
=======
export type CloudServiceImpl = typeof CloudServiceImpl;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
