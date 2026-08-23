import Link from "next/link";

const LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/september-2026-deadline", label: "The deadline" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/#upload", label: "Upload" },
] as const;

export default function Footer() {
  return (
    <footer className="border-t border-hair">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[52ch]">
          <p className="text-[0.9375rem] font-extrabold tracking-[-0.02em]">
            KeepMySnaps
          </p>
          <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted-cool">
            Not affiliated with Snapchat, Snap Inc., or whatever they&rsquo;re
            calling themselves by the time you read this.
          </p>
        </div>

        {/* Six links no longer fit on one phone-width line, hence the wrap. */}
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:justify-end">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[0.8125rem] font-semibold text-muted-cool transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
