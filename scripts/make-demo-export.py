#!/usr/bin/env python3
"""
Builds a synthetic Snapchat Memories export.

The output is a set of ZIPs shaped exactly like the real thing — same directory
layout, same filename convention, same `memories_history.json` — but every
photo is generated abstract art and every caption is invented. Nothing in it
belongs to anybody.

That makes it three things at once:

  * demo footage you can screen-record without putting your own life on camera
  * screenshots for the site's pages
  * an end-to-end fixture, which the unit tests don't give us — they build
    their inputs in memory and never see a real ZIP

The layout, taken from a real seven-part export:

    mydata~<stamp>.zip      -> mydata~<stamp>/index.html
                               mydata~<stamp>/html/faq.html
                               mydata~<stamp>/html/memories_history.html
                               mydata~<stamp>/json/memories_history.json
                               mydata~<stamp>/memories/<media>
    mydata~<stamp>-2.zip    -> memories/<media>
    ... through -7.zip         (bare memories/, no wrapper, no JSON)

Unzipping all of them in one folder is why you end up with memories,
memories 2, memories 3 and so on beside a single mydata~<stamp> folder.
Only the first ZIP holds the dates, which is why a part on its own produces
a pile of undated files.

The archive deliberately includes the awkward cases the parser exists to
survive: overlay PNGs sitting apart from their base, thumbnails that must be
ignored, entries with no file, a file with no entry, and a few memories with
no location at all. A demo that only contains the happy path proves nothing.

Usage:
    python3 scripts/make-demo-export.py
    python3 scripts/make-demo-export.py --out ~/Desktop --count 60
    python3 scripts/make-demo-export.py --photos ~/Desktop/demo-photos

Requires Pillow (`pip install pillow`). This is a development tool — it is not
imported by the app and does not run in CI.
"""

from __future__ import annotations

import argparse
import json
import math
import random
import shutil
import subprocess
import zipfile
from datetime import datetime, timedelta, timezone
from io import BytesIO
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFilter, ImageFont
except ImportError:  # pragma: no cover - a dev-tool dependency, not the app's
    raise SystemExit("This script needs Pillow. Install it with: pip install pillow")

# Deterministic on purpose: re-running gives you the same archive, so a
# screenshot taken today still matches the one you take next week.
SEED = 20260925

# The epoch-ish suffix Snapchat puts on the archive name.
SPLIT_STAMP = "1786724342212"

# City centres, so nowhere anybody lives.
#
# The name and the coordinates travel together deliberately: a geofilter
# reading LOS ANGELES over a pin dropped in Finland is exactly the sort of
# detail that gives a demo away the moment someone opens the map view.
PLACES = [
    ("LOS ANGELES", 34.05223, -118.24368),
    ("SAN FRANCISCO", 37.77493, -122.41942),
    ("AUSTIN", 30.26715, -97.74306),
    ("NEW YORK", 40.71278, -74.00594),
    ("CHICAGO", 41.87811, -87.62980),
    ("MIAMI", 25.76168, -80.19179),
    ("SEATTLE", 47.60621, -122.33207),
    ("DENVER", 39.73924, -104.99025),
    ("NASHVILLE", 36.16266, -86.78160),
    ("PORTLAND", 45.51523, -122.67843),
]

# Short, ordinary, and about nobody.
CAPTIONS = [
    "3am", "beach day", "finally", "the good table", "day one",
    "worth it", "again", "last one", "hello from the floor", "no notes",
    "peak", "we made it", "same time next year", "sunday", "before",
    "after", "one more", "look at this", "still going", "closed",
    "found it", "nearly there", "brb", "this is fine", "morning",
]

PALETTES = [
    ((250, 214, 90), (232, 108, 62)),
    ((94, 154, 214), (30, 60, 120)),
    ((236, 118, 160), (108, 46, 116)),
    ((122, 200, 158), (24, 90, 82)),
    ((248, 176, 122), (166, 66, 74)),
    ((150, 142, 220), (48, 40, 104)),
    ((240, 240, 232), (140, 148, 150)),
    ((90, 190, 200), (18, 70, 96)),
]


