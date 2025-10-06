import { ok, created, fail } from '../../shared/http/respond';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { mediaService } from '../../app/services/mediaService';

import { CourseRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/courseReposMongoDb';
import { CourseDbRepositoryInterface } from '../../app/repositories/courseDbRepository';

import { addCourses } from '../../app/usecases/course/addCourse';
import { editCourseU } from '../../app/usecases/course/editCourse';
import {
  getAllCourseU,
  getCourseByIdU,
  getCourseByStudentU
} from '../../app/usecases/course/listCourse';
import { getCourseByInstructorU } from '../../app/usecases/course/viewCourse';
import { enrollStudentU } from '../../app/usecases/course/enroll';
import {
  getRecommendedCourseByStudentU,
  getTrendingCourseU
} from '../../app/usecases/course/recommendation';
import { searchCourseU } from '../../app/usecases/course/search';

import { addLessonsU } from '../../app/usecases/lessons/addLesson';
import { editLessonsU } from '../../app/usecases/lessons/editLesson';
import { deleteLessonU } from '../../app/usecases/lessons/deleteLesson';
import { getLessonsByCourseIdU } from '../../app/usecases/lessons/viewLessons';
import { getLessonByIdU } from '../../app/usecases/lessons/getLesson';

import { getQuizzesLessonU } from '../../app/usecases/quiz/getQuiz';

import {
  addDiscussionU,
  getDiscussionsByLessonU,
  editDiscussionU,
  deleteDiscussionByIdU,
  replyDiscussionU,
  getRepliesByDiscussionIdU
} from '../../app/usecases/lessons/discussions';

import { QuizDbInterface } from '../../app/repositories/quizDbRepository';
import { QuizRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/quizzDbRepository';

import { LessonDbRepositoryInterface } from '../../app/repositories/lessonDbRepository';
import { LessonRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/lessonRepoMongodb';

import { DiscussionDbInterface } from '../../app/repositories/discussionDbRepository';
import { DiscussionRepoMongodbInterface } from '../../frameworks/database/mongodb/repositories/discussionsRepoMongodb';

import { PaymentInterface } from '../../app/repositories/paymentDbRepository';
import { PaymentImplInterface } from '../../frameworks/database/mongodb/repositories/paymentRepoMongodb';

import { CacheRepositoryInterface } from '../../app/repositories/cachedRepoInterface';
import { RedisRepositoryImpl } from '../../frameworks/database/redis/redisCacheRepository';

import { cloudServiceInterface } from '../../app/services/cloudServiceInterface';
import { CloudServiceImpl } from '../../frameworks/services';

import {
  AddCourseInfoInterface,
  EditCourseInfo
} from '../../types/courseInterface';
import { AddDiscussionInterface } from '../../types/discussion';
import { PaymentInfo } from '../../types/payment';
import { CustomRequest } from '../../types/customRequest';

import { toStringArray } from '../../app/usecases/course/_helpers';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import AppError from '../../utils/appError';

// If your app exports RedisClient type
import { RedisClient } from '../../app';

/**
 * Course controller (thin): delegates to use-cases and keeps responses uniform.
 * Refactored: Removed all direct file handling logic. The controller's role is now simply
 * to pass the request body and files object from Multer to the appropriate use case.
 */
const courseController = (
  courseDbRepository: CourseDbRepositoryInterface,
  courseDbRepositoryImpl: CourseRepositoryMongoDbInterface,
  quizDbRepository: QuizDbInterface,
  quizDbRepositoryImpl: QuizRepositoryMongoDbInterface,
  lessonDbRepository: LessonDbRepositoryInterface,
  lessonDbRepositoryImpl: LessonRepositoryMongoDbInterface,
  discussionDbRepository: DiscussionDbInterface,
  discussionDbRepositoryImpl: DiscussionRepoMongodbInterface,
  paymentDbRepository: PaymentInterface,
  paymentDbRepositoryImpl: PaymentImplInterface,
  cacheDbRepository: CacheRepositoryInterface,
  cacheDbRepositoryImpl: RedisRepositoryImpl,
  cacheClient: RedisClient
) => {
  // Wire repositories
  const dbRepositoryCourse = courseDbRepository(courseDbRepositoryImpl());
  const dbRepositoryQuiz = quizDbRepository(quizDbRepositoryImpl());
  const dbRepositoryLesson = lessonDbRepository(lessonDbRepositoryImpl());
  const dbRepositoryDiscussion = discussionDbRepository(
    discussionDbRepositoryImpl()
  );
  const dbRepositoryPayment = paymentDbRepository(paymentDbRepositoryImpl());
  const dbRepositoryCache = cacheDbRepository(
    cacheDbRepositoryImpl(cacheClient)
  );

  // Cloud service (S3/Local is picked dynamically by DB config)
  const cloud = cloudServiceInterface(CloudServiceImpl());

  /** ---------------------- Cache helpers (DRY) ---------------------- */

  // Safely delete a cache key if repository supports it
  const cacheDel = async (key: string) => {
    try {
      // many custom repos expose `del`; keep optional-chaining to avoid runtime error
      await (dbRepositoryCache as any)?.del?.(key);
    } catch {
      /* ignore cache errors */
    }
  };

  // Refresh "all-courses" cache after any mutation to make updates visible immediately
  const refreshAllCoursesCache = async () => {
    try {
      await cacheDel('all-courses');
      const fresh = await getAllCourseU(dbRepositoryCourse);
      await dbRepositoryCache.setCache({
        key: 'all-courses',
        expireTimeSec: 600,
        data: JSON.stringify(fresh)
      });
    } catch {
      /* ignore cache errors */
    }
  };

  // Invalidate course-scoped keys if you use them (keep noop-safe)
  const invalidateCourseCaches = async (courseId?: string) => {
    await refreshAllCoursesCache();
    if (courseId) {
      await cacheDel(`course:${courseId}`); // optional convention
      await cacheDel(`lessons:${courseId}`); // optional convention
      await cacheDel(`search:${courseId}`); // optional convention
    }
  };

  /** ---------------------- Course ---------------------- */

  const addCourse = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const instructorId = req.user?.Id;
      const body: AddCourseInfoInterface = req.body;
      const files = (req.files as Record<string, Express.Multer.File[]>) || {};

      // Refactored: The use case now handles everything, including file processing.
      const createdId = await addCourses(
        instructorId,
        body,
        files,
        dbRepositoryCourse
      );

      // Invalidate immediately so lists reflect the new draft right away
      await invalidateCourseCaches(String(createdId));

      created(
        res,
        'Successfully added new course, course will be published after verification',
        createdId
      );
    }
  );

  const editCourse = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const courseId = req.params.courseId;
      const instructorId = req.user?.Id;
      const body: EditCourseInfo = req.body;
      const files = (req.files as Record<string, Express.Multer.File[]>) || {};

      // Refactored: All logic, including file replacement, is now in the use case.
      const result = await editCourseU(
        courseId,
        instructorId,
        files,
        body,
        dbRepositoryCourse
      );

      // Keep cache hot & consistent
      await invalidateCourseCaches(courseId);

      ok(res, 'Successfully updated the course', result);
    }
  );

  const getAllCourses = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      // Always read DB then refresh cache—keeps data fresh when upstream mutated
      const courses = await getAllCourseU(dbRepositoryCourse);
      await dbRepositoryCache.setCache({
        key: 'all-courses',
        expireTimeSec: 600,
        data: JSON.stringify(courses)
      });
      ok(res, 'Successfully retrieved all courses', courses);
    }
  );

  const getIndividualCourse = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { courseId } = req.params;
      const course = await getCourseByIdU(courseId, dbRepositoryCourse);
      ok(res, 'Successfully retrieved the course', course);
    }
  );

  const getCoursesByInstructor = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const instructorId = req.user?.Id;
      const courses = await getCourseByInstructorU(
        instructorId,
        dbRepositoryCourse
      );
      ok(res, 'Successfully retrieved your courses', courses);
    }
  );

  const enrollStudent = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { courseId } = req.params;
      const { Id: studentId } = req.user || {};
      const paymentInfo: PaymentInfo = req.body;

      await enrollStudentU(
        courseId ?? '',
        studentId ?? '',
        paymentInfo,
        dbRepositoryCourse,
        dbRepositoryPayment
      );

      // Enrollment can affect "trending" or UI counts → refresh list cache
      await invalidateCourseCaches(courseId);

      ok(res, 'Successfully enrolled into the course', null);
    }
  );

  const getRecommendedCourseByStudentInterest = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const studentId = req.user?.Id ?? '';
      const courses = await getRecommendedCourseByStudentU(
        studentId,
        dbRepositoryCourse
      );
      ok(res, 'Successfully retrieved recommended courses', courses);
    }
  );

  const getTrendingCourses = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const courses = await getTrendingCourseU(dbRepositoryCourse);
      ok(res, 'Successfully retrieved trending courses', courses);
    }
  );

  const getCourseByStudent = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const studentId = req.user?.Id;
      const courses = await getCourseByStudentU(studentId, dbRepositoryCourse);
      ok(res, 'Successfully retrieved courses based on students', courses);
    }
  );

  const searchCourse = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { search = '', filter = '' } = req.query as {
        search?: string;
        filter?: string;
      };
      const key =
        (search?.trim?.() ?? '') === ''
          ? (search as string)
          : (filter as string);
      const searchResult = await searchCourseU(
        search as string,
        filter as string,
        dbRepositoryCourse
      );
      if (searchResult.length) {
        await dbRepositoryCache.setCache({
          key: `${key}`,
          expireTimeSec: 600,
          data: JSON.stringify(searchResult)
        });
      }
      ok(
        res,
        'Successfully retrieved courses based on the search query',
        searchResult
      );
    }
  );

  /** Moderation: draft → pending → approved|rejected */

  const submitCourse = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const courseId = req.params.courseId;
      await dbRepositoryCourse.editCourse(courseId, {
        status: 'pending',
        rejectionReason: null
      } as any);

      await invalidateCourseCaches(courseId);

      ok(res, 'Course submitted for review', null);
    }
  );

  const moderateCourse = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { courseId } = req.params;
      const { action, reason } = req.body as {
        action: 'approve' | 'reject';
        reason?: string;
      };

      if (!['approve', 'reject'].includes(action)) {
        throw new AppError(
          'Invalid action. Use approve|reject',
          HttpStatusCodes.BAD_REQUEST
        );
      }

      const patch: any = {
        status: action === 'approve' ? 'approved' : 'rejected',
        isVerified: action === 'approve',
        rejectionReason: action === 'reject' ? reason || 'Not specified' : null
      };

      const updated = await dbRepositoryCourse.editCourse(courseId, patch);
      if (!updated)
        throw new AppError('Course not found', HttpStatusCodes.NOT_FOUND);

      await invalidateCourseCaches(courseId);
      ok(res, `Course ${action}d`, null);
    }
  );

  /** ---------------------- Lessons ---------------------- */

  const addLesson = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { courseId } = req.params;
      const instructorId = req.user?.Id;
      const files = (req.files as Record<string, Express.Multer.File[]>) || {};

      // Refactored: Pass the files object directly to the use case.
      // The use case is now responsible for processing `resources` and other uploads.
      await addLessonsU(
        files,
        courseId,
        instructorId,
        req.body,
        dbRepositoryLesson,
        dbRepositoryQuiz
      );

      await invalidateCourseCaches(courseId);

      created(res, 'Successfully added new lesson', null);
    }
  );

  const editLesson = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const lessonId = req.params.lessonId;
      const instructorId = req.user?.Id;
      const files = (req.files as Record<string, Express.Multer.File[]>) || {};
      
      if (!instructorId) {
          throw new AppError('Unauthorized: Instructor ID not found.', HttpStatusCodes.UNAUTHORIZED);
      }

      await editLessonsU(
        files,
        lessonId,
        req.body,
        dbRepositoryLesson,
        dbRepositoryQuiz,
        instructorId
      );
      
      const lesson = await dbRepositoryLesson.getLessonById(lessonId);
      await invalidateCourseCaches(lesson?.courseId?.toString());

      ok(res, 'Successfully updated the lesson', null);
    }
  );

  const deleteLesson = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const lessonId = req.params.lessonId;
      const instructorId = req.user?.Id;

      if (!instructorId) {
        fail(res, 'Unauthorized', 401);
        return;
      }
      if (!lessonId) {
        fail(res, 'Missing lessonId', 400);
        return;
      }

      // Get lesson data first to check ownership and get courseId for cache invalidation
      const lessonData = await getLessonByIdU(lessonId, dbRepositoryLesson);
      if (!lessonData) {
        fail(res, 'Lesson not found', 404);
        return;
      }

      // Check if the instructor owns this lesson
      if (lessonData.instructorId.toString() !== instructorId) {
        fail(res, 'Not authorized to delete this lesson', 403);
        return;
      }

      // Delete the lesson
      await deleteLessonU(lessonId, dbRepositoryLesson, dbRepositoryQuiz);

      // Invalidate course caches
      if (lessonData.courseId) {
        await invalidateCourseCaches(lessonData.courseId.toString());
      }

      ok(res, 'Lesson deleted successfully', null);
    }
  );

  const getLessonsByCourse = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const courseId = req.params.courseId;
      const lessons = await getLessonsByCourseIdU(courseId, dbRepositoryLesson);
      ok(res, 'Successfully retrieved lessons based on the course', lessons);
    }
  );

 const getCourseByInstructor = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const courseId = req.params.courseId;
      const course = await getCourseByInstructorU(courseId, dbRepositoryCourse);
      ok(res, 'Successfully retrieved course based on the instructor', course);
    }
  );

  const getLessonsByCoursePublic = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const courseId = req.params.courseId;
      const userId = req.user?.Id;

      const [course, lessons] = await Promise.all([
        getCourseByIdU(courseId, dbRepositoryCourse),
        getLessonsByCourseIdU(courseId, dbRepositoryLesson)
      ]);

      const isInstructor = !!(
        userId &&
        course &&
        (course as any).instructorId?.toString?.() === String(userId)
      );
      const enrolledList =
        course && Array.isArray((course as any).coursesEnrolled)
          ? (course as any).coursesEnrolled
          : [];
      const isEnrolled = !!(
        userId && enrolledList.map(String).includes(String(userId))
      );

      const data =
        isInstructor || isEnrolled
          ? lessons
          : (lessons || []).filter((l: any) => !!l.isPreview);

      ok(
        res,
        isInstructor || isEnrolled ? 'All lessons' : 'Preview lessons only',
        data
      );
    }
  );

  const getLessonById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const lessonId = req.params.lessonId;
      const lesson = await getLessonByIdU(lessonId, dbRepositoryLesson);
      ok(res, 'Successfully retrieved lessons based on the course', lesson);
    }
  );

  const getQuizzesByLesson = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const lessonId = req.params.lessonId;
      const quizzes = await getQuizzesLessonU(lessonId, dbRepositoryQuiz);
      ok(res, 'Successfully retrieved quizzes based on the lesson', quizzes);
    }
  );

  /** ---------------------- Discussions ---------------------- */

  const addDiscussion = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const lessonId = req.params.lessonId;
      const userId = req.user?.Id;
      const discussion: AddDiscussionInterface = req.body;
      if (!userId) {
          throw new AppError('Unauthorized: User ID not found.', HttpStatusCodes.UNAUTHORIZED);
      }
      await addDiscussionU(
        userId,
        lessonId,
        discussion,
        dbRepositoryDiscussion
      );
      ok(res, 'Successfully posted your comment', null);
    }
  );

  const getDiscussionsByLesson = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const lessonId = req.params.lessonId;
      const discussion = await getDiscussionsByLessonU(
        lessonId,
        dbRepositoryDiscussion
      );
      ok(
        res,
        'Successfully retrieved discussions based on a lesson',
        discussion
      );
    }
  );

  const editDiscussions = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const message: string = req.body.message;
      await editDiscussionU(discussionId, message, dbRepositoryDiscussion);
      ok(res, 'Successfully edited your comment', null);
    }
  );

  const deleteDiscussion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      await deleteDiscussionByIdU(discussionId, dbRepositoryDiscussion);
      ok(res, 'Successfully deleted your comment', null);
    }
  );

  const replyDiscussion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const reply = req.body.reply;
      await replyDiscussionU(discussionId, reply, dbRepositoryDiscussion);
      ok(res, 'Successfully replied to a comment', null);
    }
  );

  const getRepliesByDiscussion = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const discussionId = req.params.discussionId;
      const replies = await getRepliesByDiscussionIdU(
        discussionId,
        dbRepositoryDiscussion
      );
      ok(res, 'Successfully retrieved replies based on discussion', replies);
    }
  );

  const deleteCourse = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { courseId } = req.params;

      const deleted = await dbRepositoryCourse.deleteCourse(courseId);
      if (!deleted) {
        return fail(res, 'Course not found', 404);
      }

      await invalidateCourseCaches(courseId);

      ok(res, 'Course deleted successfully', null);
    }
  );

  return {
    // Courses
    addCourse,
    editCourse,
    getAllCourses,
    getIndividualCourse,
    getCoursesByInstructor,
    enrollStudent,
    getRecommendedCourseByStudentInterest,
    getTrendingCourses,
    getCourseByStudent,
    getCourseByInstructor,
    searchCourse,
    submitCourse,
    moderateCourse,
    deleteCourse,

    // Lessons
    addLesson,
    editLesson,
    deleteLesson,
    getLessonsByCourse,
    getLessonsByCoursePublic,
    getLessonById,
    getQuizzesByLesson,

    // Discussions
    addDiscussion,
    getDiscussionsByLesson,
    editDiscussions,
    deleteDiscussion,
    replyDiscussion,
    getRepliesByDiscussion
  };
};

export default courseController;

