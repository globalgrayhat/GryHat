import type { Express } from 'express';
import path from 'path';
import fs from 'fs';

/** Split comma/array into a clean, unique, trimmed string[] */
export function toStringArray(input?: string | string[]): string[] {
  if (!input) return [];
  const arr = Array.isArray(input) ? input : input.split(',');
  const cleaned = arr.map(s => String(s).trim()).filter(Boolean);
  return Array.from(new Set(cleaned));
}

/** Pick first file by field name (thumbnail/guidelines/introduction) */
export function pickFile(
  files?: Record<string, Express.Multer.File[]>,
  field?: string
): Express.Multer.File | undefined {
  if (!files || !field) return undefined;
  const list = files[field];
  return Array.isArray(list) && list.length ? list[0] : undefined;
}

/** Map an URL to local absolute path if the URL is local (best-effort) */
export function localPathFromUrl(fileUrl: string, uploadsBaseDir: string): string | null {
  try {
    const u = new URL(fileUrl, 'http://localhost'); // base just to parse
    const rel = decodeURIComponent(u.pathname || '');
    // e.g. /uploads/courses/<id>/documents/file.pdf
    if (!rel.includes('/uploads/')) return null;
    return path.join(process.cwd(), rel);
  } catch {
    return null;
  }
}

/** Safe delete: prefer cloud deletion by key, fallback to local unlink by URL */
export async function safeDeleteOld(
  opts: {
    oldKey?: string;
    oldUrl?: string;
    cloudService?: { deleteByKey?: (key: string) => Promise<void> };
    uploadsBaseDir?: string;
  }
) {
  const { oldKey, oldUrl, cloudService, uploadsBaseDir = './' } = opts;

  // Try cloud delete if key & capability exist
  if (oldKey && cloudService?.deleteByKey) {
    try { await cloudService.deleteByKey(oldKey); return; } catch { /* ignore */ }
  }

  // Fallback local
  if (oldUrl) {
    const p = localPathFromUrl(oldUrl, uploadsBaseDir);
    if (p && fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch { /* ignore */ }
    }
  }
}

/** Build partial patch for arrays */
export function arraysPatch({
  tags, syllabus, requirements
}: {
  tags?: string | string[];
  syllabus?: string | string[];
  requirements?: string | string[];
}) {
  const patch: any = {};
  const t = toStringArray(tags);
  const s = toStringArray(syllabus);
  const r = toStringArray(requirements);
  if (t.length) patch.tags = t;
  if (s.length) patch.syllabus = s;
  if (r.length) patch.requirements = r;
  return patch;
}
