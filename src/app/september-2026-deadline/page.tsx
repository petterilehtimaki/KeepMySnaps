import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Countdown from "@/components/Countdown";
import JsonLd from "@/components/JsonLd";
import { breadcrumbs, deadlineEvent } from "@/lib/jsonld";
import { ButtonLink, Eyebrow, Section } from "@/components/ui";
import { OPTIONS, TIMELINE } from "@/content/deadline";
import { OG_IMAGE, TWITTER_CARD } from "@/lib/seo";
import SaveButton from "@/components/SaveButton";

/**
 * The URL keeps "september-2026-deadline" on purpose.
 *
 * It's the phrase people search, because it's the date nearly everyone —
 * including an earlier version of this page — has been repeating. Snapchat's
 * own support page says there is no deletion at all, and that archiving starts
 * in January 2027 at the earliest. So this address now answers the question
 * the way Snapchat does, which is the one page on the subject worth landing on.
 */

const SOURCE =
  "https://help.snapchat.com/hc/en-us/articles/41291271694228-How-do-I-manage-my-Memories-storage";

const TITLE = "Is Snapchat deleting memories in September 2026? No. — KeepMySnaps";
const DESCRIPTION =
  "There's no September 2026 deletion. Snapchat says it won't delete Memories over 5GB — from January 2027 it archives them as thumbnails you pay to open. What's actually changing, and what to do about it.";

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

const h2 =
  "text-[clamp(1.375rem,3vw,1.875rem)] font-extrabold leading-[1.15] tracking-[-0.025em] text-balance";
