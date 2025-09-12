
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { liveStreamService } from '../../frameworks/services';
import { CustomRequest } from '../../types/customRequest';
import AppError from '../../utils/appError';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import { UserRole } from '../../constants/enums';

/**
 * Controller responsible for managing live stream operations. This
 * includes scheduling new streams, starting and ending streams, and
 * posting chat messages. Streams are currently stored in memory via
 * the `liveStreamService`; persistence and real media streaming are
 * outside the scope of this example.
 */
export const liveStreamController = () => {
  const service = liveStreamService();

  /**
   * Schedule a live stream at a future date/time. The request body
   * should include `title` and `scheduledAt` (ISO string). The
   * authenticated instructor is automatically associated with the
   * stream. Returns the created stream object.
   */
  const schedule = asyncHandler(async (req: CustomRequest, res: Response) => {
    const instructorId = req.user?.Id;
    if (!instructorId) {
      throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);
    }
    const { title, scheduledAt } = req.body;
    if (!title || !scheduledAt) {
      throw new AppError('Missing title or scheduled time', HttpStatusCodes.BAD_REQUEST);
    }
    const stream = service.scheduleStream(instructorId, title, new Date(scheduledAt));
    res.status(201).json({
      status: 'success',
      data: stream
    });
  });

  /**
   * Start a scheduled live stream. Only the stream creator or an
   * administrator/owner may perform this action.
   */
  const start = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { streamId } = req.params;
    const userId = req.user?.Id;
    const role = req.user?.role as UserRole;
    if (!userId || !role) {
      throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);
    }
    try {
      const stream = service.startStream(streamId, userId, role);
      res.status(200).json({ status: 'success', data: stream });
    } catch (error: any) {
      throw new AppError(error.message, HttpStatusCodes.UNAUTHORIZED);
    }
  });

  /**
   * End a live stream. Only the creator or an admin/owner may end it.
   */
  const end = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { streamId } = req.params;
    const userId = req.user?.Id;
    const role = req.user?.role as UserRole;
    if (!userId || !role) {
      throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);
    }
    try {
      const stream = service.endStream(streamId, userId, role);
      res.status(200).json({ status: 'success', data: stream });
    } catch (error: any) {
      throw new AppError(error.message, HttpStatusCodes.UNAUTHORIZED);
    }
  });

  /**
   * Post a chat message to a live stream. Any participant may send
   * messages when the stream is active. The request body must include
   * a `message` field.
   */
  const chat = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { streamId } = req.params;
    const userId = req.user?.Id;
    const role = req.user?.role as UserRole;
    // Use the user's email as a display name since the augmented
    // Request type does not define a `name` property. If not available,
    // fall back to a generic placeholder.
    const userName = req.user?.email || 'Anonymous';
    const { message } = req.body;
    if (!userId || !role) {
      throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);
    }
    if (!message) {
      throw new AppError('Message cannot be empty', HttpStatusCodes.BAD_REQUEST);
    }
    try {
      const msg = service.sendMessage(streamId, userId, userName, role, message);
      res.status(201).json({ status: 'success', data: msg });
    } catch (error: any) {
      throw new AppError(error.message, HttpStatusCodes.BAD_REQUEST);
    }
  });

  /**
   * Retrieve metadata for a single stream. Returns undefined if the
   * stream does not exist. This endpoint is optional and used by
   * clients to check the status of a stream.
   */
  const get = asyncHandler(async (req: Request, res: Response) => {
    const { streamId } = req.params as { streamId: string };
    const stream = service.getStream(streamId);
    if (!stream) {
      throw new AppError('Stream not found', HttpStatusCodes.NOT_FOUND);
    }
    res.status(200).json({ status: 'success', data: stream });
  });

  return {
    schedule,
    start,
    end,
    chat,
    get
  };
};