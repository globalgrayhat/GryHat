import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const localStorageService = () => {
  const uploadDir = path.resolve(process.cwd(), 'uploads');

  const generateFilename = (originalName: string) => {
    const randomString = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(originalName);
    return `${randomString}${ext}`;
  };

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

  const uploadFile = async (file: Express.Multer.File) => {
    await fs.promises.mkdir(uploadDir, { recursive: true });
    const filename = generateFilename(file.originalname);
    const filePath = path.join(uploadDir, filename);

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

export type LocalStorageService = typeof localStorageService;
