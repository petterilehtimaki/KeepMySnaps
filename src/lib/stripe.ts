import "server-only";

/**
 * Stripe, over plain HTTPS.
 *
 * The official SDK is a Node library first. On Cloudflare Workers it hangs:
 * the request never completes and the runtime kills the worker with "your code
 * hung and would never generate a response", which names nothing useful. Its
 * fetch-based HTTP client doesn't rescue it either. A plain `fetch` to
 * api.stripe.com from the same worker answers in about 200ms, so that is what
 * this does.
 *
 * Only four calls are needed, and Stripe's REST API is form-encoded and stable,
 * so the trade is a page of code against a dependency that doesn't run where
 * this site now lives. It runs identically on Node.
 */

const API = "https://api.stripe.com/v1";

/** Stripe Checkout session ids look like `cs_test_a1B2…`. */
export function looksLikeSessionId(value: unknown): value is string {
  return typeof value === "string" && /^cs_[A-Za-z0-9_]{10,200}$/.test(value);
}

export function stripeIsConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export class StripeError extends Error {
  /**
   * Checked instead of `instanceof`.
   *
   * The Cloudflare bundle can end up with more than one copy of this module,
   * and two copies mean two classes: `instanceof` then answers false for an
   * error this file threw, and a missing session gets treated as a Stripe
   * outage. A plain flag can't drift like that.
   */
  readonly isStripeError = true;

  constructor(
    message: string,
    readonly status: number,
    /** Stripe's own code, e.g. `resource_missing` for an id it doesn't know. */
    readonly code?: string,
  ) {
    super(message);
  }

  /**
   * A definite "no such thing", rather than a wobble.
   *
   * Stripe answers 404 for an id it has never seen and 400 for one that
   * belongs to the other mode, and both mean the same thing here: this is not
   * a session that unlocks anything. Anything else is a failure to get an
   * answer, which must not be mistaken for an answer.
   */
  get missing(): boolean {
    return this.status === 404 || this.code === "resource_missing";
  }
}

/**
 * Stripe takes nested parameters as `line_items[0][price_data][currency]`,
 * so anything nested has to be flattened into that shape before sending.
 */
function toForm(
  params: Record<string, unknown>,
  prefix = "",
  out = new URLSearchParams(),
): URLSearchParams {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      value.forEach((item, i) =>
        typeof item === "object" && item !== null
          ? toForm(item as Record<string, unknown>, `${name}[${i}]`, out)
          : out.append(`${name}[${i}]`, String(item)),
      );
    } else if (typeof value === "object") {
      toForm(value as Record<string, unknown>, name, out);
    } else {
      out.append(name, String(value));
    }
  }
  return out;
}

async function call<T>(
  path: string,
  { method = "GET", params }: { method?: "GET" | "POST"; params?: Record<string, unknown> } = {},
): Promise<T> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new StripeError("Stripe isn't configured on this deployment.", 503);

  const body = params ? toForm(params) : undefined;
  const url = method === "GET" && body ? `${API}${path}?${body}` : `${API}${path}`;

  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${key}`,
      ...(method === "POST" ? { "content-type": "application/x-www-form-urlencoded" } : {}),
    },
    body: method === "POST" ? body : undefined,
    // Longer than Stripe needs, shorter than a person will wait.
    signal: AbortSignal.timeout(15_000),
  });

  const payload = (await res.json()) as {
    error?: { message?: string; code?: string };
  };
  if (!res.ok) {
    throw new StripeError(
      payload.error?.message ?? `Stripe answered ${res.status}.`,
      res.status,
      payload.error?.code,
    );
  }
  return payload as T;
}

/** The fields this site reads. Stripe sends plenty more. */
export type CheckoutSession = {
  id: string;
  status: "open" | "complete" | "expired" | null;
  payment_status: "paid" | "unpaid" | "no_payment_required";
  amount_total: number | null;
  currency: string | null;
  url: string | null;
  payment_intent: string | { id: string } | null;
  customer_details?: { email?: string | null } | null;
};

/** True for an error this module threw, whichever copy of it did. */
export function isStripeError(err: unknown): err is StripeError {
  return Boolean(err && typeof err === "object" && "isStripeError" in err);
}

export function createCheckoutSession(params: Record<string, unknown>) {
  return call<CheckoutSession>("/checkout/sessions", { method: "POST", params });
}

export function retrieveCheckoutSession(id: string) {
  return call<CheckoutSession>(`/checkout/sessions/${encodeURIComponent(id)}`);
}

export function listCheckoutSessions(params: Record<string, unknown>) {
  return call<{ data: CheckoutSession[] }>("/checkout/sessions", { params });
}

export function listCustomers(params: { email: string; limit?: number }) {
  return call<{ data: { id: string }[] }>("/customers", { params });
}
