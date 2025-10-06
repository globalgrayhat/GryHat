import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import type { EditCourseInfo } from '../../../types/courseInterface';
import type { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';

// Unified, provider-agnostic services
import { mediaService, MediaDescriptor } from '../../services/mediaService';
import { youtubeService, vimeoService } from '../../../frameworks/services';

import { arraysPatch, pickFile, safeDeleteOld, toStringArray } from './_helpers';
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { CloudServiceImpl } from '../../../frameworks/services';


// DTO validator
import { parseEditCourseDTO, type EditCourseDTO } from '../../dtos/course.dto';

/** Normalize loose payload so the DTO can validate it safely. */
const normalizeEditCourseInput = (raw: EditCourseInfo | any): Partial<EditCourseDTO> => {
  const normBool = (v: unknown) =>
    v === true || String(v ?? '').trim().toLowerCase() === 'true';

  return {
    title: raw?.title,
    duration: raw?.duration != null ? Number(raw.duration) : undefined,
    categoryId: raw?.categoryId ?? raw?.category,
    subcategoryId: raw?.subcategoryId,
    level: raw?.level,

    tags: raw?.tags != null ? toStringArray(raw.tags) : undefined,
    price: raw?.price != null ? Number(raw.price) : undefined,
    isPaid: raw?.isPaid != null ? normBool(raw.isPaid) : undefined,

    about: raw?.about,
    description: raw?.description,

    syllabus: raw?.syllabus != null ? toStringArray(raw.syllabus) : undefined,
    requirements: raw?.requirements != null ? toStringArray(raw.requirements) : undefined,

    videoSource: raw?.videoSource,
    videoUrl: raw?.videoUrl,

    introductionKey: raw?.introductionKey
  };
};

const looksLikeUrl = (s?: string) => !!s && /^https?:\/\//i.test(s || '');
const nonEmpty = (v: unknown) => String(v ?? '').trim().length > 0;

/**
 * Edit course use-case
 * - Validates input against EditCourseDTO
 * - Refactored: Uploads/rotates files (thumbnail/guidelines/introduction) via the centralized mediaService.
 * - Deletes old assets safely when replaced.
 */
export const editCourseU = async (
  courseId: string,
  instructorId: string | undefined,
  files: Record<string, Express.Multer.File[]> | undefined,
  courseInfo: EditCourseInfo,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  if (!courseId) throw new AppError('Please provide course id', HttpStatusCodes.BAD_REQUEST);
  if (!instructorId) throw new AppError('Please provide instructor id', HttpStatusCodes.BAD_REQUEST);
  if (!courseInfo) throw new AppError('Please provide course details', HttpStatusCodes.BAD_REQUEST);

  // Fetch & authorize
  const oldCourse = await courseDbRepository.getCourseById(courseId);
  if (!oldCourse) throw new AppError('Course not found', HttpStatusCodes.NOT_FOUND);
  if (String((oldCourse as any).instructorId) !== String(instructorId)) {
    throw new AppError('You are not authorized to edit this course', HttpStatusCodes.FORBIDDEN);
  }

  // Services
  const cloud = cloudServiceInterface(CloudServiceImpl());
  const media = mediaService();
  const yt = youtubeService();
  const vimeo = vimeoService();

  // Validate with DTO
  const normalized = normalizeEditCourseInput(courseInfo);
  const parsed = parseEditCourseDTO(normalized);
  if (!parsed.ok || !parsed.data) {
    throw new AppError(`Invalid patch payload: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);
  }
  const dto = parsed.data;
  
  const toDbFileFormat = (mediaDesc: MediaDescriptor) => ({
    name: mediaDesc.name,
    key: mediaDesc.key,
    url: mediaDesc.url
  });

  // Start building the patch object
  const patch: any = {
    ...(dto.title && { title: dto.title }),
    ...(dto.duration !== undefined && { duration: Number(dto.duration) }),
    ...(dto.categoryId && { category: dto.categoryId }),
    ...(dto.subcategoryId && { subcategory: dto.subcategoryId }),
    ...(dto.level && { level: dto.level }),
    ...(dto.price !== undefined && { price: Number(dto.price) }),
    ...(dto.isPaid !== undefined && { isPaid: !!dto.isPaid }),
    ...(dto.about && { about: dto.about }),
    ...(dto.description && { description: dto.description }),
    ...(dto.videoSource && { videoSource: dto.videoSource }),
    ...(dto.videoUrl && { videoUrl: dto.videoUrl })
  };
  Object.assign(patch, arraysPatch({
    tags: dto.tags,
    syllabus: dto.syllabus,
    requirements: dto.requirements
  }));

  // --- File Replacements ---
  const thumbnailFile = pickFile(files, 'thumbnail');
  const guidelinesFile = pickFile(files, 'guidelines');
  const introductionFile = pickFile(files, 'introduction');

  /** A) Thumbnail */
  if (thumbnailFile) {
    const uploadedMedia = await media.upload(thumbnailFile, { type: 'courseThumbnail', courseId });
    patch.thumbnail = toDbFileFormat(uploadedMedia);
    await safeDeleteOld({ oldKey: (oldCourse as any)?.thumbnail?.key, cloudService: { deleteByKey: cloud.removeFile } });
  }

  /** B) Guidelines */
  if (guidelinesFile) {
    const uploadedMedia = await media.upload(guidelinesFile, { type: 'courseGuidelines', courseId });
    patch.guidelines = toDbFileFormat(uploadedMedia);
    await safeDeleteOld({ oldKey: (oldCourse as any)?.guidelines?.key, cloudService: { deleteByKey: cloud.removeFile } });
  }

  /** C) Introduction (priority: key/url > file > normalized remote URL) */
  if (nonEmpty(dto.introductionKey)) {
    const keyOrUrl = String(dto.introductionKey);
    const url = looksLikeUrl(keyOrUrl) ? keyOrUrl : await cloud.getCloudFrontUrl(keyOrUrl);
    patch.introduction = { name: 'introduction', key: looksLikeUrl(keyOrUrl) ? undefined : keyOrUrl, url };
    await safeDeleteOld({ oldKey: (oldCourse as any)?.introduction?.key, cloudService: { deleteByKey: cloud.removeFile } });
  } else if (introductionFile) {
    const uploadedMedia = await media.upload(introductionFile, { type: 'courseIntroduction', courseId });
    patch.introduction = toDbFileFormat(uploadedMedia);
    await safeDeleteOld({ oldKey: (oldCourse as any)?.introduction?.key, cloudService: { deleteByKey: cloud.removeFile } });
  } else if (
    (dto.videoSource === 'youtube' || dto.videoSource === 'vimeo') &&
    nonEmpty(dto.videoUrl)
  ) {
    const src = String(dto.videoSource).toLowerCase();
    const rawUrl = String(dto.videoUrl);
    if (src === 'youtube') {
      patch.introduction = { name: 'remote-video', url: yt.normalizeUrl(rawUrl) };
    } else {
      let id = rawUrl;
      try {
        const u = new URL(rawUrl);
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length) id = parts[parts.length - 1];
      } catch {}
      patch.introduction = { name: 'remote-video', url: vimeo.getEmbedUrl(id) };
    }
    await safeDeleteOld({ oldKey: (oldCourse as any)?.introduction?.key, cloudService: { deleteByKey: cloud.removeFile } });
  }

  // Nothing to update?
  if (Object.keys(patch).length === 0) {
    return { status: 'noop', course: oldCourse };
  }

  const updated = await courseDbRepository.editCourse(courseId, patch);
  return { status: 'success', course: updated };
};

export default editCourseU;

