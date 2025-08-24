import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { CourseInterface } from '@src/types/courseInterface';

export const getAllCourseU = async (
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  const courses: CourseInterface[] | null =
    await courseDbRepository.getAllCourse();

  await Promise.all(
    courses.map(async (course) => {
      if (course.thumbnail) {
        course.thumbnailUrl = course.thumbnail.url;
      }
    })
  );
  return courses;
};

export const getCourseByIdU = async (
  courseId: string,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  if (!courseId) {
    throw new AppError(
      'Please provide a course id',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const course: CourseInterface | null = await courseDbRepository.getCourseById(
    courseId
  );

  if (course) {
    if (course.thumbnail) {
      course.thumbnailUrl = course.thumbnail.url;
    }
    if (course.guidelines) {
      course.guidelinesUrl = course.guidelines.url;
    }
  }
  return course;
};

export const getCourseByStudentU = async (
  studentId: string | undefined,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  if (!studentId) {
    throw new AppError('Invalid student id ', HttpStatusCodes.BAD_REQUEST);
  }
  const courses = await courseDbRepository.getCourseByStudent(studentId);

  await Promise.all(
    courses.map(async (course) => {
      if (course.thumbnail) {
        course.thumbnailUrl = course.thumbnail.url;
      }
    })
  );
  return courses;
};
