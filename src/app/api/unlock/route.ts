import { NextResponse } from "next/server";
import { getStripe, looksLikeSessionId } from "@/lib/stripe";
import { findUnlock, getAdminClient, recordUnlock } from "@/lib/unlocks";

/**
 * Decides whether a Stripe Checkout session id represents a real payment.
 *
 * This is the whole paywall. The browser can claim anything it likes; the
 * answer comes from Stripe, and only Stripe. A verified id is then written to
 * Supabase so later visits are a single indexed lookup rather than another
 * round trip to Stripe.
 */
export async function POST(request: Request) {
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

    if (!paid || session.status !== "complete") {
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
    // An unknown session id lands here too — Stripe 404s on ids it doesn't
    // recognise, which is not an error worth alarming anyone about.
    console.error("[unlock] stripe verification failed", err);
    return NextResponse.json({ unlocked: false });
  }
}
