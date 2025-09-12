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

import { AddCourseInfoInterface, EditCourseInfo } from '../../types/courseInterface';
import { AddDiscussionInterface } from '../../types/discussion';
import { PaymentInfo } from '../../types/payment';
import { CustomRequest } from '../../types/customRequest';

import { toStringArray } from '../../app/usecases/course/_helpers';
import HttpStatusCodes from '../../constants/HttpStatusCodes';
import AppError from '../../utils/appError';

// If your app exports RedisClient type
import { RedisClient } from '../../app';

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
  const dbRepositoryDiscussion = discussionDbRepository(discussionDbRepositoryImpl());
  const dbRepositoryPayment = paymentDbRepository(paymentDbRepositoryImpl());
  const dbRepositoryCache = cacheDbRepository(cacheDbRepositoryImpl(cacheClient));

  // Cloud service (S3/Local is picked dynamically by DB config)
  const cloud = cloudServiceInterface(CloudServiceImpl());

  /** ---------------------- Course ---------------------- */

  const addCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const instructorId = req.user?.Id;
    const body: AddCourseInfoInterface = req.body;
    const files = (req.files as Record<string, Express.Multer.File[]>) || {};

    const createdId = await addCourses(instructorId, body, files, dbRepositoryCourse, cloud);

    res.status(201).json({
      status: 'success',
      message: 'Successfully added new course, course will be published after verification',
      data: createdId
    });
  });

  const editCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const courseId = req.params.courseId;
    const instructorId = req.user?.Id;
    const body: EditCourseInfo & { introductionKey?: string } = req.body;
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
    res.status(200).json({ status: 'success', message: 'Successfully updated the course', data: result });
  });

  const getAllCourses = asyncHandler(async (_req: Request, res: Response) => {
    const courses = await getAllCourseU(dbRepositoryCourse);
    await dbRepositoryCache.setCache({ key: 'all-courses', expireTimeSec: 600, data: JSON.stringify(courses) });
    res.status(200).json({ status: 'success', message: 'Successfully retrieved all courses', data: courses });
  });

  const getIndividualCourse = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.params;
    const course = await getCourseByIdU(courseId, dbRepositoryCourse);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved the course', data: course });
  });

  const getCoursesByInstructor = asyncHandler(async (req: CustomRequest, res: Response) => {
    const instructorId = req.user?.Id;
    const courses = await getCourseByInstructorU(instructorId, dbRepositoryCourse);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved your courses', data: courses });
  });

  const enrollStudent = asyncHandler(async (req: CustomRequest, res: Response) => {
    const { courseId } = req.params;
    const { Id: studentId } = req.user || {};
    const paymentInfo: PaymentInfo = req.body;

    await enrollStudentU(courseId ?? '', studentId ?? '', paymentInfo, dbRepositoryCourse, dbRepositoryPayment);
    res.status(200).json({ status: 'success', message: 'Successfully enrolled into the course', data: null });
  });

  const getRecommendedCourseByStudentInterest = asyncHandler(async (req: CustomRequest, res: Response) => {
    const studentId = req.user?.Id ?? '';
    const courses = await getRecommendedCourseByStudentU(studentId, dbRepositoryCourse);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved recommended courses', data: courses });
  });

  const getTrendingCourses = asyncHandler(async (_req: Request, res: Response) => {
    const courses = await getTrendingCourseU(dbRepositoryCourse);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved trending courses', data: courses });
  });

  const getCourseByStudent = asyncHandler(async (req: CustomRequest, res: Response) => {
    const studentId = req.user?.Id;
    const courses = await getCourseByStudentU(studentId, dbRepositoryCourse);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved courses based on students', data: courses });
  });

  const searchCourse = asyncHandler(async (req: Request, res: Response) => {
    const { search = '', filter = '' } = req.query as { search?: string; filter?: string };
    const key = (search?.trim?.() ?? '') === '' ? (search as string) : (filter as string);
    const searchResult = await searchCourseU(search as string, filter as string, dbRepositoryCourse);
    if (searchResult.length) {
      await dbRepositoryCache.setCache({ key: `${key}`, expireTimeSec: 600, data: JSON.stringify(searchResult) });
    }
    res.status(200).json({ status: 'success', message: 'Successfully retrieved courses based on the search query', data: searchResult });
  });

  /** Moderation: draft → pending → approved|rejected */

  const submitCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const courseId = req.params.courseId;
    await dbRepositoryCourse.editCourse(courseId, { status: 'pending', rejectionReason: null } as any);
    res.status(200).json({ status: 'success', message: 'Course submitted for review', data: null });
  });

  const moderateCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const courseId = req.params.courseId;
    const { action, reason } = req.body as { action: 'approve' | 'reject'; reason?: string };

    if (action !== 'approve' && action !== 'reject') {
      throw new AppError('Invalid action. Use approve|reject', HttpStatusCodes.BAD_REQUEST);
    }
    const patch: any = { status: action === 'approve' ? 'approved' : 'rejected' };
    if (action === 'reject') patch.rejectionReason = reason || 'Not specified';

    await dbRepositoryCourse.editCourse(courseId, patch);
    res.status(200).json({ status: 'success', message: `Course ${action}d`, data: null });
  });

  /** ---------------------- Lessons ---------------------- */

  const addLesson = asyncHandler(async (req: CustomRequest, res: Response) => {
    const courseId = req.params.courseId;
    const instructorId = req.user?.Id;

    if (!instructorId) { res.status(401).json({ status: 'fail', message: 'Unauthorized' }); return; }
    if (!courseId) { res.status(400).json({ status: 'fail', message: 'Missing courseId' }); return; }

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
    res.status(201).json({ status: 'success', message: 'Successfully added new lesson', data: null });
  });

  const editLesson = asyncHandler(async (req: CustomRequest, res: Response) => {
    const lessonId = req.params.lessonId;
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
    res.status(200).json({ status: 'success', message: 'Successfully updated the lesson', data: null });
  });

  const getLessonsByCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.courseId;
    const lessons = await getLessonsByCourseIdU(courseId, dbRepositoryLesson);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved lessons based on the course', data: lessons });
  });

  const getLessonsByCoursePublic = asyncHandler(async (req: CustomRequest, res: Response) => {
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

    res.status(200).json({
      status: 'success',
      message: isInstructor || isEnrolled ? 'All lessons' : 'Preview lessons only',
      data
    });
  });

  const getLessonById = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const lesson = await getLessonByIdU(lessonId, dbRepositoryLesson);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved lessons based on the course', data: lesson });
  });

  const getQuizzesByLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const quizzes = await getQuizzesLessonU(lessonId, dbRepositoryQuiz);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved quizzes based on the lesson', data: quizzes });
  });

  /** ---------------------- Discussions ---------------------- */

  const addDiscussion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const lessonId = req.params.lessonId;
    const userId = req.user?.Id;
    const discussion: AddDiscussionInterface = req.body;

    await addDiscussionU(userId, lessonId, discussion, dbRepositoryDiscussion);
    res.status(200).json({ status: 'success', message: 'Successfully posted your comment', data: null });
  });

  const getDiscussionsByLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const discussion = await getDiscussionsByLessonU(lessonId, dbRepositoryDiscussion);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved discussions based on a lesson', data: discussion });
  });

  const editDiscussions = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = req.params.discussionId;
    const message: string = req.body.message;
    await editDiscussionU(discussionId, message, dbRepositoryDiscussion);
    res.status(200).json({ status: 'success', message: 'Successfully edited your comment', data: null });
  });

  const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = req.params.discussionId;
    await deleteDiscussionByIdU(discussionId, dbRepositoryDiscussion);
    res.status(200).json({ status: 'success', message: 'Successfully deleted your comment', data: null });
  });

  const replyDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = req.params.discussionId;
    const reply = req.body.reply;
    await replyDiscussionU(discussionId, reply, dbRepositoryDiscussion);
    res.status(200).json({ status: 'success', message: 'Successfully replied to a comment', data: null });
  });

  const getRepliesByDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId = req.params.discussionId;
    const replies = await getRepliesByDiscussionIdU(discussionId, dbRepositoryDiscussion);
    res.status(200).json({ status: 'success', message: 'Successfully retrieved replies based on discussion', data: replies });
  });

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
    searchCourse,
    submitCourse,
    moderateCourse,

    // Lessons
    addLesson,
    editLesson,
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
