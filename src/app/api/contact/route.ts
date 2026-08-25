import { NextResponse } from "next/server";
import { sendContactMessage } from "@/lib/mail";

/**
 * Takes a message from the contact form and forwards it.
 *
 * Nothing is written down. No photo data comes near this route either — it
 * accepts three short strings and refuses anything else.
 */

const LIMITS = { name: 80, email: 200, body: 5000 } as const;

/**
 * Deliberately loose. The only thing that matters is that a reply can go
 * somewhere; rejecting valid addresses because they look unusual is a worse
 * failure than accepting one that bounces.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function asString(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  // A field hidden from people and irresistible to form-filling bots. Answer
  // as though it worked, so there's nothing to learn from the response.
  if (asString(body.website, 10)) return NextResponse.json({ sent: true });

  const name = asString(body.name, LIMITS.name);
  const email = asString(body.email, LIMITS.email);
  const message = asString(body.message, LIMITS.body);

  if (!EMAIL.test(email)) {
    return NextResponse.json(
      { error: "That email address doesn't look right — we'd have nowhere to reply." },
      { status: 400 },
    );
  }
  if (message.length < 10) {
    return NextResponse.json(
      { error: "Tell us a little more than that and we'll be able to help." },
      { status: 400 },
    );
  }

  const result = await sendContactMessage({ name, email, body: message });

  if (!result.ok) {
    console.error("[contact] message not delivered", result.reason);
    return NextResponse.json(
      {
        error:
          "The message didn't go through. Nothing was saved, so nothing was lost — please try again shortly.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ sent: true });
}
