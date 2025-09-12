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
import optionalAuth from '../middlewares/optionalAuth';
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
   * tags:
   *   - name: Course
   *     description: Course CRUD & enrollment
   *   - name: Lesson
   *     description: Lessons (TUS/URL), previews & quizzes
   *   - name: Discussion
   *     description: Lesson discussions
   *   - name: Moderation
   *     description: Course submission & moderation
   */

  /**
   * @swagger
   * /api/courses/instructors/add-course:
   *   post:
   *     summary: Add a new course (Instructor only)
   *     tags: [Course]
   *     security: [ { bearerAuth: [] } ]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/MultipartCourseCreate'
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CourseCreateJson'
   *     responses:
   *       201: { description: Course created (returns courseId) }
   *       400: { description: Bad request }
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
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/MultipartCourseEdit'
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CoursePatchJson'
   *     responses:
   *       200: { description: Course updated successfully }
   */
  router.put(
    '/instructors/edit-course/:courseId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    upload.fields([
      { name: 'guidelines', maxCount: 1 },
      { name: 'introduction', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 }
    ]),
    controller.editCourse
  );

  /**
   * @swagger
   * /api/courses/instructors/submit/{courseId}:
   *   post:
   *     summary: Submit course for review (draft → pending)
   *     tags: [Moderation]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Course submitted (status=pending) }
   */
  router.post(
    '/instructors/submit/:courseId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.submitCourse
  );

  /**
   * @swagger
   * /api/courses/admin/moderate/{courseId}:
   *   patch:
   *     summary: Approve/Reject a course
   *     tags: [Moderation]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [action]
   *             properties:
   *               action: { type: string, enum: [approve, reject] }
   *               reason: { type: string, description: 'Required when action=reject' }
   *     responses:
   *       200: { description: Moderation applied }
   *       400: { description: Invalid action }
   */
  router.patch(
    '/admin/moderate/:courseId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    controller.moderateCourse
  );

  /**
   * @swagger
   * /api/courses/get-all-courses:
   *   get:
   *     summary: Get all courses
   *     tags: [Course]
   *     responses:
   *       200: { description: List of all courses }
   */
  router.get('/get-all-courses', cachingMiddleware(redisClient, 'all-courses'), controller.getAllCourses);

  /**
   * @swagger
   * /api/courses/get-course/{courseId}:
   *   get:
   *     summary: Get course by ID
   *     tags: [Course]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Course details }
   *       404: { description: Course not found }
   */
  router.get('/get-course/:courseId', controller.getIndividualCourse);

  // -------------------- LESSONS --------------------

  /**
   * @swagger
   * /api/courses/instructors/add-lesson/{courseId}:
   *   post:
   *     summary: Add lesson to course (Instructor only) — choose either a video URL OR TUS upload
   *     description: |
   *       **Video options (mutually exclusive):**
   *       - **URL mode**: provide `videoSource` (`youtube|vimeo|local|s3`) + `videoUrl`.
   *       - **TUS mode**: provide `videoFile` (single TUS id) **or** `videoTusKeys` (array/CSV of ids).
   *       Sending both URL and TUS keys in the same request returns **400**.
   *
   *       **Resources** (PDF/ZIP/..): send as `resources` (multipart files) or as pre-uploaded objects in JSON.
   *
   *       `questions` may be sent as JSON or as a JSON string in multipart.
   *     tags: [Lesson]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LessonCreateJson'
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/LessonCreateMultipart'
   *     responses:
   *       201: { description: Lesson added }
   *       400: { description: Invalid payload (URL + TUS together, or missing video) }
   */
  router.post(
    '/instructors/add-lesson/:courseId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    // نسمح فقط برفع المرفقات resources؛ الفيديو يأتي كرابط أو TUS id
    upload.fields([{ name: 'resources', maxCount: 20 }]),
    controller.addLesson
  );

  /**
   * @swagger
   * /api/courses/instructors/edit-lesson/{lessonId}:
   *   put:
   *     summary: Edit lesson (Instructor only)
   *     description: |
   *       You can update textual fields, `isPreview`, `contents`, `duration`, `resources`, and `questions`.
   *       For resources, you may upload new files via multipart `resources` or send pre-uploaded objects.
   *       (Direct video re-upload is not handled here; adjust logic if needed.)
   *     tags: [Lesson]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LessonEditJson'
   *         multipart/form-data:
   *           schema:
   *             $ref: '#/components/schemas/LessonEditMultipart'
   *     responses:
   *       200: { description: Lesson updated }
   */
  router.put(
    '/instructors/edit-lesson/:lessonId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    upload.fields([{ name: 'resources', maxCount: 20 }]),
    controller.editLesson
  );

  /**
   * @swagger
   * /api/courses/instructors/get-lessons-by-course/{courseId}:
   *   get:
   *     summary: Get lessons by course ID (instructor/admin)
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Lessons list }
   */
  router.get('/instructors/get-lessons-by-course/:courseId', controller.getLessonsByCourse);

  /**
   * @swagger
   * /api/courses/public/get-lessons/{courseId}:
   *   get:
   *     summary: Public lessons listing with previews
   *     description: |
   *       - Not enrolled/not instructor ⇒ returns only lessons where `isPreview=true`.
   *       - Instructor or enrolled student ⇒ returns all lessons.
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Preview or full lessons depending on access }
   */
  router.get('/public/get-lessons/:courseId', optionalAuth, controller.getLessonsByCoursePublic);

  /**
   * @swagger
   * /api/courses/get-lessons-by-id/{lessonId}:
   *   get:
   *     summary: Get a lesson by ID
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Lesson details }
   */
  router.get('/get-lessons-by-id/:lessonId', controller.getLessonById);

  /**
   * @swagger
   * /api/courses/get-quizzes-by-lesson/{lessonId}:
   *   get:
   *     summary: Get quizzes of a lesson
   *     tags: [Lesson]
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Quizzes list }
   */
  router.get('/get-quizzes-by-lesson/:lessonId', controller.getQuizzesByLesson);

  // -------------------- DISCUSSIONS --------------------

  /**
   * @swagger
   * /api/courses/lessons/add-discussion/{lessonId}:
   *   post:
   *     summary: Add discussion to lesson
   *     tags: [Discussion]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties: { message: { type: string } }
   *     responses:
   *       200: { description: Discussion added }
   */
  router.post('/lessons/add-discussion/:lessonId', jwtAuthMiddleware, controller.addDiscussion);

  /**
   * @swagger
   * /api/courses/lessons/get-discussions-by-lesson/{lessonId}:
   *   get:
   *     summary: Get discussions by lesson ID
   *     tags: [Discussion]
   *     parameters:
   *       - in: path
   *         name: lessonId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Discussions list }
   */
  router.get('/lessons/get-discussions-by-lesson/:lessonId', controller.getDiscussionsByLesson);

  /**
   * @swagger
   * /api/courses/lessons/edit-discussion/{discussionId}:
   *   patch:
   *     summary: Edit a discussion
   *     tags: [Discussion]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: discussionId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties: { message: { type: string } }
   *     responses:
   *       200: { description: Discussion updated }
   */
  router.patch('/lessons/edit-discussion/:discussionId', jwtAuthMiddleware, controller.editDiscussions);

  /**
   * @swagger
   * /api/courses/lessons/delete-discussion/{discussionId}:
   *   delete:
   *     summary: Delete a discussion
   *     tags: [Discussion]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: discussionId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Discussion deleted }
   */
  router.delete('/lessons/delete-discussion/:discussionId', jwtAuthMiddleware, controller.deleteDiscussion);

  /**
   * @swagger
   * /api/courses/lessons/reply-discussion/{discussionId}:
   *   put:
   *     summary: Reply to a discussion
   *     tags: [Discussion]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: discussionId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties: { reply: { type: string } }
   *     responses:
   *       200: { description: Reply added }
   */
  router.put('/lessons/reply-discussion/:discussionId', jwtAuthMiddleware, controller.replyDiscussion);

  /**
   * @swagger
   * /api/courses/lesson/replies-based-on-discussion/{discussionId}:
   *   get:
   *     summary: Get replies based on discussion ID
   *     tags: [Discussion]
   *     parameters:
   *       - in: path
   *         name: discussionId
   *         required: true
   *         schema: { type: string }
   *     responses:
   *       200: { description: Replies list }
   */
  router.get('/lesson/replies-based-on-discussion/:discussionId', controller.getRepliesByDiscussion);

  // -------------------- ENROLL / DISCOVERY --------------------

  /**
   * @swagger
   * /api/courses/enroll-student/{courseId}:
   *   post:
   *     summary: Enroll student in a course
   *     tags: [Course]
   *     security: [ { bearerAuth: [] } ]
   *     parameters:
   *       - in: path
   *         name: courseId
   *         required: true
   *         schema: { type: string }
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount: { type: number }
   *               paymentMethodId: { type: string }
   *     responses:
   *       200: { description: Student enrolled }
   */
  router.post('/enroll-student/:courseId', jwtAuthMiddleware, controller.enrollStudent);

  /**
   * @swagger
   * /api/courses/get-recommended-courses:
   *   get:
   *     summary: Get recommended courses for the authenticated student
   *     tags: [Course]
   *     security: [ { bearerAuth: [] } ]
   *     responses:
   *       200: { description: Recommended courses }
   */
  router.get('/get-recommended-courses', jwtAuthMiddleware, roleCheckMiddleware(UserRole.Student), controller.getRecommendedCourseByStudentInterest);

  /**
   * @swagger
   * /api/courses/get-trending-courses:
   *   get:
   *     summary: Get trending courses
   *     tags: [Course]
   *     responses:
   *       200: { description: Trending courses }
   */
  router.get('/get-trending-courses', controller.getTrendingCourses);

  /**
   * @swagger
   * /api/courses/get-course-by-student:
   *   get:
   *     summary: Get courses the authenticated student is enrolled in
   *     tags: [Course]
   *     security: [ { bearerAuth: [] } ]
   *     responses:
   *       200: { description: Student's courses }
   */
  router.get('/get-course-by-student', jwtAuthMiddleware, controller.getCourseByStudent);

  /**
   * @swagger
   * /api/courses/search-course:
   *   get:
   *     summary: Search courses by keyword
   *     tags: [Course]
   *     parameters:
   *       - in: query
   *         name: search
   *         schema: { type: string }
   *       - in: query
   *         name: filter
   *         schema: { type: string }
   *     responses:
   *       200: { description: Search results }
   */
  router.get('/search-course', cachingMiddleware(redisClient), controller.searchCourse);

  return router;
};

