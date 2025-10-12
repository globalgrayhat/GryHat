import HttpStatusCodes from '../../constants/HttpStatusCodes';
import { Response } from 'express';

/**
 * Unified HTTP response helpers.
 * - Always same shape: { status, message, data }
 * - status: 'success' | 'fail' | 'error'
 * - Keep controllers thin & consistent.
 */
type Payload<T> = { 
  status: 'success' | 'fail' | 'error' | 'info' | 'notification'; 
  message: string; 
  data?: T | null;
};

export const ok = <T>(res: Response, message: string, data?: T, code = HttpStatusCodes.OK): void => {
  res.status(code).json({ status: 'success', message, data: data ?? null } as Payload<T>);
};

export const info = <T>(res: Response, message: string, data?: T, code = HttpStatusCodes.OK): void => {
  res.status(code).json({ status: 'info', message, data: data ?? null } as Payload<T>);
};

export const notification = <T>(res: Response, message: string, data?: T, code = HttpStatusCodes.OK): void => {
  res.status(code).json({ status: 'notification', message, data: data ?? null } as Payload<T>);
};

export const created = <T>(res: Response, message: string, data?: T): void => {
  ok(res, message, data, HttpStatusCodes.CREATED);
};

export const fail = (res: Response, message: string, code = HttpStatusCodes.BAD_REQUEST): void => {
  res.status(code).json({ status: 'fail', message, data: null } as Payload<null>);
};

export const err = (res: Response, message: string, code = HttpStatusCodes.INTERNAL_SERVER_ERROR): void => {
  res.status(code).json({ status: 'error', message, data: null } as Payload<null>);
};