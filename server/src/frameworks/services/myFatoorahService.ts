import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import configKeys from '../../config';

type MFKeyType = 'InvoiceId' | 'PaymentId';
type CurrencyIso = 'KWD' | 'SAR' | 'AED' | 'USD' | 'EUR';

export type PaymentMethodLabel =
  | 'KNET'
  | 'VISA'
  | 'MASTER'
  | 'MADA'
  | 'APPLEPAY'
  | 'AMEX'
  | 'BENEFIT'
  | 'OMANNET'
  | 'TABBY'
  | 'TAMARA';

/** Minimal MyFatoorah types to keep the service strongly typed but lean */
export interface MFInitiatePaymentMethod {
  PaymentMethodId: number;
  PaymentMethodEn: string;     // e.g. "KNET", "Visa/Mastercard", etc.
  PaymentMethodAr?: string;
  IsDirectPayment?: boolean;
}

export interface MFInitiatePaymentData {
  PaymentMethods: MFInitiatePaymentMethod[];
}

export interface MFSendPaymentData {
  InvoiceId: number | string;
  InvoiceURL: string;
}

export interface MFGetPaymentStatusPayment {
  PaymentId?: string | number;
  PaymentStatus?: string; // e.g. "Paid", "Failed", "Pending"
}

export interface MFGetPaymentStatusData {
  InvoiceId: number | string;
  InvoiceStatus?: string; // e.g. "Paid", "Pending", "Failed"
  Payments?: MFGetPaymentStatusPayment[];
}

/** Result shape we expose to the app layer */
export interface MFCreateInvoiceResult {
  id: string;
  url: string;
  status: 'pending';
  rawResponse: MFSendPaymentData;
}

/** Lightweight error wrapper */
const formatAxiosError = (err: unknown) => {
  const axiosError = err as AxiosError;
  return (axiosError.response?.data as { Message?: string })?.Message || axiosError.message;
};

/** Build a single shared HTTP client */
const buildHttp = (): AxiosInstance => {
  const raw = (configKeys.MYFATOORAH_API_URL || '').trim();
  const noTrail = raw.replace(/\/+$/, '');
  const base = noTrail.endsWith('/v2') ? `${noTrail}/` : `${noTrail}/v2/`;

  if (!configKeys.MYFATOORAH_API_KEY) {
    throw new Error('MyFatoorah API Key is not configured.');
  }

  return axios.create({
    baseURL: base,
    headers: {
      Authorization: `Bearer ${configKeys.MYFATOORAH_API_KEY}`,
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json'
    }
  });
};

/** Format MyFatoorah expiry as yyyy-mm-ddThh:mm:ss in Kuwait TZ */
const formatMFExpiry = (minutesFromNow: number, tz: string, skewSeconds: number): string => {
  // NOTE: MF expects local time in specified tz; we approximate by formatting pieces here.
  const target = new Date(Date.now() + minutesFromNow * 60_000 + skewSeconds * 1_000);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(target);

  const get = (t: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === t)?.value ?? '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}`;
};

/** Small, reusable request helper to keep things DRY */
const mfRequest = async <T>(http: AxiosInstance, method: Method, url: string, data?: unknown, op = 'MyFatoorah API call'): Promise<T> => {
  try {
    const cfg: AxiosRequestConfig = { method, url, ...(data !== undefined ? { data } : {}) };
    const res = await http.request<{
      IsSuccess: boolean;
      Message: string;
      ValidationErrors?: unknown[];
      Data: T;
    }>(cfg);

    if (!res.data?.IsSuccess) throw new Error(`${op} failed: ${res.data?.Message}`);
    if (res.data?.Data == null) throw new Error(`${op} failed: 'Data' missing from response`);
    return res.data.Data;
  } catch (err) {
    throw new Error(`Failed to ${op}: ${formatAxiosError(err)}`);
  }
};

/**
 * Service factory — mirrors the Stripe service shape (factory returning methods),
 * but specialized for MyFatoorah. We DO NOT touch Stripe code.
 */
