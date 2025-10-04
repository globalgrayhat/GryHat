import { UserRole } from '../constants/enums';

/**
 * Represents a scheduled or active live stream. Live streams are
 * initiated by instructors and can be joined by students. Admins
 * and owners have administrative access to all streams, while
 * non‑owner instructors can only manage streams they created.
 */
export interface LiveStream {
  /** Unique identifier for the stream (MongoDB ObjectId in production). */
  id: string;
  /** Title or name of the stream. */
  title: string;
  /** ID of the instructor who created the stream. */
  instructorId: string;
  /** Scheduled start time in ISO format. */
  scheduledAt: Date;
  /** Flag indicating whether the stream is currently live. */
  isLive: boolean;
  /** Optional URL pointing to the recorded video after the stream ends. */
  recordingUrl?: string;
  /** Chat history stored as an array of messages. In a real system this
   * would be stored in a separate collection or a message queue. */
  chat: LiveStreamMessage[];
}

export interface LiveStreamMessage {
  userId: string;
  userName: string;
  role: UserRole;
  message: string;
  timestamp: Date;
}