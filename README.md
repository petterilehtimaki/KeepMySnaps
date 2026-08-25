# KeepMySnaps

Snapchat's data export hands you a folder of files stamped with the day the
export was built, with the captions torn off and the locations missing. The
real dates and coordinates are sitting in a JSON file right next to the photos.
This puts them back.

Everything runs in the browser. There is no server, no upload step and no
account — the ZIP is read, rewritten and repacked in the tab.

## Running it

```bash
npm install && npm run dev
```

```bash
npm test
```

## How the pipeline works

`src/lib/` holds the whole thing, in three pieces:

| File | Job |
| --- | --- |
| `snapchat.ts` | Parses `memories_history.json` and matches each entry to the file it belongs to |
| `exif.ts` | Writes capture time and GPS into JPEG EXIF via piexifjs |
| `process.ts` | Drives it: unzip → pair overlays → flatten → tag → repack |

**Matching** is the fiddly part, because Snapchat has shipped several shapes of
this export and the JSON doesn't reliably name the file each memory refers to.
Three passes run in order of trustworthiness: media ID found inside the
filename, then same-calendar-day ordering, then position within the export.
Anything still unmatched is reported in the summary rather than dropped.

**Captions** ship as separate transparent PNGs — that's why exported photos
look bare. Each overlay is composited onto its base photo on a canvas and the
result is re-encoded as JPEG.

**Videos** pass through untouched. MP4 has nowhere to put EXIF, so the capture
date is carried by the output filename and the ZIP entry's timestamp, which is
what the filesystem picks up on extract.

Output is one ZIP containing the fixed media, a `keepmysnaps-index.csv` of
every date and coordinate, and a README.

## A demo export

`scripts/make-demo-export.py` builds a ZIP shaped exactly like Snapchat's —
same layout, same filename convention, same `memories_history.json` — out of
generated abstract images and invented captions. Nothing in it belongs to
anybody, which is the point: screen-recording the tool working shouldn't mean
putting your own photos on camera.

```bash
npm run demo:make
npm run demo:verify -- ~/Desktop/keepmysnaps-demo-export.zip
```

It includes the awkward cases on purpose — overlays apart from their base,
thumbnails to ignore, entries with no file, a file with no entry, memories at
Null Island. The verifier runs the archive through the real matching passes and
exits non-zero if anything went unmatched that shouldn't have, which is the
only end-to-end check there is: the unit tests build their inputs in memory and
never open a ZIP.

Needs Pillow (`pip install pillow`) and, for the videos, ffmpeg. Neither is a
dependency of the app.

## The paywall

The first 20 files are free. Past that, `NEXT_PUBLIC_STRIPE_PAYMENT_LINK`
points at a Stripe Payment Link whose success URL is `/?unlocked=1`; that
parameter lifts the limit and is remembered in localStorage. See
`.env.example`. There is deliberately no server-side verification — anyone
determined enough to type a query parameter was never going to pay five
dollars, and adding a backend would mean the photos stop being none of our
business.

## Deadline

The countdown reads from `DEADLINE` in `src/lib/config.ts`, currently
26 September 2026 at 00:00 UTC — the end of the 12-month grace period that
began when the policy rolled out on 26 September 2025. That is the earliest
date deletion can start, not a universal cut-off: the rollout is per-account
from then on, which is why the copy says "can start deleting" rather than
naming the hour someone's photos disappear. Change it there if Snapchat moves.

## Notes

- Capture times are written in UTC, which is the only thing Snapchat records.
  EXIF's `OffsetTime` tags would say so explicitly, but piexifjs predates them
  and throws on unknown tags, so the GPS timestamp carries that instead.
- Large exports are processed one file at a time to keep memory flat, and the
  output ZIP is stored uncompressed — the media is already compressed, so
  deflating it again only costs time.

Not affiliated with Snapchat or Snap Inc.
