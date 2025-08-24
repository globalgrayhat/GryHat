import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '@src/app/repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '@src/app/repositories/lessonDbRepository';
import * as ffprobePath from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

export const addLessonsU = async (
  media: Express.Multer.File[] | undefined,
  courseId: string | undefined,
  instructorId: string | undefined,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!courseId) {
    throw new AppError(
      'Please provide a course id',
      HttpStatusCodes.BAD_REQUEST
    );
  }

  if (!instructorId) {
    throw new AppError(
      'Please provide an instructor id',
      HttpStatusCodes.BAD_REQUEST
    );
  }

  if (!lesson) {
    throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);
  }

  if (media) {
    const videoFile = media[0];
    const tempFilePath = './temp_video.mp4';
    const ab = videoFile.buffer.buffer.slice(
      videoFile.buffer.byteOffset, 
      videoFile.buffer.byteOffset + videoFile.buffer.byteLength
    );
    const uint8Array = new Uint8Array(ab);
    fs.writeFileSync(tempFilePath, uint8Array);
    const getVideoDuration = () =>
      new Promise<string>((resolve, reject) => {
        ffmpeg(tempFilePath)
          .setFfprobePath(ffprobePath.path)
          .ffprobe((err: Error | null, data: any) => {
            fs.unlinkSync(tempFilePath);

            if (err) {
              console.error('Error while probing the video:', err);
              reject(err);
            }

            const duration: string = data.format.duration;
            resolve(duration);
          });
      });

    try {
      const videoDuration = await getVideoDuration();
      lesson.duration = parseFloat(videoDuration);
    } catch (error) {
      console.error('Error while getting video duration:', error);
    }
  }

  if (media) {
    lesson.media = media.map((file) => ({
      name: file.originalname,
      url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`
    }));
  }
  const lessonId = await lessonDbRepository.addLesson(
    courseId,
    instructorId,
    lesson
  );
  if (!lessonId) {
    throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);
  }
  const quiz = {
    courseId,
    lessonId: lessonId.toString(),
    questions: lesson.questions
  };
  await quizDbRepository.addQuiz(quiz);
};
