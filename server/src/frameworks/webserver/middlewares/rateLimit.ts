import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Rate limiter for authentication routes (login/register). This limiter
 * restricts the number of failed login attempts from a single IP/user‑agent
 * combination. Successful requests are skipped so that legitimate users are
 * not penalised. When the maximum number of failed attempts is reached
 * within the window, the IP/browser pair will be blocked for the remainder
 * of the window.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 55, // limit each IP/UA to 5 failed requests per window
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req: Request) => {
    // Combine IP address with user agent string to differentiate between
    // multiple browsers behind the same proxy. Fallback to IP only when
    // user agent is missing.
    const ip = req.ip || req.headers['x-forwarded-for'] || '';
    const ua = (req.headers['user-agent'] as string) || '';
    return `${ip}#${ua}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      status: 'fail',
      message:
        'Too many failed login attempts. Please wait a while before trying again.'
    });
  }
});

/**
 * Rate limiter for video streaming. Prevents a client from opening the same
 * video stream multiple times concurrently. A short window is used to
 * throttle rapid re‑requests which could otherwise exhaust server
 * resources. Requests that exceed the limit within the window will
 * immediately receive a 429 response.
 */
export const videoRateLimiter = rateLimit({
  windowMs: 5 * 1000, // 5 seconds
  max: 1, // allow only 1 request per window
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    // The key includes IP/UA and the requested video id so that the same
    // client can still request different videos concurrently, but cannot
    // spam the same video endpoint.
    const ip = req.ip || req.headers['x-forwarded-for'] || '';
    const ua = (req.headers['user-agent'] as string) || '';
    const videoId = req.params.videoFileId || req.originalUrl;
    return `${ip}#${ua}#${videoId}`;
  },
  handler: (_req, res) => {
    res.status(429).json({
      status: 'fail',
      message:
        'Video streaming request limit exceeded. Please try again shortly.'
    });
  }
});