export const myFatoorahService = () => {
  const http = buildHttp();

  // Config knobs with sane defaults
  const ttlMinutes = Number(configKeys.MYFATOORAH_INVOICE_TTL_MINUTES || 30);
  const tz = configKeys.MYFATOORAH_TZ || 'Asia/Kuwait';
  const skew = Number(configKeys.MYFATOORAH_TTL_SKEW_SECONDS || 30);

  /** Get available methods dynamically for given amount/currency */
  const initiatePayment = async (amount: number, currency: CurrencyIso = 'KWD') => {
    // MyFatoorah requires InitiatePayment to fetch PaymentMethodId
    const payload = { InvoiceAmount: amount, CurrencyIso: currency };
    const data = await mfRequest<MFInitiatePaymentData>(http, 'post', 'InitiatePayment', payload, 'InitiatePayment');
    return data.PaymentMethods || [];
  };

  /** Find a PaymentMethodId by a human label (e.g., "KNET" or "Visa/Mastercard") */
  const pickMethodIdByLabel = async (amount: number, label: PaymentMethodLabel, currency: CurrencyIso = 'KWD') => {
    const methods = await initiatePayment(amount, currency);
    // Very forgiving match: contains label tokens
    const normalized = (s: string) => s.toUpperCase().replace(/\s+/g, '');
    const wanted = normalized(label);
    const found = methods.find((m) => normalized(m.PaymentMethodEn || '').includes(wanted));
    return found?.PaymentMethodId;
  };

  /** Create an invoice link (SendPayment). Optionally constrain specific PaymentMethodId(s). */
  const createInvoice = async (args: {
    amount: number;
    currency?: CurrencyIso;             // default 'KWD'
    clientReferenceId: string;          // course or order id
    description?: string;
    customerName?: string;
    customerEmail?: string;
    customerMobile?: string;
    paymentMethodLabel?: PaymentMethodLabel;   // e.g. 'KNET' or 'VISA'
    paymentMethodId?: number;                 // override explicit method id
  }): Promise<MFCreateInvoiceResult> => {
    const {
      amount,
      currency = 'KWD',
      clientReferenceId,
      description,
      customerName,
      customerEmail,
      customerMobile,
      paymentMethodLabel,
      paymentMethodId
    } = args;

    const ExpiryDate = formatMFExpiry(ttlMinutes, tz, skew);

    let methodId: number | undefined = paymentMethodId;
    if (!methodId && paymentMethodLabel) {
      methodId = await pickMethodIdByLabel(amount, paymentMethodLabel, currency);
      if (!methodId) throw new Error(`Payment method '${paymentMethodLabel}' not available for amount ${amount} ${currency}`);
    }

    const body: Record<string, unknown> = {
      NotificationOption: 'LNK',
      InvoiceValue: amount,
      CurrencyIso: currency,
      Language: 'AR',
      Description: description,
      ClientReferenceId: clientReferenceId,
      CallBackUrl: configKeys.MYFATOORAH_CALLBACK_URL,
      ErrorUrl: configKeys.MYFATOORAH_ERROR_URL,
      ExpiryDate
    };

    if (methodId) body.InvoicePaymentMethods = [methodId];
    if (customerName) body.CustomerName = customerName;
    if (customerEmail) body.CustomerEmail = customerEmail;
    if (customerMobile) body.CustomerMobile = customerMobile;

    const data = await mfRequest<MFSendPaymentData>(http, 'post', 'SendPayment', body, 'Create MyFatoorah payment');

    if (!data.InvoiceURL || !data.InvoiceId) throw new Error('Missing InvoiceURL or InvoiceId from MyFatoorah');

    return {
      id: String(data.InvoiceId),
      url: data.InvoiceURL,
      status: 'pending',
      rawResponse: data
    };
  };

  /** Unified status (GetPaymentStatus) */
  const getPaymentStatus = async (key: string, keyType: MFKeyType = 'InvoiceId') => {
    if (!key) throw new Error('Key is required');
    const data = await mfRequest<MFGetPaymentStatusData>(http, 'post', 'GetPaymentStatus', { Key: key, KeyType: keyType }, 'Get MyFatoorah payment status');

    const invoiceStatus = String(data.InvoiceStatus || '').toLowerCase();
    const payments = data.Payments || [];
    const anyPaid = payments.some((p) => String(p.PaymentStatus || '').toLowerCase() === 'paid');

    let outcome: 'paid' | 'failed' | 'pending' = 'pending';
    if (invoiceStatus === 'paid' || anyPaid) outcome = 'paid';
    else if (invoiceStatus === 'failed') outcome = 'failed';

    return {
      invoiceId: String(data.InvoiceId),
      outcome,
      raw: data
    };
  };

  const getPaymentStatusByPaymentId = async (paymentId: string) => getPaymentStatus(paymentId, 'PaymentId');

  // Surface a Stripe-like minimal API for symmetry (but dedicated to MF use-cases)
  return {
    initiatePayment,
    createInvoice,
    getPaymentStatus,
    getPaymentStatusByPaymentId
  };
};

export type MyFatoorahServiceImpl = typeof myFatoorahService;
