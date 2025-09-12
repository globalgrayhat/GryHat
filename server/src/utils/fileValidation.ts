import { Readable } from 'stream';

const concatU8 = (parts: Uint8Array[]): Uint8Array => {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
};

const detectMime = async (u8: Uint8Array): Promise<string | undefined> => {
  try {
    const mod: any = await import('file-type');
    const api = mod?.default ?? mod;

    if (typeof api.fileTypeFromBuffer === 'function') {
      const res = await api.fileTypeFromBuffer(u8);     
      return res?.mime;
    }
    if (typeof api.fromBuffer === 'function') {
      const res = await api.fromBuffer(Buffer.from(u8));  
      return res?.mime;
    }
  } catch {
  }
  return undefined;
};

export const validateFileType = async (
  buffer: Buffer | Uint8Array | ArrayBuffer | undefined,
  expectedTypes: string[],
): Promise<boolean> => {
  if (!buffer) return false;

  let u8: Uint8Array;
  if (Buffer.isBuffer(buffer)) {
    u8 = Uint8Array.from(buffer);
  } else if (buffer instanceof Uint8Array) {
    u8 = buffer;
  } else if (buffer instanceof ArrayBuffer) {
    u8 = new Uint8Array(buffer);
  } else {
    return false;
  }

  const mime = await detectMime(u8);
  return !!mime && expectedTypes.includes(mime);
};

export const validateFileTypeFromStream = async (
  stream: Readable,
  expectedTypes: string[]
): Promise<boolean> => {
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    if (chunk instanceof Uint8Array) chunks.push(Uint8Array.from(chunk));
    else chunks.push(Uint8Array.from(Buffer.from(chunk as any)));
    if (chunks.length > 10) break; 
  }
  const merged = concatU8(chunks);
  return validateFileType(merged, expectedTypes);
};

export const getFileCategory = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType === 'application/pdf') return 'documents';
  if (mimeType === 'application/zip' || mimeType === 'application/x-zip-compressed') return 'compressed';
  if (mimeType.includes('word') || mimeType.includes('excel') || mimeType.includes('powerpoint')) return 'documents';
  return 'archive';
};
