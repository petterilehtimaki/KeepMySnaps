import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs } from "@/lib/jsonld";
import FaqList from "@/components/FaqList";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { FAQS } from "@/content/faq";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

const TITLE = "FAQ — KeepMySnaps";
const DESCRIPTION =
  "Whether we can see your photos (no), how to get your export out of Snapchat, why it costs $5 once, and what happens to videos.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
  // `openGraph` and `twitter` are replaced wholesale rather than merged, so
  // the image and card type have to be restated — leaving them out strips the
  // preview image and downgrades the card to `summary`.
  openGraph: {
    type: "website",
    siteName: "KeepMySnaps",
    title: TITLE,
    description: DESCRIPTION,
    url: "/faq",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "FAQ", path: "/faq" },
        ])}
      />
      <Nav />
      <main>
        <Section className="pt-16 pb-14 sm:pt-24 sm:pb-16">
          <Eyebrow>FAQ</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Questions people actually ask
          </h1>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <FaqList items={FAQS} />

          <div className="mt-14 max-w-[70ch]">
            <p className="max-w-[52ch] text-[0.9375rem] leading-[1.65] text-muted-cool">
              Still stuck on something that isn&rsquo;t here? The step-by-step
              guide covers the Snapchat side in more detail, and there&rsquo;s a
              contact form if it doesn&rsquo;t.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#upload" className="w-full sm:w-auto">
                Save my memories
              </ButtonLink>
              <ButtonLink
                href="/how-it-works"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Read how it works
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="outline"
                className="w-full sm:w-auto"
              >
                Ask a person
              </ButtonLink>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
