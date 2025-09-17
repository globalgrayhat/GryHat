import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
<<<<<<< HEAD
import { AddDiscussionInterface, Reply } from '../../../types/discussion';
import { DiscussionDbInterface } from '../../../app/repositories/discussionDbRepository';

// Normalize reply to strong shape with timestamps
const normalizeReply = (r: any): Reply => ({
  studentId: String(r?.studentId ?? '').trim(),
  message: String(r?.message ?? '').trim(),
  createdAt: r?.createdAt ? new Date(r.createdAt) : new Date(),
  updatedAt: r?.updatedAt ? new Date(r.updatedAt) : new Date()
});

=======
import { AddDiscussionInterface } from '../../../types/discussion';
import { DiscussionDbInterface } from '../../../app/repositories/discussionDbRepository';

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
export const addDiscussionU = async (
  studentId: string | undefined,
  lessonId: string,
  discussion: AddDiscussionInterface,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
<<<<<<< HEAD
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
=======
  if (!discussion) {
    throw new AppError('Please provide data', HttpStatusCodes.BAD_REQUEST);
  }
  if (!studentId) {
    throw new AppError('user not found', HttpStatusCodes.BAD_REQUEST);
  }
  discussion.lessonId = lessonId;
  discussion.studentId = studentId;
  await discussionDbRepository.addDiscussion(discussion);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export const getDiscussionsByLessonU = async (
  lessonId: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
<<<<<<< HEAD
  if (!lessonId) throw new AppError('Please provide a lesson id', HttpStatusCodes.BAD_REQUEST);
  return discussionDbRepository.getDiscussionsByLesson(lessonId);
=======
  if (!lessonId) {
    throw new AppError(
      'Please provide a lesson id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const discussions = await discussionDbRepository.getDiscussionsByLesson(
    lessonId
  );
  return discussions;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export const editDiscussionU = async (
  discussionId: string,
  message: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
<<<<<<< HEAD
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
  const msg = String(message ?? '').trim();
  if (!msg) throw new AppError('Please provide a valid message', HttpStatusCodes.BAD_REQUEST);

  await discussionDbRepository.editDiscussion(discussionId, msg);
=======
  if (!discussionId) {
    throw new AppError(
      'Please provide a discussion id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  message = message.trim();
  if (!message) {
    throw new AppError(
      'Please provide a valid message',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  await discussionDbRepository.editDiscussion(discussionId, message);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export const deleteDiscussionByIdU = async (
  discussionId: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
<<<<<<< HEAD
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
=======
  if (!discussionId) {
    throw new AppError(
      'Please provide a discussion id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  await discussionDbRepository.deleteDiscussionById(discussionId);
};

export const replyDiscussionU = async (
  discussionId: string,
  reply: { studentId: string; message: string },
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
<<<<<<< HEAD
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
=======
  if (!discussionId) {
    throw new AppError(
      'Please provide a discussion id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (!reply) {
    throw new AppError(
      'Please provide valid data',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  await discussionDbRepository.replyDiscussion(discussionId, reply);
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export const getRepliesByDiscussionIdU = async (
  discussionId: string,
  discussionDbRepository: ReturnType<DiscussionDbInterface>
) => {
<<<<<<< HEAD
  if (!discussionId) throw new AppError('Please provide a discussion id', HttpStatusCodes.BAD_REQUEST);
  return discussionDbRepository.getRepliesByDiscussionId(discussionId);
=======
  if (!discussionId) {
    throw new AppError(
      'Please provide a discussion id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const replies = await discussionDbRepository.getRepliesByDiscussionId(
    discussionId
  );
  return replies;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};
