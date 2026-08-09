import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import FaqList from "@/components/FaqList";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { FAQS } from "@/content/faq";

export const metadata: Metadata = {
  title: "FAQ — KeepMySnaps",
  description:
    "Every question people actually ask about KeepMySnaps: whether we can see your photos (no), how to get your export out of Snapchat, what happens to captions and videos, and why it costs $5 once.",
};

export default function FaqPage() {
  return (
    <>
      <Nav />
      <main>
        <Section className="pt-16 pb-14 sm:pt-24 sm:pb-16">
          <Eyebrow>FAQ</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Questions people actually ask
          </h1>
          <p className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.6] text-muted-cool text-pretty">
            All of them, with the answers at full length rather than the
            versions we squeezed onto the homepage.
          </p>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <FaqList items={FAQS} expanded />

          <div className="mt-14 max-w-[70ch]">
            <p className="max-w-[52ch] text-[0.9375rem] leading-[1.65] text-muted-cool">
              Still stuck on something that isn&rsquo;t here? The step-by-step
              guide covers the Snapchat side in more detail.
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
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
