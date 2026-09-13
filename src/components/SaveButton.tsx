"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { FREE_FILE_LIMIT, PRICE_LABEL, UNLOCK_STORAGE_KEY } from "@/lib/config";
import { startCheckout } from "./useUnlock";
import { buttonClass } from "./ui";

/**
 * "Save my memories", with the question it used to skip.
 *
 * The button used to scroll straight to the uploader, which only has one road:
 * spend the free 20, hit the paywall, pay, drop everything in again. Fine for
 * someone who wants proof first. Pointless for someone who has already decided
 * — they had to rehearse on twenty files to be allowed to pay for the rest.
 *
 * So the click asks which one you are. Someone who has already paid is never
 * asked: a stored session id sends them straight to the uploader, which
 * re-verifies it with Stripe on its own.
 *
 * A native <dialog> rather than a portal: showModal() renders in the top layer,
 * so the sticky header's backdrop-blur — which traps position:fixed children —
 * can't clip it, and focus trapping and Escape come with the element.
 */

type Props = {
  size?: "sm" | "md";
  className?: string;
};

function alreadyPaid(): boolean {
  try {
    return Boolean(window.localStorage.getItem(UNLOCK_STORAGE_KEY));
  } catch {
    return false;
  }
}

export default function SaveButton({ size = "md", className = "" }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const goToUploader = () => {
    if (window.location.pathname === "/") {
      // Already on the page. Pushing the same hash again wouldn't scroll.
      document.getElementById("upload")?.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", "/#upload");
    } else {
      router.push("/#upload");
    }
  };
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = () => {
    if (alreadyPaid()) return goToUploader();
    setError(null);
    dialogRef.current?.showModal();
  };

  const close = () => dialogRef.current?.close();

  const testFirst = () => {
    close();
    // Closing a modal <dialog> hands focus back to the button that opened it,
    // and the browser scrolls that button into view as it does. Scrolling in
    // the same tick loses to it. A timeout rather than requestAnimationFrame,
    // because rAF doesn't fire at all in a tab the browser considers hidden.
    window.setTimeout(goToUploader, 60);
  };

  const payNow = async () => {
    setBusy(true);
    setError(null);
    const failure = await startCheckout();
    // On success the browser is already leaving for Stripe.
    if (failure) {
      setError(failure);
      setBusy(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        className={buttonClass({ size, className })}
      >
        Save my memories
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="save-choice-title"
        // Clicking the dimmed backdrop lands on the dialog element itself.
        onClick={(e) => {
          if (e.target === e.currentTarget && !busy) close();
        }}
        className="m-auto w-[min(34rem,calc(100vw-2rem))] rounded-[14px] bg-paper p-0 text-left text-ink backdrop:bg-ink/40 backdrop:backdrop-blur-[2px]"
      >
        <div className="px-6 pt-7 pb-6 sm:px-8 sm:pt-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Before you drop anything
              </p>
              <h2
                id="save-choice-title"
                className="mt-3 text-[1.5rem] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance"
              >
                Rehearse first, or just do it.
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              disabled={busy}
              aria-label="Close"
              className="-mr-2 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-[6px] text-muted-cool transition-colors hover:bg-faint hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="mt-7 flex flex-col divide-y divide-hair border-y border-hair">
            <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-[30ch]">
                <p className="text-[1rem] font-bold tracking-[-0.015em]">
                  Try it on {FREE_FILE_LIMIT} files
                </p>
                <p className="mt-1 text-[0.875rem] leading-[1.6] text-muted-cool">
                  Free. Watch the dates land before deciding we&rsquo;ve earned
                  five dollars.
                </p>
              </div>
              <button
                type="button"
                onClick={testFirst}
                disabled={busy}
                className={buttonClass({ variant: "outline", className: "w-full sm:w-auto" })}
              >
                Test first
              </button>
            </div>

            <div className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-[30ch]">
                <p className="text-[1rem] font-bold tracking-[-0.015em]">
                  Do all of them
                </p>
                <p className="mt-1 text-[0.875rem] leading-[1.6] text-muted-cool">
                  {PRICE_LABEL}, once. Every file, every ZIP Snapchat split it
                  into. You come straight back here.
                </p>
              </div>
              <button
                type="button"
                onClick={payNow}
                disabled={busy}
                className={`${buttonClass({ className: "w-full sm:w-auto" })} disabled:cursor-wait disabled:opacity-60`}
              >
                {busy ? "Opening checkout…" : `Pay ${PRICE_LABEL}`}
              </button>
            </div>
          </div>

          {error ? (
            <p role="alert" className="mt-5 text-[0.8125rem] font-semibold leading-[1.6] text-ink">
              {error}
            </p>
          ) : (
            <p className="mt-5 text-[0.8125rem] leading-[1.6] text-muted-cool">
              If it can&rsquo;t handle your export and we can&rsquo;t fix it,
              you get the $5 back.
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
