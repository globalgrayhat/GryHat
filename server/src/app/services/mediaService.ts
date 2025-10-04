/**
 * MediaService — single entrypoint to manage uploads (Local/S3) & chunk finalization.
 * - uploadWithContext: enforces LMS foldering (courses/{courseId}/{kind}/[lessonId]/originalName)
 * - uploadOne/uploadMany: generic uploads via configured provider
 * - uploadProfilePicLocal: profile avatars under users/{userId}/profile-pics
 * - finalizeChunk: promotes completed chunk sessions into provider
 */
import { cloudServiceInterface } from './cloudServiceInterface';
import { CloudServiceImpl } from '../../frameworks/services';
import { lmsUploadService } from '../../frameworks/services/lmsUploadService';
export type MediaDescriptor = { name: string; key?: string; url: string };

export const mediaService = () => {
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const lms = lmsUploadService();

  /** Upload a single file to a context-aware path (courses/<id>/<kind>/[lesson]/name). */
  const uploadWithContext = async (
    file: Express.Multer.File,
    ctx: { courseId: string; kind: string; lessonId?: string }
  ): Promise<MediaDescriptor> => {
    const safe = (v: string = '') => String(v).replace(/[^a-zA-Z0-9._-]+/g, '_');
    const parts = ['courses', safe(ctx.courseId), ctx.kind];
    if (ctx.lessonId) parts.push(safe(ctx.lessonId));
    const key = parts.join('/') + '/' + safe(file.originalname || 'file');
    const res = await (cloud as any).uploadAtPath?.(file, key) ?? await cloud.uploadAndGetUrl(file);
    return { name: file.originalname, key: (res as any)?.key, url: res.url };
  };

  /** Generic single upload using active provider. */
  const uploadOne = async (file: Express.Multer.File): Promise<MediaDescriptor> => {
    const up = await cloud.uploadAndGetUrl(file);
    return { name: up?.name || file.originalname, key: (up as any)?.key, url: up.url };
  };

  /** Generic multi upload using active provider. */
  const uploadMany = async (files: Express.Multer.File[]): Promise<MediaDescriptor[]> => {
    const out: MediaDescriptor[] = [];
    for (const f of files) {
      out.push(await uploadOne(f));
    }
    return out;
  };

  /** Upload a profile picture under users/<userId>/profile-pics/name.ext */
  const uploadProfilePicLocal = async (userId: string, file: Express.Multer.File): Promise<MediaDescriptor> => {
    const safe = (v: string = '') => String(v).replace(/[^a-zA-Z0-9._-]+/g, '_');
    const key = `users/${safe(userId)}/profile-pics/${safe(file.originalname || 'avatar')}`;
    const res = await (cloud as any).uploadAtPath?.(file, key) ?? await cloud.uploadAndGetUrl(file);
    return { name: file.originalname, key: (res as any)?.key, url: res.url };
  };

  /** Finalize chunk sessions (chunked upload (no tus)) into configured storage. */
  const finalizeChunk = async (ids: string[]): Promise<MediaDescriptor[]> => {
    const out: MediaDescriptor[] = [];
    for (const id of ids) {
      const { name, url, key } = await (lms as any).finalizeToCloud(id, cloud as any);
      out.push({ name, url, key });
    }
    return out;
  };

  /** Helper to pick 'resources' files regardless of upload style (array vs field). */
  const pickResourceFiles = (files: Record<string, Express.Multer.File[]>) => {
    const all = Array.isArray((files as any)) ? (files as any as Express.Multer.File[]) : [];
    if (all.length) return all;
    return files?.resources || [];
  };

  return { uploadWithContext, uploadOne, uploadMany, uploadProfilePicLocal, finalizeChunk, pickResourceFiles };
};

export type MediaService = ReturnType<typeof mediaService>;
