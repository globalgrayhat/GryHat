import { StorageProvider } from '../../constants/enums';
import { s3Service } from './s3CloudService';
import { localStorageService } from './localStorageService';
import { storageConfigRepoMongoDb } from '../database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';

/**
 * Dynamic storage factory. Uses DB config to pick Local or S3 on each call.
 * IMPORTANT: Default is LOCAL to avoid DNS/ENOTFOUND errors in dev.
 */
export const CloudServiceImpl = () => {
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

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
  };

  return {
    /** Upload a file using the active provider. */
    uploadFile: async (file: Express.Multer.File) => {
      const service = await selectService();
      return await service.uploadFile(file);
    },

    /** Upload and return a public URL using the active provider. */
    uploadAndGetUrl: async (file: Express.Multer.File) => {
      const service = await selectService();
      return await service.uploadAndGetUrl(file);
    },

    /**
     * Upload using a specific key/path decided by caller.
     * Keeps foldering consistent across providers.
     */
    uploadAtPath: async (file: Express.Multer.File, key: string) => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        // S3 variant accepts an explicit object key
        return await service.uploadAtKey(file, key);
      }
      // Local default: write at a relative path and expose under /uploads
      const service = localStorageService();
      const { name, key: rel } = await service.uploadAtPath(file, key);
      return { name, key: rel, url: `/uploads/${rel}` };
    },

    /** Retrieve a file (stream or buffer depending on provider). */
    getFile: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.getFile(fileKey);
      }
      const service = localStorageService();
      return await service.getFile(fileKey);
    },

    /** Video streaming helper. */
    getVideoStream: async (fileKey: string): Promise<NodeJS.ReadableStream> => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.getVideoStream(fileKey);
      }
      const service = localStorageService();
      return await service.getVideoStream(fileKey);
    },

    /** CloudFront signed URL passthrough for S3; local returns direct path. */
    getCloudFrontUrl: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.getCloudFrontUrl(fileKey);
      }
      const service = localStorageService();
      return await service.getCloudFrontUrl(fileKey);
    },

    /** Remove a stored file. */
    removeFile: async (fileKey: string) => {
      const config = await repository.getConfig();
      if (config?.provider === StorageProvider.S3) {
        const service = s3Service(config.credentials);
        return await service.removeFile(fileKey);
      }
      const service = localStorageService();
      return await service.removeFile(fileKey);
    }
  };
};

export type CloudServiceImpl = typeof CloudServiceImpl;

export { vimeoService } from './vimeoService';
export { youtubeService } from './youtubeService';
export { liveStreamService } from './liveStreamService';