def gradient(size: tuple[int, int], top: tuple, bottom: tuple, rng: random.Random) -> Image.Image:
    """A vertical gradient with a few soft shapes over it."""
    w, h = size
    img = Image.new("RGB", (1, h))
    px = img.load()
    for y in range(h):
        t = y / max(1, h - 1)
        px[0, y] = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
    img = img.resize((w, h), Image.BILINEAR)

    shapes = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pen = ImageDraw.Draw(shapes)
    for _ in range(rng.randint(2, 5)):
        cx, cy = rng.randint(0, w), rng.randint(0, h)
        r = rng.randint(w // 8, w // 2)
        tint = (rng.randint(0, 255), rng.randint(0, 255), rng.randint(0, 255), rng.randint(18, 55))
        pen.ellipse((cx - r, cy - r, cx + r, cy + r), fill=tint)
    shapes = shapes.filter(ImageFilter.GaussianBlur(radius=w // 40))
    img = Image.alpha_composite(img.convert("RGBA"), shapes).convert("RGB")

    grain = Image.effect_noise((w, h), 14).convert("L")
    return Image.blend(img, Image.merge("RGB", (grain, grain, grain)), 0.05)


class PhotoPool:
    """Real photos to use instead of the generated art, if you have some.

    The gradients are honest about being fake, which is right for a fixture and
    wrong for a tutorial video: a viewer watching you rescue eight years of
    abstract art does not feel what someone rescuing their own photos feels.
    Point `--photos` at a folder (generated images are fine, and nobody's real
    life ends up on camera) and each memory takes the next one, centre-cropped
    to the frame it needs. Fewer photos than memories just means the folder
    repeats.
    """

    SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".heic"}

    def __init__(self, folder: Path):
        self.paths = sorted(p for p in folder.iterdir() if p.suffix.lower() in self.SUFFIXES)
        if not self.paths:
            raise SystemExit(f"No images in {folder}. Looked for {', '.join(sorted(self.SUFFIXES))}.")
        self.cursor = 0

    def frame(self, size: tuple[int, int]) -> Image.Image:
        src = self.paths[self.cursor % len(self.paths)]
        self.cursor += 1
        try:
            img = Image.open(src).convert("RGB")
        except OSError as exc:  # HEIC without a plugin is the usual one
            raise SystemExit(f"Could not read {src.name}: {exc}")
        w, h = size
        scale = max(w / img.width, h / img.height)
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        left, top = (img.width - w) // 2, (img.height - h) // 2
        return img.crop((left, top, left + w, top + h))


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ):
        if Path(candidate).exists():
            try:
                return ImageFont.truetype(candidate, size)
            except OSError:
                continue
    return ImageFont.load_default()


def overlay_png(size: tuple[int, int], text: str, place: str | None = None) -> bytes:
    """
    The overlay layer: transparent everywhere except what was drawn on top.

    Snapchat composes the caption, the stickers, the drawings and the location
    filter into this single PNG, which is exactly why exported photos look bare
    and why putting this one file back restores all of it at once. Both styles
    below land in the same layer for that reason.
    """
    w, h = size
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pen = ImageDraw.Draw(img)

    if text:
        font = load_font(max(22, w // 16))
        box = pen.textbbox((0, 0), text, font=font)
        tw, th = box[2] - box[0], box[3] - box[1]
        bar_h = th + h // 22
        top = int(h * 0.62)
        pen.rectangle((0, top, w, top + bar_h), fill=(0, 0, 0, 130))
        pen.text(
            ((w - tw) / 2 - box[0], top + (bar_h - th) / 2 - box[1]),
            text, font=font, fill=(255, 255, 255, 255),
        )

    if place:
        # A geofilter: the place name across the frame, no bar behind it, with
        # a rule above and below. No box to hide behind means the shadow is
        # what keeps it readable over a bright photo — same as the real ones.
        gf = load_font(max(26, w // 11))
        spaced = " ".join(place)
        box = pen.textbbox((0, 0), spaced, font=gf)
        tw, th = box[2] - box[0], box[3] - box[1]
        y = int(h * 0.80)
        x = (w - tw) / 2 - box[0]
        for dx, dy in ((2, 2), (-2, 2), (2, -2), (-2, -2)):
            pen.text((x + dx, y + dy - box[1]), spaced, font=gf, fill=(0, 0, 0, 90))
        pen.text((x, y - box[1]), spaced, font=gf, fill=(255, 255, 255, 245))
        rule_w = min(w - 80, tw + 80)
        rx = (w - rule_w) / 2
        pen.rectangle((rx, y - th * 0.55, rx + rule_w, y - th * 0.55 + 3), fill=(255, 255, 255, 200))
        pen.rectangle((rx, y + th * 1.35, rx + rule_w, y + th * 1.35 + 3), fill=(255, 255, 255, 200))

    out = BytesIO()
    img.save(out, "PNG")
    return out.getvalue()


def make_video(path: Path, frame: Image.Image, seconds: int = 3) -> bool:
    """A still-image MP4, so the archive has real videos to pass through."""
    if not shutil.which("ffmpeg"):
        return False
    still = path.with_suffix(".still.png")
    frame.save(still, "PNG")
    try:
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-loop", "1", "-i", str(still),
             "-t", str(seconds), "-r", "24", "-pix_fmt", "yuv420p",
             "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", str(path)],
            check=True,
        )
        return True
    finally:
        still.unlink(missing_ok=True)


def media_id(rng: random.Random) -> str:
    """
    A UUID, because that is what Snapchat puts in the filename:
    `2021-10-07_C45000BA-E542-409E-9A4E-C74223CFE277-main.jpg`.

    Note what it is *not* in: the JSON. A real `memories_history.json` entry
    carries Date, Media Type, Location and two empty download URLs, and no id
    of any kind — so there is nothing to join this to. That is the whole reason
    matching is hard, and an export that pretends otherwise tests nothing.
    """
    hexes = "0123456789ABCDEF"
    take = lambda n: "".join(rng.choice(hexes) for _ in range(n))
    return f"{take(8)}-{take(4)}-{take(4)}-{take(4)}-{take(12)}"


def build(out_dir: Path, count: int, parts: int, photos: PhotoPool | None = None, hero: int = 0) -> Path:
    rng = random.Random(SEED)
    work = out_dir / "keepmysnaps-demo-export"
    if work.exists():
        shutil.rmtree(work)
    (work / "mydata" / "memories").mkdir(parents=True)
    (work / "mydata" / "json").mkdir(parents=True)
    (work / "mydata" / "html").mkdir(parents=True)

    memories_dir = work / "mydata" / "memories"
    has_ffmpeg = shutil.which("ffmpeg") is not None
    if not has_ffmpeg:
        print("! ffmpeg not found — the archive will be photos only.")

    # Spread the memories over eight years, newest first, the way Snapchat
    # lists them. Clustered rather than evenly spaced: real libraries have
    # holidays in them. The gap scales with `count` so the span stays eight
    # years whether you ask for twenty memories or two hundred — an archive
    # covering one summer doesn't demonstrate the thing this tool fixes.
    now = datetime(2026, 8, 1, tzinfo=timezone.utc)
    mean_burst = 3.9
    mean_gap = max(4, round(8 * 365 / max(1, count / mean_burst)))
    stamps: list[datetime] = []
    cursor = now
    while len(stamps) < count:
        cursor -= timedelta(days=rng.randint(max(2, mean_gap // 3), mean_gap * 2))
        for i in range(rng.choice([1, 2, 2, 3, 4, 5, 6, 8])):
            if len(stamps) >= count:
                break
            stamps.append(cursor - timedelta(hours=i * rng.randint(1, 5)))

    # Each calendar day gets one town, chosen once. Occasional travel days
    # still happen because consecutive days draw independently.
    day_place = {
        d: PLACES[rng.randrange(len(PLACES))]
        for d in {w.strftime("%Y-%m-%d") for w in stamps}
    }

    entries = []
    truth: dict[str, dict] = {}
    hero_stems: set[str] = set()

    # Where the hero batch starts. `stamps` runs newest first, so everything
    # from here on is older. The cut is nudged back so a day is never split
    # between the bundle ZIP and a continuation: the site's free run takes the
    # oldest 20 by timestamp, and a half-split day could hand one of those
    # slots to a filler file sitting in another ZIP.
    hero_cut = len(stamps) - hero if hero else len(stamps)
    while 0 < hero_cut < len(stamps) and stamps[hero_cut - 1].date() == stamps[hero_cut].date():
        hero_cut -= 1
    for index, when in enumerate(stamps):
        mid = media_id(rng)
        day = when.strftime("%Y-%m-%d")
        is_video = has_ffmpeg and index % 6 == 5
        stem = f"{day}_{mid}"

        top, bottom = PALETTES[index % len(PALETTES)]
        size = (1080, 1920) if index % 3 else (1920, 1080)
        # `stamps` runs newest first, so the oldest memories are the last ones,
        # and those are the ones the free batch of 20 will pick up. When a hero
        # batch is asked for, they get the real photos and everything newer
        # stays generated art nobody will see on camera.
        is_hero = index >= hero_cut if hero else bool(photos)
        frame = photos.frame(size) if (photos and is_hero) else gradient(size, top, bottom, rng)
        if is_hero:
            hero_stems.add(stem)

        if is_video:
            path = memories_dir / f"{stem}-main.mp4"
            if not make_video(path, frame):
                is_video = False
        if not is_video:
            path = memories_dir / f"{stem}-main.jpg"
            # Quality 88 and no EXIF written: Snapchat's export has none either,
            # which is the entire problem this archive is here to demonstrate.
            frame.save(path, "JPEG", quality=88)

        # One place per day, not per memory. People spend a day in a town and
        # move around inside it; they do not bounce between cities between
        # snaps. Getting this wrong made the matcher look far worse than it is,
        # because every day looked like a day spent in two places.
        place = day_place[day] if rng.random() < 0.85 else None

        caption = None
        geofilter = None
        if rng.random() < 0.62:
            caption = CAPTIONS[(index * 7) % len(CAPTIONS)]
        # Name the city the coordinates already put this memory in.
        if place and rng.random() < 0.34:
            geofilter = place[0]
        if caption or geofilter:
            (memories_dir / f"{stem}-overlay.png").write_bytes(
                overlay_png(size, caption or "", geofilter)
            )

        # Thumbnails exist in real exports and must be ignored, so ship some.
        if index % 5 == 0:
            frame.resize((size[0] // 6, size[1] // 6)).save(
                memories_dir / f"{stem}-thumbnail.jpg", "JPEG", quality=70
            )

        # Field-for-field what a 2026 export writes. No id, no caption: the
        # captions only exist as overlay PNGs, and nothing joins an entry to a
        # file except the date.
        entry = {
            "Date": when.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "Media Type": "Video" if is_video else "Image",
            "Download Link": "",
            "Media Download Url": "",
        }
        lat = lon = None
        if place:
            # A little jitter so every memory from one city isn't one pin.
            # A few hundred metres of moving about, plus GPS noise.
            lat = place[1] + rng.uniform(-0.004, 0.004)
            lon = place[2] + rng.uniform(-0.008, 0.008)
            entry["Location"] = f"Latitude, Longitude: {lat:.5f}, {lon:.5f}"
        else:
            # Snapchat writes Null Island when it has nothing. The parser drops it.
            entry["Location"] = "Latitude, Longitude: 0.0, 0.0"
        entries.append(entry)
        truth[Path(path).name] = {
            "date": when.isoformat(),
            "lat": round(lat, 5) if place else None,
            "lon": round(lon, 5) if place else None,
            "caption": caption,
            "geofilter": geofilter,
        }

    # Two entries whose files never made it into the archive, and one file with
    # no entry. Both happen in real exports; both should be reported, not lost.
    for offset in (1, 2):
        ghost = now - timedelta(days=offset * 400)
        entries.append({
            "Date": ghost.strftime("%Y-%m-%d %H:%M:%S UTC"),
            "Media Type": "Image",
            "Location": "Latitude, Longitude: 0.0, 0.0",
            "Download Link": "",
            "Media Download Url": "",
        })
    orphan = photos.frame((1080, 1080)) if photos else gradient((1080, 1080), *PALETTES[3], rng)
    orphan.save(memories_dir / "2022-11-04_ORPHANFILE01-main.jpg", "JPEG", quality=88)

    (work / "mydata" / "json" / "memories_history.json").write_text(
        json.dumps({"Saved Media": entries}, indent=2), encoding="utf-8"
    )

    # Count the files, not the entries — two of the entries are the deliberate
    # ghosts with no media behind them. Taken here because the work tree is
    # deleted once the archive is written.
    media = [
        f for f in memories_dir.iterdir()
        if "thumbnail" not in f.name and "overlay" not in f.name
    ]
    videos = sum(1 for f in media if f.suffix == ".mp4")
    photos = len(media) - videos

    by_day: dict[str, list[str]] = {}
    for name in truth:
        by_day.setdefault(name[:10], []).append(name)

    # The real export ships an index.html next to html/, json/ and memories/,
    # and two pages inside html/. None of it is used by this site, but the
    # demo archive is also what the tutorial videos open on camera, so the
    # folder has to look like the one that lands in somebody's Downloads.
    # The words are ours: this is a synthetic archive, not a copy of
    # Snapchat's own pages, and it carries no Snapchat branding.
    rows = "\n".join(
        f"      <tr><td>{e['Date']}</td><td>{e['Media Type']}</td>"
        f"<td>{e['Location']}</td><td>N/A</td></tr>"
        for e in entries
    )
    page = (
        "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<title>{title}</title>\n"
        "<style>body{{font:15px/1.5 -apple-system,system-ui,sans-serif;margin:2rem;}}"
        "table{{border-collapse:collapse}}td,th{{border-bottom:1px solid #ddd;"
        "padding:.4rem .8rem;text-align:left;font-size:13px}}</style>\n"
        "</head>\n<body>\n{body}\n</body>\n</html>\n"
    )
    (work / "mydata" / "index.html").write_text(
        page.format(
            title="My Data",
            body=(
                "<h1>My Data</h1>\n<ul>\n"
                "  <li><a href=\"html/faq.html\">Frequently Asked Questions</a></li>\n"
                "  <li><a href=\"html/memories_history.html\">Memories</a></li>\n</ul>\n"
                "<p>Synthetic demo archive. Nothing in it belongs to anybody.</p>"
            ),
        ),
        encoding="utf-8",
    )
    (work / "mydata" / "html" / "faq.html").write_text(
        page.format(
            title="Frequently Asked Questions",
            body=(
                "<h1>Frequently Asked Questions</h1>\n"
                "<p>This archive was generated by scripts/make-demo-export.py to match the "
                "shape of a real Memories export: seven ZIPs, six of them nothing but a "
                "memories folder, and one carrying index.html, html/, json/ and its own "
                "slice of memories.</p>\n"
                "<p>The media is generated and the captions are invented.</p>"
            ),
        ),
        encoding="utf-8",
    )
    (work / "mydata" / "html" / "memories_history.html").write_text(
        page.format(
            title="Memories",
            body=(
                "<h1>Memories</h1>\n<table>\n"
                "      <tr><th>Date</th><th>Media Type</th><th>Location</th>"
                "<th>Download Link</th></tr>\n" + rows + "\n</table>"
            ),
        ),
        encoding="utf-8",
    )

    # Snapchat splits large exports across several ZIPs: the first carries
    # html/, index.html, json/ and a slice of memories/, and the rest carry
    # nothing but more memories/. The JSON is only ever in the first one, which
    # is why feeding just one part produces a pile of undated files.
    stem = f"mydata~{SPLIT_STAMP}"
    all_media = sorted(f for f in memories_dir.iterdir() if f.is_file())
    if hero_stems and hero:
        # The bundle ZIP holds exactly the hero memories, because that is the
        # ZIP the JSON lives in and the one you open on camera. Everything else
        # goes in the six continuations.
        bundle = [f for f in all_media if f.name.split("-main")[0].split("-overlay")[0].split("-thumbnail")[0] in hero_stems]
        rest = [f for f in all_media if f not in bundle]
        per_part = math.ceil(len(rest) / max(1, parts - 1)) if parts > 1 else len(rest)
        slices = [bundle] + [rest[i * per_part : (i + 1) * per_part] for i in range(max(0, parts - 1))]
    else:
        per_part = math.ceil(len(all_media) / max(1, parts))
        slices = [all_media[i * per_part : (i + 1) * per_part] for i in range(parts)]
    written: list[Path] = []

    for part, slice_ in enumerate(slices):
        if not slice_ and part:
            break
        name = f"{stem}.zip" if part == 0 else f"{stem}-{part + 1}.zip"
        zip_path = out_dir / name
        zip_path.unlink(missing_ok=True)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            if part == 0:
                # The bundle: everything sits under one mydata~<stamp>/ folder.
                for extra in sorted((work / "mydata").rglob("*")):
                    if extra.is_file() and extra.parent.name != "memories":
                        zf.write(extra, Path(stem) / extra.relative_to(work / "mydata"))
                for file in slice_:
                    zf.write(file, Path(stem) / "memories" / file.name)
            else:
                # Continuations: a bare memories/ folder at the root, which is
                # why unzipping them all gives memories, memories 2, memories 3.
                for file in slice_:
                    zf.write(file, Path("memories") / file.name)
        written.append(zip_path)

    # Ground truth, written next to the archives rather than inside them.
    # verify-demo-export.ts scores the matcher against this — without it we can
    # only count how many files got *a* date, not how many got the right one.
    truth_path = out_dir / f"{stem}.truth.json"
    truth_path.write_text(json.dumps(truth, indent=2), encoding="utf-8")

    shutil.rmtree(work)

    span = f"{stamps[-1]:%b %Y} – {stamps[0]:%b %Y}"
    total_mb = sum(p.stat().st_size for p in written) / 1_048_576
    busiest = max(len(v) for v in by_day.values()) if by_day else 0
    print(f"\n  {out_dir}")
    for zp in written:
        print(f"    {zp.name}  ({zp.stat().st_size / 1_048_576:.1f} MB)")
    print(f"    {truth_path.name}  (ground truth — not part of the export)")
    print()
    print(f"  {len(media)} files · {photos} photos · {videos} videos · {span}")
    print(f"  {total_mb:.1f} MB across {len(written)} ZIPs · busiest day has {busiest} memories")
    print("  No EXIF, no Media ID in the JSON, captions split into overlays — like the real thing.")
    print("\n  Drop all of them on the site at once. Nothing in them is yours.\n")
    return written[0]


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--out", type=Path, default=Path.home() / "Desktop", help="where to write the ZIP (default: ~/Desktop)")
    ap.add_argument("--count", type=int, default=48, help="how many memories to generate (default: 48)")
    ap.add_argument("--parts", type=int, default=7, help="how many ZIPs to split it across, the way Snapchat does (default: 7, which is what a real export of this size arrived as)")
    ap.add_argument("--photos", type=Path, help="folder of images to use instead of the generated art, for demo footage that looks like a real library")
    ap.add_argument("--hero", type=int, help="how many of the OLDEST memories get the real photos and go in the first ZIP (default: 20 when --photos is given, which is exactly what the free run fixes)")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    pool = PhotoPool(args.photos) if args.photos else None
    hero = args.hero if args.hero is not None else (20 if pool else 0)
    hero = min(max(0, hero), args.count)
    if pool:
        print(f"Using {len(pool.paths)} photo(s) from {args.photos}")
        if hero:
            print(f"The oldest {hero} memories get them, and go in the first ZIP. The rest is filler.")
    build(args.out, max(1, args.count), max(1, args.parts), pool, hero)


if __name__ == "__main__":
    main()
