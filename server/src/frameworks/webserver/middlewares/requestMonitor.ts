import { NextFunction, Request, Response } from 'express';

/**
 * Middleware that records the time taken for each HTTP request. When the
 * response finishes, it calculates the duration and logs it to stdout. If the
 * request takes longer than a predefined threshold, a warning is emitted. Use
 * this middleware early in the middleware stack to capture as much of the
 * processing time as possible. This function does not interfere with the
 * response flow.
 */
const LONG_REQUEST_THRESHOLD_MS = 1000; // 1 second

export const requestMonitorMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;
    const message = `${req.method} ${req.originalUrl} - ${durationMs.toFixed(
      2
    )}ms`;
    if (durationMs > LONG_REQUEST_THRESHOLD_MS) {
      console.warn(`Slow request detected: ${message}`);
    } else {
      console.log(message);
    }
  });

  next();
};

export default requestMonitorMiddleware;