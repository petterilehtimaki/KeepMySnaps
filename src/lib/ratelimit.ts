/**
 * A small sliding-window limiter for the two routes that cost money.
 *
 * `/api/checkout` creates a Stripe session on every call and `/api/contact`
 * sends real email through an account with a monthly allowance and a person's
 * name on it. Neither took any convincing to do it again, so a loop could run
 * up a bill or burn the sending reputation while nobody was watching.
 *
 * The counters live in memory, which means each server instance keeps its own.
 * That is imperfect and deliberately so: the alternative is a database round
 * trip on the path of every checkout, to defend against something that has
 * never happened. This stops a loop from one machine, which is the realistic
 * case, and costs nothing. If it ever needs to be exact, the place to put it
 * is the edge rather than here.
 */

type Window = { count: number; resetAt: number };

const windows = new Map<string, Window>();

/** Stop the map growing forever on a long-lived instance. */
function sweep(now: number): void {
  if (windows.size < 5_000) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export type RateLimit = {
  allowed: boolean;
  /** Seconds until the window resets, for the Retry-After header. */
  retryAfter: number;
};

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now(),
): RateLimit {
  sweep(now);

  const existing = windows.get(key);
  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  return { allowed: existing.count <= limit, retryAfter };
}

/**
 * Who a request is from, as far as anything here can tell.
 *
 * Vercel puts the client address in x-forwarded-for. Behind anything else this
 * can be absent or shared, which is why every limit below is generous enough
 * that a whole office on one address stays under it.
 */
export function clientKey(request: Request, bucket: string): string {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  return `${bucket}:${ip}`;
}

/** Only for tests: the counters are process-wide otherwise. */
export function resetRateLimits(): void {
  windows.clear();
}
