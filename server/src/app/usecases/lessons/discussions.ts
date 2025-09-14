import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { AddDiscussionInterface, Reply } from '../../../types/discussion';
import { DiscussionDbInterface } from '../../../app/repositories/discussionDbRepository';

// Normalize reply to strong shape with timestamps
const normalizeReply = (r: any): Reply => ({
  studentId: String(r?.studentId ?? '').trim(),
  message: String(r?.message ?? '').trim(),
  createdAt: r?.createdAt ? new Date(r.createdAt) : new Date(),
  updatedAt: r?.updatedAt ? new Date(r.updatedAt) : new Date()
});

export const addDiscussionU = async (
  studentId: string | undefined,
  lessonId: string,
  discussion: AddDiscussionInterface,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
  if (!discussion) throw new AppError('Please provide data', HttpStatusCodes.BAD_REQUEST);
  if (!studentId) throw new AppError('User not found', HttpStatusCodes.BAD_REQUEST);
  if (!lessonId) throw new AppError('Please provide a lesson id', HttpStatusCodes.BAD_REQUEST);

  const msg = String(discussion.message ?? '').trim();
  if (!msg) throw new AppError('Please provide a valid message', HttpStatusCodes.BAD_REQUEST);

  const payload: AddDiscussionInterface = {
    studentId,
    lessonId,
    message: msg,
    replies: Array.isArray(discussion.replies) ? discussion.replies.map(normalizeReply) : [],
    createdAt: discussion.createdAt ? new Date(discussion.createdAt) : new Date(),
    updatedAt: discussion.updatedAt ? new Date(discussion.updatedAt) : new Date()
  };

  await discussionDbRepository.addDiscussion(payload);
};

export const getDiscussionsByLessonU = async (
  lessonId: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
  if (!lessonId) throw new AppError('Please provide a lesson id', HttpStatusCodes.BAD_REQUEST);
  return discussionDbRepository.getDiscussionsByLesson(lessonId);
};

export const editDiscussionU = async (
  discussionId: string,
  message: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
  const msg = String(message ?? '').trim();
  if (!msg) throw new AppError('Please provide a valid message', HttpStatusCodes.BAD_REQUEST);

  await discussionDbRepository.editDiscussion(discussionId, msg);
};

export const deleteDiscussionByIdU = async (
  discussionId: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
  await discussionDbRepository.deleteDiscussionById(discussionId);
};

export const replyDiscussionU = async (
  discussionId: string,
  reply: { studentId: string; message: string },
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
  if (!reply) throw new AppError('Please provide valid data', HttpStatusCodes.BAD_REQUEST);

  const msg = String(reply.message ?? '').trim();
  const sid = String(reply.studentId ?? '').trim();
  if (!sid || !msg) throw new AppError('Invalid reply payload', HttpStatusCodes.BAD_REQUEST);

  const fullReply: Reply = {
    studentId: sid,
    message: msg,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  // Repo can ignore extra fields if it only persists subset — safe & backward-compatible
  await discussionDbRepository.replyDiscussion(discussionId, fullReply as any);
};

export const getRepliesByDiscussionIdU = async (
  discussionId: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
  return discussionDbRepository.getRepliesByDiscussionId(discussionId);
};
