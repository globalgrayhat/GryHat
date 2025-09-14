// server/src/app/usecases/course/editCourse.ts

import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import type { EditCourseInfo } from '../../../types/courseInterface';
import type { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { arraysPatch, pickFile, safeDeleteOld, toStringArray } from './_helpers';

// DTO validator (keeps shape consistent with controllers)
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

/**
 * Edit course use-case
 * - Validates input against EditCourseDTO
 * - Applies text & structural patches
 * - Uploads/rotates files (thumbnail/guidelines/introduction) if provided
 * - Deletes old assets safely when replaced
 */
export const editCourseU = async (
  courseId: string,
  instructorId: string | undefined,
  files: Record<string, Express.Multer.File[]> | undefined,
  courseInfo: EditCourseInfo,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  cloudService?: ReturnType<typeof cloudServiceInterface>
) => {
  if (!courseId) throw new AppError('Please provide course id', HttpStatusCodes.BAD_REQUEST);
  if (!instructorId) throw new AppError('Please provide instructor id', HttpStatusCodes.BAD_REQUEST);
  if (!courseInfo) throw new AppError('Please provide course details', HttpStatusCodes.BAD_REQUEST);

  // Fetch & authorize
  const oldCourse = await courseDbRepository.getCourseById(courseId);
  if (!oldCourse) throw new AppError('Course not found', HttpStatusCodes.NOT_FOUND);
  if (String((oldCourse as any).instructorId) !== String(instructorId)) {
    throw new AppError('Forbidden', HttpStatusCodes.FORBIDDEN);
  }

  // Validate with DTO (keeps behavior consistent across layers)
  const normalized = normalizeEditCourseInput(courseInfo);
  const parsed = parseEditCourseDTO(normalized);
  if (!parsed.ok || !parsed.data) {
    throw new AppError(`Invalid patch payload: ${JSON.stringify(parsed.errors)}`, HttpStatusCodes.BAD_REQUEST);
  }
  const dto = parsed.data;

  // Textual/primitive patch
  const patch: any = {
    ...(dto.title && { title: dto.title }),
    ...(dto.duration !== undefined && { duration: Number(dto.duration) }),
    ...(dto.categoryId && { category: dto.categoryId }),
    ...(dto.subcategoryId && { subcategory: dto.subcategoryId }),
    ...(dto.level && { level: dto.level }),
    ...(dto.price !== undefined && { price: Number(dto.price) }),
    ...(dto.isPaid !== undefined && { isPaid: !!dto.isPaid }),
    ...(dto.about && { about: dto.about }),
    ...(dto.description && { description: dto.description })
  };

  // Arrays DRY patch (only if provided)
  Object.assign(
    patch,
    arraysPatch({
      tags: dto.tags,
      syllabus: dto.syllabus,
      requirements: dto.requirements
    })
  );

  // Video fields (do not force if absent)
  if (dto.videoSource) patch.videoSource = dto.videoSource;
  if (dto.videoUrl) patch.videoUrl = dto.videoUrl;

  // Files by fieldname (thumbnail/guidelines/introduction)
  const thumbnailFile = pickFile(files, 'thumbnail');
  const guidelinesFile = pickFile(files, 'guidelines');
  const introductionFile = pickFile(files, 'introduction');

  // --- Thumbnail
  if (thumbnailFile && cloudService?.uploadAndGetUrl) {
    const up = await cloudService.uploadAndGetUrl(thumbnailFile);
    patch.thumbnail = { name: thumbnailFile.originalname, key: up.key, url: up.url };

    await safeDeleteOld({
      oldKey: (oldCourse as any)?.thumbnail?.key,
      oldUrl: (oldCourse as any)?.thumbnail?.url,
      cloudService:
        cloudService && typeof (cloudService as any).removeFile === 'function'
          ? { deleteByKey: (cloudService as any).removeFile }
          : undefined
    });
  }

  // --- Guidelines
  if (guidelinesFile && cloudService?.uploadAndGetUrl) {
    const up = await cloudService.uploadAndGetUrl(guidelinesFile);
    patch.guidelines = { name: guidelinesFile.originalname, key: up.key, url: up.url };

    await safeDeleteOld({
      oldKey: (oldCourse as any)?.guidelines?.key,
      oldUrl: (oldCourse as any)?.guidelines?.url,
      cloudService:
        cloudService && typeof (cloudService as any).removeFile === 'function'
          ? { deleteByKey: (cloudService as any).removeFile }
          : undefined
    });
  }

  // --- Introduction: priority (key > file > external URL)
  if (dto.introductionKey) {
    patch.introduction = {
      name: 'introduction',
      key: dto.introductionKey,
      url: dto.introductionKey
    };

    await safeDeleteOld({
      oldKey: (oldCourse as any)?.introduction?.key,
      oldUrl: (oldCourse as any)?.introduction?.url,
      cloudService:
        cloudService && typeof (cloudService as any).removeFile === 'function'
          ? { deleteByKey: (cloudService as any).removeFile }
          : undefined
    });
  } else if (introductionFile && cloudService?.uploadAndGetUrl) {
    const up = await cloudService.uploadAndGetUrl(introductionFile);
    patch.introduction = { name: introductionFile.originalname, key: up.key, url: up.url };

    await safeDeleteOld({
      oldKey: (oldCourse as any)?.introduction?.key,
      oldUrl: (oldCourse as any)?.introduction?.url,
      cloudService:
        cloudService && typeof (cloudService as any).removeFile === 'function'
          ? { deleteByKey: (cloudService as any).removeFile }
          : undefined
    });
  } else if (
    (dto.videoSource === 'youtube' || dto.videoSource === 'vimeo') &&
    dto.videoUrl
  ) {
    patch.introduction = { name: 'remote-video', url: dto.videoUrl };

    if ((oldCourse as any)?.introduction?.url !== dto.videoUrl) {
      await safeDeleteOld({
        oldKey: (oldCourse as any)?.introduction?.key,
        oldUrl: (oldCourse as any)?.introduction?.url,
        cloudService:
          cloudService && typeof (cloudService as any).removeFile === 'function'
            ? { deleteByKey: (cloudService as any).removeFile }
            : undefined
      });
    }
  }

  // Nothing to update?
  if (Object.keys(patch).length === 0) {
    return { status: 'noop', courseId };
  }

  const updated = await courseDbRepository.editCourse(courseId, patch);
  return { status: 'success', course: updated };
};

export default editCourseU;
