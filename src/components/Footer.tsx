import { ARTICLES } from "@/content/articles";
import FooterColumn from "./FooterColumn";

const SITE = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/september-2026-deadline", label: "What's changing" },
  { href: "/waiting-for-your-export", label: "While you wait" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

const GUIDES = ARTICLES.map((article) => ({
  href: `/${article.slug}`,
  label: article.crumb,
}));

/**
 * Two columns, each folded to three links.
 *
 * Contact isn't listed: it has its own button in the corner of every page
 * (ContactLauncher). The guides are all still linked on purpose — with no
 * inbound links yet, a site-wide link from every page is the only ranking
 * signal we control, and a person who lands on one guide is usually one
 * question away from another.
 *
 * The columns have fixed widths from `sm` up so unfolding one doesn't shove
 * the other sideways, and the bottom padding on phones clears the contact
 * button so it never sits on top of the last link.
 */
export default function Footer() {
  return (
    <footer className="border-t border-hair">
      <div className="mx-auto w-full max-w-6xl px-6 pt-14 pb-28 sm:pb-16">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-14">
          <div className="max-w-[46ch]">
            <p className="text-[0.9375rem] font-extrabold tracking-[-0.02em]">
              KeepMySnaps
            </p>
            <p className="mt-2 text-[0.8125rem] leading-[1.6] text-muted-cool">
              Not affiliated with Snapchat, Snap Inc., or whatever they&rsquo;re
              calling themselves by the time you read this.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-[11rem_11rem] sm:gap-14">
            <FooterColumn heading="Site" links={SITE} />
            <FooterColumn heading="Guides" links={GUIDES} />
          </div>
        </div>
      </div>
    </footer>
  );
}
