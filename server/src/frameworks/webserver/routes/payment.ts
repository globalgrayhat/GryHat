import express from 'express';
import { paymentService } from '../../../frameworks/services/paymentService';
import { paymentServiceInterface } from '../../../app/services/paymentServiceInterface';
import paymentController from '../../../adapters/controllers/paymentController';
import { courseDbRepository } from '../../../app/repositories/courseDbRepository';
import { courseRepositoryMongodb } from '../../../frameworks/database/mongodb/repositories/courseReposMongoDb';

const router = express.Router();
const controller = paymentController(
  paymentServiceInterface,
  paymentService,
  courseDbRepository,
  courseRepositoryMongodb
);

/**
 * @swagger
 * /api/payments/stripe/config:
 *   get:
 *     tags: [Payments, Stripe]
 *     summary: Get Stripe publishable key
 *     description: Returns the Stripe publishable key to be used by the frontend.
 *     responses:
 *       200:
 *         description: Publishable key returned
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StripeConfigResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 */
// Stripe endpoints
router.get('/stripe/config', controller.getConfig);

/**
 * @swagger
 * /api/payments/stripe/create-payment-intent:
 *   post:
 *     tags: [Payments, Stripe]
 *     summary: Create Stripe PaymentIntent for a course
 *     description: Creates a Stripe PaymentIntent based on the course price and returns a clientSecret.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StripeCreateIntentRequest'
 *           examples:
 *             example-1:
 *               value:
 *                 courseId: "course_abc123"
 *     responses:
 *       200:
 *         description: PaymentIntent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/StripeCreateIntentResponse'
 *       400:
 *         description: Bad request (invalid courseId or course price)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 */
router.post('/stripe/create-payment-intent', controller.createPaymentIntent);

/**
 * @swagger
 * /api/payments/myfatoorah/create-invoice:
 *   post:
 *     tags: [Payments, MyFatoorah]
 *     summary: Create MyFatoorah invoice link for a course (KWD)
 *     description: >
 *       Creates a MyFatoorah invoice (SendPayment) for the given course and optionally constrains a specific method (e.g., KNET or VISA).  
 *       Currency defaults to KWD per platform requirement.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MFCreateInvoiceRequest'
 *           examples:
 *             knet:
 *               value:
 *                 courseId: "course_abc123"
 *                 methodLabel: "KNET"
 *                 customerName: "Ali Student"
 *                 customerEmail: "ali@example.com"
 *                 customerMobile: "+96550000000"
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MFCreateInvoiceResponse'
 *       400:
 *         description: Bad request (invalid courseId or course price)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 *       500:
 *         description: Internal server error from MyFatoorah or server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 */
// MyFatoorah endpoints
router.post('/myfatoorah/create-invoice', controller.createMFInvoice);

/**
 * @swagger
 * /api/payments/myfatoorah/status:
 *   post:
 *     tags: [Payments, MyFatoorah]
 *     summary: Get MyFatoorah payment status
 *     description: Fetches a normalized payment status using MyFatoorah GetPaymentStatus API.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MFStatusRequest'
 *           examples:
 *             by-invoice-id:
 *               value:
 *                 key: "123456789"
 *                 keyType: "InvoiceId"
 *             by-payment-id:
 *               value:
 *                 key: "pay_123456"
 *                 keyType: "PaymentId"
 *     responses:
 *       200:
 *         description: Status fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MFStatusResponse'
 *       400:
 *         description: Bad request (missing key)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 *       500:
 *         description: Internal server error from MyFatoorah or server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 */
router.post('/myfatoorah/status', controller.getMFStatus);

/**
 * @swagger
 * /api/payments/myfatoorah/methods:
 *   get:
 *     tags: [Payments, MyFatoorah]
 *     summary: List available MyFatoorah methods for a course price
 *     description: Returns a minimal list of payment methods (label + internal id) suitable for UI dropdowns.
 *     parameters:
 *       - in: query
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Course identifier
 *     responses:
 *       200:
 *         description: Methods list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MFMethodsResponse'
 *       400:
 *         description: Bad request (invalid courseId or course price)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 *       500:
 *         description: Internal server error from MyFatoorah or server
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 */
router.get('/myfatoorah/methods', controller.listMFMethods);

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     tags: [Payments]
 *     summary: Unified payment entrypoint (Stripe or MyFatoorah)
 *     description: >
 *       Creates a payment using the selected provider.  
 *       If provider = `stripe`, returns a Stripe clientSecret.  
 *       If provider = `myfatoorah`, returns a MyFatoorah invoice URL.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UnifiedCreateRequest'
 *           examples:
 *             stripe:
 *               summary: Stripe flow
 *               value:
 *                 provider: "stripe"
 *                 courseId: "course_abc123"
 *             myfatoorah-knet:
 *               summary: MyFatoorah KNET flow
 *               value:
 *                 provider: "myfatoorah"
 *                 courseId: "course_abc123"
 *                 methodLabel: "KNET"
 *                 customerName: "Ali Student"
 *                 customerEmail: "ali@example.com"
 *                 customerMobile: "+96550000000"
 *     responses:
 *       200:
 *         description: Payment created
 *         content:
 *           application/json:
 *             oneOf:
 *               - $ref: '#/components/schemas/UnifiedCreateResponseStripe'
 *               - $ref: '#/components/schemas/UnifiedCreateResponseMyFatoorah'
 *       400:
 *         description: Unknown provider or bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponseError'
 */
router.post('/create', controller.createPayment);

export default router;
