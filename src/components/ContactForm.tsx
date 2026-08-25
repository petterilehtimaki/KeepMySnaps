"use client";

import { useState } from "react";
import { Button } from "./ui";

type State = "idle" | "sending" | "sent";

const field =
  "w-full rounded-[6px] border border-hair bg-paper px-3.5 py-2.5 " +
  "text-[0.9375rem] leading-[1.5] text-ink transition-colors " +
  "placeholder:text-muted-cool/70 focus:border-ink/25 focus:outline-none " +
  "focus:ring-2 focus:ring-blue/25";

const label =
  "text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-muted";

export default function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;

    const form = event.currentTarget;
    const data = new FormData(form);
    setState("sending");
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          message: data.get("message"),
          website: data.get("website"),
        }),
      });
      const payload = (await res.json()) as { sent?: boolean; error?: string };
      if (!res.ok || !payload.sent) {
        setError(payload.error ?? "Something went wrong. Try again in a moment.");
        setState("idle");
        return;
      }
      form.reset();
      setState("sent");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div
        role="status"
        className="rounded-[10px] border border-hair bg-faint px-6 py-10 text-center"
      >
        <p className="text-[1.0625rem] font-bold tracking-[-0.015em]">
          Sent. Thanks.
        </p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[0.9375rem] leading-[1.65] text-muted-cool">
          It goes to one person, so the reply won&rsquo;t be instant — but it
          will be a person. Nothing about the message was stored anywhere.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mt-6 text-[0.875rem] font-semibold text-blue underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="flex max-w-[46ch] flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label className={label} htmlFor="contact-name">
          Name <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          maxLength={80}
          autoComplete="name"
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className={label} htmlFor="contact-email">
          Your email
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          placeholder="so there's somewhere to reply"
          className={field}
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className={label} htmlFor="contact-message">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={7}
          minLength={10}
          maxLength={5000}
          className={`${field} resize-y`}
        />
      </div>

      {/* Hidden from people, irresistible to bots. */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this empty</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error && (
        <p role="alert" className="text-[0.875rem] leading-[1.6] text-ink">
          {error}
        </p>
      )}

      <div>
        <Button type="submit" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  );
}
