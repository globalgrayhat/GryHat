import fs from 'fs';
import path from 'path';
import { CloudServiceInterface } from '../../app/services/cloudServiceInterface';

type MulterLike = Partial<Express.Multer.File> & { originalname: string; buffer: Buffer };

/**
 * Finalize a TUS upload into your configured storage (Local/S3).
 * This service reads the TUS binary file from the tus-node-server store
 * (commonly saved as "<uploadId>" or "<uploadId>.bin") and re-uploads it
 * through your cloud service abstraction, returning a public URL.
 */
export const tusUploadService = () => {
  const tusDir = process.env.TUS_DIR || path.resolve(process.cwd(), 'tus-data');

  /**
   * Try to read the original filename from "<id>.info" (DirectoryStore layout).
   * The "filename" metadata is commonly base64-encoded.
   */
  const readTusInfoName = async (uploadId: string): Promise<string | null> => {
    const infoPath = path.join(tusDir, `${uploadId}.info`);
    try {
      const raw = await fs.promises.readFile(infoPath, 'utf-8');
      const data = JSON.parse(raw);
      const metaName = data?.metadata?.filename;
      if (!metaName) return null;
      try {
        const decoded = Buffer.from(metaName, 'base64').toString('utf-8');
        return decoded || null;
      } catch {
        return String(metaName);
      }
    } catch {
      return null;
    }
  };

  /**
   * Promote a finished TUS upload into the cloud/local storage via your
   * CloudServiceInterface. Returns a { name, url } object usable by clients.
   */
  const finalizeToCloud = async (uploadId: string, cloud: ReturnType<CloudServiceInterface>) => {
    const binPath = path.join(tusDir, uploadId);
    const altBin = `${binPath}.bin`;

    const pickExisting = fs.existsSync(binPath) ? binPath : (fs.existsSync(altBin) ? altBin : null);
    if (!pickExisting) {
      throw new Error(`TUS upload not found: ${uploadId}`);
    }

    const buf = await fs.promises.readFile(pickExisting);
    const originalname = (await readTusInfoName(uploadId)) || `upload-${uploadId}`;
    const faux: MulterLike = { originalname, buffer: buf };

    const result = await cloud.uploadAndGetUrl(faux as Express.Multer.File);
    return { name: result.name, url: result.url };
  };

  return { finalizeToCloud };
};

export type TusUploadService = typeof tusUploadService;
