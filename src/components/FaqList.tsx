import type { FaqItem } from "@/content/faq";

/**
 * The accordion markup, shared by the homepage section and /faq so the two
 * can't drift.
 *
 * Every item renders closed. An accordion that opens one answer on load makes
 * that answer look like the important one and pushes the rest below the fold.
 */
export default function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="max-w-[70ch]">
      {items.map((faq) => (
        <details
          key={faq.q}
          className="group border-b border-hair py-5 first:border-t"
        >
          <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-[1rem] font-bold tracking-[-0.015em] [&::-webkit-details-marker]:hidden">
            {faq.q}
            <span
              aria-hidden="true"
              className="mt-[0.35em] shrink-0 text-muted-cool transition-transform duration-200 group-open:rotate-45"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 1v12M1 7h12"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </summary>
          <p className="mt-3 max-w-[60ch] pr-10 text-[0.9375rem] leading-[1.7] text-muted-cool">
            {faq.a}
          </p>
        </details>
      ))}
    </div>
  );
}
