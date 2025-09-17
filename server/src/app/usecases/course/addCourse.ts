<<<<<<< HEAD
// server/src/app/usecases/course/addCourse.ts

import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import type { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { arraysPatch, pickFile, toStringArray } from './_helpers';

// DTO validator
import { parseAddCourseDTO, type AddCourseDTO } from '../../dtos/course.dto';

/**
 * Light normalization so the DTO parser can do its job reliably.
 * Keeps controllers thin and centralizes input handling here.
 */
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
    introductionKey: raw?.introductionKey ? String(raw.introductionKey) : undefined
  };
};

/**
 * Add course
 * - Validates with AddCourseDTO
 * - Creates a draft course, then patches file fields if present
 */
export const addCourses = async (
  instructorId: string | undefined,
  courseInfoRaw: unknown,
  files: Record<string, Express.Multer.File[]> | undefined,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  cloudService: ReturnType<typeof cloudServiceInterface>
) => {
  if (!instructorId) {
    throw new AppError('Invalid instructor', HttpStatusCodes.BAD_REQUEST);
  }

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

  const thumbnailFile = pickFile(files, 'thumbnail');
  if (thumbnailFile) {
    const up = await cloudService.uploadAndGetUrl(thumbnailFile);
    patch.thumbnail = { name: thumbnailFile.originalname, key: up.key, url: up.url };
  }

  const guidelinesFile = pickFile(files, 'guidelines');
  if (guidelinesFile) {
    const up = await cloudService.uploadAndGetUrl(guidelinesFile);
    patch.guidelines = { name: guidelinesFile.originalname, key: up.key, url: up.url };
  }

  if (dto.introductionKey) {
    // Provided as existing key/url
    patch.introduction = {
      name: 'introduction',
      key: dto.introductionKey,
      url: dto.introductionKey
    };
  } else {
    const introductionFile = pickFile(files, 'introduction');
    if (introductionFile) {
      const up = await cloudService.uploadAndGetUrl(introductionFile);
      patch.introduction = { name: introductionFile.originalname, key: up.key, url: up.url };
    } else if (
      (dto.videoSource === 'youtube' || dto.videoSource === 'vimeo') &&
      dto.videoUrl
    ) {
      patch.introduction = { name: 'remote-video', url: dto.videoUrl };
    }
  }

  // DRY arrays patch
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
=======
import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { AddCourseInfoInterface } from '../../../types/courseInterface';
import AppError from '../../../utils/appError';

export const addCourses = async (
  instructorId: string | undefined,
  courseInfo: AddCourseInfoInterface,
  files: Express.Multer.File[],
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  if (!instructorId || !courseInfo || !files || files.length === 0) {
    throw new AppError('Invalid input data', HttpStatusCodes.BAD_REQUEST);
  }

  const uploadPromises = files.map(async (file) => {
    if (file.mimetype === 'application/pdf') {
      courseInfo.guidelines = {
        name: file.originalname,
        url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`
      };
    }
    if (file.mimetype === 'video/mp4') {
      courseInfo.introduction = {
        name: file.originalname,
        url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`
      };
    }
    if (file.mimetype.includes('image')) {
      courseInfo.thumbnail = {
        name: file.originalname,
        url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`
      };
    }
  });

  await Promise.all(uploadPromises);

  courseInfo.instructorId = instructorId;

  if (typeof courseInfo.tags === 'string') {
    courseInfo.tags = courseInfo.tags.split(',');
  }
  if (typeof courseInfo.syllabus === 'string') {
    courseInfo.syllabus = courseInfo.syllabus.split(',');
  }
  if (typeof courseInfo.requirements === 'string') {
    courseInfo.requirements = courseInfo.requirements.split(',');
  }
  const courseId = await courseDbRepository.addCourse(courseInfo);

  if (!courseId) {
    throw new AppError(
      'Unable to add course',
      HttpStatusCodes.INTERNAL_SERVER_ERROR
    );
  }
  return courseId;
};
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
