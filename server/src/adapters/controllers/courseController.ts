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
import {
  addDiscussionU,
  getDiscussionsByLessonU,
  editDiscussionU,
  deleteDiscussionByIdU,
  replyDiscussionU,
  getRepliesByDiscussionIdU
} from '../../app/usecases/lessons/discussions';
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

const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null
) => {
  res.status(statusCode).json({
    status: statusCode >= 400 ? 'fail' : 'success',
    message,
    data
  });
};

const uploadImagesLocally = async (files: Express.Multer.File[], course: any) => {
  const localService = localStorageService();
  const remainingFiles: Express.Multer.File[] = [];

  await Promise.all(
    files.map(async (file) => {
      if (file.mimetype.includes('image')) {
        const uploaded = await localService.uploadAndGetUrl(file);
        course.thumbnail = uploaded;
      } else {
        remainingFiles.push(file);
      }
    })
  );

  return remainingFiles;
};

const splitMediaFiles = (
  files: Express.Multer.File[]
): { videos: Express.Multer.File[]; attachments: Express.Multer.File[] } => {
  const videos: Express.Multer.File[] = [];
  const attachments: Express.Multer.File[] = [];

  files.forEach((file) => {
    if (file.mimetype.startsWith('video/')) {
      videos.push(file);
    } else {
      attachments.push(file);
    }
  });

  return { videos, attachments };
};

