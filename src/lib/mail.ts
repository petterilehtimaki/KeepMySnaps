import "server-only";

/**
 * Where contact-form messages land.
 *
 * Deliberately here rather than in `content/legal.ts`: that module is plain
 * data any component could import, and an address compiled into the client
 * bundle is an address scrapers can read. This file can only ever run on the
 * server.
 */
const CONTACT = "keepmysnaps@protonmail.com";

/**
 * Sending a contact message on, and keeping nothing.
 *
 * The rest of this site stores exactly one thing — a paid Stripe session id —
 * and the privacy page says so. A contact form that quietly filled a database
 * with people's names and email addresses would make that page a lie, so this
 * forwards the message and holds on to none of it.
 *
 * Resend's REST API is called directly rather than through its SDK: it's one
 * POST, and the processing path is already carrying more third-party code
 * than it used to.
 */

const ENDPOINT = "https://api.resend.com/emails";

export type Message = {
  name: string;
  email: string;
  body: string;
};

export type SendResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "failed" };

export function mailIsConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_FROM);
}

export async function sendContactMessage(msg: Message): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM;
  if (!key || !from) return { ok: false, reason: "unconfigured" };

  // The sender's address goes in Reply-To, never in From — a From header
  // claiming a domain we don't send for is what SPF and DMARC exist to reject.
  const payload = {
    from,
    to: [CONTACT],
    reply_to: msg.email,
    subject: `KeepMySnaps — ${msg.name || msg.email}`,
    text: [
      `From: ${msg.name || "(no name)"} <${msg.email}>`,
      "",
      msg.body,
    ].join("\n"),
  };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      // The body can echo the API key back in an error envelope, so only the
      // status is worth keeping.
      console.error("[contact] resend rejected the message", res.status);
      return { ok: false, reason: "failed" };
    }
    return { ok: true };
  } catch (err) {
    console.error("[contact] could not reach the mail provider", err);
    return { ok: false, reason: "failed" };
  }
}
