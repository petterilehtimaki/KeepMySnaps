"use client";

import Link from "next/link";
import { useId, useState } from "react";

const VISIBLE = 3;

type Props = {
  heading: string;
  links: readonly { href: string; label: string }[];
};

/**
 * One footer column, folded to its first three links.
 *
 * The rest are rendered and hidden rather than left out, so every page still
 * carries a link to every guide in its HTML. That site-wide linking is why the
 * guides are in the footer at all — folding them is for people, not crawlers.
 */
export default function FooterColumn({ heading, links }: Props) {
  const [open, setOpen] = useState(false);
  const listId = useId();
  const extra = links.length - VISIBLE;

  return (
    <nav aria-label={heading} className="flex min-w-0 flex-col">
      <p className="text-[0.75rem] font-extrabold uppercase tracking-[0.16em] text-ink">
        {heading}
      </p>
      <span aria-hidden="true" className="mt-2 block h-[3px] w-5 bg-snap" />

      <ul id={listId} className="mt-5 flex flex-col gap-3">
        {links.map((link, i) => (
          <li key={link.href} hidden={!open && i >= VISIBLE}>
            <Link
              href={link.href}
              className="text-[0.875rem] font-semibold text-ink/60 transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>

      {extra > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={listId}
          className="mt-4 -ml-1 inline-flex w-fit items-center gap-1.5 rounded-[6px] px-1 py-1 text-[0.8125rem] font-bold text-ink transition-colors hover:bg-faint"
        >
          {open ? "Show fewer" : `Show ${extra} more`}
          <svg
            width="14"
            height="14"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </nav>
  );
}
