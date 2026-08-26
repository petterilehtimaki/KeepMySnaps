import Link from "next/link";
import { ARTICLES } from "@/content/articles";

const SITE = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/september-2026-deadline", label: "The deadline" },
  { href: "/waiting-for-your-export", label: "While you wait" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

const linkClass =
  "text-[0.8125rem] font-semibold text-muted-cool transition-colors hover:text-ink";

const headingClass =
  "text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted";

/**
 * Two columns rather than one wrapping row.
 *
 * The guides are listed in full on purpose: with no inbound links yet,
 * a site-wide link from every page is the only ranking signal we control, and
 * a person who lands on one guide is usually one question away from another.
 */
export default function Footer() {
  return (
    <footer className="border-t border-hair">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-14">
          <div className="max-w-[46ch]">
            <p className="text-[0.9375rem] font-extrabold tracking-[-0.02em]">
              KeepMySnaps
            </p>
            <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted-cool">
              Not affiliated with Snapchat, Snap Inc., or whatever they&rsquo;re
              calling themselves by the time you read this.
            </p>
          </div>

          <nav className="flex flex-col gap-3">
            <p className={headingClass}>Site</p>
            {SITE.map((link) => (
              <Link key={link.href} href={link.href} className={linkClass}>
                {link.label}
              </Link>
            ))}
          </nav>

          <nav className="flex flex-col gap-3">
            <p className={headingClass}>Guides</p>
            {ARTICLES.map((article) => (
              <Link
                key={article.slug}
                href={`/${article.slug}`}
                className={linkClass}
              >
                {article.crumb}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
