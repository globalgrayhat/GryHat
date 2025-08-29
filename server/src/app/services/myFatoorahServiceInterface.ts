import { MyFatoorahServiceImpl } from '../../frameworks/services/myFatoorahService';

export const myFatoorahServiceInterface = (service: ReturnType<MyFatoorahServiceImpl>) => {
  // Keep it thin; forward-only. This preserves testability and DI.
  const initiatePayment = (amount: number, currency: 'KWD' | 'SAR' | 'AED' | 'USD' | 'EUR' = 'KWD') =>
    service.initiatePayment(amount, currency);

  const createInvoice = (args: Parameters<ReturnType<MyFatoorahServiceImpl>['createInvoice']>[0]) =>
    service.createInvoice(args);

  const getPaymentStatus = (key: string, keyType: 'InvoiceId' | 'PaymentId' = 'InvoiceId') =>
    service.getPaymentStatus(key, keyType);

  const getPaymentStatusByPaymentId = (paymentId: string) =>
    service.getPaymentStatusByPaymentId(paymentId);

  return { initiatePayment, createInvoice, getPaymentStatus, getPaymentStatusByPaymentId };
};

export type MyFatoorahServiceInterface = typeof myFatoorahServiceInterface;
