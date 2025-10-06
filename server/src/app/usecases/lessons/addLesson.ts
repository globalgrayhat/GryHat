import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CreateLessonInterface } from '../../../types/lesson';
import { QuizDbInterface } from '../../repositories/quizDbRepository';
import { LessonDbRepositoryInterface } from '../../repositories/lessonDbRepository';

// DTO validation
import { parseAddLessonDTO, type AddLessonDTO } from '../../dtos/lesson.dto';

// Unified upload stack
import { mediaService, MediaDescriptor } from '../../services/mediaService';
import { youtubeService, vimeoService } from '../../../frameworks/services';

/* -------------------------------------------------------
 * Utilities
 * ----------------------------------------------------- */
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

const looksLikeUrl = (s?: string) => !!s && /^https?:\/\//i.test(s || '');

/** Normalize loose lesson input so the DTO can validate safely. */
const normalizeAddLessonInput = (raw: CreateLessonInterface | any): AddLessonDTO => {
  const asBool = (v: unknown) => v === true || String(v ?? '').toLowerCase().trim() === 'true';

  return {
    title: String(raw?.title ?? ''),
    description: meaningful(raw?.description) ? String(raw?.description) : undefined,
    contents: Array.isArray(raw?.contents) ? raw.contents : toArray(raw?.contents),
    duration: Number(raw?.duration ?? 0),
    about: meaningful(raw?.about) ? String(raw?.about) : undefined,
    isPreview: asBool(raw?.isPreview ?? false),

    // Video sources
    videoSource: raw?.videoSource,
    videoUrl: raw?.videoUrl,
    videoFile: raw?.videoFile,

    // For chunked uploads (LMS). Kept name for backward compatibility.
    videoTusKeys: raw?.videoTusKeys !== undefined ? toArray(raw.videoTusKeys) : undefined,
    primaryVideoKey: raw?.primaryVideoKey,

    // Extras
    questions: Array.isArray(raw?.questions) ? raw.questions : tryParseJson(raw?.questions, []),
    resources: Array.isArray(raw?.resources) ? raw.resources : []
  };
};

/* -------------------------------------------------------
 * Add lesson
 * - Validates with AddLessonDTO
 * - Chooses between LMS-chunked upload *or* external URL (mutually exclusive)
 * - Uploads resource files passed by controller
 * ----------------------------------------------------- */
