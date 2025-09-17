import express from 'express';
import studentController from '../../.././adapters/controllers/studentController';
import { studentDbRepository } from '../../../app/repositories/studentDbRepository';
import { studentRepositoryMongoDB } from '../../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import { authService } from '../../../frameworks/services/authService';
import { authServiceInterface } from '../../../app/services/authServicesInterface';
import upload from '../middlewares/multer';
import { RedisClient } from '@src/app';
import { cachingMiddleware } from '../middlewares/redisCaching';
import { redisCacheRepository } from '../../../frameworks/database/redis/redisCacheRepository';
import { cacheRepositoryInterface } from '../../../app/repositories/cachedRepoInterface';
import jwtAuthMiddleware from '../middlewares/userAuth';
import { contactDbInterface } from '../../../app/repositories/contactDbRepository';
import { contactRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/contactsRepoMongoDb';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';

<<<<<<< HEAD
/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Student management and profile APIs
 */

=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
const studentRouter = (redisClient: RedisClient) => {
  const router = express.Router();
  const controller = studentController(
    authServiceInterface,
    authService,
    studentDbRepository,
    studentRepositoryMongoDB,
    contactDbInterface,
    contactRepositoryMongodb,
    cacheRepositoryInterface,
    redisCacheRepository,
    redisClient
  );
<<<<<<< HEAD

  /**
   * @swagger
   * /api/students/change-password:
   *   patch:
   *     summary: Change password for logged-in student
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       description: Current and new password data
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               currentPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   *       401:
   *         description: Unauthorized
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.patch(
    '/change-password',
    jwtAuthMiddleware,
    controller.changePassword
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/students/update-profile:
   *   put:
   *     summary: Update student profile including image upload
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     consumes:
   *       - multipart/form-data
   *     requestBody:
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               image:
   *                 type: string
   *                 format: binary
   *               otherFields:
   *                 type: object
   *                 description: Other profile fields
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *       401:
   *         description: Unauthorized
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.put(
    '/update-profile',
    jwtAuthMiddleware,
    upload.single('image'),
    controller.updateProfile
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/students/get-student-details:
   *   get:
   *     summary: Get logged-in student's details (with caching)
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Returns student details
   *       401:
   *         description: Unauthorized
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.get(
    '/get-student-details',
    jwtAuthMiddleware,
    cachingMiddleware(redisClient),
    controller.getStudentDetails
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/students/get-all-students:
   *   get:
   *     summary: Get all students
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all students
   *       401:
   *         description: Unauthorized
   */
  router.get('/get-all-students', jwtAuthMiddleware, controller.getAllStudents);

  /**
   * @swagger
   * /api/students/block-student/{studentId}:
   *   patch:
   *     summary: Block a student by admin
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: studentId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the student to block
   *     responses:
   *       200:
   *         description: Student blocked successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins allowed
   */
=======
  router.get('/get-all-students', jwtAuthMiddleware, controller.getAllStudents);

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.patch(
    '/block-student/:studentId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    controller.blockStudent
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/students/unblock-student/{studentId}:
   *   patch:
   *     summary: Unblock a student by admin
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: studentId
   *         in: path
   *         required: true
   *         schema:
   *           type: string
   *         description: The ID of the student to unblock
   *     responses:
   *       200:
   *         description: Student unblocked successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins allowed
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.patch(
    '/unblock-student/:studentId',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    controller.unblockStudent
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/students/get-all-blocked-students:
   *   get:
   *     summary: Get all blocked students (admin only)
   *     tags: [Students]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of all blocked students
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins allowed
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.get(
    '/get-all-blocked-students',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Admin),
    controller.getAllBlockedStudents
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/students/contact-us:
   *   post:
   *     summary: Add contact message from student or user
   *     tags: [Students]
   *     requestBody:
   *       description: Contact message data
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: John Doe
   *               email:
   *                 type: string
   *                 format: email
   *                 example: john@example.com
   *               message:
   *                 type: string
   *                 example: I have a question regarding my course.
   *     responses:
   *       201:
   *         description: Contact message submitted successfully
   *       400:
   *         description: Bad request
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.post('/contact-us', controller.addContact);

  return router;
};
export default studentRouter;
