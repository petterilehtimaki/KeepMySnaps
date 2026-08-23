import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs } from "@/lib/jsonld";
import LegalProse from "@/components/Legal";
import { Eyebrow, Section } from "@/components/ui";
import { LEGAL_UPDATED, PRIVACY } from "@/content/legal";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

const TITLE = "Privacy — KeepMySnaps";
const DESCRIPTION =
  "What happens to data on KeepMySnaps: nothing is uploaded, everything runs in your browser, there is no analytics and no tracking, and the only record kept is a Stripe payment id.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  // `openGraph` and `twitter` are replaced wholesale rather than merged, so
  // the image and card type have to be restated — leaving them out strips the
  // preview image and downgrades the card to `summary`.
  openGraph: {
    type: "website",
    siteName: "KeepMySnaps",
    title: TITLE,
    description: DESCRIPTION,
    url: "/privacy",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function PrivacyPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Privacy", path: "/privacy" },
        ])}
      />
      <Nav />
      <main>
        <Section className="pt-16 pb-12 sm:pt-24 sm:pb-14">
          <Eyebrow>Privacy</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Privacy Policy
          </h1>
          <p className="mt-5 text-[0.8125rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Last updated {LEGAL_UPDATED}
          </p>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <LegalProse blocks={PRIVACY} />
        </Section>
      </main>
      <Footer />
    </>
  );
}
