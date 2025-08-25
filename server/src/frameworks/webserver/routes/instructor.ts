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

  router.get('/view-instructor-requests', controller.getInstructorRequests);
  router.get('/get-all-instructors', controller.getAllInstructor);
  router.get(
    '/get-all-instructors/unblock-instructors/:instructorId',
    controller.unblockInstructor
  );
  router.get('/get-blocked-instructors', controller.getBlockedInstructor);
  router.get('/view-instructor/:instructorId', controller.getInstructorById);
  router.get(
    '/get-instructor-details',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.getInstructorDetails
  );
  router.get(
    '/get-all-instructors/block-instructors',
    controller.blockInstructor
  );
  router.get(
    '/get-students-by-instructor',
    jwtAuthMiddleware,
    controller.getStudentsForInstructors
  );
  router.patch(
    '/accept-instructor-request/:instructorId',
    controller.verifyInstructor
  );
  router.patch(
    '/change-password',
    jwtAuthMiddleware,
    roleCheckMiddleware(UserRole.Instructor),
    controller.changePassword
  );
  router.put(
    '/update-profile',
    jwtAuthMiddleware,
    upload.single('image'),
    roleCheckMiddleware(UserRole.Instructor),
    controller.updateProfile
  );
  router.put('/reject-instructor-request', controller.rejectRequest);

  return router;
};

export default instructorRouter;
