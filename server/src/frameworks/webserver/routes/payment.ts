import express from 'express';
import { paymentService } from '../../../frameworks/services/paymentService';
import { paymentServiceInterface } from '../../../app/services/paymentServiceInterface';
import paymentController from '../../../adapters/controllers/paymentController';
import { courseDbRepository } from '../../../app/repositories/courseDbRepository';
import { courseRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/courseReposMongoDb';

const paymentRouter = () => {
  const router = express.Router();
  const controller = paymentController(
    paymentServiceInterface,
    paymentService,
    courseDbRepository,
    courseRepositoryMongodb
  );

  /**
   * @swagger
   * tags:
   *   name: Payment
   *   description: Payment related endpoints
   */

  /**
   * @swagger
   * /api/payments/stripe/get-config:
   *   get:
   *     summary: Get Stripe payment configuration
   *     tags: [Payment]
   *     responses:
   *       200:
   *         description: Stripe config retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 publishableKey:
   *                   type: string
   *                   description: Stripe publishable key
   */
  router.get('/stripe/get-config', controller.getConfig);

  /**
   * @swagger
   * /api/payments/stripe/create-payment-intent:
   *   post:
   *     summary: Create a Stripe payment intent
   *     tags: [Payment]
   *     requestBody:
   *       description: Payment details for creating payment intent
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               amount:
   *                 type: number
   *                 description: Amount to charge in smallest currency unit (e.g. cents)
   *               currency:
   *                 type: string
   *                 description: Currency code (e.g. usd)
   *               metadata:
   *                 type: object
   *                 description: Optional metadata to attach to the payment
   *     responses:
   *       200:
   *         description: Payment intent created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 clientSecret:
   *                   type: string
   *                   description: The client secret for the created payment intent
   */
  router.post('/stripe/create-payment-intent', controller.createPaymentIntent);

  return router;
};

export default paymentRouter;
