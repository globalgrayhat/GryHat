import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CloudServiceInterface } from '../../app/services/cloudServiceInterface';
import { CloudServiceImpl } from '../../frameworks/services';
import fs from 'fs';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { StorageProvider } from '../../constants/enums';

/**
 * Helper to send JSON responses with consistent structure.
 */
const sendJsonResponse = (
  res: Response,
  statusCode: number,
  status: 'success' | 'fail',
  message: string,
  data: any = null
) => {
  res.status(statusCode).json({ status, message, data });
};

/**
 * Helper to stream local files supporting HTTP range requests.
 */
const streamLocalFile = async (
  res: Response,
  filePath: string,
  contentType = 'video/mp4'
) => {
  const stat = await fs.promises.stat(filePath);
  const fileSize = stat.size;
  const range = res.req.headers.range;

  if (range) {
    // Parse range header: e.g. "bytes=500-999"
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      // Invalid range; respond with 416 Range Not Satisfiable
      res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
      return res.end();
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    res.writeHead(206, {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunkSize,
      'Content-Type': contentType,
    });

    fileStream.pipe(res);
  } else {
    // No range header; stream entire file
    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
    });

    fs.createReadStream(filePath).pipe(res);
  }
};

/**
 * Controller for video streaming. Depending on the configured storage provider,
 * streams local files with range support, returns pre-signed URLs for S3,
 * or direct URLs for external providers (e.g., YouTube/Vimeo).
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
      return sendJsonResponse(res, 400, 'fail', 'Missing video file identifier');
    }

    const config = await repository.getConfig();
    const provider = config?.provider || StorageProvider.S3;

    switch (provider) {
      case StorageProvider.Local: {
        // Stream local file with range request support
        const filePath = await cloudService.getFile(videoFileId);
        await streamLocalFile(res, filePath);
        break;
      }

      case StorageProvider.S3: {
        // Return pre-signed CloudFront URL
        const url = await cloudService.getCloudFrontUrl(videoFileId);
        sendJsonResponse(res, 200, 'success', 'Retrieved pre-signed URL', url);
        break;
      }

      default: {
        // External providers (YouTube/Vimeo): return URL key
        sendJsonResponse(res, 200, 'success', 'Retrieved external video URL', videoFileId);
        break;
      }
    }
  });

  return { streamVideo };
};

export default videoStreamController;
