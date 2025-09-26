/**
 * MediaService — single entrypoint to manage uploads (Local/S3) & TUS finalization.
 * Keeps controllers DRY and storage-agnostic.
 */
import { cloudServiceInterface } from './cloudServiceInterface';
import { CloudServiceImpl } from '../../frameworks/services';
import { localStorageService } from '../../frameworks/services/localStorageService';
import { tusUploadService } from '../../frameworks/services/tusUploadService';

export type MediaDescriptor = { name: string; key?: string; url: string };

export const mediaService = () => {
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const tus = tusUploadService();

  /** Upload a single file via active storage provider. */
  const uploadOne = async (file: Express.Multer.File): Promise<MediaDescriptor> => {
    const up = await cloud.uploadAndGetUrl(file);
    return { name: up.name || file.originalname, key: (up as any).key, url: up.url };
    // ^ key may be undefined if provider returns only URL (e.g., remote video)
  };

  /** Upload multiple files. */
  const uploadMany = async (files: Express.Multer.File[]): Promise<MediaDescriptor[]> =>
    Promise.all(files.map(uploadOne));

  /**
   * Upload profile picture strictly to LOCAL storage, regardless of DB config.
   * This preserves existing behavior while keeping controllers storage-agnostic.
   */
  const uploadProfilePicLocal = async (file: Express.Multer.File): Promise<MediaDescriptor> => {
    const local = localStorageService();
    const res = await local.uploadAndGetUrl(file);
    return { name: res.name, key: (res as any).key, url: res.url };
  };

  /** Finalize TUS uploads into the configured storage and return descriptors. */
  const finalizeTus = async (ids: string[]): Promise<MediaDescriptor[]> => {
    const out: MediaDescriptor[] = [];
    for (const id of ids) {
      const { name, url } = await tus.finalizeToCloud(id, cloud);
      out.push({ name, url, key: id });
    }
    return out;
  };

  /** Helper to pick 'resources' files regardless of upload style (array vs field). */
  const pickResourceFiles = (files: Record<string, Express.Multer.File[]>) => {
    const all = Array.isArray((files as any)) ? (files as any as Express.Multer.File[]) : [];
    if (all.length) return all;
    return files?.resources || [];
  };

  return { uploadOne, uploadMany, uploadProfilePicLocal, finalizeTus, pickResourceFiles };
};

export type MediaService = ReturnType<typeof mediaService>;
