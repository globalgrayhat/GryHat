<<<<<<< HEAD
// server/src/app/usecases/lessons/addLesson.ts
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';

import ffprobeStatic from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import path from 'path';

// Unified storage + helpers
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { CloudServiceImpl } from '../../../frameworks/services';
import { tusUploadService } from '../../../frameworks/services/tusUploadService';

// DTO validation
import { parseAddLessonDTO, type AddLessonDTO } from '../../dtos/lesson.dto';

const FFPROBE_PATH = (ffprobeStatic as unknown as { path?: string }).path || '';

/** -------- Utils -------- */
const toArray = (v: unknown): string[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(String).map(s => s.trim()).filter(Boolean);
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
};

const tryParseJson = <T = any>(v: unknown, fallback: T): T => {
  if (!v) return fallback;
  if (typeof v !== 'string') return v as T;
  try { return JSON.parse(v) as T; } catch { return fallback; }
};

const meaningful = (s: unknown): s is string => {
  const v = String(s ?? '').trim().toLowerCase();
  return v !== '' && v !== 'string' && v !== 'null' && v !== 'undefined';
};

const tusDiskPath = (id: string): string | null => {
  const dir = process.env.TUS_DIR || path.resolve(process.cwd(), 'tus-data');
  const p1 = path.join(dir, id);
  const p2 = path.join(dir, `${id}.bin`);
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return null;
};

const probeDurationSec = (absPath: string): Promise<number> =>
  new Promise((resolve) => {
    try {
      if (FFPROBE_PATH) ffmpeg.setFfprobePath(FFPROBE_PATH);
      ffmpeg(absPath).ffprobe((err: Error | null, data: any) => {
        if (err) return resolve(0);
        const d = Number(data?.format?.duration ?? 0);
        resolve(Number.isFinite(d) ? d : 0);
      });
    } catch { resolve(0); }
  });

const vimeoEmbed = (idOrUrl: string) => {
  const id = idOrUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] || idOrUrl;
  return `https://player.vimeo.com/video/${id}`;
};

/** Normalize loose lesson input so DTO can validate safely */
const normalizeAddLessonInput = (raw: CreateLessonInterface | any): AddLessonDTO => {
  const asBool = (v: unknown) => v === true || String(v ?? '').toLowerCase().trim() === 'true';

  return {
    title: String(raw?.title ?? ''),
    description: meaningful(raw?.description) ? String(raw?.description) : undefined,
    contents: Array.isArray(raw?.contents) ? raw.contents : toArray(raw?.contents),
    duration: Number(raw?.duration ?? 0),
    about: meaningful(raw?.about) ? String(raw?.about) : undefined,
    isPreview: asBool(raw?.isPreview ?? false),

    videoSource: raw?.videoSource,
    videoUrl: raw?.videoUrl,
    videoFile: raw?.videoFile,
    videoTusKeys: raw?.videoTusKeys !== undefined ? toArray(raw.videoTusKeys) : undefined,
    primaryVideoKey: raw?.primaryVideoKey,

    questions: Array.isArray(raw?.questions) ? raw.questions : tryParseJson(raw?.questions, []),

    resources: Array.isArray(raw?.resources) ? raw.resources : []
  };
};

/**
 * Add lesson use-case.
 * - Validates with AddLessonDTO.
 * - Supports TUS upload OR external URL (mutually exclusive).
 * - Uploads any raw resource files (when controller passes _resourcesUploads).
 */
