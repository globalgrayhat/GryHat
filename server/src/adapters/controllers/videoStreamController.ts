<<<<<<< HEAD
import { ok, created, fail, err } from '../../shared/http/respond';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CloudServiceInterface } from '../../app/services/cloudServiceInterface';
=======
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CloudServiceInterface } from '../../app/services/cloudServiceInterface';
// Select the appropriate storage backend (S3 or local) from the service index.
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
import { CloudServiceImpl } from '../../frameworks/services';
import fs from 'fs';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';
import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { StorageProvider } from '../../constants/enums';

/**
<<<<<<< HEAD
 * Streams local video files with HTTP range support, or returns a URL for S3/external.
 * - Local: read from disk (supports partial content).
 * - S3: return pre-signed/CloudFront URL (client fetches directly).
 * - External (YouTube/Vimeo): return the URL/key as-is for client embedding.
=======
 * Controller for video streaming. Depending on the configured storage provider,
 * this handler either streams the file directly (for local storage), or
 * responds with a URL that the client can use to fetch the video (for S3
 * or external providers such as YouTube/Vimeo). Streaming local files
 * supports HTTP range requests to enable efficient playback.
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
 */
const videoStreamController = (
  cloudServiceInterface: CloudServiceInterface,
  cloudServiceImpl: CloudServiceImpl
) => {
  const cloudService = cloudServiceInterface(cloudServiceImpl());
<<<<<<< HEAD
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  const streamVideo = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const videoFileId = req.params.videoFileId;
    if (!videoFileId) {
      fail(res, 'Missing video file identifier', 400);
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

=======
  // Repository to look up the current storage provider
  const repository = storageConfigDbRepository(storageConfigRepoMongoDb());

  const streamVideo = asyncHandler(async (req: Request, res: Response) => {
    const videoFileId = req.params.videoFileId;
    if (!videoFileId) {
      res.status(400).json({
        status: 'fail',
        message: 'Missing video file identifier'
      });
      return;
    }
    // Determine which storage provider is active
    const config = await repository.getConfig();
    const provider = config?.provider || StorageProvider.S3;

    // When using local storage, stream the file directly with support for range requests
    if (provider === StorageProvider.Local) {
      // Retrieve absolute path on disk
      const filePath = await cloudService.getFile(videoFileId);
      // Determine file size to honour range requests
      const stat = await fs.promises.stat(filePath);
      const fileSize = stat.size;
      const range = req.headers.range;
      const contentType = 'video/mp4'; // default MIME type; can be enhanced to detect based on extension
      if (range) {
        // Example: "bytes=500-"
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        // If end is not specified, stream to end of file
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunkSize = end - start + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType
        });
<<<<<<< HEAD

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
      ok(res, 'URL ready', url);
      return;
    }

    // External (YouTube/Vimeo): key IS the URL
    ok(res, 'External URL', videoFileId);
  });

  return { streamVideo };
};

export default videoStreamController;
=======
        fileStream.pipe(res);
      } else {
        // No range header; send the entire file
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': contentType
        });
        fs.createReadStream(filePath).pipe(res);
      }
      return;
    }

    // For S3 storage, return a CloudFront or pre‑signed URL for the client to fetch
    if (provider === StorageProvider.S3) {
      const url = await cloudService.getCloudFrontUrl(videoFileId);
      res.status(200).json({
        status: 'success',
        message: 'Retrieved pre‑signed URL',
        data: url
      });
      return;
    }

    // For providers that rely on external video platforms (YouTube/Vimeo),
    // simply return the key itself which should already be a URL. Clients
    // can embed the video using the returned URL.
    res.status(200).json({
      status: 'success',
      message: 'Retrieved external video URL',
      data: videoFileId
    });
  });
  return {
    streamVideo
  };
};

export default videoStreamController;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
