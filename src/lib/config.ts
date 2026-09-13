/**
 * The earliest date Snapchat can start archiving Memories over 5GB.
 *
 * Snapchat's support page: "No Memories will be archived before January 2027,
 * and we will provide advance notice in the app before anything changes for
 * you." So this is the earliest moment, not a promise about anyone's library.
 *
 * And it is archiving, not deletion — "Will Snapchat delete my Memories if I do
 * not upgrade? No." Archived Memories stay in the app as thumbnails that need a
 * paid plan to open, edit or share.
 *
 * This used to count down to 26 September 2026, the end of the 12-month
 * temporary storage window, and called it the date deletion could begin. Both
 * halves of that are contradicted by Snapchat's own page, checked on 13
 * September 2026.
 *
 * Fixed UTC instant: the remaining duration is the same for every viewer
 * regardless of their timezone.
 */
export const DEADLINE = Date.UTC(2027, 0, 1, 0, 0, 0); // 1 January 2027, 00:00 UTC

export const FREE_FILE_LIMIT = 20;

export const PRICE_CENTS = 500;
export const PRICE_CURRENCY = "usd";
export const PRICE_LABEL = "$5";

export const PRODUCT_NAME = "KeepMySnaps: unlock every file";

/**
 * Where the verified Stripe Checkout session id is kept between visits. The
 * value is the session id itself, not a boolean: it gets re-verified server
 * side on every load, so editing it by hand achieves nothing.
 */
export const UNLOCK_STORAGE_KEY = "kms.session";
