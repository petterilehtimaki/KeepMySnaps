import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import LegalProse from "@/components/Legal";
import { Eyebrow, Section } from "@/components/ui";
import { LEGAL_UPDATED, TERMS } from "@/content/legal";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

const TITLE = "Terms — KeepMySnaps";
const DESCRIPTION =
  "The terms for KeepMySnaps: $5 once, the first 20 files free, refunds on request, run by an individual, and not affiliated with Snap Inc.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  // `openGraph` and `twitter` are replaced wholesale rather than merged, so
  // the image and card type have to be restated — leaving them out strips the
  // preview image and downgrades the card to `summary`.
  openGraph: {
    type: "website",
    siteName: "KeepMySnaps",
    title: TITLE,
    description: DESCRIPTION,
    url: "/terms",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main>
        <Section className="pt-16 pb-12 sm:pt-24 sm:pb-14">
          <Eyebrow>Terms</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Terms
          </h1>
          <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Last updated {LEGAL_UPDATED}
          </p>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <LegalProse blocks={TERMS} />
        </Section>
      </main>
      <Footer />
    </>
  );
}
