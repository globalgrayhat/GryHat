/**
 * MediaService — The single, unified entry point for all file uploads.
 * This service centralizes validation, path/key generation, and storage operations.
 *
 * Responsibilities:
 * - Context-aware validation (file type, size limits).
 * - Standardized folder structure generation.
 * - Interaction with the underlying cloud service (Local, S3, etc.).
 * - Finalization of chunked uploads.
 */
import { cloudServiceInterface } from './cloudServiceInterface';
import { CloudServiceImpl } from '../../frameworks/services';
import { lmsUploadService } from '../../frameworks/services/lmsUploadService';
import AppError from '../../utils/appError';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import { validateFileType } from '../../utils/fileValidation';
import configKeys from '../../config';

// --- Type Definitions ---
export type MediaDescriptor = { name: string; key: string; url: string };

export type UploadContext = 
  | { type: 'profilePic'; userId: string }
  | { type: 'certificate'; userId: string }
  | { type: 'courseThumbnail'; courseId: string }
  | { type: 'courseGuidelines'; courseId: string }
  | { type: 'courseIntroduction'; courseId: string }
  | { type: 'lessonResource'; courseId: string; lessonId: string };

// --- MIME Type Definitions (Centralized) ---
const MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
  archive: ['application/zip', 'application/x-zip-compressed', 'application/x-7z-compressed', 'application/x-rar-compressed', 'application/x-tar', 'application/gzip'],
  video: ['video/mp4', 'video/x-matroska', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
};

// --- Service Implementation ---
export const mediaService = () => {
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const lms = lmsUploadService();

  /**
   * Validates a file against allowed MIME types and size limits with a fallback.
   * @param file - The Multer file object.
   * @param allowedMimes - An array of allowed MIME types.
   * @param maxSize - The maximum allowed file size in bytes.
   */
  const validateFile = async (file: Express.Multer.File, allowedMimes: string[], maxSize: number) => {
    if (!file.buffer) {
      throw new AppError('File buffer is missing. Ensure multer is using memoryStorage.', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
    if (file.size > maxSize) {
      const mb = (maxSize / (1024 * 1024)).toFixed(1);
      throw new AppError(`File is too large. Maximum size is ${mb}MB.`, HttpStatusCodes.BAD_REQUEST);
    }
    
    // 1. Primary validation: Check magic numbers via buffer.
    let isValid = await validateFileType(file.buffer, allowedMimes);

    // 2. Fallback validation: If magic number check fails, trust the mimetype from the request as a secondary check.
    if (!isValid && allowedMimes.includes(file.mimetype)) {
        console.warn(`[MediaService] Magic number validation failed for ${file.originalname}. Falling back to provided mimetype: ${file.mimetype}.`);
        isValid = true;
    }

    if (!isValid) {
      throw new AppError(`Invalid file type for '${file.originalname}'. Only ${allowedMimes.join(', ')} are permitted.`, HttpStatusCodes.BAD_REQUEST);
    }
  };

  /**
   * Generates a structured storage key based on the upload context.
   * @param file - The Multer file object (for its original name).
   * @param context - The upload context.
   * @returns A sanitized, structured key (e.g., "users/123/profile/avatar.png").
   */
  const generateKey = (file: Express.Multer.File, context: UploadContext): string => {
    const sanitize = (v: string = '') => v.replace(/[^a-zA-Z0-9._-]+/g, '_');
    const filename = `${Date.now()}-${sanitize(file.originalname)}`;

    switch (context.type) {
      case 'profilePic':
        return `users/${sanitize(context.userId)}/profile-pics/${filename}`;
      case 'certificate':
        return `users/${sanitize(context.userId)}/certificates/${filename}`;
      case 'courseThumbnail':
        return `courses/${sanitize(context.courseId)}/images/${filename}`;
      case 'courseGuidelines':
        return `courses/${sanitize(context.courseId)}/documents/${filename}`;
      case 'courseIntroduction':
        return `courses/${sanitize(context.courseId)}/introduction/${filename}`;
      case 'lessonResource':
        return `courses/${sanitize(context.courseId)}/lessons/${sanitize(context.lessonId)}/resources/${filename}`;
    }
  };
  
  /**
   * The primary method for handling all direct (non-chunked) file uploads.
   * It validates, generates a key, and uploads the file using the configured storage provider.
   * @param file - The Multer file to upload.
   * @param context - The context defining the upload type, which determines validation rules and storage path.
   * @returns A promise resolving to a MediaDescriptor ({ name, key, url }).
   */
  const upload = async (file: Express.Multer.File, context: UploadContext): Promise<MediaDescriptor> => {
    let allowedMimes: string[];
    let maxSize: number;

    // Determine validation rules based on context
    switch (context.type) {
      case 'profilePic':
        allowedMimes = MIME_TYPES.image;
        maxSize = configKeys.MAX_PROFILE_PIC_SIZE;
        break;
      case 'certificate':
        allowedMimes = [...MIME_TYPES.image, ...MIME_TYPES.document];
        maxSize = configKeys.MAX_CERTIFICATE_FILE_SIZE;
        break;
      case 'courseThumbnail':
        allowedMimes = MIME_TYPES.image;
        maxSize = configKeys.MAX_LMS_FILE_SIZE;
        break;
      case 'courseGuidelines':
      case 'lessonResource':
        allowedMimes = [...MIME_TYPES.document, ...MIME_TYPES.archive];
        maxSize = configKeys.MAX_LMS_DOCUMENT_SIZE;
        break;
      case 'courseIntroduction':
         allowedMimes = [...MIME_TYPES.video, ...MIME_TYPES.image];
         maxSize = configKeys.MAX_LMS_FILE_SIZE;
        break;
      default:
        throw new AppError('Invalid upload context.', HttpStatusCodes.INTERNAL_SERVER_ERROR);
    }
    
    // 1. Validate
    await validateFile(file, allowedMimes, maxSize);
    
    // 2. Generate Key
    const key = generateKey(file, context);
    
    // 3. Upload via the cloud service interface
    const result = await cloud.uploadAtPath(file, key);

    return { name: file.originalname, key: result.key, url: result.url };
  };
  
  /**
   * Finalizes one or more chunked upload sessions.
   * This is the bridge between `lmsUploadService` and the primary cloud storage.
   * @param uploadIds - An array of chunk session IDs to finalize.
   * @returns A promise resolving to an array of MediaDescriptors.
   */
  const finalizeChunkedUpload = async (uploadIds: string[]): Promise<MediaDescriptor[]> => {
    const results: MediaDescriptor[] = [];
    for (const id of uploadIds) {
      // The `finalizeToCloud` method in lmsUploadService will merge chunks and then use the cloud service.
      const { name, url, key } = await lms.finalizeToCloud(id);
      results.push({ name, url, key });
    }
    return results;
  };

  return {
    upload,
    finalizeChunkedUpload,
  };
};

export type MediaService = ReturnType<typeof mediaService>;

