import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, deadlineEvent } from "@/lib/jsonld";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { OPTIONS, TIMELINE } from "@/content/deadline";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";

const TITLE = "When will Snapchat delete your memories? — KeepMySnaps";
const DESCRIPTION =
  "26 September 2026 is the earliest date Snapchat can start deleting Memories over 5GB — twelve months after the policy rolled out. Here is what was actually announced, what wasn't, and the three things you can do about it.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/september-2026-deadline" },
  openGraph: {
    type: "article",
    siteName: "KeepMySnaps",
    title: TITLE,
    description: DESCRIPTION,
    url: "/september-2026-deadline",
    images: [OG_IMAGE],
  },
  twitter: {
    card: TWITTER_CARD,
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

const h2 = "text-[clamp(1.375rem,3vw,1.875rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance";
const body = "text-[0.9375rem] leading-[1.7] text-muted-cool";

export default function DeadlinePage() {
  return (
    <>
      <JsonLd data={deadlineEvent()} />
      <JsonLd
        data={breadcrumbs([
          { name: "Home", path: "/" },
          { name: "The September 2026 deadline", path: "/september-2026-deadline" },
        ])}
      />
      <Nav />
      <main>
        <Section className="pt-16 pb-12 sm:pt-24 sm:pb-14">
          <Eyebrow>The deadline</Eyebrow>
          <h1 className="mt-4 max-w-[20ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            When will Snapchat delete your memories?
          </h1>
          {/* The lead answers the headline on its own. Anything that needs the
              paragraph above it to make sense can't be quoted out of context,
              and being quoted out of context is the point of this page. */}
          <p className="mt-6 max-w-[62ch] text-[1.0625rem] leading-[1.65] text-ink">
            The earliest date is <strong>26 September 2026</strong>. That is twelve
            months after Snapchat capped free Memories storage at 5GB on 26
            September 2025 and gave everyone already over the line a year of
            temporary storage. It is the first date deletion <em>can</em> start —
            not a moment when everyone&rsquo;s photos disappear together. Snapchat
            has not published a schedule beyond that, and anyone quoting you an
            exact hour is guessing.
          </p>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <div className="rounded-[10px] border border-hair bg-faint px-6 py-8 sm:px-10 sm:py-10">
            <Countdown />
          </div>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>What was actually announced</h2>
          <ol className="mt-8 flex flex-col gap-8">
            {TIMELINE.map((entry) => (
              <li key={entry.when} className="flex flex-col gap-2 border-l-2 border-hair pl-5 sm:pl-6">
                <p className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-muted tnum">
                  {entry.when}
                </p>
                <p className="text-[1.0625rem] font-bold tracking-[-0.02em]">
                  {entry.what}
                </p>
                <p className={`max-w-[62ch] ${body}`}>{entry.detail}</p>
              </li>
            ))}
          </ol>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>What happens if you do nothing</h2>
          <p className={`mt-5 max-w-[62ch] ${body}`}>
            Nothing at all, if your Memories fit inside 5GB — the cap only bites
            above the line, and your oldest Memories are the ones that fit under
            it. If you are over, the excess is what goes, and Snapchat has said
            it will be gone rather than archived. There is no recovery step
            afterwards and no way to buy it back later.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            You can check where you stand in the app under Settings &rarr;
            Manage &rarr; Memories, which shows what you are using against the
            5GB you get free.
          </p>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>The three things you can do</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {OPTIONS.map((option) => (
              <div
                key={option.name}
                className="flex flex-col gap-3 rounded-[10px] border border-hair p-6"
              >
                <p className="text-[1.0625rem] font-bold tracking-[-0.02em]">
                  {option.name}
                </p>
                <p className="text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  {option.cost}
                </p>
                <p className={body}>{option.gets}</p>
                <p className={`mt-auto pt-1 text-[0.875rem] leading-[1.65] text-muted-cool`}>
                  <span className="font-semibold text-ink">The catch. </span>
                  {option.catch}
                </p>
              </div>
            ))}
          </div>
          <p className={`mt-8 max-w-[62ch] ${body}`}>
            Paying is the right answer for some people and it is worth saying so
            plainly: if you want your Memories to stay in Snapchat, where the
            app can show them back to you, $1.99 a month buys exactly that and
            no export will replace it. Exporting is the right answer if you want
            the files to be yours.
          </p>
        </Section>

        <Section className="pb-20 sm:pb-24">
          <h2 className={h2}>Why waiting until September is the expensive move</h2>
          <p className={`mt-5 max-w-[62ch] ${body}`}>
            Requesting your data is not the same as having it. Snapchat builds
            the archive on its own schedule and emails a link when it is done,
            which takes anywhere from a few hours to a couple of days for a
            large Memories library — and that is under normal load, before
            millions of people ask at once in the final week.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            The download links in that email also expire. Reports of the window
            range from about 72 hours to seven days, and Snapchat does not
            document it clearly, so treat it as short: download the ZIP the day
            the email lands rather than the weekend after. Miss it and you are
            back at the start of the queue.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            Request it now, even if you have not decided what to do yet. The
            export costs nothing, commits you to nothing, and the wait is the
            one part of this nobody can speed up.
          </p>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <div className="max-w-[70ch] border-t border-hair pt-10">
            <h2 className={h2}>Then the part nobody warns you about</h2>
            <p className={`mt-5 max-w-[62ch] ${body}`}>
              The archive arrives with the capture dates, GPS coordinates and
              captions stripped out. Every photo is stamped with the day the
              export was built, so eight years of Memories land in your photo
              library on a single date, in no order, with the text overlays
              sitting in separate files. The real dates and coordinates are in a
              JSON file right next to the media — Snapchat just doesn&rsquo;t put
              them back into the photos.
            </p>
            <p className={`mt-4 max-w-[62ch] ${body}`}>
              That is what this site does, in your browser, without uploading
              anything. The first 20 files are free, so you can check the dates
              landed before deciding whether it was worth $5.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/#upload" className="w-full sm:w-auto">
                Save my memories
              </ButtonLink>
              <ButtonLink
                href="/how-it-works"
                variant="outline"
                className="w-full sm:w-auto"
              >
                How to request your export
              </ButtonLink>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
