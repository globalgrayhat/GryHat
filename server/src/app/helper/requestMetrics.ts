/**
 * A simple in‑memory store for collecting metrics about HTTP request
 * durations. Each entry in the map uses the HTTP method and route path as
 * the key (for example "GET /api/auth/student-login"). When a request
 * completes the monitor middleware records its duration by calling
 * `recordRequest`. Use `getMetrics` to retrieve a snapshot of the
 * statistics for all observed routes. Note: this store is not persisted
 * beyond the lifetime of the Node.js process.
 */

interface RouteMetrics {
  totalRequests: number;
  totalDurationMs: number;
  maxDurationMs: number;
  minDurationMs: number;
  slowRequests: number;
}

const metricsStore: Map<string, RouteMetrics> = new Map();

/**
 * Record the duration of a completed HTTP request. Slow requests are
 * identified using the same threshold defined in the request monitor
 * middleware. Aggregated statistics are updated in the store.
 *
 * @param key A unique identifier for the route (method + path)
 * @param duration The duration of the request in milliseconds
 * @param isSlow Whether the request exceeded the configured slow threshold
 */
export function recordRequest(
  key: string,
  duration: number,
  isSlow: boolean
) {
  const metrics = metricsStore.get(key) ?? {
    totalRequests: 0,
    totalDurationMs: 0,
    maxDurationMs: 0,
    minDurationMs: Number.POSITIVE_INFINITY,
    slowRequests: 0
  };
  metrics.totalRequests += 1;
  metrics.totalDurationMs += duration;
  metrics.maxDurationMs = Math.max(metrics.maxDurationMs, duration);
  metrics.minDurationMs = Math.min(metrics.minDurationMs, duration);
  if (isSlow) {
    metrics.slowRequests += 1;
  }
  metricsStore.set(key, metrics);
}

/**
 * Retrieve a snapshot of the recorded metrics. Each route key is mapped to
 * an object containing aggregated information about that route. Average
 * duration is calculated on demand. A copy of the internal data is
 * returned to avoid accidental modification of the underlying store.
 */
export function getMetrics() {
  const result: Record<string, RouteMetrics & { averageDurationMs: number }> = {};
  for (const [key, value] of metricsStore.entries()) {
    result[key] = {
      ...value,
      averageDurationMs: value.totalDurationMs / value.totalRequests
    };
  }
  return result;
}