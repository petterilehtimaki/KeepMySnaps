#!/usr/bin/env python3
"""
Builds a synthetic Snapchat Memories export.

The output is a ZIP shaped exactly like the real thing — same directory
layout, same filename convention, same `memories_history.json` — but every
photo is generated abstract art and every caption is invented. Nothing in it
belongs to anybody.

That makes it three things at once:

  * demo footage you can screen-record without putting your own life on camera
  * screenshots for the site's pages
  * an end-to-end fixture, which the unit tests don't give us — they build
    their inputs in memory and never see a real ZIP

The archive deliberately includes the awkward cases the parser exists to
survive: overlay PNGs sitting apart from their base, thumbnails that must be
ignored, entries with no file, a file with no entry, and a few memories with
no location at all. A demo that only contains the happy path proves nothing.

Usage:
    python3 scripts/make-demo-export.py
    python3 scripts/make-demo-export.py --out ~/Desktop --count 60

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

# Coordinates are city centres, not anybody's home. Roughly: Helsinki, Tampere,
# Berlin, Lisbon, Reykjavik, Stockholm, Tallinn, Porto.
PLACES = [
    (60.16952, 24.93545),
    (61.49911, 23.78712),
    (52.52001, 13.40495),
    (38.72225, -9.13934),
    (64.14666, -21.94270),
    (59.32938, 18.06871),
    (59.43696, 24.75353),
    (41.15794, -8.62918),
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


def overlay_png(size: tuple[int, int], text: str) -> bytes:
    """
    A caption overlay: transparent everywhere except the text bar.

    This is the shape that makes exported photos look bare — Snapchat ships the
    caption as its own file and never puts it back.
    """
    w, h = size
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    pen = ImageDraw.Draw(img)
    font = load_font(max(22, w // 16))

    box = pen.textbbox((0, 0), text, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    bar_h = th + h // 22
    top = int(h * 0.62)
    pen.rectangle((0, top, w, top + bar_h), fill=(0, 0, 0, 130))
    pen.text(((w - tw) / 2 - box[0], top + (bar_h - th) / 2 - box[1]), text, font=font, fill=(255, 255, 255, 255))

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


def build(out_dir: Path, count: int, parts: int) -> Path:
    rng = random.Random(SEED)
    work = out_dir / "keepmysnaps-demo-export"
    if work.exists():
        shutil.rmtree(work)
    (work / "mydata" / "memories").mkdir(parents=True)
    (work / "mydata" / "json").mkdir(parents=True)

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

    entries = []
    truth: dict[str, dict] = {}
    for index, when in enumerate(stamps):
        mid = media_id(rng)
        day = when.strftime("%Y-%m-%d")
        is_video = has_ffmpeg and index % 6 == 5
        stem = f"{day}_{mid}"

        top, bottom = PALETTES[index % len(PALETTES)]
        size = (1080, 1920) if index % 3 else (1920, 1080)
        frame = gradient(size, top, bottom, rng)

        if is_video:
            path = memories_dir / f"{stem}-main.mp4"
            if not make_video(path, frame):
                is_video = False
        if not is_video:
            path = memories_dir / f"{stem}-main.jpg"
            # Quality 88 and no EXIF written: Snapchat's export has none either,
            # which is the entire problem this archive is here to demonstrate.
            frame.save(path, "JPEG", quality=88)

        caption = None
        if rng.random() < 0.6:
            caption = CAPTIONS[(index * 7) % len(CAPTIONS)]
            (memories_dir / f"{stem}-overlay.png").write_bytes(overlay_png(size, caption))

        # Thumbnails exist in real exports and must be ignored, so ship some.
        if index % 5 == 0:
            frame.resize((size[0] // 6, size[1] // 6)).save(
                memories_dir / f"{stem}-thumbnail.jpg", "JPEG", quality=70
            )

        place = PLACES[index % len(PLACES)] if rng.random() < 0.85 else None
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
            lat = place[0] + rng.uniform(-0.02, 0.02)
            lon = place[1] + rng.uniform(-0.02, 0.02)
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
    orphan = gradient((1080, 1080), *PALETTES[3], rng)
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

    # Snapchat splits large exports across several ZIPs: the first carries
    # html/, index.html, json/ and a slice of memories/, and the rest carry
    # nothing but more memories/. The JSON is only ever in the first one, which
    # is why feeding just one part produces a pile of undated files.
    stem = f"mydata~{SPLIT_STAMP}"
    all_media = sorted(f for f in memories_dir.iterdir() if f.is_file())
    per_part = math.ceil(len(all_media) / max(1, parts))
    written: list[Path] = []

    for part in range(parts):
        slice_ = all_media[part * per_part : (part + 1) * per_part]
        if not slice_ and part:
            break
        name = f"{stem}.zip" if part == 0 else f"{stem}-{part + 1}.zip"
        zip_path = out_dir / name
        zip_path.unlink(missing_ok=True)
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
            if part == 0:
                for extra in sorted((work / "mydata").rglob("*")):
                    if extra.is_file() and "memories/" not in str(extra):
                        zf.write(extra, extra.relative_to(work))
            for file in slice_:
                zf.write(file, file.relative_to(work))
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
    ap.add_argument("--parts", type=int, default=3, help="how many ZIPs to split it across, the way Snapchat does (default: 3)")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    build(args.out, max(1, args.count), max(1, args.parts))


if __name__ == "__main__":
    main()
