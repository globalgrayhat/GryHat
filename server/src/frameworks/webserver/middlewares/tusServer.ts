// server/src/frameworks/webserver/middlewares/tusServer.ts
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';
import { VideoUploadModel } from '../../database/mongodb/models/videoUpload';
import { validateFileTypeFromStream } from '../../../utils/fileValidation';
import configKeys from '../../../config';
import path from 'path';
import fs from 'fs';
import Course from '../../database/mongodb/models/course';

/** Parse TUS Upload-Metadata header into a plain object */
const parseTusMetadata = (header?: string) => {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(',')) {
    const [k, v] = part.trim().split(' ');
    if (!k) continue;
    try { out[k] = v ? Buffer.from(v, 'base64').toString('utf8') : ''; }
    catch { out[k] = ''; }
  }
  return out;
};

export const createTusServer = () => {
  const tusServer = new Server({
    path: '/api/uploads',
    datastore: new FileStore({
      directory: configKeys.TUS_UPLOAD_PATH || './uploads/tus',
    }),
    /**
     * Generate a unique upload identifier for each file. File names are
     * sanitized to remove unsafe characters and trimmed to a reasonable
     * length to avoid filesystem limitations. The identifier includes
     * the user ID (if available), a timestamp and the sanitized file
     * name. Using a deterministic naming scheme aids debugging and
     * ensures uploads do not overwrite one another.
     */
    namingFunction: (req) => {
      // `req` is an IncomingMessage instance from the Node HTTP server.
      // It does not include Express authentication properties by default,
      // so we cast to `any` to attempt to read a `user` property when
      // available. If undefined, fall back to 'anonymous'.
      const userId = (req as any).user?.Id || 'anonymous';
      const rawMetadata = req.headers['upload-metadata'];
      let fileName = 'file';
      if (rawMetadata) {
        const encoded = rawMetadata.toString().split(' ')[1];
        fileName = Buffer.from(encoded, 'base64').toString();
      }
      // Sanitize the filename: remove path separators and control characters
      const sanitized = fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .substring(0, 100);
      return `${userId}-${Date.now()}-${sanitized}`;
    },
    onUploadFinish: async (req, res, upload) => {
      try {
        
        // Extract metadata from Upload-Metadata header or upload.metadata if available
        const metaHeader = (req.headers['upload-metadata'] as string) || (upload as any).metadata;
        const meta = parseTusMetadata(metaHeader);
        const courseId = meta.courseId;
        const target = meta.field || meta.target || 'introduction';
        const fileName = meta.filename || upload.id;
        const userId = (req as any).user?._id || (req as any).user?.Id || (req as any).user?.id;

        const filePath = path.join(configKeys.TUS_UPLOAD_PATH || './uploads/tus', upload.id);
        const publicUrl = `/uploads/tus/${upload.id}`;

        // Validate type from stream
        const fileStream = fs.createReadStream(filePath);
        const isValid = await validateFileTypeFromStream(fileStream, [
          'video/mp4','video/webm','video/ogg',
          'application/pdf','application/zip','application/x-zip-compressed',
          'image/jpeg','image/png','image/webp'
        ]);
        if (!isValid) throw new Error('Unsupported file type');

        // Persist basic upload record
        await VideoUploadModel.create({
          uploadId: upload.id,
          userId,
          fileName: fileName,
          fileSize: (upload as any).size ?? 0,
          fileType: (upload as any).type || 'application/octet-stream',
          status: 'completed',
          uploadedAt: new Date()
        });

        // If courseId provided, update the course document accordingly
        if (courseId) {
          if (target === 'introduction') {
            await Course.findByIdAndUpdate(courseId, {
              $set: {
                introduction: { name: fileName, url: publicUrl, key: upload.id },
                introductionSource: 'local'
              }
            }).exec();
          }
        }
    

      } catch (error) {
        console.error('Error handling upload finish:', error);
      }
      // Return the response to satisfy the type expectations of the
      // @tus/server API. The server will take care of ending the
      // response.
      return res;
    }
  });

  return tusServer;
};