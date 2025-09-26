
import { LiveStream, LiveStreamMessage } from '../../types/liveStream';
import { UserRole } from '../../constants/enums';

// Simple unique id without external deps
const generateId = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;

/**
 * In-memory store for demo purposes. Replace with a DB in production.
 */
const streams: Map<string, LiveStream> = new Map();

/**
 * Live stream service: schedule/start/stop and append chat messages.
 * This does NOT implement actual video transport; integrate a media
 * server / 3rd-party streaming for real streaming.
 */
export const liveStreamService = () => {
  const scheduleStream = (
    instructorId: string,
    title: string,
    scheduledAt: Date
  ): LiveStream => {
    const id = generateId();
    const stream: LiveStream = { id, title, instructorId, scheduledAt, isLive: false, chat: [] };
    streams.set(id, stream);
    return stream;
  };

  const startStream = (streamId: string, userId: string, role: UserRole): LiveStream => {
    const stream = streams.get(streamId);
    if (!stream) throw new Error('Stream not found');
    if (stream.instructorId !== userId && role !== UserRole.Admin && role !== UserRole.Owner) {
      throw new Error('Not authorized to start this stream');
    }
    stream.isLive = true;
    return stream;
  };

  const endStream = (streamId: string, userId: string, role: UserRole): LiveStream => {
    const stream = streams.get(streamId);
    if (!stream) throw new Error('Stream not found');
    if (stream.instructorId !== userId && role !== UserRole.Admin && role !== UserRole.Owner) {
      throw new Error('Not authorized to end this stream');
    }
    stream.isLive = false;
    return stream;
  };

  const sendMessage = (
    streamId: string,
    userId: string,
    userName: string,
    role: UserRole,
    message: string
  ): LiveStreamMessage => {
    const stream = streams.get(streamId);
    if (!stream) throw new Error('Stream not found');
    if (!stream.isLive) throw new Error('Stream is not live');
    const msg: LiveStreamMessage = { userId, userName, role, message, timestamp: new Date() };
    stream.chat.push(msg);
    return msg;
  };

  const getStream = (streamId: string): LiveStream | undefined => streams.get(streamId);

  return { scheduleStream, startStream, endStream, sendMessage, getStream };
};
