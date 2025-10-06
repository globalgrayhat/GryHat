import { ok, created } from '../../shared/http/respond';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { liveStreamService } from '../../frameworks/services';
import { CustomRequest } from '../../types/customRequest';
import AppError from '../../utils/appError';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import { UserRole } from '../../constants/enums';

/**
 * Live stream controller (thin): schedule/start/end/chat/get.
 * Use
 *  in-memory service; persistence/media are out of scope.
 */
export const liveStreamController = () => {
  const service = liveStreamService();

  // Schedule a future live stream (instructor only)
  const schedule = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.user?.Id;
    if (!instructorId) throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);

    const { title, scheduledAt } = req.body as { title?: string; scheduledAt?: string };
    if (!title || !scheduledAt) {
      throw new AppError('Missing title or scheduled time', HttpStatusCodes.BAD_REQUEST);
    }

    const stream = service.scheduleStream(instructorId, title, new Date(scheduledAt));
    created(res, 'Stream scheduled', stream);
  });

  // Start a scheduled stream (owner/admin)
  const start = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { streamId } = req.params;
    const userId = req.user?.Id;
    const role = req.user?.role as UserRole | undefined;
    if (!userId || !role) throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);

    try {
      const stream = service.startStream(streamId, userId, role);
      ok(res, 'Stream started', stream);
    } catch (e: any) {
      throw new AppError(e?.message || 'Not allowed to start stream', HttpStatusCodes.UNAUTHORIZED);
    }
  });

  // End a running stream (owner/admin)
  const end = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { streamId } = req.params;
    const userId = req.user?.Id;
    const role = req.user?.role as UserRole | undefined;
    if (!userId || !role) throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);

    try {
      const stream = service.endStream(streamId, userId, role);
      ok(res, 'Stream ended', stream);
    } catch (e: any) {
      throw new AppError(e?.message || 'Not allowed to end stream', HttpStatusCodes.UNAUTHORIZED);
    }
  });

  // Post a chat message to an active stream
  const chat = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { streamId } = req.params;
    const userId = req.user?.Id;
    const role = req.user?.role as UserRole | undefined;
    const userName = req.user?.email || 'Anonymous';
    const { message } = req.body as { message?: string };

    if (!userId || !role) throw new AppError('Unauthorized', HttpStatusCodes.UNAUTHORIZED);
    if (!message) throw new AppError('Message cannot be empty', HttpStatusCodes.BAD_REQUEST);

    try {
      const msg = service.sendMessage(streamId, userId, userName, role, message);
      created(res, 'Message posted', msg);
    } catch (e: any) {
      throw new AppError(e?.message || 'Failed to post message', HttpStatusCodes.BAD_REQUEST);
    }
  });

  // Get a single stream metadata
  const get = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { streamId } = req.params as { streamId: string };
    const stream = service.getStream(streamId);
    if (!stream) throw new AppError('Stream not found', HttpStatusCodes.NOT_FOUND);
    ok(res, 'Stream retrieved', stream);
  });

  return { schedule, start, end, chat, get };
};
