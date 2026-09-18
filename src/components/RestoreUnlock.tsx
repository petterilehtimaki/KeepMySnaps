"use client";

import { useRef, useState } from "react";
import { buttonClass } from "./ui";

/**
 * "I already paid."
 *
 * The unlock lives in the browser that paid, so anyone who pays on a laptop
 * and comes back on a phone, or clears their browsing data, is asked for money
 * they have already handed over. Without this the only way back is writing to
 * a person, which most people won't do: they'll decide they were had.
 *
 * Deliberately not a sign-in. There is no account to sign in to, and a login
 * box is the point where a stranger with a folder of private photos leaves.
 */
export default function RestoreUnlock() {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const close = () => dialogRef.current?.close();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setError(null);
    try {
      const res = await fetch("/api/restore", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (res.ok && data.ok) {
        setState("sent");
      } else {
        setState("error");
        setError(data.message ?? "That didn't go through. Try again in a moment.");
      }
    } catch {
      setState("error");
      setError("That didn't go through. Check your connection and try again.");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-[0.8125rem] font-semibold text-muted-cool underline underline-offset-4 transition-colors hover:text-ink"
      >
        Already paid, on another device?
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="restore-title"
        onClose={() => {
          setState("idle");
          setError(null);
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget && state !== "sending") close();
        }}
        className="m-auto w-[min(30rem,calc(100vw-2rem))] rounded-[14px] bg-paper p-0 text-left text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="px-6 py-7 sm:px-8">
          <h2
            id="restore-title"
            className="text-[1.375rem] font-extrabold leading-[1.15] tracking-[-0.025em]"
          >
            Get your unlock back
          </h2>

          {state === "sent" ? (
            <>
              <p className="mt-3 text-[0.9375rem] leading-[1.65] text-muted-cool">
                If that address paid, the link is on its way. It can take a
                minute, and it might land in spam. Open it in whichever browser
                you want to do the work in.
              </p>
              <div className="mt-7 flex justify-end">
                <button type="button" onClick={close} className={buttonClass()}>
                  Right then
                </button>
              </div>
            </>
          ) : (
            <form onSubmit={submit}>
              <p className="mt-3 text-[0.9375rem] leading-[1.65] text-muted-cool">
                Paying unlocks the browser you paid in, which is no help on a
                different phone or after clearing your history. Type the address
                you paid with and the link comes back to you.
              </p>

              <label
                htmlFor="restore-email"
                className="mt-6 block text-[0.8125rem] font-semibold"
              >
                The email you paid with
              </label>
              <input
                id="restore-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={state === "sending"}
                className="mt-2 w-full rounded-[8px] border border-hair bg-faint/60 px-3 py-2.5 text-[0.9375rem] outline-none focus:border-blue"
              />

              {error && (
                <p className="mt-3 text-[0.875rem] font-semibold leading-[1.6]">
                  {error}
                </p>
              )}

              <p className="mt-5 text-[0.75rem] leading-[1.6] text-muted-cool">
                We ask Stripe whether that address bought anything and email the
                link there. Nothing about you is stored here, and your photos
                are not involved either way.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={close}
                  disabled={state === "sending"}
                  className="text-[0.875rem] font-semibold text-muted-cool underline underline-offset-4 hover:text-ink"
                >
                  Never mind
                </button>
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className={buttonClass()}
                >
                  {state === "sending" ? "Sending" : "Send the link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </dialog>
    </>
  );
}
