import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import { MyFatoorahServiceInterface } from '../../services/myFatoorahServiceInterface';
import type { PaymentMethodLabel } from '../../../frameworks/services/myFatoorahService';

/**
 * Creates a MyFatoorah invoice link for a course purchase.
 * Allows selecting a specific MF method (e.g., 'KNET' or 'VISA') or using dynamic best fit.
 */
export const createMFInvoiceU = async (
  courseId: string,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  mfService: ReturnType<MyFatoorahServiceInterface>,
  opts?: {
    methodLabel?: PaymentMethodLabel;    // 'KNET' | 'VISA' | ...
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
    studentId?: string;                  // to stitch student with invoice if needed
  }
) => {
  if (!courseId) {
    throw new AppError('Please provide a valid courseId', HttpStatusCodes.BAD_REQUEST);
  }

  const amountRow = await courseDbRepository.getAmountByCourseId(courseId);
  if (!amountRow?.price) {
    throw new AppError('There is something wrong with the course', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }

  const amount = Number(amountRow.price);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new AppError('Invalid course price', HttpStatusCodes.BAD_REQUEST);
  }

  // Currency is KWD (per requirement)
  const currency = 'KWD' as const;

  const invoice = await mfService.createInvoice({
    amount,
    currency,
    clientReferenceId: courseId, // you may switch to an orderId if you have one
    description: `Course purchase: ${courseId}`,
    customerName: opts?.customerName,
    customerEmail: opts?.customerEmail,
    customerMobile: opts?.customerMobile,
    paymentMethodLabel: opts?.methodLabel // e.g., 'KNET' or 'VISA'
  });

  return invoice; // { id, url, status: 'pending', rawResponse }
};

/** Pulls a normalized status for a given MF key (InvoiceId by default) */
export const getMFStatusU = async (
  key: string,
  mfService: ReturnType<MyFatoorahServiceInterface>,
  keyType: 'InvoiceId' | 'PaymentId' = 'InvoiceId'
) => {
  if (!key) {
    throw new AppError('Key is required', HttpStatusCodes.BAD_REQUEST);
  }
  return mfService.getPaymentStatus(key, keyType); // { invoiceId, outcome, raw }
};

/** Optional: list MF payment methods dynamically for UI dropdowns (KNET / Visa / ...). */
export const listMFMethodsU = async (
  courseId: string,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  mfService: ReturnType<MyFatoorahServiceInterface>
) => {
  const amountRow = await courseDbRepository.getAmountByCourseId(courseId);
  if (!amountRow?.price) {
    throw new AppError('There is something wrong with the course', HttpStatusCodes.INTERNAL_SERVER_ERROR);
  }
  const methods = await mfService.initiatePayment(Number(amountRow.price), 'KWD');
  return methods.map((m) => ({
    id: m.PaymentMethodId,
    label: m.PaymentMethodEn
  }));
};
