import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import type { AddCourseInfoInterface } from '../../../types/courseInterface';
import type { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { cloudServiceInterface } from '../../services/cloudServiceInterface';
import { arraysPatch, pickFile, toStringArray } from './_helpers';

export const addCourses = async (
  instructorId: string | undefined,
  courseInfo: AddCourseInfoInterface,
  files: Record<string, Express.Multer.File[]> | undefined,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  cloudService: ReturnType<typeof cloudServiceInterface>
) => {
  if (!instructorId || !courseInfo) {
    throw new AppError('Invalid input data', HttpStatusCodes.BAD_REQUEST);
  }

  const basePayload: any = {
    instructorId,
    title: courseInfo.title,
    duration: Number(courseInfo.duration || 0),
    category: courseInfo.categoryId,
    subcategory: courseInfo.subcategoryId || undefined,
    level: courseInfo.level,
    tags: toStringArray(courseInfo.tags),
    price: Number(courseInfo.price || 0),
    isPaid: String(courseInfo.isPaid).toLowerCase() === 'true',
    about: courseInfo.about || courseInfo.description || courseInfo.title || 'About',
    description: courseInfo.description || '',
    syllabus: toStringArray(courseInfo.syllabus),
    requirements: toStringArray(courseInfo.requirements),
    videoSource: courseInfo.videoSource || 'local',
    videoUrl: courseInfo.videoUrl,
    status: 'draft'
  };

  if (!basePayload.title || !basePayload.category || !basePayload.level) {
    throw new AppError('Missing required fields (title/categoryId/level)', HttpStatusCodes.BAD_REQUEST);
  }

  const createdId = await courseDbRepository.addCourse(basePayload);
  if (!createdId) {
    throw new AppError('Unable to add course', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

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

  if (courseInfo.introductionKey) {
    patch.introduction = { name: 'introduction', key: courseInfo.introductionKey, url: courseInfo.introductionKey };
  } else {
    const introductionFile = pickFile(files, 'introduction');
    if (introductionFile) {
      const up = await cloudService.uploadAndGetUrl(introductionFile);
      patch.introduction = { name: introductionFile.originalname, key: up.key, url: up.url };
    } else if (
      (courseInfo.videoSource === 'youtube' || courseInfo.videoSource === 'vimeo') &&
      courseInfo.videoUrl
    ) {
      patch.introduction = { name: 'remote-video', url: courseInfo.videoUrl };
    }
  }

  Object.assign(patch, arraysPatch({
    tags: courseInfo.tags,
    syllabus: courseInfo.syllabus,
    requirements: courseInfo.requirements,
  }));

  if (Object.keys(patch).length) {
    await courseDbRepository.editCourse(String(createdId), patch);
  }

  return createdId;
};

export default addCourses;
