import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '@src/app/repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '@src/app/repositories/lessonDbRepository';
import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';

// DTO validation for patch inputs
import { parseEditLessonDTO } from '../../dtos/lesson.dto';

const FFPROBE_PATH = (ffprobeStatic as unknown as { path?: string }).path || '';

export const editLessonsU = async (
  media: Express.Multer.File[] | undefined,
  lessonId: string,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!lesson) throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);

  // Validate/normalize using DTO
  const parsed = parseEditLessonDTO({
    title: lesson.title,
    description: lesson.description,
    contents: lesson.contents,
    duration: lesson.duration,
    about: lesson.about,
    isPreview: lesson.isPreview,
    resources: lesson.resources,
    videoTusKeys: lesson.videoTusKeys,
    primaryVideoKey: lesson.primaryVideoKey,
    media: lesson.media as any, // repo may ignore
    videoSource: lesson.videoSource,
    videoUrl: lesson.videoUrl,
    videoFile: lesson.videoFile,
    questions: lesson.questions
  });
  if (!parsed.ok) throw new AppError(`Invalid lesson patch: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);

  // Optional probe if new video uploaded here (rare with TUS/URL flow)
  if (media?.length) {
    const videoFile = media[0];
    const tempFilePath = './temp_video.mp4';

    const ab = videoFile.buffer.buffer.slice(
      videoFile.buffer.byteOffset,
      videoFile.buffer.byteOffset + videoFile.buffer.byteLength
    );
    fs.writeFileSync(tempFilePath, new Uint8Array(ab));

    try {
      const duration = await new Promise<number>((resolve) => {
        if (FFPROBE_PATH) ffmpeg.setFfprobePath(FFPROBE_PATH);
        ffmpeg(tempFilePath).ffprobe((err: Error | null, data: any) => {
          try { fs.unlinkSync(tempFilePath); } catch {}
          if (err) return resolve(0);
          resolve(Number(data?.format?.duration ?? 0));
        });
      });
      if (duration > 0) lesson.duration = duration;
    } catch { try { fs.unlinkSync(tempFilePath); } catch {} }
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
  if (!response) throw new AppError('Failed to edit lesson', HttpStatusCodes.BAD_REQUEST);

  // Update quiz only if questions were actually provided
  if (Array.isArray(lesson.questions)) {
    await quizDbRepository.editQuiz(lessonId, { questions: lesson.questions });
  }
};
