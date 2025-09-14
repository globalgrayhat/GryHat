import { Response } from 'express';

/**
 * Unified HTTP response helpers.
 * - Always same shape: { status, message, data }
 * - status: 'success' | 'fail' | 'error'
 * - Keep controllers thin & consistent.
 */
type Payload<T> = { status: 'success'|'fail'|'error'; message: string; data?: T|null };

export const ok = <T>(res: Response, message: string, data?: T, code = 200): void => {
  res.status(code).json({ status: 'success', message, data } as Payload<T>);
};

export const created = <T>(res: Response, message: string, data?: T): void => {
  ok(res, message, data, 201);
};

export const fail = (res: Response, message: string, code = 400): void => {
  res.status(code).json({ status: 'fail', message, data: null } as Payload<null>);
};

export const err = (res: Response, message: string, code = 500): void => {
  res.status(code).json({ status: 'error', message, data: null } as Payload<null>);
};
