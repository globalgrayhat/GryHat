import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';

import * as ffprobePath from 'ffprobe-static';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import path from 'path';

// Unified storage + helpers
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { CloudServiceImpl } from '../../../frameworks/services';
import { tusUploadService } from '../../../frameworks/services/tusUploadService';

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
      ffmpeg(absPath).setFfprobePath(ffprobePath.path).ffprobe((err: Error | null, data: any) => {
        if (err) return resolve(0);
        const d = Number(data?.format?.duration ?? 0);
        resolve(isFinite(d) ? d : 0);
      });
    } catch { resolve(0); }
  });

const vimeoEmbed = (idOrUrl: string) => {
  const id = idOrUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1] || idOrUrl;
  return `https://player.vimeo.com/video/${id}`;
};


export const addLessonsU = async (
  _media: Express.Multer.File[] | undefined,
  courseId: string | undefined,
  instructorId: string | undefined,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!courseId) throw new AppError('Please provide a course id', HttpStatusCodes.BAD_REQUEST);
  if (!instructorId) throw new AppError('Please provide an instructor id', HttpStatusCodes.BAD_REQUEST);
  if (!lesson) throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);

  const cloud = cloudServiceInterface(CloudServiceImpl());
  const tus = tusUploadService();

  // ---- Normalize fields ----
  (lesson as any).contents = Array.isArray(lesson.contents) ? lesson.contents : toArray((lesson as any).contents);
  (lesson as any).about = meaningful((lesson as any).about) ? String((lesson as any).about) : undefined;
  (lesson as any).isPreview =
    typeof (lesson as any).isPreview === 'boolean'
      ? (lesson as any).isPreview
      : String((lesson as any).isPreview || '').toLowerCase() === 'true';

  (lesson as any).questions = tryParseJson((lesson as any).questions, lesson.questions || []);
  (lesson as any).resources = Array.isArray((lesson as any).resources) ? (lesson as any).resources : [];
  (lesson as any).media = Array.isArray((lesson as any).media) ? (lesson as any).media : [];

  // ---- Gather video inputs ----
  const rawUrl = (lesson as any).videoUrl;
  const rawSource = String((lesson as any).videoSource || '').toLowerCase(); // 'youtube'|'vimeo'|'local'|'s3'|'tus'
  const hasUrl = meaningful(rawUrl);
  const url = hasUrl ? String(rawUrl).trim() : '';

  const singleTusId = meaningful((lesson as any).videoFile) ? String((lesson as any).videoFile).trim() : '';
  const tusArray = toArray((lesson as any).videoTusKeys).filter(meaningful);
  const tusIds = singleTusId ? [singleTusId] : tusArray;

  if (hasUrl && tusIds.length) {
    throw new AppError('Choose either a video URL OR a TUS upload (videoFile/videoTusKeys), not both.', HttpStatusCodes.BAD_REQUEST);
  }

  // ---- Upload resources (raw files) ----
  const rawResUploads: Express.Multer.File[] =
    Array.isArray((lesson as any)._resourcesUploads) ? (lesson as any)._resourcesUploads : [];
  if (rawResUploads.length) {
    const up = await Promise.all(
      rawResUploads.map(async f => {
        const r = await cloud.uploadAndGetUrl(f);
        return { name: r.name, url: r.url, key: (r as any).key };
      })
    );
    (lesson as any).resources = [ ...(lesson as any).resources, ...up ];
  }

  // ---- Decide video mode ----
  let usedVideo = false;

  if (!hasUrl && tusIds.length && (rawSource === 'tus' || rawSource === '' || rawSource === undefined)) {
    const existingIds: string[] = tusIds.filter(id => !!tusDiskPath(id));
    if (!existingIds.length) throw new AppError('Provided TUS id(s) not found on server', HttpStatusCodes.BAD_REQUEST);

    const finalized: string[] = [];
    for (const id of existingIds) {
      try {
        const { url: fileUrl, name } = await tus.finalizeToCloud(id, cloud);
        (lesson as any).media.push({ name: name || 'video', url: fileUrl, key: id });
        finalized.push(id);
      } catch { /* ignore */ }
    }
    if (!finalized.length) throw new AppError('Failed to finalize any TUS uploads', HttpStatusCodes.BAD_REQUEST);

    (lesson as any).videoTusKeys = finalized;
    (lesson as any).primaryVideoKey = finalized[0];

    if (!lesson.duration) {
      const firstPath = tusDiskPath(finalized[0]);
      if (firstPath) {
        const dur = await probeDurationSec(firstPath);
        if (dur > 0) (lesson as any).duration = dur;
      }
    }
    usedVideo = true;
  }

  // B) URL mode
  if (!usedVideo && hasUrl) {
    const src = rawSource || ( /youtu\.be|youtube\.com/i.test(url) ? 'youtube'
                       : /vimeo\.com/i.test(url) ? 'vimeo'
                       : 'direct');

    if (src === 'youtube') {
      // embed format
      const u = new URL(url);
      let vid = u.searchParams.get('v');
      if (!vid && u.hostname === 'youtu.be') vid = u.pathname.slice(1);
      if (!vid) throw new AppError('Invalid YouTube URL', HttpStatusCodes.BAD_REQUEST);
      const embed = `https://www.youtube.com/embed/${vid}`;
      (lesson as any).media.push({ name: 'youtube', url: embed });
    } else if (src === 'vimeo') {
      (lesson as any).media.push({ name: 'vimeo', url: vimeoEmbed(url) });
    } else {
      (lesson as any).media.push({ name: 'video', url });
    }

    (lesson as any).videoTusKeys = [];
    (lesson as any).primaryVideoKey = undefined;
    usedVideo = true;
  }

  if (!usedVideo) {
    throw new AppError('No valid video provided. Provide either a video URL or a TUS id (videoFile / videoTusKeys).', HttpStatusCodes.BAD_REQUEST);
  }

  // ===== Persist =====
  const lessonId = await lessonDbRepository.addLesson(courseId, instructorId, lesson);
  if (!lessonId) throw new AppError('Failed to add lesson', HttpStatusCodes.BAD_REQUEST);

  // Optional quiz
  const qs = (lesson as any).questions;
  if (Array.isArray(qs) && qs.length) {
    await quizDbRepository.addQuiz({ courseId, lessonId: lessonId.toString(), questions: qs });
  }
};
