import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { EditCourseInfo } from '../../../types/courseInterface';
import AppError from '../../../utils/appError';
import fs from 'fs';

export const editCourseU = async (
  courseId: string,
  instructorId: string | undefined,
  files: { [fieldname: string]: Express.Multer.File[] },
  courseInfo: EditCourseInfo,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  let isThumbnailUpdated = false,
    isGuideLinesUpdated = false;
  if (!courseId) {
    throw new AppError(
      'Please provide course id ',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (!instructorId) {
    throw new AppError(
      'Please provide instructor id ',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (!courseInfo) {
    throw new AppError(
      'Please provide course details',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const oldCourse = await courseDbRepository.getCourseById(courseId);

  if (files && files.guidelines && files.guidelines.length > 0) {
    const uploadPromises = files.guidelines.map(async (file) => {
      if (file.mimetype === 'application/pdf') {
        courseInfo.guidelines = {
          name: file.originalname,
          url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`
        };
        isGuideLinesUpdated = true;
      } else {
        courseInfo.thumbnail = {
          name: file.originalname,
          url: `http://localhost:${process.env.PORT}/uploads/${file.filename}`
        };
        isThumbnailUpdated = true;
      }
    });

    await Promise.all(uploadPromises);
  }
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

  const response = await courseDbRepository.editCourse(courseId, courseInfo);
  if (response) {
    if (isGuideLinesUpdated && oldCourse?.guidelines) {
      fs.unlinkSync(oldCourse.guidelines.url);
    }
    if (isThumbnailUpdated && oldCourse?.thumbnail) {
      fs.unlinkSync(oldCourse.thumbnail.url);
    }
  }
};
