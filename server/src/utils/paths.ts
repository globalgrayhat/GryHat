import path from 'path';
import fs from 'fs';
import configKeys from '../config';
import { FileKind } from '../constants/enums';
import { kindToBucket } from './fileType';


export function ensureDir(dir: string) {
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}


export function courseBucketPath(courseId: string, kind: FileKind): string {
const bucket = kindToBucket(kind);
const p = path.resolve(configKeys.LMS_UPLOAD_ROOT, 'courses', courseId, bucket);
ensureDir(p);
return p;
}


export function regPath(userId: string, type: 'profile-pics' | 'certificates') {
const p = path.resolve(configKeys.REG_UPLOAD_ROOT, userId, type);
ensureDir(p);
return p;
}


export function publicUrlFromLocal(absPath: string): string {
const root = path.resolve(configKeys.UPLOAD_ROOT);
const rel = path.relative(root, absPath).replace(/\\/g, '/');
return `${configKeys.PUBLIC_BASE_URL}/uploads/${rel}`;
}


export function s3KeyForCourse(courseId: string, fileName: string, kind: FileKind) {
const bucket = kindToBucket(kind);
// Note: this is the *key prefix* inside S3 bucket, not the bucket name.
return `courses/${courseId}/${bucket}/${fileName}`.replace(/\\/g, '/');
}