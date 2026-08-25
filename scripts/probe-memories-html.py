#!/usr/bin/env python3
"""
Looks inside the export's `memories/memories.html` files.

Each part of a split export ships its own copy, and between them they link
every media file by name. The question is whether that page carries anything
the filename doesn't already say — a time, a caption, a location, or simply an
order that lines up with `memories_history.json`.

If the order lines up, that is the join: the Nth link is the Nth entry, every
photo gets its own timestamp and its own coordinates, and matching stops
guessing.

Prints structure only: tag and attribute names, counts, and whether two
sequences agree. No coordinates, no captions, no filenames.

Usage:
    python3 scripts/probe-memories-html.py ~/Downloads/snap\\ data/mydata~*.zip
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

UUID = re.compile(r"[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}", re.I)
DECIMAL = re.compile(r"-?\d+\.\d{4,}")
MEDIA_REF = re.compile(r'(?:href|src)="([^"]*?\.(?:jpg|jpeg|png|mp4|mov|webp))"', re.I)
DATE_IN_NAME = re.compile(r"(\d{4}-\d{2}-\d{2})")
TIMESTAMP = re.compile(r"\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}")


def head(t: str) -> None:
    print(f"\n{t}\n{'─' * len(t)}")


def redact(html: str) -> str:
    html = UUID.sub("<UUID>", html)
    html = TIMESTAMP.sub("<TIMESTAMP>", html)
    html = re.sub(r"-?\d+\.\d{3,}", "<COORD>", html)
    return html


def main(argv: list[str]) -> None:
    zips = sorted(Path(p) for p in argv if p.lower().endswith(".zip"))
    if not zips:
        sys.exit("Pass the export ZIPs.")

    pages: list[tuple[str, str]] = []      # (zip name, html)
    entries: list[dict] = []

    for zp in zips:
        with zipfile.ZipFile(zp) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                low = info.filename.lower()
                if low.endswith("memories.html"):
                    pages.append((zp.name, zf.read(info).decode("utf-8", "replace")))
                elif low.endswith("memories_history.json"):
                    data = json.loads(zf.read(info).decode("utf-8", "replace"))
                    for v in (data.values() if isinstance(data, dict) else [data]):
                        if isinstance(v, list):
                            entries.extend(x for x in v if isinstance(x, dict))

    head("memories.html, per part")
    all_refs: list[str] = []
    for zname, html in pages:
        refs = MEDIA_REF.findall(html)
        all_refs.extend(refs)
        print(f"  {zname:<34} {len(refs):>5} media links")
    print(f"  {'TOTAL':<34} {len(all_refs):>5}")
    print(f"  {'json entries':<34} {len(entries):>5}")

    if not pages:
        sys.exit("\nNo memories.html found in those ZIPs.")

    # ---------------------------------------------------- what surrounds a link
    head("Markup around a media link (values redacted)")
    sample_html = pages[0][1]
    m = MEDIA_REF.search(sample_html)
    if m:
        start = max(0, m.start() - 700)
        chunk = redact(sample_html[start : m.end() + 700])
        print("\n".join("    " + line for line in chunk.splitlines() if line.strip())[:2400])

    head("Tags and attributes used")
    tags = Counter(t.lower() for t in re.findall(r"<([a-zA-Z][a-zA-Z0-9]*)", sample_html))
    print("  tags:  " + ", ".join(f"{t}×{n}" for t, n in tags.most_common(12)))
    attrs = Counter(a.lower() for a in re.findall(r"\s([a-zA-Z-]+)=\"", sample_html))
    print("  attrs: " + ", ".join(f"{a}×{n}" for a, n in attrs.most_common(12)))

    head("Does it carry anything the filename doesn't?")
    joined = "\n".join(h for _, h in pages)
    stamps = len(TIMESTAMP.findall(joined))
    print(f"  full timestamps (HH:MM:SS) present   {stamps}")
    coords = len(DECIMAL.findall(joined))
    print(f"  decimal coordinate-looking numbers   {coords}")

    # -------------------------------------------------- the decisive comparison
    head("Does link order match memories_history.json order?")
    html_days = [d.group(1) for r in all_refs
                 if not re.search(r"overlay", r, re.I)
                 for d in [DATE_IN_NAME.search(Path(r).name)] if d]
    json_days = [e["Date"][:10] for e in entries if isinstance(e.get("Date"), str)]

    print(f"  dated base links in html order       {len(html_days)}")
    print(f"  dated entries in json order          {len(json_days)}")

    def score(a: list[str], b: list[str]) -> float:
        n = min(len(a), len(b))
        if not n:
            return 0.0
        return sum(1 for i in range(n) if a[i] == b[i]) / n * 100

    fwd = score(html_days, json_days)
    rev = score(html_days, json_days[::-1])
    print(f"  same position, same day (forward)    {fwd:.1f}%")
    print(f"  same position, same day (reversed)   {rev:.1f}%")
    print()
    best = max(fwd, rev)
    if best > 95:
        print("  VERDICT: the orders line up. The Nth link is the Nth entry, so")
        print(f"  every file can take its own timestamp and coordinates"
              f" ({'reverse' if rev > fwd else 'forward'} order).")
    elif best > 60:
        print(f"  VERDICT: partly aligned ({best:.0f}%). Probably the right idea with")
        print("  a wrinkle — split parts may need concatenating differently.")
    else:
        print("  VERDICT: the orders don't correspond. This page is a gallery, not")
        print("  a manifest, and adds nothing the filename didn't already say.")
    print()


if __name__ == "__main__":
    main(sys.argv[1:])
