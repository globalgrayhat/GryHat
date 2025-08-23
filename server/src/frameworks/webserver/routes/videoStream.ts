import express from 'express';
import videoStreamController from '../../../adapters/controllers/videoStreamController';
import { CloudServiceImpl } from '../../../frameworks/services';
import { cloudServiceInterface } from '../../../app/services/cloudServiceInterface';
// Apply rate limiter to video streaming endpoint
import { videoRateLimiter } from '../middlewares/rateLimit';

const videoStreamRouter = () => {
  const router = express.Router();
  const controller = videoStreamController(cloudServiceInterface, CloudServiceImpl);

  router.get('/stream-video/:videoFileId', videoRateLimiter, controller.streamVideo);

  return router
};
export default videoStreamRouter;
