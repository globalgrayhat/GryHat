import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';

// DTO validation for patch inputs
import { parseEditLessonDTO } from '../../dtos/lesson.dto';

// Unified upload & URL normalizers
import { mediaService } from '../../services/mediaService';
import { youtubeService, vimeoService } from '../../../frameworks/services';

const looksLikeUrl = (s?: string) => !!s && /^https?:\/\//i.test(s || '');
const nonEmpty = (v: unknown) => String(v ?? '').trim().length > 0;

export const editLessonsU = async (
  media: Express.Multer.File[] | undefined,
  lessonId: string,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
) => {
  if (!lesson) throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);

  // Validate/normalize using DTO (only provided fields are considered)
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
    media: lesson.media as any,
    videoSource: lesson.videoSource,
    videoUrl: lesson.videoUrl,
    videoFile: lesson.videoFile,
    questions: lesson.questions
  });
  if (!parsed.ok) {
    throw new AppError(`Invalid lesson patch: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);
  }

  const current = await lessonDbRepository.getLessonById?.(lessonId);
  if (!current) throw new AppError('Lesson not found', HttpStatusCodes.NOT_FOUND);

  const mediaSvc = mediaService();
  const yt = youtubeService();
  const vimeo = vimeoService();

  // Start building patch from input (only fields provided by DTO)
  const patch: any = {};

  if (nonEmpty(lesson.title)) patch.title = lesson.title;
  if (nonEmpty(lesson.description)) patch.description = lesson.description;
  if (Array.isArray(lesson.contents)) patch.contents = lesson.contents;
  if (typeof lesson.duration === 'number') patch.duration = Number(lesson.duration);
  if (nonEmpty(lesson.about)) patch.about = lesson.about;
  if (typeof lesson.isPreview === 'boolean') patch.isPreview = !!lesson.isPreview;

  if (Array.isArray(lesson.resources)) patch.resources = lesson.resources;

  // If controller provided raw resource uploads as `_resourcesUploads`, normalize them
  const extraRes: Express.Multer.File[] =
    Array.isArray((lesson as any)._resourcesUploads) ? (lesson as any)._resourcesUploads : [];
  if (extraRes.length) {
    const uploaded = await mediaSvc.uploadMany(extraRes);
    const normalizedRes = uploaded.map(u => ({ name: u.name, url: u.url, key: u.key }));
    patch.resources = [...(patch.resources || current?.resources || []), ...normalizedRes];
  }

  // Normalize/replace media list if caller sent direct files here (rare; usually chunked/URL)
  if (media && media.length > 0) {
    const uploaded = await mediaSvc.uploadMany(media);
    patch.media = uploaded.map(u => ({ name: u.name, url: u.url, key: u.key }));
  }

  // Handle video switch:
  //   - If videoTusKeys provided: finalize chunk sessions and set media/primaryVideoKey
  //   - Else if videoUrl provided: normalize YT/Vimeo embed or accept direct URL
  if (Array.isArray(lesson.videoTusKeys) && lesson.videoTusKeys.length) {
    const ids = lesson.videoTusKeys.filter(nonEmpty);
    if (ids.length) {
      const finalized = await mediaSvc.finalizeChunk(ids);
      if (!finalized.length) throw new AppError('Failed to finalize any chunked uploads', HttpStatusCodes.BAD_REQUEST);
      patch.media = [...(patch.media || current?.media || []), ...finalized.map(f => ({ name: f.name || 'video', url: f.url, key: f.key }))];
      const keys = finalized.map(f => f.key || '').filter(Boolean);
      patch.videoTusKeys = keys;
      patch.primaryVideoKey = nonEmpty(lesson.primaryVideoKey) ? lesson.primaryVideoKey : keys[0];
    }
  } else if (nonEmpty(lesson.videoUrl)) {
    const src = String(lesson.videoSource || '').toLowerCase();
    const url = String(lesson.videoUrl);

    if (src === 'youtube' || /youtu\.be|youtube\.com/i.test(url)) {
      const embed = yt.normalizeUrl(url); // throws if invalid
      patch.media = [...(patch.media || current?.media || []), { name: 'youtube', url: embed }];
      patch.videoTusKeys = [];
      patch.primaryVideoKey = undefined;
    } else if (src === 'vimeo' || /vimeo\.com/i.test(url)) {
      let id = url;
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length) id = parts[parts.length - 1];
      } catch { /* if not a URL, treat as id */ }
      patch.media = [...(patch.media || current?.media || []), { name: 'vimeo', url: vimeo.getEmbedUrl(id) }];
      patch.videoTusKeys = [];
      patch.primaryVideoKey = undefined;
    } else {
      if (!looksLikeUrl(url)) throw new AppError('Invalid videoUrl', HttpStatusCodes.BAD_REQUEST);
      patch.media = [...(patch.media || current?.media || []), { name: 'video', url }];
      patch.videoTusKeys = [];
      patch.primaryVideoKey = undefined;
    }

    if (nonEmpty(lesson.videoSource)) patch.videoSource = lesson.videoSource;
    patch.videoUrl = url;
  }

  // Nothing to update?
  if (Object.keys(patch).length === 0) {
    return;
  }

  const response = await lessonDbRepository.editLesson(lessonId, patch);
  if (!response) throw new AppError('Failed to edit lesson', HttpStatusCodes.BAD_REQUEST);

  // Update quiz only if questions were actually provided
  if (Array.isArray(lesson.questions)) {
    await quizDbRepository.editQuiz(lessonId, { questions: lesson.questions });
  }
};
