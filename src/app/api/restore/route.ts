import { NextResponse } from "next/server";
import { listCheckoutSessions, listCustomers, stripeIsConfigured } from "@/lib/stripe";
import { sendRestoreLink } from "@/lib/mail";
import { clientKey, rateLimit } from "@/lib/ratelimit";
import { absoluteUrl } from "@/lib/seo";

/**
 * Emails somebody the link that unlocks what they already paid for.
 *
 * The unlock lives in the browser that paid. That is what lets this site have
 * no accounts, and it is also why a person who paid on a laptop gets asked for
 * five dollars again on their phone. From their side that is indistinguishable
 * from being robbed, and the only way back used to be writing to a human.
 *
 * So: they type the address they paid with, Stripe is asked whether that
 * address bought anything, and if it did the link goes to that address. No
 * account, no password, and the only thing learned is an email address Stripe
 * already had. Nothing is written down here.
 *
 * The answer is the same either way. "No purchase found for that address"
 * would turn this into a way to ask whether a given person is a customer.
 */

const SAME_ANSWER = {
  ok: true,
  message:
    "If that address paid, the link is on its way. It can take a minute, and it might land in spam.",
};

/** How far back to look through recent checkouts for a guest purchase. */
const RECENT_SESSIONS = 100;

export async function POST(request: Request) {
  // Low on purpose: this sends mail to an address the sender chose, so it is
  // the one route where a loop could be used to bother somebody else.
  const limit = rateLimit(clientKey(request, "restore"), 4, 60 * 60 * 1000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: "Too many tries. Give it an hour." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  let email = "";
  try {
    const body = (await request.json()) as { email?: unknown };
    email = typeof body.email === "string" ? body.email.trim().slice(0, 200) : "";
  } catch {
    return NextResponse.json({ ok: false, message: "Malformed request." }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json(
      { ok: false, message: "That doesn't look like an email address." },
      { status: 400 },
    );
  }

  if (!stripeIsConfigured()) return NextResponse.json(SAME_ANSWER);

  try {
    const sessionId = await findPaidSession(email);
    if (sessionId) {
      await sendRestoreLink(
        email,
        `${absoluteUrl("/")}?session_id=${encodeURIComponent(sessionId)}#upload`,
      );
    }
  } catch (err) {
    // A Stripe hiccup shouldn't tell the sender anything either.
    console.error("[restore] lookup failed", err);
  }

  return NextResponse.json(SAME_ANSWER);
}

/**
 * The most recent paid checkout for an address, by whichever route finds it.
 *
 * Customers first, since every checkout from now on creates one. Then a sweep
 * of recent sessions, which is what catches a guest purchase made before that
 * was true.
 */
async function findPaidSession(email: string): Promise<string | null> {
  const customers = await listCustomers({ email, limit: 10 });
  for (const customer of customers.data) {
    const sessions = await listCheckoutSessions({
      customer: customer.id,
      limit: 10,
    });
    const paid = sessions.data.find((s) => s.payment_status === "paid");
    if (paid) return paid.id;
  }

  const recent = await listCheckoutSessions({ limit: RECENT_SESSIONS });
  const match = recent.data.find(
    (s) =>
      s.payment_status === "paid" &&
      s.customer_details?.email?.toLowerCase() === email.toLowerCase(),
  );
  return match?.id ?? null;
}
