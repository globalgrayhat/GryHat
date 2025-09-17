import { CourseDbRepositoryInterface } from '../../repositories/courseDbRepository';
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import AppError from '../../../utils/appError';
import { PaymentInterface } from '@src/app/repositories/paymentDbRepository';
<<<<<<< HEAD
import { PaymentInfo, PaymentMethod, PaymentProvider } from '@src/types/payment';

/** Decide provider from incoming blob without touching Stripe code */
const resolveProvider = (info: any): PaymentProvider => {
  // 1) explicit wins
  if (info?.provider === 'stripe' || info?.provider === 'myfatoorah') return info.provider;

  // 2) Stripe PaymentIntent usually starts with "pi_"
  if (typeof info?.id === 'string' && /^pi_/i.test(info.id)) return 'stripe';

  // 3) Labels hint MyFatoorah
  const mfLabels = ['KNET','VISA','MASTER','MADA','APPLEPAY','AMEX','BENEFIT','OMANNET','TABBY','TAMARA'];
  if (mfLabels.includes(String(info?.payment_method || '').toUpperCase())) return 'myfatoorah';

  // 4) Currency heuristic: KWD -> MyFatoorah
  if (String(info?.currency || '').toUpperCase() === 'KWD') return 'myfatoorah';

  // 5) Fallback to Stripe
  return 'stripe';
};

/** Normalize to our PaymentMethod union */
const mapToPaymentMethod = (provider: PaymentProvider, rawMethod: any): PaymentMethod => {
  const v = String(rawMethod || '').trim().toUpperCase();

  if (provider === 'stripe') {
    // Stripe is typically "card" for our storage
    return 'card';
  }

  // MyFatoorah labels mapping (case-insensitive)
  switch (v) {
    case 'KNET': return 'knet';
    case 'VISA': return 'visa';
    case 'MASTER':
    case 'MASTERCARD': return 'master';
    case 'MADA': return 'mada';
    case 'APPLEPAY': return 'applepay';
    case 'AMEX': return 'amex';
    case 'BENEFIT': return 'benefit';
    case 'OMANNET': return 'omannet';
    case 'TABBY': return 'tabby';
    case 'TAMARA': return 'tamara';
    default: return 'unknown';
  }
};

/** Normalize amount to major units.
 *  Stripe sends minor units (cents) -> divide by 100.
 *  MyFatoorah uses major units already.
 */
const normalizeAmount = (provider: PaymentProvider, rawAmount: unknown): number => {
  const n = Number(rawAmount);
  if (!Number.isFinite(n) || n <= 0) {
    throw new AppError('Invalid payment amount', HttpStatusCodes.BAD_REQUEST);
  }
  return provider === 'stripe' ? n / 100 : n;
};

/** Pick a useful payment id from various shapes (Stripe/MF) */
const pickPaymentId = (info: any): string | undefined => {
  return (
    info?.id ??          // Stripe PaymentIntent id
    info?.paymentId ??   // generic
    info?.invoiceId ??   // possible MF naming
    info?.InvoiceId ??   // possible MF raw casing
    undefined
  );
};
=======
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)

export const enrollStudentU = async (
  courseId: string,
  studentId: string,
  paymentInfo: any,
  courseDbRepository: ReturnType<CourseDbRepositoryInterface>,
  paymentDbRepository: ReturnType<PaymentInterface>
) => {
  if (!courseId) {
<<<<<<< HEAD
    throw new AppError('Please provide course details', HttpStatusCodes.BAD_REQUEST);
  }
  if (!studentId) {
    throw new AppError('Please provide valid student details', HttpStatusCodes.BAD_REQUEST);
  }

  const course = await courseDbRepository.getCourseById(courseId);

  if (course?.isPaid) {
    // 1) provider
    const provider: PaymentProvider = resolveProvider(paymentInfo);

    // 2) amount (major), currency (upper), method (union), status (string)
    const amount = normalizeAmount(provider, paymentInfo?.amount);
    const currency = String(paymentInfo?.currency || 'KWD').toUpperCase();
    const payment_method: PaymentMethod = mapToPaymentMethod(provider, paymentInfo?.payment_method);
    const status = String(paymentInfo?.status || 'pending');

    // 3) choose a good id
    const paymentId = pickPaymentId(paymentInfo);

    // 4) build strong PaymentInfo
    const payment: PaymentInfo = {
      provider,
      paymentId,
      courseId,
      studentId,
      amount,
      currency,
      payment_method,
      status
    };

=======
    throw new AppError(
      'Please provide course details',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  if (!studentId) {
    throw new AppError(
      'Please provide valid student details',
      HttpStatusCodes.BAD_REQUEST
    );
  }
  const course = await courseDbRepository.getCourseById(courseId);
  if (course?.isPaid) {
    const payment = {
      paymentId: paymentInfo.id,
      courseId: courseId,
      studentId: studentId,
      amount: paymentInfo.amount / 100,
      currency: paymentInfo.currency,
      payment_method: paymentInfo.payment_method,
      status: paymentInfo.status
    };
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
    await Promise.all([
      courseDbRepository.enrollStudent(courseId, studentId),
      paymentDbRepository.savePayment(payment)
    ]);
  } else {
    await courseDbRepository.enrollStudent(courseId, studentId);
  }
};
