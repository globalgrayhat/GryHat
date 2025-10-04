/**
 * LMS upload orchestrator (chunked staging + finalize to cloud).
 * - Clean foldering: uploads/courses/{courseId}/{kind}/[lessonId]/originalName
 * - Per-course dedupe via SHA-256 (handled when registering asset)
 * - Provider-agnostic: delegates to CloudServiceImpl (Local/S3)
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { z } from 'zod';
import { CloudServiceImpl } from '.';
import { cloudServiceInterface } from '../../app/services/cloudServiceInterface';

export const COURSE_KINDS = [
  'images', 'videos', 'documents', 'archives', 'assets', 'introduction'
] as const;
export type CourseKind = typeof COURSE_KINDS[number];

const CHUNK_DIR = path.resolve(process.cwd(), '.chunks');
const ensureDir = (dir: string) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

// ---- Zod meta for a chunked session
const metaSchema = z.object({
  courseId: z.string().min(1),
  kind: z.enum(COURSE_KINDS),           // لا تعمل cast mutating
  lessonId: z.string().optional(),
  filename: z.string().min(1),
  mime: z.string().optional(),
  size: z.number().optional(),
  sha256: z.string().optional()
});
type Meta = z.infer<typeof metaSchema>;

/** Normalize any input to a Uint8Array (to avoid Buffer typing clashes) */
const toU8 = (buf: Buffer | Uint8Array | ArrayBuffer): Uint8Array => {
  if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
  if (Buffer.isBuffer(buf)) return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  return buf as Uint8Array;
};

const sha256 = (buf: Buffer | Uint8Array): string => {
  const h = crypto.createHash('sha256');
  h.update(toU8(buf));  // BinaryLike = ArrayBufferView ✔ (NOT Buffer)
  return h.digest('hex');
};

/** Start a chunked session */
const initChunk = async (meta: Meta) => {
  const parsed = metaSchema.parse(meta);
  const uploadId = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}`;
  const dir = path.join(CHUNK_DIR, uploadId);
  ensureDir(dir);
  await fs.promises.writeFile(path.join(dir, 'meta.json'), JSON.stringify(parsed, null, 2), 'utf-8');
  return { uploadId };
};

/** Persist a single part to disk (RAM friendly) */
const putChunk = async (uploadId: string, partNumber: number, buf: Buffer | Uint8Array | ArrayBuffer) => {
  if (!uploadId || !Number.isFinite(partNumber) || partNumber < 1) throw new Error('Invalid upload/part');
  const dir = path.join(CHUNK_DIR, uploadId);
  ensureDir(dir);
  const partPath = path.join(dir, `part-${partNumber}`);

  const data = toU8(buf); // <-- Uint8Array not Buffer
  await fs.promises.writeFile(partPath, data as unknown as NodeJS.ArrayBufferView);
  return { ok: true };
};

/** Merge parts and compute SHA-256 (optional) */
const completeChunk = async (uploadId: string) => {
  const dir = path.join(CHUNK_DIR, uploadId);
  const metaPath = path.join(dir, 'meta.json');
  if (!fs.existsSync(metaPath)) throw new Error('Session not found');

  const files = (await fs.promises.readdir(dir)).filter(f => f.startsWith('part-'));
  if (!files.length) throw new Error('No parts uploaded');

  const ordered = files
    .map(f => ({ f, n: Number(f.replace('part-','')) }))
    .sort((a,b) => a.n - b.n);

  const merged = path.join(dir, 'merged.bin');
  const out = fs.createWriteStream(merged);

  for (const { f } of ordered) {
    const p = path.join(dir, f);
    await new Promise<void>((resolve, reject) => {
      const rs = fs.createReadStream(p);
      rs.on('error', reject);
      rs.on('end', resolve);
      rs.pipe(out, { end: false });
    });
  }
  await new Promise<void>((resolve) => out.end(() => resolve()));

  // Best-effort checksum
  try {
    const s = await fs.promises.readFile(merged);     // returns Buffer
    await fs.promises.writeFile(path.join(dir, 'sha256.txt'), sha256(s), 'utf-8');
  } catch {}

  const size = (await fs.promises.stat(merged)).size;
  return { uploadId, size };
};

/** Push merged file to storage at canonical key and cleanup. */
const finalizeToCloud = async (uploadId: string) => {
  const dir = path.join(CHUNK_DIR, uploadId);
  const metaPath = path.join(dir, 'meta.json');
  const merged = path.join(dir, 'merged.bin');
  if (!fs.existsSync(metaPath)) throw new Error('Session metadata not found');
  if (!fs.existsSync(merged)) throw new Error('Merged file not found. Call complete first.');

  const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8')) as Meta;

  const safe = (v: string = '') => String(v).replace(/[^a-zA-Z0-9._-]+/g, '_');
  const parts = ['courses', safe(meta.courseId), meta.kind];
  if (meta.lessonId) parts.push(safe(meta.lessonId));
  const key = parts.join('/') + '/' + safe(meta.filename);

  const cloud = cloudServiceInterface(CloudServiceImpl());
  const fakeFile: any = { originalname: meta.filename, path: merged };

  // Use uploadAtPath if available, else fallback
  const up = await (cloud as any).uploadAtPath?.(fakeFile, key) ?? await cloud.uploadAndGetUrl(fakeFile);

  try { await fs.promises.rm(dir, { recursive: true, force: true }); } catch {}

  return { name: meta.filename, key: up.key, url: up.url };
};

export const lmsUploadService = () => ({
  initChunk,
  putChunk,
  completeChunk,
  finalizeToCloud
});
