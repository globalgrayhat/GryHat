<<<<<<< HEAD
// server/src/adapters/controllers/courseController.ts

import { ok, created, fail } from '../../shared/http/respond';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

import { CourseRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/courseReposMongoDb';
import { CourseDbRepositoryInterface } from '../../app/repositories/courseDbRepository';

import { addCourses } from '../../app/usecases/course/addCourse';
import { editCourseU } from '../../app/usecases/course/editCourse';
import { getAllCourseU, getCourseByIdU, getCourseByStudentU } from '../../app/usecases/course/listCourse';
import { getCourseByInstructorU } from '../../app/usecases/course/viewCourse';
import { enrollStudentU } from '../../app/usecases/course/enroll';
import { getRecommendedCourseByStudentU, getTrendingCourseU } from '../../app/usecases/course/recommendation';
import { searchCourseU } from '../../app/usecases/course/search';

import { addLessonsU } from '../../app/usecases/lessons/addLesson';
import { editLessonsU } from '../../app/usecases/lessons/editLesson';
import { getLessonsByCourseIdU } from '../../app/usecases/lessons/viewLessons';
import { getLessonByIdU } from '../../app/usecases/lessons/getLesson';

import { getQuizzesLessonU } from '../../app/usecases/quiz/getQuiz';

=======
import { Request, Response, NextFunction } from 'express';
import asyncHandler from 'express-async-handler';
import { CourseRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/courseReposMongoDb';
import { CourseDbRepositoryInterface } from '../../app/repositories/courseDbRepository';
import { addCourses } from '../../app/usecases/course/addCourse';
import {
  AddCourseInfoInterface,
  EditCourseInfo
} from '../../types/courseInterface';
import { CustomRequest } from '../../types/customRequest';
import {
  getAllCourseU,
  getCourseByIdU,
  getCourseByStudentU
} from '../../app/usecases/course/listCourse';
import { getCourseByInstructorU } from '../../app/usecases/course/viewCourse';
import { addLessonsU } from '../../app/usecases/lessons/addLesson';
import { getLessonsByCourseIdU } from '../../app/usecases/lessons/viewLessons';
import { CloudServiceInterface } from '../../app/services/cloudServiceInterface';
// Import from the service index to enable configurable storage providers.
import { CloudServiceImpl } from '../../frameworks/services';
import { getQuizzesLessonU } from '../../app/usecases/quiz/getQuiz';
import { getLessonByIdU } from '../../app/usecases/lessons/getLesson';
import { QuizDbInterface } from '../../app/repositories/quizDbRepository';
import { QuizRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/quizzDbRepository';
import { LessonDbRepositoryInterface } from '../../app/repositories/lessonDbRepository';
import { LessonRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/lessonRepoMongodb';
import { AddDiscussionInterface } from '../../types/discussion';
import { DiscussionRepoMongodbInterface } from '../../frameworks/database/mongodb/repositories/discussionsRepoMongodb';
import { DiscussionDbInterface } from '../../app/repositories/discussionDbRepository';
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
import {
  addDiscussionU,
  getDiscussionsByLessonU,
  editDiscussionU,
  deleteDiscussionByIdU,
  replyDiscussionU,
  getRepliesByDiscussionIdU
} from '../../app/usecases/lessons/discussions';
<<<<<<< HEAD

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

import { AddCourseInfoInterface, EditCourseInfo } from '../../types/courseInterface';
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
 * Adds cache invalidation to ensure UI sees updates immediately after mutations.
 */
const courseController = (
=======
import { enrollStudentU } from '../../app/usecases/course/enroll';
import { PaymentInfo } from '../../types/payment';
import { PaymentInterface } from '../../app/repositories/paymentDbRepository';
import { PaymentImplInterface } from '../../frameworks/database/mongodb/repositories/paymentRepoMongodb';
import {
  getRecommendedCourseByStudentU,
  getTrendingCourseU
} from '../../app/usecases/course/recommendation';
import { editCourseU } from '../../app/usecases/course/editCourse';
import { editLessonsU } from '../../app/usecases/lessons/editLesson';
import { searchCourseU } from '../../app/usecases/course/search';
import { CacheRepositoryInterface } from '@src/app/repositories/cachedRepoInterface';
import { RedisRepositoryImpl } from '@src/frameworks/database/redis/redisCacheRepository';
import { RedisClient } from '@src/app';
import { localStorageService } from '../../frameworks/services/localStorageService';

const courseController = (
  cloudServiceInterface: CloudServiceInterface,
  cloudServiceImpl: CloudServiceImpl,
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
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
<<<<<<< HEAD
  // Wire repositories
  const dbRepositoryCourse = courseDbRepository(courseDbRepositoryImpl());
  const dbRepositoryQuiz = quizDbRepository(quizDbRepositoryImpl());
  const dbRepositoryLesson = lessonDbRepository(lessonDbRepositoryImpl());
  const dbRepositoryDiscussion = discussionDbRepository(discussionDbRepositoryImpl());
  const dbRepositoryPayment = paymentDbRepository(paymentDbRepositoryImpl());
  const dbRepositoryCache = cacheDbRepository(cacheDbRepositoryImpl(cacheClient));

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
      await cacheDel(`course:${courseId}`);      // optional convention
      await cacheDel(`lessons:${courseId}`);     // optional convention
      await cacheDel(`search:${courseId}`);      // optional convention
    }
  };

  /** ---------------------- Course ---------------------- */

  const addCourse = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.user?.Id;
    const body: AddCourseInfoInterface = req.body;
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};

    const createdId = await addCourses(instructorId, body, files, dbRepositoryCourse, cloud);

    // Invalidate immediately so lists reflect the new draft right away
    await invalidateCourseCaches(String(createdId));

    created(res, 'Successfully added new course, course will be published after verification', createdId);
  });

  const editCourse = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const courseId = req.params.courseId;
    const instructorId = req.user?.Id;
    const body: (EditCourseInfo & { introductionKey?: string }) = req.body;
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};

    // Attach uploads (thumbnail/guidelines/introduction) if present
    if (files.thumbnail?.length) {
      const up = await cloud.uploadAndGetUrl(files.thumbnail[0]);
      body.thumbnail = { name: files.thumbnail[0].originalname, url: up.url, key: up.key };
    }
    if (files.guidelines?.length) {
      const up = await cloud.uploadAndGetUrl(files.guidelines[0]);
      body.guidelines = { name: files.guidelines[0].originalname, url: up.url, key: up.key };
    }
    if (files.introduction?.length) {
      const up = await cloud.uploadAndGetUrl(files.introduction[0]);
      body.introduction = { name: files.introduction[0].originalname, url: up.url, key: up.key };
      delete (body as any).introductionKey;
    } else if (body.introductionKey) {
      (body as any).introduction = { name: 'introduction', url: body.introductionKey, key: body.introductionKey };
      delete (body as any).introductionKey;
    }

    const result = await editCourseU(courseId, instructorId, files, body, dbRepositoryCourse);

    // Keep cache hot & consistent
    await invalidateCourseCaches(courseId);

    ok(res, 'Successfully updated the course', result);
  });

  const getAllCourses = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    // Always read DB then refresh cache—keeps data fresh when upstream mutated
    const courses = await getAllCourseU(dbRepositoryCourse);
    await dbRepositoryCache.setCache({ key: 'all-courses', expireTimeSec: 600, data: JSON.stringify(courses) });
    ok(res, 'Successfully retrieved all courses', courses);
  });

  const getIndividualCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const course = await getCourseByIdU(courseId, dbRepositoryCourse);
    ok(res, 'Successfully retrieved the course', course);
  });

  const getCoursesByInstructor = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const instructorId = req.user?.Id;
    const courses = await getCourseByInstructorU(instructorId, dbRepositoryCourse);
    ok(res, 'Successfully retrieved your courses', courses);
  });

  const enrollStudent = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const { Id: studentId } = req.user || {};
    const paymentInfo: PaymentInfo = req.body;

    await enrollStudentU(courseId ?? '', studentId ?? '', paymentInfo, dbRepositoryCourse, dbRepositoryPayment);

    // Enrollment can affect "trending" or UI counts → refresh list cache
    await invalidateCourseCaches(courseId);

    ok(res, 'Successfully enrolled into the course', null);
  });

  const getRecommendedCourseByStudentInterest = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const studentId = req.user?.Id ?? '';
    const courses = await getRecommendedCourseByStudentU(studentId, dbRepositoryCourse);
    ok(res, 'Successfully retrieved recommended courses', courses);
  });

  const getTrendingCourses = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const courses = await getTrendingCourseU(dbRepositoryCourse);
    ok(res, 'Successfully retrieved trending courses', courses);
  });

  const getCourseByStudent = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const studentId = req.user?.Id;
    const courses = await getCourseByStudentU(studentId, dbRepositoryCourse);
    ok(res, 'Successfully retrieved courses based on students', courses);
  });

  const searchCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { search = '', filter = '' } = req.query as { search?: string; filter?: string };
    const key = (search?.trim?.() ?? '') === '' ? (search as string) : (filter as string);
    const searchResult = await searchCourseU(search as string, filter as string, dbRepositoryCourse);
    if (searchResult.length) {
      await dbRepositoryCache.setCache({ key: `${key}`, expireTimeSec: 600, data: JSON.stringify(searchResult) });
    }
    ok(res, 'Successfully retrieved courses based on the search query', searchResult);
  });

  /** Moderation: draft → pending → approved|rejected */

  const submitCourse = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const courseId = req.params.courseId;
    await dbRepositoryCourse.editCourse(courseId, { status: 'pending', rejectionReason: null } as any);

    await invalidateCourseCaches(courseId);

    ok(res, 'Course submitted for review', null);
  });

  const moderateCourse = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const { courseId } = req.params;
    const { action, reason } = req.body as { action: 'approve' | 'reject'; reason?: string };
  
    if (!['approve', 'reject'].includes(action)) {
      throw new AppError('Invalid action. Use approve|reject', HttpStatusCodes.BAD_REQUEST);
    }
  
    const patch: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      isVerified: action === 'approve',
      rejectionReason: action === 'reject' ? reason || 'Not specified' : null,
    };
  
    const updated = await dbRepositoryCourse.editCourse(courseId, patch);
    if (!updated) throw new AppError('Course not found', HttpStatusCodes.NOT_FOUND);
  
    await invalidateCourseCaches(courseId);
    ok(res, `Course ${action}d`, null);
  });
  

  /** ---------------------- Lessons ---------------------- */

  const addLesson = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const courseId = req.params.courseId;
    const instructorId = req.user?.Id;

    if (!instructorId) { fail(res, 'Unauthorized', 401); return; }
    if (!courseId) { fail(res, 'Missing courseId', 400); return; }

    const body = req.body as any;

    // parse questions if sent as JSON string (multipart)
    if (typeof body.questions === 'string') {
      try { body.questions = JSON.parse(body.questions); } catch { body.questions = []; }
    }
    if (!Array.isArray(body.questions)) body.questions = [];

    // Handle resource files (pdf/zip/etc.)
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};
    const resourceFiles: Express.Multer.File[] = Array.isArray((req as any).files)
      ? ((req as any).files as Express.Multer.File[])
      : (files.resources || []);
    const uploaded = await Promise.all(resourceFiles.map(async (f) => await cloud.uploadAndGetUrl(f)));
    const resources = uploaded.map(u => ({ name: u.name || 'resource', url: u.url, key: u.key }));

    const lesson = {
      title: body.title,
      description: body.description,
      contents: Array.isArray(body.contents) ? body.contents : toStringArray(body.contents),
      duration: Number(body.duration || 0),
      about: body.about,

      isPreview: String(body.isPreview ?? 'false').toLowerCase() === 'true',

      // video controls (ONE of URL or TUS)
      videoSource: body.videoSource,         // 'youtube' | 'vimeo' | 'local' | 's3' | 'tus'
      videoUrl: body.videoUrl,
      videoFile: body.videoFile,            // single TUS id
      videoTusKeys: toStringArray(body.videoTusKeys),

      primaryVideoKey: toStringArray(body.videoTusKeys)[0] || undefined,

      media: [],            // will be filled by usecase for compat
      resources,            // uploaded above
      questions: body.questions,

      courseId,
      instructorId
    };

    await addLessonsU([], courseId, instructorId, lesson, dbRepositoryLesson, dbRepositoryQuiz);

    // Lessons listing might be cached by course
    await invalidateCourseCaches(courseId);

    created(res, 'Successfully added new lesson', null);
  });

  const editLesson = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const lessonId = req.params.lessonId;
    const courseId = req.params.courseId; // if present in route params
    const body = req.body as any;

    if (typeof body.questions === 'string') {
      try { body.questions = JSON.parse(body.questions); } catch { body.questions = []; }
    }

    const patch: any = { ...body };

    if (typeof body.isPreview !== 'undefined') {
      patch.isPreview = String(body.isPreview).toLowerCase() === 'true';
    }
    if (typeof body.videoTusKeys !== 'undefined') {
      const keys = toStringArray(body.videoTusKeys);
      patch.videoTusKeys = keys;
      if (keys.length) patch.primaryVideoKey = keys[0];
    }

    // Replace resources if new files uploaded
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};
    const resourceFiles: Express.Multer.File[] = Array.isArray((req as any).files)
      ? ((req as any).files as Express.Multer.File[])
      : (files.resources || []);
    if (resourceFiles.length) {
      const uploaded = await Promise.all(resourceFiles.map(async (f) => await cloud.uploadAndGetUrl(f)));
      patch.resources = uploaded.map(u => ({ name: u.name || 'resource', url: u.url, key: u.key }));
    }

    await editLessonsU([], lessonId, patch, dbRepositoryLesson, dbRepositoryQuiz);

    // Reflect lesson changes immediately
    await invalidateCourseCaches(courseId);

    ok(res, 'Successfully updated the lesson', null);
  });

  const getLessonsByCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const courseId = req.params.courseId;
    const lessons = await getLessonsByCourseIdU(courseId, dbRepositoryLesson);
    ok(res, 'Successfully retrieved lessons based on the course', lessons);
  });

  const getLessonsByCoursePublic = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const courseId = req.params.courseId;
    const userId = req.user?.Id;

    const [course, lessons] = await Promise.all([
      getCourseByIdU(courseId, dbRepositoryCourse),
      getLessonsByCourseIdU(courseId, dbRepositoryLesson)
    ]);

    const isInstructor = !!(userId && course && (course as any).instructorId?.toString?.() === String(userId));
    const enrolledList = (course && Array.isArray((course as any).coursesEnrolled)) ? (course as any).coursesEnrolled : [];
    const isEnrolled = !!(userId && enrolledList.map(String).includes(String(userId)));

    const data = (isInstructor || isEnrolled) ? lessons : (lessons || []).filter((l: any) => !!l.isPreview);

    ok(res, isInstructor || isEnrolled ? 'All lessons' : 'Preview lessons only', data);
  });

  const getLessonById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const lessonId = req.params.lessonId;
    const lesson = await getLessonByIdU(lessonId, dbRepositoryLesson);
    ok(res, 'Successfully retrieved lessons based on the course', lesson);
  });

  const getQuizzesByLesson = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const lessonId = req.params.lessonId;
    const quizzes = await getQuizzesLessonU(lessonId, dbRepositoryQuiz);
    ok(res, 'Successfully retrieved quizzes based on the lesson', quizzes);
  });

  /** ---------------------- Discussions ---------------------- */

  const addDiscussion = asyncHandler(async (req: CustomRequest, res: Response): Promise<void> => {
    const lessonId = req.params.lessonId;
    const userId = req.user?.Id;
    const discussion: AddDiscussionInterface = req.body;

    await addDiscussionU(userId, lessonId, discussion, dbRepositoryDiscussion);
    ok(res, 'Successfully posted your comment', null);
  });

  const getDiscussionsByLesson = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const lessonId = req.params.lessonId;
    const discussion = await getDiscussionsByLessonU(lessonId, dbRepositoryDiscussion);
    ok(res, 'Successfully retrieved discussions based on a lesson', discussion);
  });

  const editDiscussions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const discussionId = req.params.discussionId;
    const message: string = req.body.message;
    await editDiscussionU(discussionId, message, dbRepositoryDiscussion);
    ok(res, 'Successfully edited your comment', null);
  });

  const deleteDiscussion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const discussionId = req.params.discussionId;
    await deleteDiscussionByIdU(discussionId, dbRepositoryDiscussion);
    ok(res, 'Successfully deleted your comment', null);
  });

  const replyDiscussion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const discussionId = req.params.discussionId;
    const reply = req.body.reply;
    await replyDiscussionU(discussionId, reply, dbRepositoryDiscussion);
    ok(res, 'Successfully replied to a comment', null);
  });

  const getRepliesByDiscussion = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const discussionId = req.params.discussionId;
    const replies = await getRepliesByDiscussionIdU(discussionId, dbRepositoryDiscussion);
    ok(res, 'Successfully retrieved replies based on discussion', replies);
  });

  const deleteCourse = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.params;

    const deleted = await dbRepositoryCourse.deleteCourse(courseId);
    if (!deleted) {
      return fail(res, 'Course not found', 404);
    }

    await invalidateCourseCaches(courseId);

    ok(res, 'Course deleted successfully', null);
  });

  return {
    // Courses
=======
  const dbRepositoryCourse = courseDbRepository(courseDbRepositoryImpl());
  const cloudService = cloudServiceInterface(cloudServiceImpl());
  const dbRepositoryQuiz = quizDbRepository(quizDbRepositoryImpl());
  const dbRepositoryLesson = lessonDbRepository(lessonDbRepositoryImpl());
  const dbRepositoryDiscussion = discussionDbRepository(
    discussionDbRepositoryImpl()
  );
  const dbRepositoryPayment = paymentDbRepository(paymentDbRepositoryImpl());
  const dbRepositoryCache = cacheDbRepository(
    cacheDbRepositoryImpl(cacheClient)
  );

  const addCourse = asyncHandler(
    async (req: CustomRequest, res: Response, next: NextFunction) => {
      const course: AddCourseInfoInterface = req.body;
      const files: Express.Multer.File[] = req.files as Express.Multer.File[];
      const instructorId = req.user?.Id;

      const localService = localStorageService();
      const remainingFiles: Express.Multer.File[] = [];
      await Promise.all(
        files.map(async (file) => {
          if (file.mimetype.includes('image')) {
            // Upload thumbnail image locally and attach to courseInfo
            const uploaded = await localService.uploadAndGetUrl(file);
            course.thumbnail = uploaded;
          } else {
            remainingFiles.push(file);
          }
        })
      );
      const response = await addCourses(
        instructorId,
        course,
        remainingFiles,
        dbRepositoryCourse
      );
      res.status(201).json({
        status: 'success',
        message:
          'Successfully added new course, course will be published after verification',
        data: response
      });
    }
  );

  const editCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const course: EditCourseInfo = req.body;
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    const instructorId = req.user?.Id;
    const courseId: string = req.params.courseId;
    // Separate image files from others and store images locally
    const remainingFiles: Express.Multer.File[] = [];
    const localService = localStorageService();
    await Promise.all(
      (files || []).map(async (file) => {
        if (file.mimetype.includes('image')) {
          // Upload updated thumbnail locally
          const uploaded = await localService.uploadAndGetUrl(file);
          course.thumbnail = uploaded;
        } else {
          remainingFiles.push(file);
        }
      })
    );
    const response = await editCourseU(
      courseId,
      instructorId,
      remainingFiles,
      course,
      dbRepositoryCourse
    );
    res.status(200).json({
      status: 'success',
      message: 'Successfully updated the course',
      data: response
    });
  });

  const getAllCourses = asyncHandler(async (req: Request, res: Response) => {
    const courses = await getAllCourseU(dbRepositoryCourse);
    const cacheOptions = {
      key: `all-courses`,
      expireTimeSec: 600,
      data: JSON.stringify(courses)
    };
    await dbRepositoryCache.setCache(cacheOptions);
    res.status(200).json({
      status: 'success',
      message: 'Successfully retrieved all courses',
      data: courses
    });
  });

  const getIndividualCourse = asyncHandler(
    async (req: Request, res: Response) => {
      const courseId: string = req.params.courseId;
      const course = await getCourseByIdU(courseId, dbRepositoryCourse);
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved the course',
        data: course
      });
    }
  );

  const getCoursesByInstructor = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const instructorId = req.user?.Id;
      const courses = await getCourseByInstructorU(
        instructorId,
        dbRepositoryCourse
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved your courses',
        data: courses
      });
    }
  );

  const addLesson = asyncHandler(async (req: CustomRequest, res: Response) => {
    const instructorId = req.user?.Id;
    const courseId = req.params.courseId;
    const lesson = req.body;
    const medias = req.files as Express.Multer.File[];
    const questions = JSON.parse(lesson.questions);
    lesson.questions = questions;
    // Split media files into videos and attachments. Videos are uploaded using
    // the configured cloud service, while attachments (documents, archives,
    // images) are stored locally. This ensures resumable uploads can be
    // implemented for local files via TUS in the future.
    const localService = localStorageService();
    const videos: Express.Multer.File[] = [];
    const attachments: Express.Multer.File[] = [];
    (medias || []).forEach((file) => {
      if (file.mimetype.startsWith('video/')) {
        videos.push(file);
      } else {
        attachments.push(file);
      }
    });
    // Upload attachments locally and assign to lesson.media.
    const uploadedAttachments = await Promise.all(
      attachments.map(async (file) => await localService.uploadAndGetUrl(file))
    );
    // Map uploaded attachments to only name and key properties as expected by
    // the lesson schema. url is preserved if present.
    lesson.media = uploadedAttachments.map((att) => {
      return { name: att.name, key: att.key, url: att.url };
    });
    await addLessonsU(
      videos,
      courseId,
      instructorId,
      lesson,
      dbRepositoryLesson,
      dbRepositoryQuiz
    );
    res.status(200).json({
      status: 'success',
      message: 'Successfully added new lesson',
      data: null
    });
  });

  const editLesson = asyncHandler(async (req: CustomRequest, res: Response) => {
    const lesson = req.body;
    const lessonId = req.params.lessonId;
    const medias = req.files as Express.Multer.File[];
    const questions = JSON.parse(lesson.questions);
    lesson.questions = questions;
    await editLessonsU(
      medias,
      lessonId,
      lesson,
      dbRepositoryLesson,
      dbRepositoryQuiz
    );
    res.status(200).json({
      status: 'success',
      message: 'Successfully updated the lesson',
      data: null
    });
  });

  const getLessonsByCourse = asyncHandler(
    async (req: Request, res: Response) => {
      const courseId = req.params.courseId;
      const lessons = await getLessonsByCourseIdU(courseId, dbRepositoryLesson);
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved lessons based on the course',
        data: lessons
      });
    }
  );

  const getLessonById = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const lesson = await getLessonByIdU(lessonId, dbRepositoryLesson);
    res.status(200).json({
      status: 'success',
      message: 'Successfully retrieved lessons based on the course',
      data: lesson
    });
  });

  const getQuizzesByLesson = asyncHandler(
    async (req: Request, res: Response) => {
      const lessonId = req.params.lessonId;
      const quizzes = await getQuizzesLessonU(lessonId, dbRepositoryQuiz);
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved quizzes based on the lesson',
        data: quizzes
      });
    }
  );

  const addDiscussion = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const lessonId: string = req.params.lessonId;
      const userId = req.user?.Id;
      const discussion: AddDiscussionInterface = req.body;
      await addDiscussionU(
        userId,
        lessonId,
        discussion,
        dbRepositoryDiscussion
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully posted your comment',
        data: null
      });
    }
  );

  const getDiscussionsByLesson = asyncHandler(
    async (req: Request, res: Response) => {
      const lessonId: string = req.params.lessonId;
      const discussion = await getDiscussionsByLessonU(
        lessonId,
        dbRepositoryDiscussion
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved discussions based on a lesson',
        data: discussion
      });
    }
  );

  const editDiscussions = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;
    const message: string = req.body.message;
    await editDiscussionU(discussionId, message, dbRepositoryDiscussion);
    res.status(200).json({
      status: 'success',
      message: 'Successfully edited your comment',
      data: null
    });
  });

  const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;
    await deleteDiscussionByIdU(discussionId, dbRepositoryDiscussion);
    res.status(200).json({
      status: 'success',
      message: 'Successfully deleted your comment',
      data: null
    });
  });

  const replyDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;
    const reply = req.body.reply;
    await replyDiscussionU(discussionId, reply, dbRepositoryDiscussion);
    res.status(200).json({
      status: 'success',
      message: 'Successfully replied to a comment',
      data: null
    });
  });

  const getRepliesByDiscussion = asyncHandler(
    async (req: Request, res: Response) => {
      const discussionId: string = req.params.discussionId;
      const replies = await getRepliesByDiscussionIdU(
        discussionId,
        dbRepositoryDiscussion
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved replies based on discussion',
        data: replies
      });
    }
  );

  const enrollStudent = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const paymentInfo: PaymentInfo = req.body;
      const { courseId }: { courseId?: string } = req.params;
      const { Id }: { Id?: string } = req.user || {};
      const courseIdValue: string = courseId ?? '';
      const studentId: string = Id ?? '';

      await enrollStudentU(
        courseIdValue,
        studentId,
        paymentInfo,
        dbRepositoryCourse,
        dbRepositoryPayment
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully enrolled into the course',
        data: null
      });
    }
  );

  const getRecommendedCourseByStudentInterest = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const studentId: string = req.user?.Id ?? '';
      const courses = await getRecommendedCourseByStudentU(
        studentId,
        dbRepositoryCourse
      );
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved recommended courses',
        data: courses
      });
    }
  );

  const getTrendingCourses = asyncHandler(
    async (req: Request, res: Response) => {
      const courses = await getTrendingCourseU(dbRepositoryCourse);
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved trending courses',
        data: courses
      });
    }
  );

  const getCourseByStudent = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const studentId: string | undefined = req.user?.Id;
      const courses = await getCourseByStudentU(studentId, dbRepositoryCourse);
      res.status(200).json({
        status: 'success',
        message: 'Successfully retrieved courses based on students',
        data: courses
      });
    }
  );

  const searchCourse = asyncHandler(async (req: Request, res: Response) => {
    const { search, filter } = req.query as { search: string; filter: string };
    const key = search.trim() === '' ? search : filter;
    const searchResult = await searchCourseU(
      search,
      filter,
      dbRepositoryCourse
    );
    if (searchResult.length) {
      const cacheOptions = {
        key: `${key}`,
        expireTimeSec: 600,
        data: JSON.stringify(searchResult)
      };
      await dbRepositoryCache.setCache(cacheOptions);
    }
    res.status(200).json({
      status: 'success',
      message: 'Successfully retrieved courses based on the search query',
      data: searchResult
    });
  });

  return {
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    addCourse,
    editCourse,
    getAllCourses,
    getIndividualCourse,
    getCoursesByInstructor,
<<<<<<< HEAD
    enrollStudent,
    getRecommendedCourseByStudentInterest,
    getTrendingCourses,
    getCourseByStudent,
    searchCourse,
    submitCourse,
    moderateCourse,
    deleteCourse,

    // Lessons
    addLesson,
    editLesson,
    getLessonsByCourse,
    getLessonsByCoursePublic,
    getLessonById,
    getQuizzesByLesson,

    // Discussions
=======
    addLesson,
    editLesson,
    getLessonsByCourse,
    getLessonById,
    getQuizzesByLesson,
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    addDiscussion,
    getDiscussionsByLesson,
    editDiscussions,
    deleteDiscussion,
    replyDiscussion,
    getRepliesByDiscussion,
<<<<<<< HEAD
=======
    enrollStudent,
    getRecommendedCourseByStudentInterest,
    getTrendingCourses,
    getCourseByStudent,
    searchCourse
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  };
};

export default courseController;
