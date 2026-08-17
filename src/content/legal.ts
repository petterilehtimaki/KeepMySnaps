/**
 * The privacy policy and the terms.
 *
 * Every factual claim below was checked against the code before it was
 * written. In particular: there is no analytics, no tracking script, no
 * third-party embed and no cookie anywhere in this repo; the fonts are
 * self-hosted by next/font rather than fetched from Google at runtime; no API
 * route accepts a file; and the only row ever written about a payment is the
 * one defined in supabase/migrations/0001_create_unlocks.sql. If any of that
 * changes, this file has to change with it.
 */

export type LegalBlock =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: { lead?: string; text: string }[] };

export const LEGAL_UPDATED = "17 August 2026";

/** Fill this in before going live. It is deliberately conspicuous. */
export const CONTACT = "[CONTACT]";

export const PRIVACY: LegalBlock[] = [
  {
    kind: "p",
    text: "KeepMySnaps is run by one person in Finland, not by a company. This page says exactly what happens to data when you use the site. It's short because the site does very little.",
  },

  { kind: "h", text: "Your photos never leave your device" },
  {
    kind: "p",
    text: "When you drop an export onto this site, the ZIP is opened, read and rewritten inside your browser tab, by code that was already downloaded when the page loaded. Nothing is uploaded. There is no address on this site that accepts a file, so there is nowhere for one to go. If you'd rather verify that than trust it: load the page, disconnect from the internet, and run your export through anyway. It works.",
  },
  {
    kind: "p",
    text: "The finished ZIP is assembled in your browser's memory and saved by your own browser's download. I never have a copy — which also means I can't recover anything for you if something goes wrong.",
  },

  { kind: "h", text: "What's stored in your browser" },
  {
    kind: "p",
    text: "One thing. If you pay, your Stripe Checkout session id is kept in this site's local storage under the name kms.session, so the file limit stays unlocked when you come back. It's a payment receipt id rather than an identifier for you, and it's re-checked with Stripe on every visit. Clearing site data for this domain removes it.",
  },
  {
    kind: "p",
    text: "There are no cookies. No analytics, no tracking pixels, no advertising, no social embeds, no session recording, and no third-party scripts of any kind. Even the fonts are served from this domain rather than fetched from Google.",
  },

  { kind: "h", text: "What crosses the network" },
  { kind: "p", text: "Three things, and only three:" },
  {
    kind: "ul",
    items: [
      {
        lead: "Loading the page.",
        text: "The site is hosted on Vercel, which — like every web host — records standard request information in its server logs: IP address, browser user agent, which page was requested, and when. I don't use those logs to build a picture of anyone, and there is nothing in them connecting a request to an export.",
      },
      {
        lead: "Starting a payment.",
        text: "Clicking unlock sends an empty request to this site's checkout endpoint, which asks Stripe to open a checkout page and sends your browser there. That request carries nothing about you and nothing about your files.",
      },
      {
        lead: "Confirming a payment.",
        text: "When you come back afterwards, your browser sends the Checkout session id so the site can ask Stripe a single question: was this session paid? Nothing else is sent.",
      },
    ],
  },

  { kind: "h", text: "Payment" },
  {
    kind: "p",
    text: "Payments are handled by Stripe. Card details are entered on Stripe's own page and never touch this site. Stripe processes that payment as its own data controller under its privacy policy, and will hold whatever you gave it — typically an email address for the receipt.",
  },
  {
    kind: "p",
    text: "After a successful payment, one row is written to a database (Supabase) holding: the Stripe checkout session id, the Stripe payment intent id, the amount, the currency, when it was created, when it was last presented, and how many times it has been presented. That is the entire row. No name, no email address, no IP address, nothing about your photos. The table is reachable only by this site's server and denies all public access.",
  },

  { kind: "h", text: "What doesn't exist" },
  {
    kind: "p",
    text: "There are no accounts and no sign-in. There is no mailing list. Nothing is sold, shared, rented or handed to advertisers — there is nothing here to sell. No profiling and no automated decision-making happens about you.",
  },

  { kind: "h", text: "How long things are kept" },
  {
    kind: "p",
    text: "Payment rows are kept while they're needed for refunds and bookkeeping. Everything else isn't kept, because it isn't collected. Request logs are held by the host on its own schedule rather than mine.",
  },

  { kind: "h", text: "Your rights" },
  {
    kind: "p",
    text: "Under the GDPR you have rights of access, correction, deletion, restriction, objection and portability over personal data held about you. In practice the only record here that could be tied to you is a payment row, and the link runs through Stripe. Email me from the address on your Stripe receipt, or send the receipt, and I'll delete the row. Some payment records may have to be kept for tax and accounting reasons, which is a legal obligation rather than a preference. You can also complain to your data protection authority — in Finland, the Office of the Data Protection Ombudsman.",
  },

  { kind: "h", text: "Age" },
  {
    kind: "p",
    text: "The site collects nothing, but payments should be made by someone old enough to make them. If you're under 18, ask whoever owns the card first.",
  },

  { kind: "h", text: "Changes" },
  {
    kind: "p",
    text: "If this page changes, the date at the top changes with it. There's no mailing list to notify you, and I'm not going to start one for this.",
  },

  { kind: "h", text: "Contact" },
  {
    kind: "p",
    text: `${CONTACT}. It's one person, so allow a couple of days for a reply.`,
  },
  {
    kind: "p",
    text: "KeepMySnaps is not affiliated with, endorsed by, or connected to Snap Inc.",
  },
];