export default courseRouter;

/**
 * @swagger
 * components:
 *   schemas:
 *     MultipartCourseCreate:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         duration: { type: number }
 *         categoryId: { type: string }
 *         level: { type: string, enum: [Beginner, Intermediate, Advanced] }
 *         tags: { type: string, description: "CSV or multiple fields" }
 *         price: { type: number }
 *         isPaid: { type: boolean }
 *         about: { type: string }
 *         description: { type: string }
 *         syllabus: { type: string, description: "CSV" }
 *         requirements: { type: string, description: "CSV" }
 *         videoSource: { type: string, enum: [local, s3, youtube, vimeo] }
 *         videoUrl: { type: string }
 *         thumbnail: { type: string, format: binary }
 *         introduction: { type: string, format: binary }
 *         guidelines: { type: string, format: binary }
 *     CourseCreateJson:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         duration: { type: number }
 *         categoryId: { type: string }
 *         level: { type: string, enum: [Beginner, Intermediate, Advanced] }
 *         tags: { type: array, items: { type: string } }
 *         price: { type: number }
 *         isPaid: { type: boolean }
 *         about: { type: string }
 *         description: { type: string }
 *         syllabus: { type: array, items: { type: string } }
 *         requirements: { type: array, items: { type: string } }
 *         videoSource: { type: string, enum: [local, s3, youtube, vimeo] }
 *         videoUrl: { type: string, description: "Required when videoSource is youtube/vimeo" }
 *         introductionKey: { type: string, description: "TUS key for intro (optional)" }
 *     MultipartCourseEdit:
 *       type: object
 *       properties:
 *         thumbnail: { type: string, format: binary }
 *         introduction: { type: string, format: binary }
 *         guidelines: { type: string, format: binary }
 *         title: { type: string }
 *         about: { type: string }
 *         description: { type: string }
 *         level: { type: string }
 *         price: { type: number }
 *         isPaid: { type: boolean }
 *     CoursePatchJson:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         about: { type: string }
 *         description: { type: string }
 *         level: { type: string }
 *         price: { type: number }
 *         isPaid: { type: boolean }
 *         tags: { type: array, items: { type: string } }
 *         syllabus: { type: array, items: { type: string } }
 *         requirements: { type: array, items: { type: string } }
 *
 *     # ---------- LESSON SCHEMAS ----------
 *     LessonCreateJson:
 *       type: object
 *       required: [title, description, contents, duration]
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         contents: { type: array, items: { type: string } }
 *         duration: { type: number, minimum: 0 }
 *         about: { type: string }
 *         isPreview: { type: boolean, default: false }
 *         # Choose ONE of the following video inputs:
 *         videoSource:
 *           type: string
 *           enum: [tus, youtube, vimeo, local, s3]
 *           description: "Video source type. Use 'tus' with videoFile/videoTusKeys OR provide youtube/vimeo/local/s3 with videoUrl."
 *         videoUrl:
 *           type: string
 *           description: "Required when videoSource is youtube/vimeo/local/s3"
 *         videoFile:
 *           type: string
 *           description: "Single TUS upload id (mutually exclusive with videoUrl)"
 *         videoTusKeys:
 *           type: array
 *           items: { type: string }
 *           description: "Multiple TUS ids (mutually exclusive with videoUrl)"
 *         resources:
 *           type: array
 *           description: "Pre-uploaded file objects"
 *           items:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               url: { type: string }
 *               key: { type: string }
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *             description: "Quiz question"
 *     LessonCreateMultipart:
 *       type: object
 *       properties:
 *         # Files:
 *         resources:
 *           type: array
 *           items: { type: string, format: binary }
 *         # Text fields:
 *         title: { type: string }
 *         description: { type: string }
 *         contents: { type: string, description: "CSV" }
 *         duration: { type: number }
 *         about: { type: string }
 *         isPreview: { type: boolean }
 *         videoSource:
 *           type: string
 *           enum: [tus, youtube, vimeo, local, s3]
 *         videoUrl: { type: string }
 *         videoFile: { type: string, description: "Single TUS id" }
 *         videoTusKeys: { type: string, description: "CSV of TUS ids" }
 *         questions: { type: string, description: "JSON string" }
 *
 *     LessonEditJson:
 *       type: object
 *       properties:
 *         title: { type: string }
 *         description: { type: string }
 *         contents: { type: array, items: { type: string } }
 *         duration: { type: number, minimum: 0 }
 *         about: { type: string }
 *         isPreview: { type: boolean }
 *         resources:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               url: { type: string }
 *               key: { type: string }
 *         questions:
 *           type: array
 *           items:
 *             type: object
 *     LessonEditMultipart:
 *       type: object
 *       properties:
 *         resources:
 *           type: array
 *           items: { type: string, format: binary }
 *         title: { type: string }
 *         description: { type: string }
 *         contents: { type: string, description: "CSV" }
 *         duration: { type: number }
 *         about: { type: string }
 *         isPreview: { type: boolean }
 *         questions: { type: string, description: "JSON string" }
 */
