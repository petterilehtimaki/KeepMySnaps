"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";
import ContactForm from "./ContactForm";

/**
 * The contact form, parked in the bottom-right corner of every page.
 *
 * A native <dialog> for the same reasons as SaveChoice: showModal() puts it in
 * the top layer, traps focus and handles Escape. On a phone it opens as a sheet
 * from the bottom edge; from `sm` up it opens as a panel in the same corner as
 * the button, over a light backdrop, so the page stays readable behind it.
 *
 * Not rendered on /contact, where the form is already the whole page.
 */
export default function ContactLauncher() {
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (pathname === "/contact") return null;

  const close = () => dialogRef.current?.close();

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex h-11 items-center gap-2 rounded-full border border-hair bg-paper pr-4 pl-3.5 text-[0.875rem] font-bold tracking-[-0.01em] text-ink shadow-[0_6px_24px_rgba(26,26,23,0.12)] transition-[border-color,box-shadow] duration-150 hover:border-ink/20 hover:shadow-[0_8px_30px_rgba(26,26,23,0.18)] sm:right-6 sm:bottom-6"
      >
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M4 4h12a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 16 14H9.5L6 17v-3H4a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 4 4z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        Ask a person
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="contact-panel-title"
        // Clicking the backdrop lands on the dialog element itself.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className="contact-panel mx-0 mt-auto mb-0 max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-[16px] bg-paper p-0 text-left text-ink shadow-[0_-8px_40px_rgba(26,26,23,0.14)] backdrop:bg-ink/40 sm:mr-6 sm:mb-6 sm:ml-auto sm:max-h-[calc(100dvh-3rem)] sm:w-[25rem] sm:rounded-[14px] sm:border sm:border-hair sm:shadow-[0_18px_60px_rgba(26,26,23,0.18)] sm:backdrop:bg-ink/15"
      >
        <div className="px-5 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-6 sm:pb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-muted">
                Contact
              </p>
              <h2
                id="contact-panel-title"
                className="mt-2 text-[1.375rem] font-extrabold leading-[1.15] tracking-[-0.025em]"
              >
                Ask a person
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="-mt-1 -mr-2 flex size-9 shrink-0 items-center justify-center rounded-[6px] text-muted-cool transition-colors hover:bg-faint hover:text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <p className="mt-3 text-[0.875rem] leading-[1.6] text-muted-cool">
            A file the tool choked on, a payment problem, anything the FAQ
            doesn&rsquo;t cover. It reaches one person and nothing is stored.
            Please don&rsquo;t send photos: there&rsquo;s nowhere to put them.
          </p>

          <div className="mt-5">
            <ContactForm compact />
          </div>
        </div>
      </dialog>
    </>
  );
}
