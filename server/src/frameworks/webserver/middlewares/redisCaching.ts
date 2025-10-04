import { NextFunction, Response } from 'express';
import { CustomRequest } from '@src/types/customRequest';

// Lightweight shape of what we need from Redis
type RedisLike = {
  get(key: string): Promise<string | null>;
  set?(key: string, value: string, opts?: any): Promise<unknown>;
  expire?(key: string, seconds: number): Promise<unknown>;
};

export function cachingMiddleware(redisClient?: RedisLike, keyPrefix = 'cache:') {
  return async function (req: CustomRequest, res: Response, next: NextFunction) {
    try {
      if (!redisClient) return next();

      const { search, filter } = req.query as { search?: string; filter?: string };
      const keyPart =
        search ?? filter ?? req.user?.Id ?? req.originalUrl; // robust fallback
      if (!keyPart) return next();

      const cacheKey = `${keyPrefix}${keyPart}`;
      const data = await redisClient.get(cacheKey);
      if (!data) return next();

      res.json({ data: JSON.parse(data) });
    } catch {
      // Fail-open on cache errors
      next();
    }
  };
}
