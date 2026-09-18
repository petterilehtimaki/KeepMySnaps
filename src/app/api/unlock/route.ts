import { NextResponse } from "next/server";
import { getStripe, looksLikeSessionId } from "@/lib/stripe";
import { findUnlock, getAdminClient, recordUnlock } from "@/lib/unlocks";
import { PRICE_CENTS, PRICE_CURRENCY } from "@/lib/config";
import { clientKey, rateLimit } from "@/lib/ratelimit";

/**
 * Decides whether a Stripe Checkout session id represents a real payment.
 *
 * This is the whole paywall. The browser can claim anything it likes; the
 * answer comes from Stripe, and only Stripe. A verified id is then written to
 * Supabase so later visits are a single indexed lookup rather than another
 * round trip to Stripe.
 */
export async function POST(request: Request) {
  // This one is checked on every page load by people who have paid, and it
  // asks Stripe about a session id, so the ceiling is high but not absent.
  const limit = rateLimit(clientKey(request, "unlock"), 120, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { status: "error" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let sessionId: unknown;

  try {
    const body = (await request.json()) as { sessionId?: unknown };
    sessionId = body.sessionId;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // Cheap shape check first, so obvious junk never reaches Stripe.
  if (!looksLikeSessionId(sessionId)) {
    return NextResponse.json({ unlocked: false });
  }

  const db = getAdminClient();

  // Fast path — we've already checked this one with Stripe before.
  if (db) {
    try {
      const existing = await findUnlock(db, sessionId);
      if (existing) return NextResponse.json({ unlocked: true });
    } catch (err) {
      // A database wobble shouldn't cost a paying customer their unlock;
      // fall through and ask Stripe directly.
      console.error("[unlock] supabase lookup failed", err);
    }
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments aren't configured on this deployment." },
      { status: 503 },
    );
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const paid =
      session.payment_status === "paid" || session.payment_status === "no_payment_required";

    // Also check what was paid. Stripe only hands back sessions belonging to
    // this account, but "this account" is a wider set than "this product" the
    // moment a second price exists — a cheaper session id would otherwise
    // unlock the same thing.
    const rightAmount =
      session.payment_status === "no_payment_required" ||
      ((session.amount_total ?? 0) >= PRICE_CENTS &&
        (session.currency ?? PRICE_CURRENCY).toLowerCase() === PRICE_CURRENCY);

    // Some payment methods settle after the customer has been sent back. That
    // isn't a "no" yet, and the browser has to keep the id to ask again later.
    if (session.status === "complete" && session.payment_status === "unpaid") {
      return NextResponse.json({ unlocked: false, pending: true });
    }

    if (!paid || !rightAmount || session.status !== "complete") {
      return NextResponse.json({ unlocked: false });
    }

    if (db) {
      try {
        await recordUnlock(db, {
          stripe_session_id: session.id,
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : (session.payment_intent?.id ?? null),
          amount_total: session.amount_total ?? 0,
          currency: session.currency ?? "usd",
        });
      } catch (err) {
        // Verified is verified. Losing the cache entry only costs a Stripe
        // lookup next time.
        console.error("[unlock] supabase write failed", err);
      }
    }

    return NextResponse.json({ unlocked: true });
  } catch (err) {
    // Stripe 404s on ids it doesn't recognise: a real "no", and not worth
    // logging. Anything else — a timeout, a network failure, an outage, a bad
    // key — is not an answer about the payment. Replying "not paid" would make
    // the browser forget a genuine customer's id, so it's a 502 instead, which
    // the browser treats as "ask again".
    if ((err as { statusCode?: number }).statusCode === 404) {
      return NextResponse.json({ unlocked: false });
    }
    console.error("[unlock] stripe verification failed", err);
    return NextResponse.json(
      { error: "Couldn't confirm the payment with Stripe right now." },
      { status: 502 },
    );
  }
}
