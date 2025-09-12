import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '@src/app/repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '@src/app/repositories/lessonDbRepository';
import * as ffprobePath from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

export const editLessonsU = async (
  media: Express.Multer.File[] | undefined,
  lessonId: string,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!lesson) {
    throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);
  }

  // Optional probe if new video uploaded here (rare with TUS/URL flow)
  if (media?.length) {
    const videoFile = media[0];
    const tempFilePath = './temp_video.mp4';

    const ab = videoFile.buffer.buffer.slice(
      videoFile.buffer.byteOffset,
      videoFile.buffer.byteOffset + videoFile.buffer.byteLength
    );
    const uint8Array = new Uint8Array(ab);
    fs.writeFileSync(tempFilePath, uint8Array);

    try {
      const duration = await new Promise<number>((resolve) => {
        ffmpeg(tempFilePath)
          .setFfprobePath(ffprobePath.path)
          .ffprobe((err: Error | null, data: any) => {
            fs.unlinkSync(tempFilePath);
            if (err) return resolve(0);
            resolve(Number(data?.format?.duration ?? 0));
          });
      });
      if (duration > 0) lesson.duration = duration;
    } catch { /* ignore */ }
  }

  // Normalize media list to avoid TS "possibly undefined"
  const mediaList: Array<{ name: string; url: string }> = Array.isArray(lesson.media) ? lesson.media : [];
  // If direct files arrived here (not usual), map them to URLs
  if (media && media.length > 0) {
    mediaList.length = 0; // rebuild
    for (const file of media) {
      const fileUrl = `http://localhost:${process.env.PORT}/uploads/${file.filename}`;
      mediaList.push({ name: file.originalname, url: fileUrl });
    }
  }
  lesson.media = mediaList;

  // Persist lesson changes
  const response = await lessonDbRepository.editLesson(lessonId, lesson);
  if (!response) {
    throw new AppError('Failed to edit lesson', HttpStatusCodes.BAD_REQUEST);
  }

  // Update quiz only if questions were actually provided
  if (Array.isArray(lesson.questions)) {
    await quizDbRepository.editQuiz(lessonId, { questions: lesson.questions });
  }
};
