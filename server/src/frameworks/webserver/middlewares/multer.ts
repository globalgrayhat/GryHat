<<<<<<< HEAD

import multer from 'multer';
import fs from 'fs';
import path from 'path';
import type { Request } from 'express';
import { validateFileType } from '../../../utils/fileValidation';
import configKeys from '../../../config';
import AppError from '../../../utils/appError';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';

/**
 * Minimal file type to avoid depending on Express.Multer.File ambient typing.
 */
type MulterFileLite = {
  fieldname: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
};

const imageMimes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];
const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

const archiveMimes = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-7z-compressed',
  'application/x-rar-compressed',
  'application/x-tar',
  'application/gzip'
];
const archiveExts = ['.zip', '.rar', '.7z', '.tar', '.gz'];

const docMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];
const docExts = ['.pdf', '.doc', '.docx', '.txt'];

// Videos commonly used
const videoMimes = [
  'video/mp4',
  'video/x-matroska', // mkv
  'video/quicktime',  // mov
  'video/x-msvideo',  // avi
  'video/webm'
];
const videoExts = ['.mp4', '.mkv', '.mov', '.avi', '.webm', '.m4v'];

const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb) => {
    const baseDir =
      file.fieldname === 'profilePic' || file.fieldname === 'certificate' || file.fieldname === 'certificates'
        ? (configKeys.UPLOAD_PATH || './uploads')
        : (configKeys.LMS_UPLOAD_PATH || './uploads/courses');

    const anyReq: any = req as any;
    const courseId = (anyReq?.body?.courseId || anyReq?.params?.courseId || anyReq?.query?.courseId || '').toString().trim();

    // user segregation if available (optional)
    const userId = anyReq?.user?.Id ? String(anyReq.user.Id) : 'anonymous';

    let uploadPath = baseDir;
    if (courseId) {
      // Segment by course and by category inferred from extension
      const ext = path.extname(file.originalname || '').toLowerCase();
      const isImage = (file.mimetype && file.mimetype.startsWith('image/')) || imageExts.includes(ext);
      const isVideo = (file.mimetype && file.mimetype.startsWith('video/')) || videoExts.includes(ext);
      const isDoc = docExts.includes(ext);
      const isArchive = archiveExts.includes(ext);

      let bucket = 'assets';
      if (isVideo) bucket = 'videos';
      else if (isImage) bucket = 'images';
      else if (isDoc) bucket = 'documents';
      else if (isArchive) bucket = 'archives';

      uploadPath = path.join(baseDir, 'courses', courseId, bucket);
    } else {
      if (file.fieldname === 'profilePic') uploadPath = path.join(baseDir, userId, 'profile-pics');
      else if (file.fieldname === 'certificate' || file.fieldname === 'certificates') uploadPath = path.join(baseDir, userId, 'certificates');
    }

    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (_req: Request, file: any, cb) => {
    const ext = path.extname(file.originalname || '');
    const base = path.basename(file.originalname || 'file', ext);
    const suffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const safeBase = base.replace(/[^a-zA-Z0-9_-]+/g, '_').slice(0, 60);
    cb(null, `${safeBase}-${suffix}${ext}`);
  }
});

const fileFilter: multer.Options['fileFilter'] = async (req, file: any, cb) => {
  try {
    const f = file as MulterFileLite;
    const ext = path.extname(f.originalname || '').toLowerCase();
    const isSvg = f.mimetype === 'image/svg+xml' || ext === '.svg';
    const isImage = (f.mimetype && f.mimetype.startsWith('image/')) || imageExts.includes(ext);
    const isVideo = (f.mimetype && f.mimetype.startsWith('video/')) || videoExts.includes(ext);
    const isDoc = docMimes.includes(f.mimetype) || docExts.includes(ext);
    const isArchive = archiveMimes.includes(f.mimetype) || archiveExts.includes(ext);

    // handle generic octet-stream from some clients
    const isOctet = f.mimetype === 'application/octet-stream';

    let isValid = false;

    // Profile pic: images only
    if (f.fieldname === 'profilePic') {
      isValid = isImage || isSvg;
      if (!isValid && f.buffer) isValid = await validateFileType(f.buffer, imageMimes);
    }

    // Certificate(s): pdf or images
    else if (f.fieldname === 'certificates' || f.fieldname === 'certificate') {
      if (ext === '.pdf' || f.mimetype === 'application/pdf') {
        if (f.size === 0) isValid = true;
        else if (f.buffer) isValid = await validateFileType(f.buffer, ['application/pdf']);
        else isValid = true;
      } else if (isImage) {
        if (isSvg) isValid = true;
        else if (f.buffer) isValid = await validateFileType(f.buffer, imageMimes);
        else isValid = true;
      }
    }

    // LMS payload (course creation/edit), including 'introduction' file
    else {
      // Accept docs, archives, images, videos; or octet-stream if extension matches any allowed
      if (isDoc || isArchive || isImage || isVideo) {
        if (isSvg) isValid = true;
        else if (f.size === 0) isValid = true;
        else if (f.buffer) {
          const allowed = isVideo ? videoMimes : isImage ? imageMimes : isDoc ? docMimes : archiveMimes;
          isValid = await validateFileType(f.buffer, allowed);
        } else {
          isValid = true;
        }
      } else if (isOctet && (videoExts.concat(imageExts).concat(docExts).concat(archiveExts)).includes(ext)) {
        // fallback by extension when mimetype is generic
        isValid = true;
      }
    }

    if (!isValid) {
      const allowed = [
        ...docMimes,
        'archives (zip/rar/7z/tar/gz)',
        ...videoMimes,
        ...imageMimes
      ];
      return cb(
        new AppError(
          `Invalid file type for field ${f.fieldname}. Allowed: ${allowed.join(', ')}`,
          HttpStatusCodes.BAD_REQUEST
        )
      );
    }

    // size limits
    let maxSize: number;
    if (f.fieldname === 'profilePic') {
      maxSize = configKeys.MAX_PROFILE_PIC_SIZE;
    } else if (f.fieldname === 'certificates' || f.fieldname === 'certificate') {
      maxSize = configKeys.MAX_CERTIFICATE_FILE_SIZE;
    } else {
      const docMax = configKeys.MAX_LMS_DOCUMENT_SIZE;
      const mediaMax = configKeys.MAX_LMS_FILE_SIZE;
      maxSize = (isDoc || isArchive) ? docMax : mediaMax;
    }

    if (f.size > maxSize) {
      const mb = (maxSize / (1024 * 1024)).toFixed(0);
      return cb(new AppError(`File too large. Max ${mb}MB`, HttpStatusCodes.BAD_REQUEST));
    }

    cb(null, true);
  } catch (err) {
    cb(err as Error);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Math.max(
      configKeys.MAX_LIGHT_FILE_SIZE,
      configKeys.MAX_PROFILE_PIC_SIZE,
      configKeys.MAX_CERTIFICATE_FILE_SIZE,
      configKeys.MAX_LMS_FILE_SIZE,
      configKeys.MAX_LMS_DOCUMENT_SIZE
    )
  }
=======
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/';
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },

  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname.trim().replace(/\s+/g, '-'));
  }
});

const upload = multer({
  storage: storage
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
});

export default upload;