const courseController = (
  cloudServiceInterface: CloudServiceInterface,
  cloudServiceImpl: CloudServiceImpl,
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

  const addCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const course: AddCourseInfoInterface = req.body;
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    const instructorId = req.user?.Id;

    const remainingFiles = await uploadImagesLocally(files, course);

    const response = await addCourses(
      instructorId,
      course,
      remainingFiles,
      dbRepositoryCourse
    );

    sendResponse(
      res,
      201,
      'Successfully added new course, course will be published after verification',
      response
    );
  });

  const editCourse = asyncHandler(async (req: CustomRequest, res: Response) => {
    const course: EditCourseInfo = req.body;
    const files: Express.Multer.File[] = req.files as Express.Multer.File[];
    const instructorId = req.user?.Id;
    const courseId: string = req.params.courseId;

    const remainingFiles = await uploadImagesLocally(files || [], course);

    const response = await editCourseU(
      courseId,
      instructorId,
      remainingFiles,
      course,
      dbRepositoryCourse
    );

    sendResponse(res, 200, 'Successfully updated the course', response);
  });

  const getAllCourses = asyncHandler(async (_req: Request, res: Response) => {
    const courses = await getAllCourseU(dbRepositoryCourse);
    await dbRepositoryCache.setCache({
      key: `all-courses`,
      expireTimeSec: 600,
      data: JSON.stringify(courses)
    });
    sendResponse(res, 200, 'Successfully retrieved all courses', courses);
  });

  const getIndividualCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseId: string = req.params.courseId;
    const course = await getCourseByIdU(courseId, dbRepositoryCourse);
    sendResponse(res, 200, 'Successfully retrieved the course', course);
  });

  const getCoursesByInstructor = asyncHandler(
    async (req: CustomRequest, res: Response) => {
      const instructorId = req.user?.Id;
      const courses = await getCourseByInstructorU(instructorId, dbRepositoryCourse);
      sendResponse(res, 200, 'Successfully retrieved your courses', courses);
    }
  );

  const addLesson = asyncHandler(async (req: CustomRequest, res: Response) => {
    const instructorId = req.user?.Id;
    const courseId = req.params.courseId;
    const lesson = req.body;
    lesson.questions = JSON.parse(lesson.questions);

    const medias = req.files as Express.Multer.File[];
    const { videos, attachments } = splitMediaFiles(medias || []);

    const localService = localStorageService();
    const uploadedAttachments = await Promise.all(
      attachments.map(async (file) => await localService.uploadAndGetUrl(file))
    );

    lesson.media = uploadedAttachments.map((att) => ({
      name: att.name,
      key: att.key,
      url: att.url
    }));

    await addLessonsU(
      videos,
      courseId,
      instructorId,
      lesson,
      dbRepositoryLesson,
      dbRepositoryQuiz
    );

    sendResponse(res, 200, 'Successfully added new lesson');
  });

  const editLesson = asyncHandler(async (req: CustomRequest, res: Response) => {
    const lesson = req.body;
    const lessonId = req.params.lessonId;
    lesson.questions = JSON.parse(lesson.questions);
    const medias = req.files as Express.Multer.File[];

    await editLessonsU(medias, lessonId, lesson, dbRepositoryLesson, dbRepositoryQuiz);

    sendResponse(res, 200, 'Successfully updated the lesson');
  });

  const getLessonsByCourse = asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.params.courseId;
    const lessons = await getLessonsByCourseIdU(courseId, dbRepositoryLesson);
    sendResponse(res, 200, 'Successfully retrieved lessons based on the course', lessons);
  });

  const getLessonById = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const lesson = await getLessonByIdU(lessonId, dbRepositoryLesson);
    sendResponse(res, 200, 'Successfully retrieved lesson', lesson);
  });

  const getQuizzesByLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.params.lessonId;
    const quizzes = await getQuizzesLessonU(lessonId, dbRepositoryQuiz);
    sendResponse(res, 200, 'Successfully retrieved quizzes based on the lesson', quizzes);
  });

  const addDiscussion = asyncHandler(async (req: CustomRequest, res: Response) => {
    const lessonId: string = req.params.lessonId;
    const userId = req.user?.Id;
    const discussion: AddDiscussionInterface = req.body;

    await addDiscussionU(userId, lessonId, discussion, dbRepositoryDiscussion);
    sendResponse(res, 200, 'Successfully posted your comment');
  });

  const getDiscussionsByLesson = asyncHandler(async (req: Request, res: Response) => {
    const lessonId: string = req.params.lessonId;
    const discussion = await getDiscussionsByLessonU(lessonId, dbRepositoryDiscussion);
    sendResponse(res, 200, 'Successfully retrieved discussions based on a lesson', discussion);
  });

  const editDiscussions = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;
    const message: string = req.body.message;

    await editDiscussionU(discussionId, message, dbRepositoryDiscussion);
    sendResponse(res, 200, 'Successfully edited your comment');
  });

  const deleteDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;

    await deleteDiscussionByIdU(discussionId, dbRepositoryDiscussion);
    sendResponse(res, 200, 'Successfully deleted your comment');
  });

  const replyDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;
    const reply = req.body.reply;

    await replyDiscussionU(discussionId, reply, dbRepositoryDiscussion);
    sendResponse(res, 200, 'Successfully replied to a comment');
  });

  const getRepliesByDiscussion = asyncHandler(async (req: Request, res: Response) => {
    const discussionId: string = req.params.discussionId;
    const replies = await getRepliesByDiscussionIdU(discussionId, dbRepositoryDiscussion);
    sendResponse(res, 200, 'Successfully retrieved replies based on discussion', replies);
  });

  const enrollStudent = asyncHandler(async (req: CustomRequest, res: Response) => {
    const paymentInfo: PaymentInfo = req.body;
    const courseId: string = req.params.courseId ?? '';
    const studentId: string = req.user?.Id ?? '';

    await enrollStudentU(
      courseId,
      studentId,
      paymentInfo,
      dbRepositoryCourse,
      dbRepositoryPayment
    );

    sendResponse(res, 200, 'Successfully enrolled into the course');
  });

  const getRecommendedCourseByStudentInterest = asyncHandler(async (req: CustomRequest, res: Response) => {
    const studentId: string = req.user?.Id ?? '';
    const courses = await getRecommendedCourseByStudentU(studentId, dbRepositoryCourse);
    sendResponse(res, 200, 'Successfully retrieved recommended courses', courses);
  });

  const getTrendingCourses = asyncHandler(async (_req: Request, res: Response) => {
    const courses = await getTrendingCourseU(dbRepositoryCourse);
    sendResponse(res, 200, 'Successfully retrieved trending courses', courses);
  });

  const getCourseByStudent = asyncHandler(async (req: CustomRequest, res: Response) => {
    const studentId: string | undefined = req.user?.Id;
    const courses = await getCourseByStudentU(studentId, dbRepositoryCourse);
    sendResponse(res, 200, 'Successfully retrieved courses based on students', courses);
  });

  const searchCourse = asyncHandler(async (req: Request, res: Response) => {
    const { search, filter } = req.query as { search: string; filter: string };
    const key = search.trim() === '' ? search : filter;

    const searchResult = await searchCourseU(search, filter, dbRepositoryCourse);

    if (searchResult.length) {
      await dbRepositoryCache.setCache({
        key,
        expireTimeSec: 600,
        data: JSON.stringify(searchResult)
      });
    }

    sendResponse(res, 200, 'Successfully retrieved courses based on the search query', searchResult);
  });

  return {
    addCourse,
    editCourse,
    getAllCourses,
    getIndividualCourse,
    getCoursesByInstructor,
    addLesson,
    editLesson,
    getLessonsByCourse,
    getLessonById,
    getQuizzesByLesson,
    addDiscussion,
    getDiscussionsByLesson,
    editDiscussions,
    deleteDiscussion,
    replyDiscussion,
    getRepliesByDiscussion,
    enrollStudent,
    getRecommendedCourseByStudentInterest,
    getTrendingCourses,
    getCourseByStudent,
    searchCourse
  };
};

export default courseController;
