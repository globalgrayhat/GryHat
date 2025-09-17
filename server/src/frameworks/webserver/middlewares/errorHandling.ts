import { NextFunction, Request, Response } from 'express';
import AppError from '../../../utils/appError';
<<<<<<< HEAD
import HttpStatusCodes from '../../../constants/HttpStatusCodes';
import { err as respondErr, fail as respondFail } from '../../../shared/http/respond';

/**
 * Centralized error handler.
 * Always returns unified payload shape: { status, message, data }
 */
const errorHandlingMiddleware = (
  error: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const err: AppError & { code?: number; keyValue?: Record<string, any> } = error;

  // Normalize defaults
  err.statusCode = (err as any).statusCode || 500;
  err.status = (err as any).status || 'error';

  // Duplicate key (Mongo)
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'unknown';
    return respondFail(res, `Duplicate value for ${field}`, HttpStatusCodes.BAD_REQUEST);
  }

  // Validation errors thrown manually as AppError with 400
  if (err.statusCode === HttpStatusCodes.BAD_REQUEST) {
    return respondFail(res, err.message || 'Bad request', HttpStatusCodes.BAD_REQUEST);
  }

  // Not found
  if (err.statusCode === HttpStatusCodes.NOT_FOUND) {
    return respondFail(res, err.message || 'Resource not found', HttpStatusCodes.NOT_FOUND);
  }

  // Unauthorized / Forbidden etc.
  if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
    return respondFail(res, err.message || 'Request failed', err.statusCode);
  }

  // Fallback 500
  return respondErr(res, err.message || 'Internal server error', HttpStatusCodes.INTERNAL_SERVER_ERROR);
=======

const errorHandlingMiddleware = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (err.name === 'MongoServerError') {
    const field = Object.keys(err.keyValue)[0];
    if (field === 'mobile') {
      res.status(409).json({
        status: 'error',
        message: 'Mobile already exists',
      });
    } else {
      res.status(409).json({
        status: 'error',
        message: 'Duplicate key error',
        error: err.keyValue,
      });
    }
  } else if (err.statusCode === 404) {
    res
      .status(err.statusCode)
      .json({ errors: err.status, message: err.message });
  } else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export default errorHandlingMiddleware;
