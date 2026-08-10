import "server-only";
import Stripe from "stripe";

/**
 * Server-side Stripe client. Returns null when STRIPE_SECRET_KEY isn't set so
 * the routes can answer with a clear 503 instead of the build falling over —
 * the rest of the site works fine without payments configured.
 */
export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** Stripe Checkout session ids look like `cs_test_a1B2…`. */
export function looksLikeSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^cs_[A-Za-z0-9_]{10,200}$/.test(value)
  );
}
