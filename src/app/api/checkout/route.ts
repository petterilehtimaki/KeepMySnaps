import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { PRICE_CENTS, PRICE_CURRENCY, PRODUCT_NAME } from "@/lib/config";

/**
 * Creates a one-off Stripe Checkout session and hands back its URL.
 *
 * No photo data reaches this route — it takes no request body at all. The only
 * thing crossing the wire is the fact that somebody clicked a button.
 */
export async function POST(request: Request) {
  const stripe = getStripe();

  if (!stripe) {
    return NextResponse.json(
      { error: "Payments aren't configured on this deployment." },
      { status: 503 },
    );
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: PRICE_CURRENCY,
            unit_amount: PRICE_CENTS,
            product_data: {
              name: PRODUCT_NAME,
              description:
                "Removes the 20-file limit. One payment, not a subscription.",
            },
          },
        },
      ],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}#upload`,
      cancel_url: `${origin}/#upload`,
    });

    if (!session.url) {
      throw new Error("Stripe returned a session without a URL");
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    // Stripe errors can carry account details; they stay in the server log.
    console.error("[checkout] failed to create session", err);
    return NextResponse.json(
      { error: "Couldn't start checkout. Try again in a moment." },
      { status: 502 },
    );
  }
}
