import { StorageProvider } from '../../constants/enums';
import { s3Service } from './s3CloudService';
import { localStorageService } from './localStorageService';
import { storageConfigRepoMongoDb } from '../database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';

/**
 * Service that dynamically selects a storage provider (S3 or Local)
 * based on the configuration stored in the database.
 */
export const CloudServiceImpl = () => {
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  /**
   * Selects the appropriate storage service based on the configuration.
   */
  const selectService = async () => {
    try {
      const config = await repository.getConfig();

      if (!config) {
        throw new Error('Storage configuration not found');
      }

      switch (config.provider) {
        case StorageProvider.S3:
          return s3Service(config.credentials);
        case StorageProvider.Local:
          return localStorageService();
        default:
          throw new Error(`Storage provider ${config.provider} is not supported`);
      }
    } catch (error) {
      console.error('Error selecting storage service:', error);
      throw new Error('Failed to select the storage service');
    }
  };

  /**
   * Uploads a file to the selected storage provider.
   * @param file - The file to upload.
   */
  const uploadFile = async (file: Express.Multer.File) => {
    const service = await selectService();
    return await service.uploadFile(file);
  };

  /**
   * Uploads a file and returns the URL to access the uploaded file.
   * @param file - The file to upload.
   */
  const uploadAndGetUrl = async (file: Express.Multer.File) => {
    const service = await selectService();
    return await service.uploadAndGetUrl(file);
  };

  /**
   * Gets a file from the storage provider by file key.
   * @param fileKey - The key of the file to retrieve.
   */
  const getFile = async (fileKey: string) => {
    const service = await selectService();
    return await service.getFile(fileKey);
  };

  /**
   * Gets a video stream from the storage provider by file key.
   * @param key - The key of the video to stream.
   */
  const getVideoStream = async (key: string): Promise<NodeJS.ReadableStream> => {
    const service = await selectService();
    return await service.getVideoStream(key);
  };

  /**
   * Gets the URL for accessing the file from the storage provider.
   * @param fileKey - The key of the file.
   */
  const getCloudFrontUrl = async (fileKey: string) => {
    const service = await selectService();
    return await service.getCloudFrontUrl(fileKey);
  };

  /**
   * Removes a file from the storage provider.
   * @param fileKey - The key of the file to remove.
   */
  const removeFile = async (fileKey: string) => {
    const service = await selectService();
    return await service.removeFile(fileKey);
  };

  return {
    uploadFile,
    uploadAndGetUrl,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile
  };
};

export type CloudServiceImpl = typeof CloudServiceImpl;
