import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';

export const getRecommendedCourseByStudentU = async (
  studentId: string,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
<<<<<<< HEAD
  // Check if studentId is provided
  if (!studentId) {
    throw new AppError('Please provide a valid student id', HttpStatusCodes.BAD_REQUEST);
  }

  // Fetch recommended courses for the student
  const courses = await courseDbRepository.getRecommendedCourseByStudentInterest(studentId);

  // Set media URLs if available
  await Promise.all(
    courses.map(async (course) => {
      if (course.course) course.media.thumbnailUrl = course.course.thumbnail.url;
      if (course.instructor) course.media.profileUrl = course.instructor.profile.url;
    })
  );

  // Return processed courses
  return courses;
};


=======
  if (!studentId) {
    throw new AppError(
      'Please provide a valid student id ',
      HttpStatusCodes.BAD_REQUEST
    );
  }

  const courses =
    await courseDbRepository.getRecommendedCourseByStudentInterest(studentId);
  await Promise.all(
    courses.map(async (course) => {
      course.media = { thumbnailUrl: '', profileUrl: '' };
      if (course.course) {
        course.media.thumbnailUrl = course.course.thumbnail.url;
      }
      if (course.instructor) {
        course.media.profileUrl = course.instructor.profile.url;
      }
    })
  );

  return courses;
};

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
export const getTrendingCourseU = async (
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>
) => {
  const courses = await courseDbRepository.getTrendingCourse();
  await Promise.all(
    courses.map(async (course) => {
      if (course.thumbnail) {
        course.thumbnailUrl = course.thumbnail.url;
      }
      if (course.instructorProfile) {
        course.profileUrl = course.instructorProfile.url;
      }
    })
  );
  return courses;
};
