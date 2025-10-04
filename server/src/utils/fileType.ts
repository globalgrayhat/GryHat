import path from 'path';
import { FileKind } from '../constants/enums';


export const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
export const VIDEO_EXTS = ['.mp4', '.mkv', '.mov', '.avi', '.webm', '.m4v'];
export const DOC_EXTS = ['.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx'];
export const ARCH_EXTS = ['.zip', '.rar', '.7z', '.tar', '.gz'];


export function detectKindByExt(name: string): FileKind {
const ext = path.extname(name).toLowerCase();
if (IMAGE_EXTS.includes(ext)) return FileKind.Image;
if (VIDEO_EXTS.includes(ext)) return FileKind.Video;
if (DOC_EXTS.includes(ext)) return FileKind.Document;
if (ARCH_EXTS.includes(ext)) return FileKind.Archive;
return FileKind.Other;
}


export function kindToBucket(kind: FileKind): string {
switch (kind) {
case FileKind.Image: return 'images';
case FileKind.Video: return 'videos';
case FileKind.Document: return 'documents';
case FileKind.Archive: return 'archives';
default: return 'misc';
}
}