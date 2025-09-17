import configKeys from '../../../config';
import { createClient } from 'redis';

<<<<<<< HEAD
/**
 * Safe Redis connection factory.
 * - Uses REDIS_URL if present (and username/password when provided).
 * - If REDIS_DISABLE=true or no URL, it falls back to an in‑memory cache with the
 *   same minimal surface (get/set/setEx/del).
 * - If a NOAUTH/WRONGPASS error occurs at runtime, we auto‑fallback to memory.
 */
const connection = () => {
  type MinimalRedis = {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<'OK' | null>;
    setEx: (key: string, ttlSec: number, value: string) => Promise<'OK' | null>;
    del: (...keys: string[]) => Promise<number>;
    on?: (event: string, cb: (...args: any[]) => void) => void;
    connect?: () => Promise<void>;
    quit?: () => Promise<void>;
  };

  const memoryClient = (): MinimalRedis => {
    const store = new Map<string, { v: string; t?: NodeJS.Timeout }>();

    const set = async (key: string, value: string) => {
      const old = store.get(key);
      if (old?.t) clearTimeout(old.t);
      store.set(key, { v: value });
      return 'OK' as const;
    };
    const setEx = async (key: string, ttlSec: number, value: string) => {
      const old = store.get(key);
      if (old?.t) clearTimeout(old.t);
      const t = setTimeout(() => store.delete(key), ttlSec * 1000).unref?.();
      store.set(key, { v: value, t: t as any });
      return 'OK' as const;
    };
    const get = async (key: string) => store.get(key)?.v ?? null;
    const del = async (...keys: string[]) => {
      let c = 0;
      for (const k of keys) if (store.delete(k)) c++;
      return c;
    };
    return { get, set, setEx, del };
  };

  const wrapWithAutoFallback = (client: any): MinimalRedis => {
    const mem = memoryClient();
    let fallback = String(process.env.REDIS_FORCE_MEMORY || configKeys.REDIS_DISABLE || '').toLowerCase() === 'true';

    const guard = async <T>(fn: () => Promise<T>, fb: () => Promise<T>) => {
      if (fallback) return fb();
      try {
        return await fn();
      } catch (err: any) {
        const msg = String(err?.message || err);
        if (/NOAUTH|WRONGPASS/i.test(msg)) {
          console.warn('\x1b[33m%s\x1b[0m', '[Redis] Auth error → switching to in‑memory cache');
          fallback = true;
          return fb();
        }
        throw err;
      }
    };

    return {
      get: (k) => guard(() => client.get(k), () => mem.get(k)),
      set: (k, v) => guard(() => client.set(k, v), () => mem.set(k, v)),
      setEx: (k, ttl, v) => guard(() => client.setEx(k, ttl, v), () => mem.setEx(k, ttl, v)),
      del: (...keys) => guard(() => client.del(...keys), () => mem.del(...keys)),
      on: client.on?.bind(client),
      connect: client.connect?.bind(client),
      quit: client.quit?.bind(client)
    };
  };

  const createRedisClient = (): MinimalRedis => {
    // If disabled or URL missing, use memory client.
    const disabled = String(configKeys.REDIS_DISABLE || '').toLowerCase() === 'true';
    if (disabled || !configKeys.REDIS_URL) {
      console.log('\x1b[36m%s\x1b[0m', '[Redis] Disabled or no URL → using in‑memory cache');
      return memoryClient();
    }

    const client = createClient({
      url: configKeys.REDIS_URL,
      username: (configKeys as any).REDIS_USERNAME,
      password: (configKeys as any).REDIS_PASSWORD,
    });

    client.on('error', (err) => console.error('\x1b[31m%s\x1b[0m', 'Redis Client Error:', err));
    client.connect()
      .then(() => console.log('\x1b[42m\x1b[30m%s\x1b[0m', 'Redis connected successfully'))
      .catch((err) => console.error('\x1b[31m\x1b[1m%s\x1b[0m', 'Redis connection failed:', err));

    return wrapWithAutoFallback(client);
  };

  return { createRedisClient };
=======
const connection = () => {
  const createRedisClient = () => {
    const client = createClient({
      url: configKeys.REDIS_URL,
    });

    client.on('error', err => 
      console.error("\x1b[31m%s\x1b[0m", 'Redis Client Error:', err)
    );

    client.connect()
      .then(() => {
        console.log("\x1b[41m\x1b[1m%s\x1b[0m", 'Redis connected successfully'); // background red + bold
      })
      .catch((err) => {
        console.error("\x1b[31m\x1b[1m%s\x1b[0m", 'Redis connection failed:', err); // red + bold
      });

    return client;
  };

  return {
    createRedisClient,
  };
>>>>>>> 3e27a7a (نسخة نظيفة بكودي فقط)
};

export default connection;