export const TERMS: LegalBlock[] = [
  {
    kind: "p",
    text: "The plain version: it's a $5 tool, run by one person, that fixes the dates on a copy of your own Snapchat export inside your browser. Use it on your own data, keep the original ZIP until you've checked the output, and if it doesn't work for you, ask for your money back.",
  },

  { kind: "h", text: "What this is" },
  {
    kind: "p",
    text: "KeepMySnaps is a website that reads a Snapchat data export in your browser, writes the real capture dates and locations back into the photos, flattens the captions onto them, and hands you a new ZIP. It's operated by an individual in Finland, not by a company. It is not affiliated with, endorsed by, or connected to Snap Inc., and Snapchat is their trademark rather than mine.",
  },

  { kind: "h", text: "What it costs" },
  {
    kind: "p",
    text: "The first 20 files are processed free, so you can open them and check the output before paying anything. $5 once removes the limit — one payment, not a subscription, and nothing renews. The unlock lives in the browser you paid in, so clearing site data or moving to another device loses it. If that happens, get in touch with your Stripe receipt and I'll sort it out.",
  },

  { kind: "h", text: "Refunds" },
  {
    kind: "p",
    text: "Ask and you'll get one. You don't have to explain why.",
  },

  { kind: "h", text: "Use it on your own data" },
  {
    kind: "p",
    text: "This is for exports of accounts you own. Don't run someone else's export through it without their say-so, and don't use it for anything illegal.",
  },

  { kind: "h", text: "No guarantees" },
  {
    kind: "p",
    text: "This is provided as it is. It works on every export shape I've been able to test, but Snapchat changes the format of these archives without telling anyone, and yours may be shaped in a way I haven't seen. Keep the original ZIP from Snapchat until you've opened the output and confirmed it's right. Since nothing is uploaded, I never hold a copy of your files and cannot recover, restore or re-run anything for you.",
  },
  {
    kind: "p",
    text: "I also have no control over Snapchat. When your export arrives, what's in it, how long the download link stays alive, and whether or when your memories get deleted are all their decisions, not mine.",
  },

  { kind: "h", text: "Availability" },
  {
    kind: "p",
    text: "This is a one-person site. It may be unavailable, may change, and may eventually be shut down. If it goes away before you've used something you paid for, ask for a refund and you'll get one.",
  },

  { kind: "h", text: "Liability" },
  {
    kind: "p",
    text: "Nothing here limits liability for anything that can't legally be limited, including death, personal injury, or fraud. Beyond that: because the work happens entirely on your own device and I never hold your files, my liability for any claim connected to this site is limited to what you paid — $5, or nothing if you didn't pay.",
  },

  { kind: "h", text: "Changes" },
  {
    kind: "p",
    text: "These terms can change, and the date at the top says when they last did. Changes apply going forward, not to a payment you've already made.",
  },

  { kind: "h", text: "Law" },
  {
    kind: "p",
    text: "These terms are governed by Finnish law. If you're a consumer, this doesn't take away any rights your own country's consumer law gives you.",
  },

  { kind: "h", text: "Contact" },
  { kind: "p", text: `${CONTACT}.` },
];
