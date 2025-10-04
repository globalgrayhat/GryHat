import { CloudServiceImpl } from '../../frameworks/services';

export const cloudServiceInterface = (service: ReturnType<CloudServiceImpl>) => {
  const upload = async (file: Express.Multer.File) => service.uploadFile(file);

  const uploadAndGetUrl = async (file: Express.Multer.File) =>
    service.uploadAndGetUrl(file);

  // New: optional when provider supports path-based keys
  const uploadAtPath = async (file: Express.Multer.File, key: string) =>
    (service as any).uploadAtPath
      ? (service as any).uploadAtPath(file, key)
      : service.uploadAndGetUrl(file);

  const getFile = async (fileKey: string) => service.getFile(fileKey);
  const getVideoStream = async (fileKey: string) => service.getVideoStream(fileKey);
  const getCloudFrontUrl = async (fileKey: string) => service.getCloudFrontUrl(fileKey);
  const removeFile = async (fileKey: string) => service.removeFile(fileKey);

  return {
    upload,
    uploadAndGetUrl,
    uploadAtPath,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile
  };
};

export type CloudServiceInterface = typeof cloudServiceInterface;
