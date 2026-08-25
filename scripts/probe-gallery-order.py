#!/usr/bin/env python3
"""
Asks whether the gallery in `memories/memories.html` lists each day's memories
in the order they were taken.

Filenames sort as date-then-UUID, so within one day the file order is random.
The JSON knows the times but not which file is which. If the gallery walks a
day in time order, that is the missing link: the Nth picture shown on day D is
the Nth memory of day D, and every file can take its own timestamp and its own
coordinates instead of the day's best guess.

There is a way to check this without knowing any answers in advance. Every
entry says Image or Video, and every file is a .jpg or an .mp4. So compare two
sequences per day: the media types in gallery order, and the media types in
JSON time order. If the gallery were shuffled, those sequences would agree only
by luck on days with a mix of both. If they agree almost everywhere, the
gallery is sorted by time.

Prints counts and percentages only.

Usage:
    python3 scripts/probe-gallery-order.py ~/Downloads/snap\\ data/mydata~*.zip
"""

from __future__ import annotations

import json
import random
import re
import sys
import zipfile
from collections import defaultdict
from pathlib import Path

MEDIA_REF = re.compile(r'src="([^"]*?\.(?:jpg|jpeg|png|mp4|mov|webp))"', re.I)
DAY = re.compile(r"(\d{4}-\d{2}-\d{2})")


def part_index(name: str) -> int:
    """Part 1 has no suffix, so plain sorting puts it last. It goes first."""
    m = re.search(r"-(\d+)\.zip$", name, re.I)
    return int(m.group(1)) if m else 1


def kind(path: str) -> str:
    return "video" if path.lower().endswith((".mp4", ".mov")) else "image"


def head(t: str) -> None:
    print(f"\n{t}\n{'─' * len(t)}")


def main(argv: list[str]) -> None:
    zips = sorted((Path(p) for p in argv if p.lower().endswith(".zip")),
                  key=lambda p: part_index(p.name))
    if not zips:
        sys.exit("Pass the export ZIPs.")

    gallery: list[str] = []
    entries: list[dict] = []

    for zp in zips:
        with zipfile.ZipFile(zp) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                low = info.filename.lower()
                if low.endswith("memories.html"):
                    html = zf.read(info).decode("utf-8", "replace")
                    for ref in MEDIA_REF.findall(html):
                        name = Path(ref).name
                        if re.search(r"overlay", name, re.I):
                            continue          # captions aren't memories
                        gallery.append(name)
                elif low.endswith("memories_history.json"):
                    data = json.loads(zf.read(info).decode("utf-8", "replace"))
                    for v in (data.values() if isinstance(data, dict) else [data]):
                        if isinstance(v, list):
                            entries.extend(x for x in v if isinstance(x, dict))

    print(f"\n  parts read in order: {', '.join(str(part_index(z.name)) for z in zips)}")
    print(f"  base media in gallery order: {len(gallery)}")
    print(f"  json entries:                {len(entries)}")

    # ---------------------------------------- is the gallery order != filename order?
    by_day_gallery: dict[str, list[str]] = defaultdict(list)
    for name in gallery:
        m = DAY.search(name)
        if m:
            by_day_gallery[m.group(1)].append(name)

    head("Is the gallery just alphabetical?")
    differs = sum(1 for d, files in by_day_gallery.items()
                  if len(files) > 1 and files != sorted(files))
    multi = sum(1 for files in by_day_gallery.values() if len(files) > 1)
    print(f"  days with more than one memory       {multi}")
    print(f"  days where gallery order differs     {differs}")
    if not multi:
        print("\n  No memories.html with more than one memory a day. Nothing to test.\n")
        return
    if differs / multi < 0.05:
        print("\n  The gallery is sorted the same way the filenames are, so it")
        print("  carries no ordering the archive didn't already have.")
        print()
        return
    print("\n  It differs — so the gallery holds an order of its own. Testing it.")

    # ----------------------------------------------- does that order mean time?
    by_day_json: dict[str, list[dict]] = defaultdict(list)
    for e in entries:
        d = e.get("Date")
        if isinstance(d, str) and DAY.match(d):
            by_day_json[d[:10]].append(e)

    def type_of(entry: dict) -> str:
        return "video" if "video" in str(entry.get("Media Type", "")).lower() else "image"

    tested = matched_asc = matched_desc = 0
    mixed_days = 0

    for day, files in by_day_gallery.items():
        rows = by_day_json.get(day, [])
        if len(rows) != len(files) or len(files) < 2:
            continue
        types = [kind(f) for f in files]
        if len(set(types)) < 2:
            continue                      # all one kind proves nothing
        mixed_days += 1
        asc = [type_of(e) for e in sorted(rows, key=lambda e: e["Date"])]
        tested += 1
        if types == asc:
            matched_asc += 1
        if types == asc[::-1]:
            matched_desc += 1

    head("Does gallery order == time order?")
    print(f"  days with a usable mix of photo and video   {mixed_days}")
    if not tested:
        print("\n  Not enough mixed days to tell.\n")
        return

    pct_asc = matched_asc / tested * 100
    pct_desc = matched_desc / tested * 100
    print(f"  gallery matches oldest-first                {matched_asc} ({pct_asc:.1f}%)")
    print(f"  gallery matches newest-first                {matched_desc} ({pct_desc:.1f}%)")

    # What would luck alone give? Shuffle each day and score the same way.
    rng = random.Random(7)
    chance_hits = 0
    for day, files in by_day_gallery.items():
        rows = by_day_json.get(day, [])
        if len(rows) != len(files) or len(files) < 2:
            continue
        types = [kind(f) for f in files]
        if len(set(types)) < 2:
            continue
        shuffled = types[:]
        rng.shuffle(shuffled)
        asc = [type_of(e) for e in sorted(rows, key=lambda e: e["Date"])]
        if shuffled == asc:
            chance_hits += 1
    print(f"  same test on shuffled order (luck)          {chance_hits} ({chance_hits / tested * 100:.1f}%)")

    best = max(pct_asc, pct_desc)
    print()
    if best > 90:
        order = "oldest-first" if pct_asc > pct_desc else "newest-first"
        print(f"  VERDICT: the gallery is in time order ({order}). Use it — every")
        print("  file can take its own timestamp and its own coordinates.")
    elif best > chance_hits / max(1, tested) * 100 + 15:
        print(f"  VERDICT: better than chance ({best:.0f}% vs {chance_hits / tested * 100:.0f}%)")
        print("  but not reliable enough to write coordinates from.")
    else:
        print("  VERDICT: no better than luck. The gallery order means nothing.")
    print()


if __name__ == "__main__":
    main(sys.argv[1:])
