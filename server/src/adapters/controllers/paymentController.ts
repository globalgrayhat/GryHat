import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import {
  createPaymentIntentU,
  getConfigU
} from '../../app/usecases/payment/stripe';
import { PaymentServiceInterface } from '../../app/services/paymentServiceInterface';
import { PaymentServiceImpl } from '../../frameworks/services/paymentService';
import { CourseDbRepositoryInterface } from '@src/app/repositories/courseDbRepository';
import { CourseRepositoryMongoDbInterface } from '@src/frameworks/database/mongodb/repositories/courseReposMongoDb';

const paymentController = (
  paymentServiceInterface: PaymentServiceInterface,
  paymentServiceImpl: PaymentServiceImpl,
  courseDbInterface: CourseDbRepositoryInterface,
  courseDbImpl: CourseRepositoryMongoDbInterface
) => {
  const paymentService = paymentServiceInterface(paymentServiceImpl());
  const dbRepositoryCourse = courseDbInterface(courseDbImpl());

  /**
   * Unified response sender to avoid repetitive response formatting.
   *
   * @param res Express Response object
   * @param data Data to send in response
   * @param message Optional response message (default: 'Success')
   * @param statusCode HTTP status code (default: 200)
   */
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

  // Get payment configuration (e.g., Stripe config)
  const getConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = getConfigU(paymentService);
    sendResponse(res, config, 'Successfully retrieved payment configuration');
  });

  // Create a payment intent for a specific course
  const createPaymentIntent = asyncHandler(async (req: Request, res: Response) => {
    const { courseId }: { courseId: string } = req.body;
    const response = await createPaymentIntentU(
      courseId,
      dbRepositoryCourse,
      paymentService
    );
    const { client_secret } = response;

    sendResponse(res, { clientSecret: client_secret }, 'Payment intent created successfully');
  });

  return {
    getConfig,
    createPaymentIntent
  };
};

export default paymentController;
