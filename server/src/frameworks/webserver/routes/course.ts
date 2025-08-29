import express from 'express';
import courseController from '../../../adapters/controllers/courseController';
import { courseRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/courseReposMongoDb';
import { courseDbRepository } from '../../../app/repositories/courseDbRepository';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
import upload from '../middlewares/multer';
import { quizDbRepository } from '../../../app/repositories/quizDbRepository';
import { quizRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/quizzDbRepository';
import { lessonDbRepository } from '../../../app/repositories/lessonDbRepository';
import { lessonRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/lessonRepoMongodb';
import { discussionDbRepository } from '../../../app/repositories/discussionDbRepository';
import { discussionRepositoryMongoDb } from '../../../frameworks/database/mongodb/repositories/discussionsRepoMongodb';
import { paymentRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/paymentRepoMongodb';
import { paymentInterface } from '../../../app/repositories/paymentDbRepository';
import jwtAuthMiddleware from '../middlewares/userAuth';
import { redisCacheRepository } from '../../../frameworks/database/redis/redisCacheRepository';
import { cacheRepositoryInterface } from '../../../app/repositories/cachedRepoInterface';
import { RedisClient } from '../../../app';
import { cachingMiddleware } from '../middlewares/redisCaching';

const courseRouter = (redisClient: RedisClient) => {
  const router = express.Router();

  const controller = courseController(
    courseDbRepository,
    courseRepositoryMongodb,
    quizDbRepository,
    quizRepositoryMongodb,
    lessonDbRepository,
    lessonRepositoryMongodb,
    discussionDbRepository,
    discussionRepositoryMongoDb,
    paymentInterface,
    paymentRepositoryMongodb,
    cacheRepositoryInterface,
    redisCacheRepository,
    redisClient
  );

  /**
   * @swagger
   * /api/courses/instructors/add-course:
   *   post:
   *     summary: Add a new course (Instructor only)
   *     tags: [Course]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               guidelines:
   *                 type: string
   *                 format: binary
   *               introduction:
   *                 type: string
   *                 format: binary
   *               thumbnail:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Course created successfully
   *       400:
   *         description: Bad request
   */
  router.post(
    '/instructors/add-course',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    upload.fields([
      { name: 'guidelines', maxCount: 1 },
      { name: 'introduction', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    controller.addCourse
  );

  /**
   * @swagger
   * /api/courses/instructors/edit-course/{courseId}:
   *   put:
   *     summary: Edit course (Instructor only)
   *     tags: [Course]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: courseId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               files:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Course updated successfully
   *       400:
   *         description: Bad request
   */
  router.put(
    '/instructors/edit-course/:courseId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    upload.array('files'),
    controller.editCourse
  );

  /**
   * @swagger
   * /api/courses/get-all-courses:
   *   get:
   *     summary: Get all courses
   *     tags: [Course]
   *     responses:
   *       200:
   *         description: List of all courses
   */
  router.get(
    '/get-all-courses',
    cachingMiddleware(redisClient, 'all-courses'),
    controller.getAllCourses
  );

  /**
   * @swagger
   * /api/courses/get-course/{courseId}:
   *   get:
   *     summary: Get course by ID
   *     tags: [Course]
   *     parameters:
   *       - name: courseId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Course details
   *       404:
   *         description: Course not found
   */
  router.get('/get-course/:courseId', controller.getIndividualCourse);

  /**
   * @swagger
   * /api/courses/get-course-by-instructor:
   *   get:
   *     summary: Get courses created by the authenticated instructor
   *     tags: [Course]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of instructor's courses
   */
  router.get(
    '/get-course-by-instructor',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.getCoursesByInstructor
  );

  /**
   * @swagger
   * /api/courses/instructors/add-lesson/{courseId}:
   *   post:
   *     summary: Add lesson to course (Instructor only)
   *     tags: [Lesson]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: courseId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               media:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       201:
   *         description: Lesson added successfully
   */
  router.post(
    '/instructors/add-lesson/:courseId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    upload.array('media'),
    controller.addLesson
  );

  /**
   * @swagger
   * /api/courses/instructors/edit-lesson/{lessonId}:
   *   put:
   *     summary: Edit lesson (Instructor only)
   *     tags: [Lesson]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: lessonId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               media:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: binary
   *     responses:
   *       200:
   *         description: Lesson updated successfully
   */
  router.put(
    '/instructors/edit-lesson/:lessonId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    upload.array('media'),
    controller.editLesson
  );

  /**
   * @swagger
   * /api/courses/instructors/get-lessons-by-course/{courseId}:
   *   get:
   *     summary: Get lessons by course ID
   *     tags: [Lesson]
   *     parameters:
   *       - name: courseId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of lessons for the course
   */
  router.get(
    '/instructors/get-lessons-by-course/:courseId',
    controller.getLessonsByCourse
  );

  /**
   * @swagger
   * /api/courses/get-lessons-by-id/{lessonId}:
   *   get:
   *     summary: Get lesson by ID
   *     tags: [Lesson]
   *     parameters:
   *       - name: lessonId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Lesson details
   */
  router.get('/get-lessons-by-id/:lessonId', controller.getLessonById);

  /**
   * @swagger
   * /api/courses/get-quizzes-by-lesson/{lessonId}:
   *   get:
   *     summary: Get quizzes for a lesson
   *     tags: [Quiz]
   *     parameters:
   *       - name: lessonId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of quizzes
   */
  router.get('/get-quizzes-by-lesson/:lessonId', controller.getQuizzesByLesson);

  /**
   * @swagger
   * /api/courses/lessons/add-discussion/{lessonId}:
   *   post:
   *     summary: Add discussion to lesson (authenticated users)
   *     tags: [Discussion]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: lessonId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Discussion content
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *     responses:
   *       201:
   *         description: Discussion added
   */
  router.post(
    '/lessons/add-discussion/:lessonId',
    jwtAuthMiddleware,
    controller.addDiscussion
  );

  /**
   * @swagger
   * /api/courses/lessons/get-discussions-by-lesson/{lessonId}:
   *   get:
   *     summary: Get discussions by lesson ID
   *     tags: [Discussion]
   *     parameters:
   *       - name: lessonId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of discussions
   */
  router.get(
    '/lessons/get-discussions-by-lesson/:lessonId',
    controller.getDiscussionsByLesson
  );

  /**
   * @swagger
   * /api/courses/lessons/edit-discussion/{discussionId}:
   *   patch:
   *     summary: Edit a discussion (authenticated users)
   *     tags: [Discussion]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: discussionId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Updated discussion content
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *     responses:
   *       200:
   *         description: Discussion updated
   */
  router.patch(
    '/lessons/edit-discussion/:discussionId',
    jwtAuthMiddleware,
    controller.editDiscussions
  );

  /**
   * @swagger
   * /api/courses/lessons/delete-discussion/{discussionId}:
   *   delete:
   *     summary: Delete a discussion (authenticated users)
   *     tags: [Discussion]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: discussionId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Discussion deleted
   */
  router.delete(
    '/lessons/delete-discussion/:discussionId',
    jwtAuthMiddleware,
    controller.deleteDiscussion
  );

  /**
   * @swagger
   * /api/courses/lessons/reply-discussion/{discussionId}:
   *   put:
   *     summary: Reply to a discussion (authenticated users)
   *     tags: [Discussion]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: discussionId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       description: Reply content
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reply:
   *                 type: string
   *     responses:
   *       200:
   *         description: Reply added
   */
  router.put(
    '/lessons/reply-discussion/:discussionId',
    jwtAuthMiddleware,
    controller.replyDiscussion
  );

  /**
   * @swagger
   * /api/courses/lesson/replies-based-on-discussion/{discussionId}:
   *   get:
   *     summary: Get replies based on discussion ID
   *     tags: [Discussion]
   *     parameters:
   *       - name: discussionId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: List of replies
   */
  router.get(
    '/lesson/replies-based-on-discussion/:discussionId',
    controller.getRepliesByDiscussion
  );

  /**
   * @swagger
   * /api/courses/enroll-student/{courseId}:
   *   post:
   *     summary: Enroll student in a course
   *     tags: [Course]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: courseId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Student enrolled successfully
   *       400:
   *         description: Enrollment failed
   */
  router.post(
    '/enroll-student/:courseId',
    jwtAuthMiddleware,
    controller.enrollStudent
  );

  /**
   * @swagger
   * /api/courses/get-recommended-courses:
   *   get:
   *     summary: Get recommended courses for the authenticated student
   *     tags: [Course]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of recommended courses
   */
  router.get(
    '/get-recommended-courses',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Student),
    controller.getRecommendedCourseByStudentInterest
  );

  /**
   * @swagger
   * /api/courses/get-trending-courses:
   *   get:
   *     summary: Get trending courses
   *     tags: [Course]
   *     responses:
   *       200:
   *         description: List of trending courses
   */
  router.get('/get-trending-courses', controller.getTrendingCourses);

  /**
   * @swagger
   * /api/courses/get-course-by-student:
   *   get:
   *     summary: Get courses the authenticated student is enrolled in
   *     tags: [Course]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of student's courses
   */
  router.get(
    '/get-course-by-student',
    jwtAuthMiddleware,
    controller.getCourseByStudent
  );

  /**
   * @swagger
   * /api/courses/search-course:
   *   get:
   *     summary: Search courses by keyword
   *     tags: [Course]
   *     parameters:
   *       - name: q
   *         in: query
   *         schema:
   *           type: string
   *         description: Search keyword
   *     responses:
   *       200:
   *         description: Search results
   */
  router.get(
    '/search-course',
    cachingMiddleware(redisClient),
    controller.searchCourse
  );

  return router;
};

export default courseRouter;
