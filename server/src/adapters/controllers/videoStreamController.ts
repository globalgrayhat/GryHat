import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CloudServiceInterface } from '../../app/services/cloudServiceInterface';
import { CloudServiceImpl } from '../../frameworks/services';
import fs from 'fs';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { StorageProvider } from '../../constants/enums';

/**
 * Streams local video files with HTTP range support, or returns a URL for S3/external.
 * - Local: read from disk (supports partial content).
 * - S3: return pre-signed/CloudFront URL (client fetches directly).
 * - External (YouTube/Vimeo): return the URL/key as-is for client embedding.
 */
const videoStreamController = (
  cloudServiceInterface: CloudServiceInterface,
  cloudServiceImpl: CloudServiceImpl
) => {
  const cloudService = cloudServiceInterface(cloudServiceImpl());
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  const streamVideo = asyncHandler(async (req: Request, res: Response) => {
    const videoFileId = req.params.videoFileId;
    if (!videoFileId) {
      res.status(400).json({ status: 'fail', message: 'Missing video file identifier' });
      return;
    }

    const config = await repository.getConfig();
    const provider = config?.provider || StorageProvider.Local;

    // LOCAL: stream file with range support
    if (provider === StorageProvider.Local) {
      const filePath = await cloudService.getFile(videoFileId);
      const stat = await fs.promises.stat(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      // TODO: derive content-type from extension if needed
      const contentType = 'video/mp4';

      if (range) {
        const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
        const start = parseInt(startStr, 10);
        const end = endStr ? parseInt(endStr, 10) : fileSize - 1;
        const chunkSize = end - start + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType
        });

        fs.createReadStream(filePath, { start, end }).pipe(res);
        return;
      }

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    // S3: deliver a fetchable URL
    if (provider === StorageProvider.S3) {
      const url = await cloudService.getCloudFrontUrl(videoFileId);
      res.status(200).json({ status: 'success', message: 'URL ready', data: url });
      return;
    }

    // External (YouTube/Vimeo): key IS the URL
    res.status(200).json({ status: 'success', message: 'External URL', data: videoFileId });
  });

  return { streamVideo };
};

export default videoStreamController;
