import { AdminRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/adminRepoMongoDb';
import { AdminDbInterface } from '../../app/repositories/adminDbRepository';
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { CourseDbRepositoryInterface } from '../../app/repositories/courseDbRepository';
import { CourseRepositoryMongoDbInterface } from '../../frameworks/database/mongodb/repositories/courseReposMongoDb';
import { InstructorDbInterface } from '../../app/repositories/instructorDbRepository';
import { InstructorRepositoryMongoDb } from '../../frameworks/database/mongodb/repositories/instructorRepoMongoDb';
import { StudentsDbInterface } from '../../app/repositories/studentDbRepository';
import { StudentRepositoryMongoDB } from '../../frameworks/database/mongodb/repositories/studentsRepoMongoDb';
import {
  getDashBoardDetailsU,
  getGraphDetailsU
} from '../../app/usecases/admin/dashBoardData';
import { PaymentInterface } from '../../app/repositories/paymentDbRepository';
import { PaymentImplInterface } from '../../frameworks/database/mongodb/repositories/paymentRepoMongodb';
import { CategoryDbInterface } from '../../app/repositories/categoryDbRepository';
import { CategoryRepoMongodbInterface } from '../../frameworks/database/mongodb/repositories/categoryRepoMongoDb';

import { storageConfigDbRepository } from '../../app/repositories/storageConfigDbRepository';
import { storageConfigRepoMongoDb } from '../../frameworks/database/mongodb/repositories/storageConfigRepoMongoDb';

import { updateStorageConfigU, getStorageConfigU } from '../../app/usecases/admin/updateStorageConfig';

const adminController = (
  adminDbRepository: AdminDbInterface,
  adminDbRepositoryImpl: AdminRepositoryMongoDb,
  courseDbRepository: CourseDbRepositoryInterface,
  courseDbRepositoryImpl: CourseRepositoryMongoDbInterface,
  instructorDbRepository: InstructorDbInterface,
  instructorDbRepositoryImpl: InstructorRepositoryMongoDb,
  studentDbRepository: StudentsDbInterface,
  studentDbRepositoryImpl: StudentRepositoryMongoDB,
  paymentDbRepository: PaymentInterface,
  paymentDbRepositoryImpl: PaymentImplInterface,
  categoryDbRepository: CategoryDbInterface,
  categoryDbRepositoryImpl: CategoryRepoMongodbInterface
) => {
  // Instantiate all repositories once
  const repositories = {
    admin: adminDbRepository(adminDbRepositoryImpl()),
    course: courseDbRepository(courseDbRepositoryImpl()),
    instructor: instructorDbRepository(instructorDbRepositoryImpl()),
    student: studentDbRepository(studentDbRepositoryImpl()),
    payment: paymentDbRepository(paymentDbRepositoryImpl()),
    category: categoryDbRepository(categoryDbRepositoryImpl()),
    storageConfig: storageConfigDbRepository(storageConfigRepoMongoDb())
  };

  const sendResponse = (
    res: Response,
    data: any,
    message = 'Success',
    statusCode = 200
  ) => {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data
    });
  };

  const getDashBoardDetails = asyncHandler(async (req: Request, res: Response) => {
    const data = await getDashBoardDetailsU(
      repositories.course,
      repositories.instructor,
      repositories.student,
      repositories.payment
    );
    sendResponse(res, data, 'Successfully retrieved dashboard details');
  });

  const getGraphDetails = asyncHandler(async (req: Request, res: Response) => {
    const data = await getGraphDetailsU(
      repositories.course,
      repositories.category,
      repositories.payment
    );
    sendResponse(res, data, 'Successfully retrieved graph details');
  });


  const getStorageConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = await getStorageConfigU(repositories.storageConfig);
    sendResponse(res, config, 'Current storage configuration');
  });

  const updateStorageConfig = asyncHandler(async (req: Request, res: Response) => {
    const { provider, credentials } = req.body;
    const updatedConfig = await updateStorageConfigU({ provider, credentials }, repositories.storageConfig);
    sendResponse(res, updatedConfig, 'Storage configuration updated');
  });

  return {
    getDashBoardDetails,
    getGraphDetails,
    getStorageConfig,
    updateStorageConfig
  };
};

export default adminController;
