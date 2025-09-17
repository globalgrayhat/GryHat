<<<<<<< HEAD
import { ok, created, fail, err } from '../../shared/http/respond';
// src/adapters/controllers/paymentController.ts
import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';

// === Stripe use-cases (existing, unchanged) ===
import { createPaymentIntentU, getConfigU } from '../../app/usecases/payment/stripe';
import { PaymentServiceInterface } from '../../app/services/paymentServiceInterface';
import { PaymentServiceImpl } from '../../frameworks/services/paymentService';

// === Courses Repo (existing) ===
import { CourseDbRepositoryInterface } from '@src/app/repositories/courseDbRepository';
import { CourseRepositoryMongoDbInterface } from '@src/frameworks/database/mongodb/repositories/courseReposMongoDb';

// === MyFatoorah additions ===
import { myFatoorahServiceInterface } from '../../app/services/myFatoorahServiceInterface';
import { MyFatoorahServiceImpl, type PaymentMethodLabel } from '../../frameworks/services/myFatoorahService';
import { createMFInvoiceU, getMFStatusU, listMFMethodsU } from '../../app/usecases/payment/myfatoorah';

/** Narrow arbitrary input to PaymentMethodLabel (or undefined) */
const toPaymentMethodLabel = (v: unknown): PaymentMethodLabel | undefined => {
  if (v == null) return undefined;
  const s = String(v).toUpperCase().replace(/\s+/g, '');

  // Normalize common variants MyFatoorah shows like "Visa/Mastercard"
  if (s.includes('VISA')) return 'VISA';
  if (s.includes('MASTER')) return 'MASTER';

  // Direct matches
  const allowed: PaymentMethodLabel[] = [
    'KNET','VISA','MASTER','MADA','APPLEPAY','AMEX','BENEFIT','OMANNET','TABBY','TAMARA'
  ];
  return (allowed.includes(s as PaymentMethodLabel) ? (s as PaymentMethodLabel) : undefined);
};

=======
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

>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
const paymentController = (
  paymentServiceInterface: PaymentServiceInterface,
  paymentServiceImpl: PaymentServiceImpl,
  courseDbInterface: CourseDbRepositoryInterface,
<<<<<<< HEAD
  courseDbImpl: CourseRepositoryMongoDbInterface,

  // === New DI for MyFatoorah (adds flexibility without touching Stripe) ===
  mfServiceInterface = myFatoorahServiceInterface,
  mfServiceImpl: MyFatoorahServiceImpl = require('../../frameworks/services/myFatoorahService').myFatoorahService
) => {
  // Stripe wiring (unchanged)
  const paymentService = paymentServiceInterface(paymentServiceImpl());

  // Courses repo
  const dbRepositoryCourse = courseDbInterface(courseDbImpl());

  // MyFatoorah wiring
  const mfService = mfServiceInterface(mfServiceImpl());

  // ---------- Stripe endpoints (unchanged) ----------
  const getConfig = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const config = getConfigU(paymentService);
    return void ok(res, 'Successfully completed payment', config);
  });

  const createPaymentIntent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.body as { courseId: string };
    const response = await createPaymentIntentU(courseId, dbRepositoryCourse, paymentService);
    const { client_secret } = response;
    return void ok(res, 'Successfully completed payment', { clientSecret: client_secret });
  });

  // ---------- MyFatoorah endpoints (new) ----------
  const createMFInvoice = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const {
      courseId,
      methodLabel: rawLabel,
      customerName,
      customerEmail,
      customerMobile,
      studentId
    } = (req.body || {}) as {
      courseId: string;
      methodLabel?: string;
      customerName?: string;
      customerEmail?: string;
      customerMobile?: string;
      studentId?: string;
    };

    const methodLabel = toPaymentMethodLabel(rawLabel);

    const invoice = await createMFInvoiceU(
      courseId,
      dbRepositoryCourse,
      mfService,
      { methodLabel, customerName, customerEmail, customerMobile, studentId }
    );

    return void ok(res, 'MyFatoorah invoice created', { invoiceId: invoice.id, url: invoice.url, status: invoice.status });
  });

  const getMFStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { key, keyType } = (req.body || {}) as { key: string; keyType?: 'InvoiceId' | 'PaymentId' };
    const status = await getMFStatusU(key, mfService, keyType);
    return void ok(res, 'MyFatoorah status fetched', status);
  });

  const listMFMethods = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { courseId } = req.query as { courseId: string };
    const methods = await listMFMethodsU(courseId, dbRepositoryCourse, mfService);
    return void ok(res, 'MyFatoorah methods', methods);
  });

  // ---------- Optional: Unified entry point ----------
  const createPayment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { provider } = (req.body || {}) as { provider?: 'stripe' | 'myfatoorah' };

    if (provider === 'stripe') {
      const { courseId } = req.body as { courseId: string };
      const response = await createPaymentIntentU(courseId, dbRepositoryCourse, paymentService);
      return void ok(res, 'Stripe client secret created', { clientSecret: response.client_secret });
    }

    if (provider === 'myfatoorah') {
      const {
        courseId,
        methodLabel: rawLabel,
        customerName,
        customerEmail,
        customerMobile,
        studentId
      } = req.body as {
        courseId: string;
        methodLabel?: string;
        customerName?: string;
        customerEmail?: string;
        customerMobile?: string;
        studentId?: string;
      };

      const methodLabel = toPaymentMethodLabel(rawLabel);

      const invoice = await createMFInvoiceU(
        courseId,
        dbRepositoryCourse,
        mfService,
        { methodLabel, customerName, customerEmail, customerMobile, studentId }
      );
      return void ok(res, 'MyFatoorah invoice created', { invoiceId: invoice.id, url: invoice.url, status: invoice.status });
    }

    return void fail(res, 'Unknown provider', 400);
  });

  return {
    // Stripe
    getConfig,
    createPaymentIntent,

    // MyFatoorah
    createMFInvoice,
    getMFStatus,
    listMFMethods,

    // Unified (optional)
    createPayment
  };
};

export default paymentController;
=======
  courseDbImpl: CourseRepositoryMongoDbInterface
) => {
  const paymentService = paymentServiceInterface(paymentServiceImpl());
  const dbRepositoryCourse = courseDbInterface(courseDbImpl());

  const getConfig = asyncHandler(async (req: Request, res: Response) => {
    const config = getConfigU(paymentService);
    res.status(200).json({
      status: 'success',
      message: 'Successfully completed payment',
      data: config
    });
  });

  const createPaymentIntent = asyncHandler(
    async (req: Request, res: Response) => {
      const { courseId }: { courseId: string } = req.body;
      const response = await createPaymentIntentU(
        courseId,
        dbRepositoryCourse,
        paymentService
      );
      const { client_secret } = response;
      res.status(200).json({
        status: 'success',
        message: 'Successfully completed payment',
        data: {
          clientSecret: client_secret
        }
      });
    }
  );

  return {
    getConfig,
    createPaymentIntent
  };
};

export default paymentController;
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
