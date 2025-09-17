import express from 'express';
import videoStreamController from '../../../adapters/controllers/videoStreamController';
import { CloudServiceImpl } from '../../../frameworks/services';
import { cloudServiceInterface } from '../../../app/services/cloudServiceInterface';
// Apply rate limiter to video streaming endpoint
import { videoRateLimiter } from '../middlewares/rateLimit';

<<<<<<< HEAD
/**
 * @swagger
 * tags:
 *   name: Video Streaming
 *   description: Video streaming endpoints with rate limiting
 */

=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
const videoStreamRouter = () => {
  const router = express.Router();
  const controller = videoStreamController(cloudServiceInterface, CloudServiceImpl);

<<<<<<< HEAD
  /**
   * @swagger
   * /api/video-streaming/stream-video/{videoFileId}:
   *   get:
   *     summary: Stream video file by ID with rate limiting
   *     tags: [Video Streaming]
   *     parameters:
   *       - in: path
   *         name: videoFileId
   *         required: true
   *         schema:
   *           type: string
   *         description: ID of the video file to stream
   *     responses:
   *       200:
   *         description: Video stream starts successfully
   *         content:
   *           video/mp4:
   *             schema:
   *               type: string
   *               format: binary
   *       429:
   *         description: Too many requests (rate limited)
   *       404:
   *         description: Video file not found
   */
  router.get('/stream-video/:videoFileId', videoRateLimiter, controller.streamVideo);

  return router;
=======
  router.get('/stream-video/:videoFileId', videoRateLimiter, controller.streamVideo);

  return router
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};
export default videoStreamRouter;
