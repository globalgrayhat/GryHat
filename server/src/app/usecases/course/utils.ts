export const parseCSV = (val: unknown): string[] => {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String).map(s => s.trim()).filter(Boolean);
  return String(val)
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
};

export type FilesMap = { [fieldname: string]: Express.Multer.File[] } | undefined;

export const pickFirst = (files: FilesMap, field: string): Express.Multer.File | undefined =>
  files?.[field]?.[0];

export const ensureHttpUrl = (baseUrl: string, relativeOrAbs: string): string => {
  // If cloud service returns absolute URL, keep it. If relative, prefix base.
  if (/^https?:\/\//i.test(relativeOrAbs)) return relativeOrAbs;
  return `${baseUrl.replace(/\/+$/, '')}/${relativeOrAbs.replace(/^\/+/, '')}`;
};

/**
 * Extracts a storage key from a URL if possible.
 * For S3-style URLs, pass through the part after the bucket path if you encode keys in URL.
 * For local URLs like http://host/uploads/courses/<courseId>/<bucket>/<file>,
 * you can return the relative path after '/uploads/' as the 'key'.
 */
export const extractKeyFromUrl = (url: string): string | null => {
  try {
    const u = new URL(url);
    // Example: http://localhost:5000/uploads/courses/123/videos/file.mp4
    const match = u.pathname.match(/\/uploads\/(.+)$/);
    return match ? match[1] : null;
  } catch {
    // Not a URL; maybe already a key or a relative path
    return url || null;
  }
};
