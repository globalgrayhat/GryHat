import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { CourseInterface } from '@src/types/courseInterface';
import { Types } from 'mongoose';

export const getRejectedCoursesU = async (
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
): Promise<(CourseInterface & { thumbnailUrl?: string })[]> => {
  const courses = await courseDbRepository.getRejectedCourses();

  if (!courses || courses.length === 0) {
    throw new AppError('No rejected courses found', HttpStatusCodes.NOT_FOUND);
  }

  return courses.map(course => {
    const c = course.toObject ? course.toObject() : course;
    return {
      ...c,
      instructorId: c.instructorId ? (typeof c.instructorId === 'string' ? c.instructorId : c.instructorId.toHexString()) : undefined,
      category: c.category ? (typeof c.category === 'string' ? c.category : c.category.toHexString()) : undefined,
      subcategory: c.subcategory ? (typeof c.subcategory === 'string' ? c.subcategory : c.subcategory.toHexString()) : undefined,
      coursesEnrolled: (c.coursesEnrolled || []).map((id: Types.ObjectId | string) =>
        typeof id === 'string' ? id : id.toHexString()
      ),
      thumbnailUrl: c.thumbnail?.url
    };
  });
};
