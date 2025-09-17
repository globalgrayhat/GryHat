<<<<<<< HEAD
// Which provider processed the payment
export type PaymentProvider = 'stripe' | 'myfatoorah';

// Normalized payment method across providers
// - Stripe: we usually treat it as 'card'
// - MyFatoorah: map labels like KNET/VISA/... to lowercased keys
export type PaymentMethod =
  | 'card'           // Stripe generic
  | 'knet'
  | 'visa'
  | 'master'
  | 'mada'
  | 'applepay'
  | 'amex'
  | 'benefit'
  | 'omannet'
  | 'tabby'
  | 'tamara'
  | 'unknown';

// Persisted payment record
export interface PaymentInfo {
  provider: PaymentProvider;   // REQUIRED to avoid ambiguity
  courseId: string;
  studentId: string;
  paymentId?: string;
  amount: number;              // major units (e.g., KWD)
  currency: string;            // e.g., 'KWD'
  payment_method: PaymentMethod;
  status: string;              // e.g., 'succeeded' | 'paid' | 'pending' | 'failed'
}
=======
export interface PaymentInfo {
    courseId:string;
    studentId:string;
    paymentId?:string;
    amount: number;
    currency: string;
    payment_method: string;
    status: string;
  }
  
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
