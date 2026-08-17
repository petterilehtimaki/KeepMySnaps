import type { ReactNode } from "react";
import Countdown from "./Countdown";
import { ButtonLink, Section } from "./ui";

/** Line-only icons — no fills, no colour, no rounded tiles. */
const icon = {
  browser: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 9.5h18M6.5 7.25h.01" />
    </>
  ),
  tag: (
    <>
      <path d="M12.7 3.5H5.4A1.9 1.9 0 0 0 3.5 5.4v7.3c0 .5.2 1 .6 1.3l6.9 6.9a1.9 1.9 0 0 0 2.7 0l6.6-6.6a1.9 1.9 0 0 0 0-2.7L14 4.1a1.9 1.9 0 0 0-1.3-.6Z" />
      <circle cx="8.2" cy="8.2" r="1.15" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5.5" width="18" height="15" rx="2" />
      <path d="M3 10.5h18M8 3v4.5M16 3v4.5" />
    </>
  ),
  save: (
    <>
      <path d="M12 3.5v11" />
      <path d="M7.75 10.25 12 14.5l4.25-4.25" />
      <path d="M4 16.5v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </>
  ),
} satisfies Record<string, ReactNode>;

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const FEATURES = [
  {
    icon: icon.browser,
    title: "In your browser",
    body: "No install, no account, no upload queue. It starts working the second you drop the file in.",
  },
  {
    icon: icon.tag,
    title: "$5, one time",
    body: "First 20 files free, so you can check it works before deciding we deserve money.",
  },
  {
    icon: icon.calendar,
    title: "Real dates, restored",
    body: "EXIF and GPS written back in, so your photos land on the day they happened.",
  },
  {
    icon: icon.save,
    title: "Save it anywhere",
    body: "You get an ordinary ZIP. Drive, Dropbox, camera roll, an external drive in a drawer.",
  },
];

export default function Hero() {
  return (
    <>
      <Section className="pt-20 pb-14 text-center sm:pt-28 sm:pb-16">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-muted">
          Snapchat can start deleting memories in
        </p>

        <div className="mt-8 sm:mt-10">
          <Countdown />
        </div>

        <h1 className="mx-auto mt-14 max-w-[26ch] text-[clamp(1.75rem,4.6vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.028em] text-balance sm:mt-16">
          Save your <span className="snap-mark">Snapchat</span> memories before
          they&rsquo;re gone
        </h1>

        <p className="mx-auto mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.6] text-muted-cool text-pretty">
          Snapchat&rsquo;s export hands you a folder of undated files with the
          captions torn off. This puts the dates, locations and captions back —
          without uploading anything.
        </p>

        <div className="mt-10 flex justify-center">
          <ButtonLink href="#upload" className="w-full sm:w-auto">
            Save my memories
          </ButtonLink>
        </div>
      </Section>

      <Section className="pt-10 pb-28 sm:pt-16 sm:pb-36">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-[12px] bg-faint p-7 sm:p-8"
            >
              <span className="block text-ink">
                <Icon>{feature.icon}</Icon>
              </span>
              <h2 className="mt-5 text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">
                {feature.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted-cool">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
