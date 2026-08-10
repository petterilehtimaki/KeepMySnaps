/**
 * The earliest date Snapchat can begin deleting Memories over 5GB.
 *
 * The policy rolled out on 26 September 2025 with a 12-month grace period, so
 * 26 September 2026 is the first date deletion is possible — not a universal
 * cut-off. Deletion is rolling and per-account after that, which is why the
 * countdown copy says "can start" rather than promising anyone a specific
 * moment their photos vanish.
 *
 * Fixed UTC instant: the remaining duration is the same for every viewer
 * regardless of their timezone.
 */
export const DEADLINE = Date.UTC(2026, 8, 26, 0, 0, 0); // 26 September 2026, 00:00 UTC

export const FREE_FILE_LIMIT = 20;

export const PRICE_CENTS = 500;
export const PRICE_CURRENCY = "usd";
export const PRICE_LABEL = "$5";

export const PRODUCT_NAME = "KeepMySnaps — unlock every file";

/**
 * Where the verified Stripe Checkout session id is kept between visits. The
 * value is the session id itself, not a boolean: it gets re-verified server
 * side on every load, so editing it by hand achieves nothing.
 */
export const UNLOCK_STORAGE_KEY = "kms.session";
