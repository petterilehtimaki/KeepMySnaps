/** Snapchat's stated cut-off for memories over 5GB. */
export const DEADLINE = Date.UTC(2026, 8, 1, 0, 0, 0); // 1 September 2026

export const FREE_FILE_LIMIT = 20;

export const PRICE_LABEL = "$5";

/**
 * A Stripe Payment Link — no backend involved. Set the link's success URL to
 * `https://your-domain/?unlocked=1` and that's the entire checkout flow.
 */
export const STRIPE_PAYMENT_LINK =
  process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK ?? "";

export const UNLOCK_STORAGE_KEY = "kms.unlocked";
