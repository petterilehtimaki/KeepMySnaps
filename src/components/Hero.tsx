import Countdown from "./Countdown";
import { ButtonLink, Section } from "./ui";

const STATS = [
  {
    title: "In your browser",
    body: "Nothing installed or uploaded. Your photos never touch a server, because there isn't one.",
  },
  {
    title: "$5, one time",
    body: "First 20 files free, so you can check it works before deciding we deserve money.",
  },
  {
    title: "Real dates, restored",
    body: "EXIF and GPS written back in, so your photos land on the day they happened.",
  },
  {
    title: "Save it anywhere",
    body: "You get an ordinary ZIP. Drive, Dropbox, camera roll, an external drive in a drawer.",
  },
];

export default function Hero() {
  return (
    <>
      <Section className="pt-20 pb-16 text-center sm:pt-28 sm:pb-20">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-muted">
          Snapchat deletes your memories in
        </p>

        <div className="mt-8 sm:mt-10">
          <Countdown />
        </div>

        <h1 className="mx-auto mt-14 max-w-[26ch] text-[clamp(1.75rem,4.6vw,2.75rem)] font-extrabold leading-[1.12] tracking-[-0.028em] text-balance sm:mt-18">
          Save your <span className="snap-mark">Snapchat</span> memories before
          they&rsquo;re gone
        </h1>

        <p className="mx-auto mt-6 max-w-[46ch] text-[1.0625rem] leading-[1.6] text-muted-cool text-pretty">
          Snapchat&rsquo;s export hands you a folder of undated files with the
          captions torn off. This puts the dates, locations and captions back —
          without uploading anything.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="#upload" className="w-full sm:w-auto">
            Save my memories
          </ButtonLink>
          <ButtonLink
            href="#how-it-works"
            variant="outline"
            className="w-full sm:w-auto"
          >
            How it works
          </ButtonLink>
        </div>
      </Section>

      <Section className="pb-24 sm:pb-32">
        <div className="grid grid-cols-1 gap-x-14 gap-y-11 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.title} className="max-w-[34ch]">
              <h2 className="text-[0.9375rem] font-bold tracking-[-0.01em] text-ink">
                {stat.title}
              </h2>
              <p className="mt-2 text-[0.9375rem] leading-[1.6] text-muted-cool">
                {stat.body}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