export const addLessonsU = async (
  _media: Express.Multer.File[] | undefined,
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  courseId: string | undefined,
  instructorId: string | undefined,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
<<<<<<< HEAD
): Promise<void> => {
  if (!courseId) throw new AppError('Please provide a course id', HttpStatusCodes.BAD_REQUEST);
  if (!instructorId) throw new AppError('Please provide an instructor id', HttpStatusCodes.BAD_REQUEST);
  if (!lesson) throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);

  const cloud = cloudServiceInterface(CloudServiceImpl());
  const tus = tusUploadService();

  // ---- Normalize + validate with DTO ----
  const normalized = normalizeAddLessonInput(lesson);
  const parsed = parseAddLessonDTO(normalized);
  if (!parsed.ok || !parsed.data) {
    throw new AppError(`Invalid lesson payload: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);
  }
  const dto = parsed.data;

  // Prepare payload
  const payload: any = {
    title: dto.title,
    description: dto.description ?? '',
    contents: dto.contents,
    duration: Number(dto.duration || 0),
    about: dto.about,
    isPreview: !!dto.isPreview,

    videoTusKeys: Array.isArray(dto.videoTusKeys) ? dto.videoTusKeys : [],
    primaryVideoKey: dto.primaryVideoKey,

    media: Array.isArray((lesson as any).media) ? (lesson as any).media : [],
    resources: Array.isArray(dto.resources) ? dto.resources : [],

    courseId,
    instructorId,

    videoSource: dto.videoSource,
    videoUrl: dto.videoUrl
  };

  // ---- Upload resources if controller passed raw uploads in _resourcesUploads ----
  const rawResUploads: Express.Multer.File[] =
    Array.isArray((lesson as any)._resourcesUploads) ? (lesson as any)._resourcesUploads : [];
  if (rawResUploads.length) {
    const up = await Promise.all(
      rawResUploads.map(async (f) => {
        const r = await cloud.uploadAndGetUrl(f);
        return { name: r.name, url: r.url, key: (r as any).key };
      })
    );
    payload.resources = [...(payload.resources || []), ...up];
  }

  // ---- Decide video mode (mutually exclusive) ----
  const hasUrl = meaningful(dto.videoUrl);
  const url = hasUrl ? String(dto.videoUrl).trim() : '';
  const tusIds = Array.isArray(dto.videoTusKeys) ? dto.videoTusKeys.filter(meaningful) : [];
  const rawSource = String(dto.videoSource || '').toLowerCase();

  if (hasUrl && tusIds.length) {
    throw new AppError('Choose either a video URL OR a TUS upload (videoTusKeys), not both.', HttpStatusCodes.BAD_REQUEST);
  }

  let usedVideo = false;

  // A) TUS mode
  if (!hasUrl && tusIds.length && (rawSource === 'tus' || rawSource === 'local' || rawSource === '' || rawSource === undefined)) {
    const existingIds: string[] = tusIds.filter((id) => !!tusDiskPath(id));
    if (!existingIds.length) throw new AppError('Provided TUS id(s) not found on server', HttpStatusCodes.BAD_REQUEST);

    const finalized: string[] = [];
    for (const id of existingIds) {
      try {
        const { url: fileUrl, name } = await tus.finalizeToCloud(id, cloud);
        payload.media.push({ name: name || 'video', url: fileUrl, key: id });
        finalized.push(id);
      } catch { /* ignore */ }
    }
    if (!finalized.length) throw new AppError('Failed to finalize any TUS uploads', HttpStatusCodes.BAD_REQUEST);

    payload.videoTusKeys = finalized;
    payload.primaryVideoKey = dto.primaryVideoKey ?? finalized[0];

    if (!payload.duration) {
      const firstPath = tusDiskPath(finalized[0]);
      if (firstPath) {
        const dur = await probeDurationSec(firstPath);
        if (dur > 0) payload.duration = dur;
      }
    }
    usedVideo = true;
  }

  // B) URL mode
  if (!usedVideo && hasUrl) {
    const src =
      rawSource ||
      ( /youtu\.be|youtube\.com/i.test(url) ? 'youtube'
      : /vimeo\.com/i.test(url) ? 'vimeo'
      : 'direct');

    if (src === 'youtube') {
      // Convert to embed format
      let vid = '';
      try {
        const u = new URL(url);
        vid = u.searchParams.get('v') || '';
        if (!vid && /youtu\.be/i.test(u.hostname)) vid = u.pathname.slice(1);
      } catch { /* fallthrough */ }
      if (!vid) throw new AppError('Invalid YouTube URL', HttpStatusCodes.BAD_REQUEST);
      payload.media.push({ name: 'youtube', url: `https://www.youtube.com/embed/${vid}` });
    } else if (src === 'vimeo') {
      payload.media.push({ name: 'vimeo', url: vimeoEmbed(url) });
    } else {
      payload.media.push({ name: 'video', url });
    }

    payload.videoTusKeys = [];
    payload.primaryVideoKey = undefined;
    usedVideo = true;
  }

  if (!usedVideo) {
    throw new AppError('No valid video provided. Provide either a video URL or TUS id(s) in videoTusKeys.', HttpStatusCodes.BAD_REQUEST);
  }

  // ===== Persist =====
  const lessonId = await lessonDbRepository.addLesson(courseId, instructorId, payload as CreateLessonInterface);
  if (!lessonId) throw new AppError('Failed to add lesson', HttpStatusCodes.BAD_REQUEST);

  // Optional quiz
  const qs = dto.questions ?? tryParseJson((lesson as any).questions, []);
  if (Array.isArray(qs) && qs.length) {
    await quizDbRepository.addQuiz({ courseId, lessonId: lessonId.toString(), questions: qs });
  }
=======
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
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};
