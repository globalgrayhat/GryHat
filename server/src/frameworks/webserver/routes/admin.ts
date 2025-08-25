import express from 'express';
import adminController from '../../../adapters/controllers/adminController';
import { adminRepoMongoDb } from '../../../frameworks/database/mongodb/repositories/adminRepoMongoDb';
import { adminDbRepository } from '../../../app/repositories/adminDbRepository';
import { courseRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/courseReposMongoDb';
import { courseDbRepository } from '../../../app/repositories/courseDbRepository';
import { instructorDbRepository } from '../../../app/repositories/instructorDbRepository';
import { instructorRepoMongoDb } from '../../../frameworks/database/mongodb/repositories/instructorRepoMongoDb';
import { studentDbRepository } from '../../../app/repositories/studentDbRepository';
import { studentRepositoryMongoDB } from '../../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import { paymentInterface } from '../../../app/repositories/paymentDbRepository';
import { paymentRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/paymentRepoMongodb';
import {  categoryDbInterface } from '../../../app/repositories/categoryDbRepository';
import { categoryRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/categoryRepoMongoDb';


const adminRouter = () => {
  const router = express.Router();
  const controller = adminController(
    adminDbRepository,
    adminRepoMongoDb,
    courseDbRepository,
    courseRepositoryMongodb,
    instructorDbRepository,
    instructorRepoMongoDb,
    studentDbRepository,
    studentRepositoryMongoDB ,
    paymentInterface,
    paymentRepositoryMongodb,
    categoryDbInterface,
    categoryRepositoryMongodb
  );

  router.get("/dashboard-details",controller.getDashBoardDetails)
  router.get('/storage-config', controller.getStorageConfig);
  router.put('/storage-config', controller.updateStorageConfig);
  router.get('/graph-data',controller.getGraphDetails)

  return router;
};

export default adminRouter;
