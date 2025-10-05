/**
 * LMS upload orchestrator for chunked file uploads.
 * This service handles staging chunks locally and then finalizing the merged file to a cloud provider.
 *
 * Features:
 * - Organizes uploads into a clean folder structure: uploads/courses/{courseId}/{kind}/[lessonId]/{originalName}
 * - Handles per-course deduplication via SHA-256 checksums when registering the asset.
 * - Provider-agnostic: Delegates the final upload to a cloud service implementation (e.g., Local Storage, S3).
 */
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { z } from 'zod';
import { CloudServiceImpl } from '.';
import { cloudServiceInterface } from '../../app/services/cloudServiceInterface';

// Define the allowed categories for course-related uploads.
export const COURSE_KINDS = [
  'images', 'videos', 'documents', 'archives', 'assets', 'introduction'
] as const;
export type CourseKind = typeof COURSE_KINDS[number];

// --- Constants and Utility Functions ---

const CHUNK_DIR = path.resolve(process.cwd(), '.chunks');
const ensureDir = (dir: string) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

/**
 * Zod schema for validating the metadata of a chunked upload session.
 * This ensures that all required information is present and correctly typed.
 */
const metaSchema = z.object({
  courseId: z.string().min(1),
  kind: z.enum(COURSE_KINDS),      // Validates 'kind' against the predefined list without mutation.
  lessonId: z.string().optional(),
  filename: z.string().min(1),
  mime: z.string().optional(),
  size: z.number().optional(),
  sha256: z.string().optional()
});
type Meta = z.infer<typeof metaSchema>;

/**
 * Normalizes various binary data types (Buffer, ArrayBuffer) into a Uint8Array.
 * This avoids potential type mismatches and ensures consistent data handling.
 * @param buf The input buffer or array buffer.
 * @returns A Uint8Array view of the data.
 */
const toU8 = (buf: Buffer | Uint8Array | ArrayBuffer): Uint8Array => {
  if (buf instanceof ArrayBuffer) return new Uint8Array(buf);
  if (Buffer.isBuffer(buf)) return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  return buf as Uint8Array;
};

/**
 * Computes the SHA-256 hash of a binary data buffer.
 * @param buf The input data.
 * @returns The hex-encoded SHA-256 hash string.
 */
const sha256 = (buf: Buffer | Uint8Array): string => {
  const h = crypto.createHash('sha256');
  h.update(toU8(buf)); // Hash function requires a Uint8Array or similar.
  return h.digest('hex');
};


// --- Service Implementation ---

/**
 * Starts a new chunked upload session.
 * Creates a unique directory to store chunks and metadata for this session.
 * @param meta Metadata about the file being uploaded (course, name, etc.).
 * @returns The unique identifier for the upload session.
 */
