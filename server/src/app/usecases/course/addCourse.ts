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
