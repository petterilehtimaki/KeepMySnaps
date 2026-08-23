import { FAQS } from "@/content/faq";
import { DEADLINE, FREE_FILE_LIMIT, PRICE_LABEL } from "@/lib/config";
import { absoluteUrl } from "@/lib/seo";

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
each entry to its file, composites the overlays back on, and writes the result
into JPEG EXIF. Videos keep their date via the filename and ZIP entry timestamp,
because MP4 has nowhere to store EXIF.

## Deadline

Snapchat's 5GB Memories limit rolled out on 26 September 2025 with a 12-month
grace period, so ${DEADLINE_TEXT} is the earliest date deletion can begin. The
rollout is per-account from then on — it is not a universal cut-off hour.

## Price

The first ${FREE_FILE_LIMIT} files are free. Past that it is ${PRICE_LABEL} once, for any number of
files. Refunds on request.

## Pages

${[
  ["Home and uploader", "/"],
  ["How it works — requesting the export, step by step", "/how-it-works"],
  ["FAQ", "/faq"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
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