const initChunk = async (meta: Meta) => {
  const parsed = metaSchema.parse(meta); // Validate metadata before proceeding.
  const uploadId = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString('hex')}`;
  const dir = path.join(CHUNK_DIR, uploadId);
  ensureDir(dir);
  await fs.promises.writeFile(path.join(dir, 'meta.json'), JSON.stringify(parsed, null, 2), 'utf-8');
  return { uploadId };
};

/**
 * Saves a single file chunk to the session directory.
 * This is memory-friendly as it writes directly to disk.
 * @param uploadId The session identifier.
 * @param partNumber The sequence number of the chunk.
 * @param buf The chunk data.
 */
const putChunk = async (uploadId: string, partNumber: number, buf: Buffer | Uint8Array | ArrayBuffer) => {
  if (!uploadId || !Number.isFinite(partNumber) || partNumber < 1) {
    throw new Error('Invalid upload ID or part number.');
  }
  const dir = path.join(CHUNK_DIR, uploadId);
  ensureDir(dir);
  const partPath = path.join(dir, `part-${partNumber}`);

  const data = toU8(buf); // Ensure data is in Uint8Array format.
  await fs.promises.writeFile(partPath, data as unknown as NodeJS.ArrayBufferView);
  return { ok: true };
};

/**
 * Merges all chunks for a session into a single file and computes its SHA-256 hash.
 * This should be called after all parts have been uploaded.
 * @param uploadId The session identifier.
 * @returns The session ID and the total size of the merged file.
 */
const completeChunk = async (uploadId: string) => {
  const dir = path.join(CHUNK_DIR, uploadId);
  const metaPath = path.join(dir, 'meta.json');
  if (!fs.existsSync(metaPath)) throw new Error('Upload session not found.');

  const files = (await fs.promises.readdir(dir)).filter(f => f.startsWith('part-'));
  if (!files.length) throw new Error('No chunks were uploaded for this session.');

  // Sort chunks by part number to ensure correct order before merging.
  const ordered = files
    .map(f => ({ f, n: Number(f.replace('part-','')) }))
    .sort((a,b) => a.n - b.n);

  const mergedPath = path.join(dir, 'merged.bin');
  const outStream = fs.createWriteStream(mergedPath);

  // Sequentially stream each part into the final merged file.
  for (const { f: partFile } of ordered) {
    const partPath = path.join(dir, partFile);
    await new Promise<void>((resolve, reject) => {
      const readStream = fs.createReadStream(partPath);
      readStream.on('error', reject);
      readStream.on('end', resolve);
      readStream.pipe(outStream, { end: false }); // Don't end the stream until all parts are written.
    });
  }
  await new Promise<void>((resolve) => outStream.end(() => resolve())); // Close the write stream.

  // Best-effort attempt to generate and save the checksum.
  try {
    const mergedFileBuffer = await fs.promises.readFile(mergedPath); // Returns a Buffer.
    await fs.promises.writeFile(path.join(dir, 'sha256.txt'), sha256(mergedFileBuffer), 'utf-8');
  } catch (err) {
    console.error(`Could not compute checksum for ${uploadId}:`, err);
  }

  const size = (await fs.promises.stat(mergedPath)).size;
  return { uploadId, size };
};

/**
 * Finalizes the upload by pushing the merged file to the cloud storage provider
 * and then cleaning up the temporary chunk directory.
 * @param uploadId The session identifier.
 * @returns The final file name, storage key, and public URL.
 */
const finalizeToCloud = async (uploadId: string) => {
  const dir = path.join(CHUNK_DIR, uploadId);
  const metaPath = path.join(dir, 'meta.json');
  const mergedPath = path.join(dir, 'merged.bin');
  if (!fs.existsSync(metaPath)) throw new Error('Session metadata not found.');
  if (!fs.existsSync(mergedPath)) throw new Error('Merged file not found. Call completeChunk() first.');

  const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf-8')) as Meta;

  // Sanitize path components to prevent directory traversal issues.
  const sanitize = (v: string = '') => String(v).replace(/[^a-zA-Z0-9._-]+/g, '_');
  const pathParts = ['courses', sanitize(meta.courseId), meta.kind];
  if (meta.lessonId) pathParts.push(sanitize(meta.lessonId));
  const key = pathParts.join('/') + '/' + sanitize(meta.filename);

  const cloud = cloudServiceInterface(CloudServiceImpl());
  // Create a mock file object that the cloud service can use.
  const fileToUpload: any = { originalname: meta.filename, path: mergedPath };

  // Prefer the more efficient `uploadAtPath` if available, otherwise fallback.
  const uploadResult = await (cloud as any).uploadAtPath?.(fileToUpload, key) ?? await cloud.uploadAndGetUrl(fileToUpload);

  // Clean up the temporary directory.
  try {
    await fs.promises.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(`Failed to clean up chunk directory ${dir}:`, err);
  }

  return { name: meta.filename, key: uploadResult.key, url: uploadResult.url };
};

/**
 * Factory function for the LMS Upload Service.
 * Encapsulates all chunk-based upload functionalities.
 */
export const lmsUploadService = () => ({
  initChunk,
  putChunk,
  completeChunk,
  finalizeToCloud
});
