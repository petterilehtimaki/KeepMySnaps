import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MyDataMockup from "@/components/MyDataMockup";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { STEPS } from "@/content/steps";

export const metadata: Metadata = {
  title: "How it works — KeepMySnaps",
  description:
    "The long version: how to request your Snapchat export, what to drop in, and exactly which metadata gets written back into your photos. Three steps, one of which is just waiting for Snapchat.",
};

export default function HowItWorksPage() {
  return (
    <>
      <Nav />
      <main>
        <Section className="pt-16 pb-20 sm:pt-24 sm:pb-24">
          <Eyebrow>How it works</Eyebrow>
          <h1 className="mt-4 max-w-[24ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Three steps, one of which is just waiting for Snapchat
          </h1>
          <p className="mt-6 max-w-[54ch] text-[1.0625rem] leading-[1.6] text-muted-cool text-pretty">
            The homepage has this in three sentences. This is the version with
            the parts we left out — including the checkbox that quietly decides
            whether your export contains any photos at all.
          </p>
        </Section>

        {STEPS.map((step, i) => (
          <Section
            key={step.n}
            className={i === 0 ? "pb-20 sm:pb-24" : "pt-4 pb-20 sm:pb-24"}
          >
            <div className="border-t border-hair pt-10">
              <span className="tnum block text-[1.375rem] font-extrabold tracking-[-0.02em] text-colon">
                {step.n}
              </span>
              <h2 className="mt-4 max-w-[24ch] text-[clamp(1.375rem,2.6vw,1.75rem)] font-extrabold leading-[1.18] tracking-[-0.022em] text-balance">
                {step.title}
              </h2>

              <div className="mt-6 max-w-[62ch] space-y-4">
                {step.long.map((para) => (
                  <p
                    key={para.slice(0, 40)}
                    className="text-[0.9375rem] leading-[1.7] text-muted-cool"
                  >
                    {para}
                  </p>
                ))}
              </div>

              {step.n === "01" && <MyDataMockup />}
            </div>
          </Section>
        ))}

        <Section className="pb-24 sm:pb-32">
          <div className="border-t border-hair pt-12">
            <h2 className="max-w-[24ch] text-[clamp(1.375rem,2.6vw,1.75rem)] font-extrabold leading-[1.18] tracking-[-0.022em] text-balance">
              That&rsquo;s the whole thing
            </h2>
            <p className="mt-4 max-w-[52ch] text-[0.9375rem] leading-[1.65] text-muted-cool">
              There is no step four. If your export has already arrived, the
              drop zone is waiting on the homepage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#upload" className="w-full sm:w-auto">
                Save my memories
              </ButtonLink>
              <ButtonLink href="/faq" variant="outline" className="w-full sm:w-auto">
                Read the FAQ
              </ButtonLink>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
