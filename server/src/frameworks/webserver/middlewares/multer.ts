import multer from 'multer';
import path from 'path';
import configKeys from '../../../config';
import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';

/**
 * @description Simplified Multer configuration.
 * All complex validation (file type, context-specific size) is now delegated to `mediaService`.
 * This middleware is now only responsible for parsing multipart/form-data and making files available in memory.
 * This makes it more reusable and keeps concerns separated.
 */

// Use memory storage to handle files as buffers, giving services flexibility.
const storage = multer.memoryStorage();

// A simple file filter to reject obviously unsupported file extensions as a first line of defense.
// More robust validation based on file content (magic numbers) will happen in the service layer.
const fileFilter: multer.Options['fileFilter'] = (req, file, cb) => {
  const allowedExtensions = [
    // Images
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg',
    // Documents
    '.pdf', '.doc', '.docx', '.txt',
    // Archives
    '.zip', '.rar', '.7z', '.tar', '.gz',
    // Videos
    '.mp4', '.mkv', '.mov', '.avi', '.webm', '.m4v'
  ];
  
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    // Note: This error may not be user-facing if a more specific error is thrown later in mediaService.
    cb(new AppError(`File extension ${ext} is not allowed.`, HttpStatusCodes.BAD_REQUEST));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    // A generous global limit to prevent server overload.
    // Specific, context-aware limits (e.g., profile pic vs. video) are enforced by `mediaService`.
    fileSize: configKeys.MAX_LMS_FILE_SIZE,
  },
});

export default upload;
