import express from 'express';
import { instructorRepoMongoDb } from '../../../frameworks/database/mongodb/repositories/instructorRepoMongoDb';
import { sendEmailServiceInterface } from '../../../app/services/sendEmailServiceInterface';
import { sendEmailService } from '../../../frameworks/services/sendEmailService';
import { instructorDbRepository } from '../../../app/repositories/instructorDbRepository';
import instructorController from '../../../adapters/controllers/instructorController';
import { authService } from '../../../frameworks/services/authService';
import { authServiceInterface } from '../../../app/services/authServicesInterface';
import roleCheckMiddleware from '../middlewares/roleCheckMiddleware';
import { UserRole } from '../../../constants/enums';
import jwtAuthMiddleware from '../middlewares/userAuth';
import upload from '../middlewares/multer';
import { courseDbRepository } from '../../../app/repositories/courseDbRepository';
import { courseRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/courseReposMongoDb';

const instructorRouter = () => {
  const router = express.Router();
  const controller = instructorController(
    authServiceInterface,
    authService,
    instructorDbRepository,
    instructorRepoMongoDb,
    courseDbRepository,
    courseRepositoryMongodb,
    sendEmailServiceInterface,
    sendEmailService
  );
<<<<<<< HEAD

  /**
   * @swagger
   * tags:
   *   name: Instructor
   *   description: Instructor related APIs
   */

  /**
   * @swagger
   * /api/instructors/view-instructor-requests:
   *   get:
   *     summary: Get all instructor requests
   *     tags: [Instructor]
   *     responses:
   *       200:
   *         description: List of instructor requests
   */
  router.get('/view-instructor-requests', controller.getInstructorRequests);

  /**
   * @swagger
   * /api/instructors/get-all-instructors:
   *   get:
   *     summary: Get all instructors
   *     tags: [Instructor]
   *     responses:
   *       200:
   *         description: List of all instructors
   */
  router.get('/get-all-instructors', controller.getAllInstructor);

  /**
   * @swagger
   * /api/instructors/get-all-instructors/unblock-instructors/{instructorId}:
   *   get:
   *     summary: Unblock a specific instructor by ID
   *     tags: [Instructor]
   *     parameters:
   *       - in: path
   *         name: instructorId
   *         schema:
   *           type: string
   *         required: true
   *         description: The instructor ID to unblock
   *     responses:
   *       200:
   *         description: Instructor unblocked successfully
   */
  router.get(
=======
  //* Instructor management
  router.get('/view-instructor-requests', controller.getInstructorRequests);

  router.patch(
    '/accept-instructor-request/:instructorId',
    controller.verifyInstructor
  );

  router.put('/reject-instructor-request', controller.rejectRequest);

  router.get('/get-all-instructors', controller.getAllInstructor);

  router.patch(
    '/get-all-instructors/block-instructors',
    controller.blockInstructor
  );

  router.patch(
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    '/get-all-instructors/unblock-instructors/:instructorId',
    controller.unblockInstructor
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/instructors/get-blocked-instructors:
   *   get:
   *     summary: Get all blocked instructors
   *     tags: [Instructor]
   *     responses:
   *       200:
   *         description: List of blocked instructors
   */
  router.get('/get-blocked-instructors', controller.getBlockedInstructor);

  /**
   * @swagger
   * /api/instructors/view-instructor/{instructorId}:
   *   get:
   *     summary: Get instructor by ID
   *     tags: [Instructor]
   *     parameters:
   *       - in: path
   *         name: instructorId
   *         schema:
   *           type: string
   *         required: true
   *         description: Instructor ID
   *     responses:
   *       200:
   *         description: Instructor details
   */
  router.get('/view-instructor/:instructorId', controller.getInstructorById);

  /**
   * @swagger
   * /api/instructors/get-instructor-details:
   *   get:
   *     summary: Get logged-in instructor's details
   *     tags: [Instructor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Instructor details for logged-in user
   */
=======
  router.get('/get-blocked-instructors', controller.getBlockedInstructor);

  router.get('/view-instructor/:instructorId', controller.getInstructorById);

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.get(
    '/get-instructor-details',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.getInstructorDetails
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/instructors/get-all-instructors/block-instructors:
   *   get:
   *     summary: Block an instructor (should specify which instructor internally)
   *     tags: [Instructor]
   *     responses:
   *       200:
   *         description: Instructor blocked
   */
  router.get(
    '/get-all-instructors/block-instructors',
    controller.blockInstructor
  );

  /**
   * @swagger
   * /api/instructors/get-students-by-instructor:
   *   get:
   *     summary: Get students associated with the instructor
   *     tags: [Instructor]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of students for instructor
   */
  router.get(
    '/get-students-by-instructor',
    jwtAuthMiddleware,
    controller.getStudentsForInstructors
  );

  /**
   * @swagger
   * /api/instructors/accept-instructor-request/{instructorId}:
   *   patch:
   *     summary: Accept instructor registration request
   *     tags: [Instructor]
   *     parameters:
   *       - in: path
   *         name: instructorId
   *         schema:
   *           type: string
   *         required: true
   *         description: Instructor request ID to accept
   *     responses:
   *       200:
   *         description: Instructor request accepted
   */
  router.patch(
    '/accept-instructor-request/:instructorId',
    controller.verifyInstructor
  );

  /**
   * @swagger
   * /api/instructors/change-password:
   *   patch:
   *     summary: Change password for logged-in instructor
   *     tags: [Instructor]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       description: New password data
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               oldPassword:
   *                 type: string
   *               newPassword:
   *                 type: string
   *     responses:
   *       200:
   *         description: Password changed successfully
   */
  router.patch(
    '/change-password',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.changePassword
  );

  /**
   * @swagger
   * /api/instructors/update-profile:
   *   put:
   *     summary: Update instructor profile including image upload
   *     tags: [Instructor]
   *     security:
   *       - bearerAuth: []
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
   *                 description: Other profile fields (name, bio, etc.)
   *     responses:
   *       200:
   *         description: Profile updated successfully
   */
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
  router.put(
    '/update-profile',
    jwtAuthMiddleware,
    upload.single('image'),
    roleCheckMiddleware(UserRole.Instructor),
    controller.updateProfile
  );

<<<<<<< HEAD
  /**
   * @swagger
   * /api/instructors/reject-instructor-request:
   *   put:
   *     summary: Reject instructor registration request
   *     tags: [Instructor]
   *     requestBody:
   *       description: Data to identify request to reject
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               instructorId:
   *                 type: string
   *     responses:
   *       200:
   *         description: Instructor request rejected
   */
  router.put('/reject-instructor-request', controller.rejectRequest);
=======
  router.patch(
    '/change-password',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.changePassword
  );

  router.get(
    '/get-students-by-instructor',
    jwtAuthMiddleware,
    controller.getStudentsForInstructors
  );
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

  return router;
};

export default instructorRouter;
