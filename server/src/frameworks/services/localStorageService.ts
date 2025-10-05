import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * A service for managing file storage on the local filesystem.
 * This is suitable for development or single-server deployments.
 * It mimics a cloud storage interface for consistency.
 */
export const localStorageService = () => {
  const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

  /**
   * Generates a unique, random filename while preserving the original extension.
   * @param originalName The original name of the uploaded file.
   * @returns A new, randomized filename.
   */
  const generateFilename = (originalName: string) => {
    const randomString = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName);
    return `${randomString}${ext}`;
  };

  /**
   * Reads the content of a Multer file object, whether it's in a buffer or a temporary path.
   * This provides flexibility in handling different Multer storage strategies.
   * @param file The Multer file object.
   * @returns A promise that resolves to the file content as a Uint8Array.
   */
  const readFileContent = async (file: Express.Multer.File): Promise<Uint8Array> => {
    // The file object type can be inconsistent, so we cast to 'any' for robust property checking.
    const anyFile = file as any;

    if (anyFile.buffer && Buffer.isBuffer(anyFile.buffer)) {
      // If content is in a buffer (e.g., from memoryStorage), use it directly.
      return Uint8Array.from(anyFile.buffer as Buffer);
    }

    if (anyFile.path) {
      // If content is in a file path (e.g., from diskStorage), read it from disk.
      const buffer = await fs.promises.readFile(anyFile.path as string);
      return Uint8Array.from(buffer);
    }

    throw new Error('No file buffer or path was available for upload.');
  };

  /**
   * Uploads a file to a specific, structured path (key) within the upload directory.
   * @param file The Multer file object to upload.
   * @param key The relative destination path (e.g., "courses/course123/image.jpg").
   * @returns An object containing the original name and the storage key.
   */
  const uploadAtPath = async (file: Express.Multer.File, key: string) => {
    const absolutePath = path.join(UPLOAD_DIR, key);
    // Ensure the destination directory exists.
    await fs.promises.mkdir(path.dirname(absolutePath), { recursive: true });

    const fileContent = await readFileContent(file);
    await fs.promises.writeFile(absolutePath, fileContent);

    return { name: file.originalname, key };
  };

  /**
   * Uploads a file with a randomly generated name to the root of the upload directory.
   * @param file The Multer file object to upload.
   * @returns An object containing the original name and the generated storage key.
   */
  const uploadFile = async (file: Express.Multer.File) => {
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = generateFilename(file.originalname);
    const filePath = path.join(UPLOAD_DIR, filename);

    const fileContent = await readFileContent(file);
    await fs.promises.writeFile(filePath, fileContent);

    return { name: file.originalname, key: filename };
  };

  /**
   * Uploads a file and returns its public-facing URL.
   * @param file The Multer file object to upload.
   * @returns An object with the name, key, and a URL to access the file.
   */
  const uploadAndGetUrl = async (file: Express.Multer.File) => {
    const result = await uploadFile(file);
    // The URL is constructed based on a conventional public path.
    return { ...result, url: `/uploads/${result.key}` };
  };

  /**
   * Gets the absolute filesystem path for a given storage key.
   * @param fileKey The key (filename) of the file.
   * @returns The absolute path to the file.
   */
  const getFile = async (fileKey: string) => path.join(UPLOAD_DIR, fileKey);

  /**
   * Creates a readable stream for a file, useful for video streaming.
   * @param key The key (filename) of the file.
   * @returns A readable stream of the file content.
   */
  const getVideoStream = async (key: string) =>
    fs.createReadStream(path.join(UPLOAD_DIR, key));

  /**
   * Returns a publicly accessible URL for a file. For local storage, this is a direct path.
   * @param fileKey The key (filename) of the file.
   * @returns A URL path string.
   */
  const getCloudFrontUrl = async (fileKey: string) => `/uploads/${fileKey}`;

  /**
   * Deletes a file from the local storage.
   * @param fileKey The key (filename) of the file to remove.
   */
  const removeFile = async (fileKey: string) => {
    const filePath = path.join(UPLOAD_DIR, fileKey);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      // Ignore errors if the file doesn't exist, making the operation idempotent.
    }
  };

  // Expose all public methods of the service.
  return {
    uploadFile,
    uploadAndGetUrl,
    uploadAtPath,
    getFile,
    getVideoStream,
    getCloudFrontUrl,
    removeFile
  };
};

export type LocalStorageService = ReturnType<typeof localStorageService>;
