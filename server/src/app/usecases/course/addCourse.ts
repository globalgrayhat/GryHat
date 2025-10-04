import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import type { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';

// Unified storage/services (no duplication of low-level logic)
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { mediaService } from '../../services/mediaService';
import { CloudServiceImpl, youtubeService, vimeoService } from '../../../frameworks/services';

// Helpers
import { arraysPatch, pickFile, toStringArray } from './_helpers';

// DTO validator
import { parseAddCourseDTO, type AddCourseDTO } from '../../dtos/course.dto';

/** -----------------------------------------------------------
 *  Light normalization so the DTO parser can do its job reliably.
 *  Keeps controllers thin and centralizes input handling here.
 *  ---------------------------------------------------------- */
const normalizeAddCourseInput = (raw: any): Partial<AddCourseDTO> => {
  const asBool =
    raw?.isPaid === true ||
    String(raw?.isPaid ?? 'false').trim().toLowerCase() === 'true';

  return {
    title: String(raw?.title ?? ''),
    duration: Number(raw?.duration ?? 0),

    // Prefer DTO keys; keep legacy alias `category`
    categoryId: String(raw?.categoryId ?? raw?.category ?? ''),
    subcategoryId: raw?.subcategoryId ? String(raw.subcategoryId) : undefined,

    level: String(raw?.level ?? ''),

    tags: toStringArray(raw?.tags),
    price: Number(raw?.price ?? 0),
    isPaid: asBool,

    about: raw?.about != null ? String(raw.about) : undefined,
    description: raw?.description != null ? String(raw.description) : undefined,

    syllabus: toStringArray(raw?.syllabus),
    requirements: toStringArray(raw?.requirements),

    videoSource: raw?.videoSource ? String(raw.videoSource) : undefined,
    videoUrl: raw?.videoUrl ? String(raw.videoUrl) : undefined,

    // If frontend already finalized a chunk or has a stored key/url, it can pass it here.
    introductionKey: raw?.introductionKey ? String(raw.introductionKey) : undefined
  };
};

/** Small helpers (pure) */
const looksLikeUrl = (s?: string) => !!s && /^https?:\/\//i.test(s);
const nonEmpty = (v: unknown) => String(v ?? '').trim().length > 0;

/** -----------------------------------------------------------
 *  Add course
 *  - Validates with AddCourseDTO
 *  - Creates a draft course, then patches file fields if present
 *  - Uses mediaService for uploads (DRY, provider-agnostic)
 *  - Uses youtubeService/vimeoService for embed URL normalization
 *  ---------------------------------------------------------- */
export const addCourses = async (
  instructorId: string | undefined,
  courseInfoRaw: unknown,
  files: Record<string, Express.Multer.File[]> | undefined,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  // kept for backwards-compat if caller already creates it; we still prefer mediaService internally
  _cloudService: ReturnType<typeof cloudServiceInterface>
) => {
  if (!instructorId) {
    throw new AppError('Invalid instructor', HttpStatusCodes.BAD_REQUEST);
  }

  // Services (dynamic provider selection is handled internally)
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const media = mediaService();
  const yt = youtubeService();
  const vimeo = vimeoService();

  // 1) Normalize → validate (DTO drives the shape)
  const normalized = normalizeAddCourseInput(courseInfoRaw);
  const parsed = parseAddCourseDTO(normalized);

  if (!parsed.ok || !parsed.data) {
    throw new AppError(
      `Invalid course payload: ${JSON.stringify(parsed.errors)}`,
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const dto = parsed.data;

  // 2) Persist base (no files yet)
  const basePayload: any = {
    instructorId,
    title: dto.title,
    duration: Number(dto.duration || 0),
    category: dto.categoryId,
    subcategory: dto.subcategoryId || undefined,
    level: dto.level,
    tags: dto.tags,
    price: Number(dto.price || 0),
    isPaid: !!dto.isPaid,
    about: dto.about || dto.description || dto.title || 'About',
    description: dto.description || '',
    syllabus: dto.syllabus,
    requirements: dto.requirements,
    // For intro video we’ll patch later; keep source/url if provided
    videoSource: dto.videoSource || 'local',
    videoUrl: dto.videoUrl,
    status: 'draft'
  };

  if (!basePayload.title || !basePayload.category || !basePayload.level) {
    throw new AppError(
      'Missing required fields (title/categoryId/level)',
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const createdId = await courseDbRepository.addCourse(basePayload);
  if (!createdId) {
    throw new AppError('Unable to add course', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  // 3) Optional uploads → patch record
  const patch: any = {};

  /** A) Thumbnail */
  const thumbnailFile = pickFile(files, 'thumbnail');
  if (thumbnailFile) {
    const up = await media.uploadOne(thumbnailFile); // provider-agnostic
    patch.thumbnail = { name: up.name, key: up.key, url: up.url };
  }

  /** B) Guidelines */
  const guidelinesFile = pickFile(files, 'guidelines');
  if (guidelinesFile) {
    const up = await media.uploadOne(guidelinesFile);
    patch.guidelines = { name: up.name, key: up.key, url: up.url };
  }

  /** C) Introduction (priority: key/url → file → remote url) */
  if (nonEmpty(dto.introductionKey)) {
    // If frontend already finalized via LMS and has a key → transform to URL when needed
    const key = String(dto.introductionKey);
    const url = looksLikeUrl(key) ? key : await cloud.getCloudFrontUrl(key);
    patch.introduction = { name: 'introduction', key, url };
  } else {
    const introductionFile = pickFile(files, 'introduction');
    if (introductionFile) {
      // Keep LMS foldering: courses/<courseId>/introduction/<name>
      const up = await media.uploadWithContext(introductionFile, {
        courseId: String(createdId),
        kind: 'introduction'
      });
      patch.introduction = { name: up.name, key: up.key, url: up.url };
    } else if (
      (dto.videoSource === 'youtube' || dto.videoSource === 'vimeo') &&
      nonEmpty(dto.videoUrl)
    ) {
      // Normalize embed URL using dedicated services
      const src = String(dto.videoSource).toLowerCase();
      const rawUrl = String(dto.videoUrl);
      if (src === 'youtube') {
        const embed = yt.normalizeUrl(rawUrl); // throws if invalid
        patch.introduction = { name: 'remote-video', url: embed };
      } else {
        // vimeo: DTO passes URL; service expects an id → try to extract last path segment
        let id = rawUrl;
        try {
          const u = new URL(rawUrl);
          const parts = u.pathname.split('/').filter(Boolean);
          if (parts.length) id = parts[parts.length - 1];
        } catch {
          /* if not a URL, treat as already an id */
        }
        patch.introduction = { name: 'remote-video', url: vimeo.getEmbedUrl(id) };
      }
    }
  }

  /** D) DRY arrays patch */
  Object.assign(
    patch,
    arraysPatch({
      tags: dto.tags,
      syllabus: dto.syllabus,
      requirements: dto.requirements
    })
  );

  if (Object.keys(patch).length) {
    await courseDbRepository.editCourse(String(createdId), patch);
  }

  return createdId;
};

export default addCourses;
