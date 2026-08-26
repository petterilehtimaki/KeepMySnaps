import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs } from "@/lib/jsonld";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { SNAGS, STAGES } from "@/content/waiting";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

const TITLE = "How long does a Snapchat export take? — KeepMySnaps";
const DESCRIPTION =
  "Anywhere from a few hours to a couple of days, and longer the closer it gets to the deadline. What happens while you wait, when the link expires, and what will be wrong with the archive when it finally lands.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/waiting-for-your-export" },
  openGraph: {
    type: "article",
    siteName: "KeepMySnaps",
    title: TITLE,
    description: DESCRIPTION,
    url: "/waiting-for-your-export",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const h2 =
  "text-[clamp(1.375rem,3vw,1.875rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance";
const body = "text-[0.9375rem] leading-[1.7] text-muted-cool";

export default function WaitingPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Waiting for your export", path: "/waiting-for-your-export" },
        ])}
      />
      <Nav />
      <main>
        <Section className="pt-16 pb-12 sm:pt-24 sm:pb-14">
          <Eyebrow>While you wait</Eyebrow>
          <h1 className="mt-4 max-w-[22ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            How long does a Snapchat export take?
          </h1>
          {/* Answers the headline on its own, because this is the paragraph
              that gets lifted into a search result or an AI answer. */}
          <p className="mt-6 max-w-[62ch] text-[1.0625rem] leading-[1.65] text-ink">
            Usually <strong>a few hours to a couple of days</strong>. Small
            accounts often get the email the same day; a library of several
            thousand memories takes longer, and everything slows down as the
            September deadline approaches and millions of people ask at once.
            Snapchat publishes no estimate and shows no progress, so there is
            nothing to refresh. This is the part nobody can hurry, which is the
            whole argument for requesting it now rather than in the last week.
          </p>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>What happens, in order</h2>
          <ol className="mt-8 flex flex-col gap-8">
            {STAGES.map((stage) => (
              <li
                key={stage.when}
                className="flex flex-col gap-2 border-l-2 border-hair pl-5 sm:pl-6"
              >
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {stage.when}
                </p>
                <p className="text-[1.0625rem] font-bold tracking-[-0.02em]">
                  {stage.what}
                </p>
                <p className={`max-w-[62ch] ${body}`}>{stage.detail}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>When it goes wrong</h2>
          <div className="mt-8 flex flex-col gap-7">
            {SNAGS.map((snag) => (
              <div key={snag.q} className="max-w-[68ch]">
                <p className="text-[1rem] font-bold tracking-[-0.015em]">
                  {snag.q}
                </p>
                <p className={`mt-2 max-w-[62ch] ${body}`}>{snag.a}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <div className="max-w-[70ch] border-t border-hair pt-10">
            <h2 className={h2}>And then the part nobody warns you about</h2>
            <p className={`mt-5 max-w-[62ch] ${body}`}>
              The archive arrives with the capture dates, GPS and captions
              stripped out. Every photo carries the day the export was built, so
              eight years of memories land in your library on a single date, out
              of order, with the text and stickers sitting in separate files
              beside them. The real dates and coordinates are in a JSON file
              right there in the ZIP — Snapchat just doesn&rsquo;t put them back
              into the media.
            </p>
            <p className={`mt-4 max-w-[62ch] ${body}`}>
              That is what this site fixes, in your browser, without uploading
              anything. Come back when the email lands. The first 20 files are
              free, so you can check the dates landed before deciding whether it
              was worth $5.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/how-it-works" className="w-full sm:w-auto">
                Request your export
              </ButtonLink>
              <ButtonLink
                href="/september-2026-deadline"
                variant="outline"
                className="w-full sm:w-auto"
              >
                How long you&rsquo;ve got
              </ButtonLink>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