export const addLessonsU = async (
  files: Record<string, Express.Multer.File[]> | undefined,
  courseId: string | undefined,
  instructorId: string | undefined,
  lesson: CreateLessonInterface,
  lessonDbRepository: ReturnType<LessonDbRepositoryInterface>,
  quizDbRepository: ReturnType<QuizDbInterface>
): Promise<void> => {
  if (!courseId) throw new AppError('Please provide a course id', HttpStatusCodes.BAD_REQUEST);
  if (!instructorId) throw new AppError('Please provide an instructor id', HttpStatusCodes.BAD_REQUEST);
  if (!lesson) throw new AppError('Data is not provided', HttpStatusCodes.BAD_REQUEST);

  const media = mediaService();
  const yt = youtubeService();
  const vimeo = vimeoService();

  const normalized = normalizeAddLessonInput(lesson);
  const parsed = parseAddLessonDTO(normalized);
  if (!parsed.ok || !parsed.data) {
    throw new AppError(`Invalid lesson payload: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);
  }
  const dto = parsed.data;

  const payload: any = {
    title: dto.title,
    description: dto.description ?? '',
    contents: dto.contents,
    duration: Number(dto.duration || 0),
    about: dto.about,
    isPreview: !!dto.isPreview,
    videoTusKeys: Array.isArray(dto.videoTusKeys) ? dto.videoTusKeys : [],
    primaryVideoKey: dto.primaryVideoKey,
    media: [],
    resources: Array.isArray(dto.resources) ? dto.resources : [],
    courseId,
    instructorId,
    videoSource: dto.videoSource,
    videoUrl: dto.videoUrl
  };

  const lessonIdPlaceholder = 'temp-lesson-id'; // A temporary ID for key generation

  // 3) Upload resource files if present
  const resourceFiles = files?.['resources'] ?? [];
  if (resourceFiles.length) {
    const uploadedResources = await Promise.all(
      resourceFiles.map((file) => 
        media.upload(file, { 
          type: 'lessonResource', 
          courseId, 
          lessonId: lessonIdPlaceholder 
        })
      )
    );
    payload.resources.push(...uploadedResources.map((r: MediaDescriptor) => ({ name: r.name, url: r.url, key: r.key })));
  }

  // 4) Choose video mode (mutually exclusive): chunked (LMS) OR URL
  const hasUrl = meaningful(dto.videoUrl);
  const url = hasUrl ? String(dto.videoUrl).trim() : '';
  const chunkIds = Array.isArray(dto.videoTusKeys) ? dto.videoTusKeys.filter(meaningful) : [];
  const rawSource = String(dto.videoSource || '').toLowerCase();

  if (hasUrl && chunkIds.length) {
    throw new AppError('Choose either a video URL OR chunked upload ids (videoTusKeys), not both.', HttpStatusCodes.BAD_REQUEST);
  }

  let usedVideo = false;

  // A) Chunked (LMS) mode
  if (
    !hasUrl &&
    chunkIds.length &&
    (rawSource === 'tus' || rawSource === 'chunked' || rawSource === 'local' || rawSource === '' || rawSource === undefined)
  ) {
    const finalized = await media.finalizeChunkedUpload(chunkIds);
    if (!finalized.length) throw new AppError('Failed to finalize any chunked uploads', HttpStatusCodes.BAD_REQUEST);

    payload.media.push(...finalized.map(f => ({ name: f.name || 'video', url: f.url, key: f.key })));
    const keys = finalized.map(f => f.key || '').filter(Boolean);
    payload.videoTusKeys = keys;
    payload.primaryVideoKey = dto.primaryVideoKey ?? keys[0];
    usedVideo = true;
  }

  // B) Direct URL mode
  if (!usedVideo && hasUrl) {
    const src =
      rawSource ||
      ( /youtu\.be|youtube\.com/i.test(url) ? 'youtube'
      : /vimeo\.com/i.test(url) ? 'vimeo'
      : 'direct');

    if (src === 'youtube') {
      const embed = yt.normalizeUrl(url);
      payload.media.push({ name: 'youtube', url: embed });
    } else if (src === 'vimeo') {
      let id = url;
      try {
        const u = new URL(url);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length) id = parts[parts.length - 1];
      } catch { /* if not a URL, treat as id */ }
      payload.media.push({ name: 'vimeo', url: vimeo.getEmbedUrl(id) });
    } else {
      if (!looksLikeUrl(url)) throw new AppError('Invalid videoUrl', HttpStatusCodes.BAD_REQUEST);
      payload.media.push({ name: 'video', url });
    }

    payload.videoTusKeys = [];
    payload.primaryVideoKey = undefined;
    usedVideo = true;
  }

  if (!usedVideo) {
    throw new AppError(
      'No valid video provided. Provide either a video URL or chunked upload ids in videoTusKeys.',
      HttpStatusCodes.BAD_REQUEST
    );
  }

  // 5) Persist lesson
  const lessonId = await lessonDbRepository.addLesson(courseId, instructorId, payload as CreateLessonInterface);
  if (!lessonId) throw new AppError('Failed to add lesson', HttpStatusCodes.BAD_REQUEST);

  // 6) Optional quiz
  const qs = dto.questions ?? tryParseJson((lesson as any).questions, []);
  if (Array.isArray(qs) && qs.length) {
    await quizDbRepository.addQuiz({ courseId, lessonId: lessonId.toString(), questions: qs });
  }
};

