import configKeys from '../../../config';
import { createClient } from 'redis';

/**
 * Redis connection factory (singleton) with safe fallbacks.
 *
 * - Uses REDIS_URL (and optional username/password) when available.
 * - If REDIS_DISABLE=true OR no REDIS_URL → uses an in-memory Map that mimics a
 *   minimal Redis surface (get/set/setEx/del/expire).
 * - On runtime auth/connection errors (NOAUTH/WRONGPASS/ECONNREFUSED),
 *   wrapper automatically falls back to the in-memory cache.
 * - Singleton: multiple calls to `connection().createRedisClient()` return
 *   the SAME instance, avoiding repeated connections and logs.
 */

type MinimalRedis = {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string) => Promise<string | null>;
  setEx: (key: string, ttlSec: number, value: string) => Promise<string | null>;
  del: (...keys: string[]) => Promise<number>;
  expire?: (key: string, ttlSec: number) => Promise<number>;
  on?: (event: string, cb: (...args: any[]) => void) => void;
  connect?: () => Promise<void>;
  quit?: () => Promise<string | void>;
};

// ---------------- In-memory lightweight “Redis” ----------------

const memoryClient = (): MinimalRedis => {
  // value + optional TTL timer handle
  const store = new Map<string, { v: string; t?: NodeJS.Timeout }>();

  const clearT = (key: string) => {
    const it = store.get(key);
    if (it?.t) {
      clearTimeout(it.t);
      it.t = undefined;
    }
  };

  const set = async (key: string, value: string) => {
    clearT(key);
    store.set(key, { v: value });
    return 'OK' as const;
  };

  const setEx = async (key: string, ttlSec: number, value: string) => {
    clearT(key);
    const timer = setTimeout(() => store.delete(key), ttlSec * 1000);
    // Don’t keep the event loop alive because of timers
    (timer as any)?.unref?.();
    store.set(key, { v: value, t: timer });
    return 'OK' as const;
  };

  const expire = async (key: string, ttlSec: number) => {
    if (!store.has(key)) return 0;
    const cur = store.get(key)!;
    clearT(key);
    const timer = setTimeout(() => store.delete(key), ttlSec * 1000);
    (timer as any)?.unref?.();
    store.set(key, { v: cur.v, t: timer });
    return 1;
  };

  const get = async (key: string) => store.get(key)?.v ?? null;

  const del = async (...keys: string[]) => {
    let c = 0;
    for (const k of keys) c += store.delete(k) ? 1 : 0;
    return c;
  };

  return { get, set, setEx, del, expire };
};

// --------------- Wrapper with auto-fallback to memory ---------------

/**
 * NOTE: We accept the concrete client type via `ReturnType<typeof createClient>`
 * to avoid TS conflicts between duplicated type declarations across packages.
 */
const wrapWithAutoFallback = (client: ReturnType<typeof createClient>): MinimalRedis => {
  const mem = memoryClient();

  // Start in fallback mode if explicitly disabled
  let fallback =
    String(process.env.REDIS_FORCE_MEMORY || configKeys.REDIS_DISABLE || '')
      .toLowerCase() === 'true';

  const shouldFallback = (err: unknown) => {
    const msg = String((err as any)?.message || err || '');
    return (
      /NOAUTH|WRONGPASS/i.test(msg) ||                // bad auth
      /ECONNREFUSED|ENOTFOUND|EAI_AGAIN/i.test(msg)   // conn/DNS failures
    );
  };

  const guard = async <T>(fn: () => Promise<T>, fb: () => Promise<T>) => {
    if (fallback) return fb();
    try {
      return await fn();
    } catch (err) {
      if (shouldFallback(err)) {
        console.warn(
          '\x1b[33m%s\x1b[0m',
          '[Redis] Error detected → switching to in-memory cache'
        );
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
    // pass array form to match v4 types
    del: (...keys) => guard(() => client.del(keys as any), () => mem.del(...keys)),
    // ✅ no non-null assertion; always return number (1|0)
    expire: (k, ttl) =>
      guard<number>(
        () => client.expire(k, ttl).then(res => (res ? 1 : 0)),  // Convert boolean to number
        () => mem.expire ? mem.expire(k, ttl) : Promise.resolve(0)
      ),
    on: client.on.bind(client),
    connect: client.connect.bind(client),
    quit: client.quit.bind(client),
  };
};

// ---------------- Singleton management (module-level) ----------------

let cachedClient: MinimalRedis | null = null;                  // Public surface used by app
let realRedis: ReturnType<typeof createClient> | null = null;  // Underlying redis client
let connectedLogged = false;                                   // Avoid duplicate logs

const buildRealClient = (): ReturnType<typeof createClient> => {
  const client = createClient({
    url: configKeys.REDIS_URL,
    // Optional if you use ACLs
    username: (configKeys as any).REDIS_USERNAME,
    password: (configKeys as any).REDIS_PASSWORD,
  });

  client.on('error', (err) =>
    console.error('\x1b[31m%s\x1b[0m', 'Redis Client Error:', err)
  );

  client.on('connect', () => {
    if (!connectedLogged) {
      console.log('\x1b[42m\x1b[30m%s\x1b[0m', 'Redis connected successfully');
      connectedLogged = true;
    }
  });

  // Connect once; additional calls to createRedisClient reuse the same instance
  client
    .connect()
    .catch((err) =>
      console.error('\x1b[31m\x1b[1m%s\x1b[0m', 'Redis connection failed:', err)
    );

  return client;
};

// ---------------- Public factory (keeps existing call-site shape) ----------------

const connection = () => {
  const createRedisClient = (): MinimalRedis => {
    // If we already created a client (real or memory), return it (singleton).
    if (cachedClient) return cachedClient;

    const disabled =
      String(configKeys.REDIS_DISABLE || '').toLowerCase() === 'true';
    const noUrl = !configKeys.REDIS_URL;

    if (disabled || noUrl) {
      console.log(
        '\x1b[36m%s\x1b[0m',
        '[Redis] Disabled or no URL → using in-memory cache'
      );
      cachedClient = memoryClient();
      return cachedClient;
    }

    // Create underlying redis once, wrap with auto-fallback, cache and return.
    realRedis = realRedis ?? buildRealClient();
    cachedClient = wrapWithAutoFallback(realRedis);
    return cachedClient;
  };

  return { createRedisClient };
};

export default connection;
export type { MinimalRedis };
