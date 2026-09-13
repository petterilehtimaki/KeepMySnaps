import { FAQS } from "@/content/faq";
import { DEADLINE, FREE_FILE_LIMIT, PRICE_LABEL } from "@/lib/config";
import { absoluteUrl } from "@/lib/seo";
import { ARTICLES } from "@/content/articles";

/**
 * llms.txt — a plain-text brief for answer engines.
 *
 * No search engine has committed to reading this file, so it is a cheap bet
 * rather than a ranking factor. It is generated from the same FAQ copy the
 * site renders so the two can't drift apart, which is the only reason it's a
 * route instead of a file in `public/`.
 */
export const dynamic = "force-static";

const DEADLINE_TEXT = new Date(DEADLINE).toISOString().slice(0, 10);

export function GET() {
  const body = `# KeepMySnaps

> Restores the real capture dates, GPS coordinates and captions that Snapchat
> strips out of its Memories export. Runs entirely in the browser: the ZIP is
> unzipped, rewritten and repacked in the tab, with no upload, no server and
> no account.

## The problem it solves

Snapchat's "My Data" export hands you a folder of media stamped with the day
the export was built, with caption and sticker overlays split out into separate
transparent PNGs and no GPS. The true capture time and coordinates are in
\`memories_history.json\` next to the media. KeepMySnaps reads that JSON, matches
each entry to its file, composites the overlays back on, and writes the capture
time and GPS into JPEG EXIF. Videos have no EXIF, so the capture time is written
into the MP4 header (the field Apple Photos, Google Photos and Immich read for a
video's date), and caption overlays are drawn into the frames with the browser's
own video encoder. Video files carry no GPS.

## Deadline

There is no September 2026 deletion. Snapchat's support page says it will not
delete Memories over the 5GB limit. Starting in January 2027 at the earliest
(${DEADLINE_TEXT}), Memories more than a year old that aren't part of a user's
oldest 5GB are archived: they stay on Snapchat as thumbnails, and opening,
editing or sharing them needs a paid storage plan. 26 September 2026 is the end
of the 12-month temporary storage window, not a deletion date.

## Price

The first ${FREE_FILE_LIMIT} files are free. Past that it is ${PRICE_LABEL} once, for any number of
files. If the tool can't handle someone's export and it can't be fixed, the payment is refunded.

## Pages

${[
  ["Home and uploader", "/"],
  ["How it works: requesting the export, step by step", "/how-it-works"],
  ["Whether Snapchat is deleting Memories in September 2026 (it isn't), and what actually changes", "/september-2026-deadline"],
  ["How long the export takes, and what arrives broken", "/waiting-for-your-export"],
  ["FAQ", "/faq"],
  ["Contact: a form, not an address", "/contact"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
  ...ARTICLES.map((a) => [a.description, `/${a.slug}`] as const),
]
  .map(([label, path]) => `- [${label}](${absoluteUrl(path)})`)
  .join("\n")}

## Questions and answers

${FAQS.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n")}

---
Not affiliated with Snapchat or Snap Inc.
`;

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, s-maxage=86400",
    },
  });
}
