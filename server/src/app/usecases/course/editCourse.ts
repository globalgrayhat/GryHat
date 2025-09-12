
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import type { EditCourseInfo } from '../../../types/courseInterface';
import type { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import {
  arraysPatch,
  pickFile,
  safeDeleteOld,
  toStringArray,
} from './_helpers';

export const editCourseU = async (
  courseId: string,
  instructorId: string | undefined,
  files: { [fieldname: string]: Express.Multer.File[] } | undefined,
  courseInfo: EditCourseInfo,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  cloudService?: ReturnType<typeof cloudServiceInterface>,
) => {
  if (!courseId) throw new AppError('Please provide course id', HttpStatusCodes.BAD_REQUEST);
  if (!instructorId) throw new AppError('Please provide instructor id', HttpStatusCodes.BAD_REQUEST);
  if (!courseInfo) throw new AppError('Please provide course details', HttpStatusCodes.BAD_REQUEST);

  const oldCourse = await courseDbRepository.getCourseById(courseId);
  if (!oldCourse) throw new AppError('Course not found', HttpStatusCodes.NOT_FOUND);

  const patch: any = {
    // textual updates if provided
    ...(courseInfo.title && { title: courseInfo.title }),
    ...(courseInfo.level && { level: courseInfo.level }),
    ...(courseInfo.tags && { tags: toStringArray(courseInfo.tags) }),
    ...(courseInfo.price !== undefined && { price: Number(courseInfo.price) }),
    ...(courseInfo.about && { about: courseInfo.about }),
    ...(courseInfo.description && { description: courseInfo.description }),
    ...(courseInfo.syllabus && { syllabus: toStringArray(courseInfo.syllabus) }),
    ...(courseInfo.requirements && { requirements: toStringArray(courseInfo.requirements) }),
  };

  // Files by fieldname (thumbnail/guidelines/introduction)
  const thumbnailFile   = pickFile(files, 'thumbnail');
  const guidelinesFile  = pickFile(files, 'guidelines');
  const introductionFile = pickFile(files, 'introduction');

  // --- Thumbnail
  if (thumbnailFile && cloudService?.uploadAndGetUrl) {
    const up = await cloudService.uploadAndGetUrl(thumbnailFile);
    patch.thumbnail = { name: thumbnailFile.originalname, key: up.key, url: up.url };

    // delete old safely
    await safeDeleteOld({
      oldKey: (oldCourse.thumbnail as any)?.key,
      oldUrl: (oldCourse.thumbnail as any)?.url,
      cloudService: (cloudService && typeof (cloudService as any).removeFile === 'function') ? { deleteByKey: (cloudService as any).removeFile } : undefined,
    });
  }

  // --- Guidelines
  if (guidelinesFile && cloudService?.uploadAndGetUrl) {
    const up = await cloudService.uploadAndGetUrl(guidelinesFile);
    patch.guidelines = { name: guidelinesFile.originalname, key: up.key, url: up.url };

    await safeDeleteOld({
      oldKey: (oldCourse.guidelines as any)?.key,
      oldUrl: (oldCourse.guidelines as any)?.url,
      cloudService: (cloudService && typeof (cloudService as any).removeFile === 'function') ? { deleteByKey: (cloudService as any).removeFile } : undefined,
    });
  }

  // --- Introduction priority: TUS key > file > external
  if (courseInfo.introductionKey) {
    patch.introduction = { name: 'introduction', key: courseInfo.introductionKey, url: courseInfo.introductionKey };

    await safeDeleteOld({
      oldKey: (oldCourse.introduction as any)?.key,
      oldUrl: (oldCourse.introduction as any)?.url,
      cloudService: (cloudService && typeof (cloudService as any).removeFile === 'function') ? { deleteByKey: (cloudService as any).removeFile } : undefined,
    });

  } else if (introductionFile && cloudService?.uploadAndGetUrl) {
    const up = await cloudService.uploadAndGetUrl(introductionFile);
    patch.introduction = { name: introductionFile.originalname, key: up.key, url: up.url };

    await safeDeleteOld({
      oldKey: (oldCourse.introduction as any)?.key,
      oldUrl: (oldCourse.introduction as any)?.url,
      cloudService: (cloudService && typeof (cloudService as any).removeFile === 'function') ? { deleteByKey: (cloudService as any).removeFile } : undefined,
    });

  } else if (
    (courseInfo.videoSource === 'youtube' || courseInfo.videoSource === 'vimeo') &&
    courseInfo.videoUrl
  ) {
    patch.introduction = { name: 'remote-video', url: courseInfo.videoUrl };

    if (oldCourse.introduction && (oldCourse.introduction as any)?.url !== courseInfo.videoUrl) {
      await safeDeleteOld({
        oldKey: (oldCourse.introduction as any)?.key,
        oldUrl: (oldCourse.introduction as any)?.url,
        cloudService: (cloudService && typeof (cloudService as any).removeFile === 'function') ? { deleteByKey: (cloudService as any).removeFile } : undefined,
      });
    }
  }

  // Apply patch if any
  if (Object.keys(patch).length === 0) {
    // Nothing to update; return silently
    return { status: 'noop', courseId };
  }

  const updated = await courseDbRepository.editCourse(courseId, patch);
  return { status: 'success', course: updated };
};

export default editCourseU;