const body = "text-[0.9375rem] leading-[1.7] text-muted-cool";
const quote =
  "border-l-2 border-hair pl-5 text-[0.9375rem] leading-[1.7] text-ink sm:pl-6";

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
          <h1 className="mt-4 max-w-[22ch] text-[clamp(1.75rem,4.2vw,2.75rem)] font-extrabold leading-[1.13] tracking-[-0.028em] text-balance">
            Is Snapchat deleting your memories in September 2026?
          </h1>
          {/* Answers the headline on its own, because this is the paragraph
              that gets quoted — and the answer most people expect is wrong. */}
          <p className="mt-6 max-w-[62ch] text-[1.0625rem] leading-[1.65] text-ink">
            <strong>No.</strong> Snapchat&rsquo;s own support page answers it
            directly: nothing over the 5GB limit is deleted. What happens
            instead starts in <strong>January 2027</strong> at the earliest —
            Memories more than a year old that aren&rsquo;t part of your oldest
            5GB get archived, which means they stay in the app as thumbnails
            you have to pay to open, edit or share. The 26 September 2026 date
            everyone repeats is when the 12 months of temporary storage runs
            out, not when anything is removed.
          </p>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <div className="rounded-[10px] border border-hair bg-faint px-6 py-8 text-center sm:px-10 sm:py-10">
            <Countdown withEyebrow />
          </div>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>What Snapchat actually said</h2>
          <div className="mt-8 flex max-w-[64ch] flex-col gap-4">
            <p className={quote}>
              &ldquo;No. Snapchat will not automatically delete your Memories
              because you do not upgrade.&rdquo;
            </p>
            <p className={quote}>
              &ldquo;No Memories will be archived before January 2027, and we
              will provide advance notice in the app before anything changes
              for you.&rdquo;
            </p>
            <p className={quote}>
              &ldquo;Archived Memories will appear as thumbnails in the app, but
              you will need to upgrade your storage to open, edit, or share
              them.&rdquo;
            </p>
            <p className="text-[0.8125rem] leading-[1.6] text-muted-cool">
              From{" "}
              <a
                href={SOURCE}
                className="font-semibold text-ink underline underline-offset-4"
                rel="noopener"
              >
                Snapchat Support
              </a>
              , checked 13 September 2026.
            </p>
          </div>

          <ol className="mt-12 flex flex-col gap-8">
            {TIMELINE.map((entry) => (
              <li
                key={entry.when}
                className="flex flex-col gap-2 border-l-2 border-hair pl-5 sm:pl-6"
              >
                <p className="tnum text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-muted">
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
          <h2 className={h2}>What &ldquo;archived&rdquo; means for you</h2>
          <p className={`mt-5 max-w-[62ch] ${body}`}>
            It&rsquo;s more specific than it sounds. An archived memory isn&rsquo;t
            gone and isn&rsquo;t hidden — you&rsquo;ll still see it in the app —
            but only as a thumbnail. The full photo or video is behind a storage
            plan for as long as you want to look at it.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            Two parts of your library stay fully usable for free: everything
            saved in the last year, and your oldest 5GB. What gets archived is
            everything in between — which, for anyone who has used Snapchat for
            a few years, is usually most of it.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            You can check where you stand in the app under Settings &rarr;
            Manage &rarr; Memories, which shows what you&rsquo;re using against
            the 5GB you get free.
          </p>
        </Section>

        <Section className="pb-16 sm:pb-20">
          <h2 className={h2}>So why does everyone say September?</h2>
          <p className={`mt-5 max-w-[62ch] ${body}`}>
            When Snapchat announced storage plans on 26 September 2025, it
            promised affected accounts 12 months of temporary storage. Twelve
            months from then is 26 September 2026, and a great deal of coverage
            — and most of the tools selling a fix, including an earlier version
            of this page — read the end of that window as the start of
            deletion. Snapchat&rsquo;s announcement never said that.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            Its support page now says the opposite, and it&rsquo;s the one
            source that gets to decide. If you&rsquo;re looking at a countdown
            to 26 September somewhere, it&rsquo;s counting down to the end of a
            grace period, not the loss of anything.
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
                <p className="mt-auto pt-1 text-[0.875rem] leading-[1.65] text-muted-cool">
                  <span className="font-semibold text-ink">The catch. </span>
                  {option.catch}
                </p>
              </div>
            ))}
          </div>
          <p className={`mt-8 max-w-[62ch] ${body}`}>
            Paying is the right answer for some people, and it&rsquo;s worth
            saying so plainly: if what you want is your Memories inside
            Snapchat, where the app shows them back to you, a storage plan buys
            exactly that and no export replaces it. Exporting is the right
            answer if you want the files to be yours — or if you&rsquo;re
            paying now and suspect you won&rsquo;t want to forever.
          </p>
        </Section>

        <Section className="pb-20 sm:pb-24">
          <h2 className={h2}>Why it&rsquo;s still worth exporting soon</h2>
          <p className={`mt-5 max-w-[62ch] ${body}`}>
            None of this is an emergency, but the export is the slow part.
            Snapchat builds the archive on its own schedule and emails a link
            when it&rsquo;s done — a few hours to a couple of days for a large
            library, and longer when a lot of people ask at once. A lot of
            people are about to, because they believe the September date.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            The download links in that email expire, too. Reports of the window
            range from about 72 hours to seven days and Snapchat doesn&rsquo;t
            document it, so download the ZIP the day the email lands.
          </p>
          <p className={`mt-4 max-w-[62ch] ${body}`}>
            Request it now, even if you&rsquo;ve decided to pay. The export
            costs nothing, commits you to nothing, and gets you the full-quality
            files while every one of them is still openable.
          </p>
        </Section>

        <Section className="pb-24 sm:pb-32">
          <div className="max-w-[70ch] border-t border-hair pt-10">
            <h2 className={h2}>Then the part nobody warns you about</h2>
            <p className={`mt-5 max-w-[62ch] ${body}`}>
              The archive arrives with the capture dates, GPS coordinates and
              captions stripped out. Every photo is stamped with the day the
              export was built, so years of Memories land in your photo library
              on a single date, in no order, with the text, stickers and
              location filters sitting in separate files. The real dates and
              coordinates are in a JSON file right next to the media — Snapchat
              just doesn&rsquo;t put them back into the photos.
            </p>
            <p className={`mt-4 max-w-[62ch] ${body}`}>
              That is what this site does, in your browser, without uploading
              anything. The first 20 files are free, so you can check the dates
              landed before deciding whether it was worth $5.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SaveButton className="w-full sm:w-auto" />
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
