import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

<<<<<<< HEAD
export const localStorageService = () => {
  const uploadDir = path.resolve(process.cwd(), 'uploads');

=======
/**
 * A service for storing files on the local filesystem. The API surface
 * intentionally mirrors that of the S3 service so that callers can remain
 * agnostic of where their files are persisted. Files are written to an
 * `uploads` directory relative to the project root. When adding more complex
 * features (e.g. resumable uploads), replace these implementations with
 * calls to an appropriate library such as `tus-node-server`.
 */
export const localStorageService = () => {
  const uploadDir = path.resolve(process.cwd(), 'uploads');

  /**
   * Generates a random file name to avoid collisions. The original file
   * extension is preserved where possible.
   */
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  const generateFilename = (originalName: string) => {
    const randomString = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName);
    return `${randomString}${ext}`;
  };

<<<<<<< HEAD
  const readFileContent = async (file: Express.Multer.File): Promise<Uint8Array> => {
    const anyFile = file as any;

    if (anyFile.buffer && Buffer.isBuffer(anyFile.buffer)) {
      return Uint8Array.from(anyFile.buffer as Buffer);
    }

    if (anyFile.path) {
      const b = await fs.promises.readFile(anyFile.path as string); // Buffer
      return Uint8Array.from(b);
    }

    throw new Error('No file buffer or path available for upload');
  };

=======
  /**
   * Writes a file buffer to disk and returns its key. Consumers should treat
   * the returned key as an opaque value and should not rely on its format.
   */
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  const uploadFile = async (file: Express.Multer.File) => {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const filename = generateFilename(file.originalname);
    const filePath = path.join(uploadDir, filename);
<<<<<<< HEAD

    const u8 = await readFileContent(file); // Uint8Array
    await fs.promises.writeFile(filePath, u8);

    return { name: file.originalname, key: filename };
  };

  const uploadAndGetUrl = async (file: Express.Multer.File) => {
    const result = await uploadFile(file);
    return { ...result, url: `/uploads/${result.key}` };
  };

  const getFile = async (fileKey: string) => path.join(uploadDir, fileKey);

  const getVideoStream = async (key: string) =>
    fs.createReadStream(path.join(uploadDir, key));

  const getCloudFrontUrl = async (fileKey: string) => `/uploads/${fileKey}`;

  const removeFile = async (fileKey: string) => {
    const filePath = path.join(uploadDir, fileKey);
    try { await fs.promises.unlink(filePath); } catch { /* ignore */ }
=======
    // Node's Buffer may be based on SharedArrayBuffer which can cause
    // type mismatch errors with the fs typings. Convert to a Uint8Array
    // explicitly so that it satisfies the ArrayBufferView constraint.
    const arrayBuffer = file.buffer.buffer.slice(
      file.buffer.byteOffset,
      file.buffer.byteOffset + file.buffer.byteLength
    );
    const uint8 = new Uint8Array(arrayBuffer);
    await fs.promises.writeFile(filePath, uint8);
    return {
      name: file.originalname,
      key: filename
    };
  };

  /**
   * Uploads a file and immediately returns a relative URL that clients can use
   * to download the file. For local storage this simply prepends a public
   * `/uploads` prefix to the key. In production you might serve the static
   * files via a separate static file server.
   */
  const uploadAndGetUrl = async (file: Express.Multer.File) => {
    const result = await uploadFile(file);
    return {
      ...result,
      url: `/uploads/${result.key}`
    };
  };

  /**
   * Returns the absolute path to a file on disk given its key. The consumer
   * should handle reading the file contents or streaming it. No existence
   * checks are performed here.
   */
  const getFile = async (fileKey: string) => {
    return path.join(uploadDir, fileKey);
  };

  /**
   * Returns a readable stream for a given file key. This enables efficient
   * streaming of large video files over HTTP. If the file does not exist,
   * the underlying call will throw.
   */
  const getVideoStream = async (key: string): Promise<NodeJS.ReadableStream> => {
    const filePath = path.join(uploadDir, key);
    return fs.createReadStream(filePath);
  };

  /**
   * For local storage there is no CloudFront distribution. We still return
   * a URL relative to the `/uploads` directory so that callers can treat it
   * uniformly with other providers.
   */
  const getCloudFrontUrl = async (fileKey: string) => {
    return `/uploads/${fileKey}`;
  };

  /**
   * Deletes a file from the filesystem. If the file does not exist, the
   * promise resolves without throwing.
   */
  const removeFile = async (fileKey: string) => {
    const filePath = path.join(uploadDir, fileKey);
    try {
      await fs.promises.unlink(filePath);
    } catch {
      /* silently ignore missing files */
    }
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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

<<<<<<< HEAD
export type LocalStorageService = typeof localStorageService;
=======
export type LocalStorageService = typeof localStorageService;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
