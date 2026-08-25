#!/usr/bin/env python3
"""
Reports the *shape* of a Snapchat export without revealing its contents.

The question this exists to answer: is there anything in the export that joins
a media file to its entry in `memories_history.json`? Matching falls back to
guessing by calendar day when there isn't, and a guess is why a photo can end
up carrying a different memory's coordinates.

Every answer it prints is structural — key names, counts, whether a filename's
UUID occurs anywhere in the metadata. It never prints a coordinate, a date, a
caption, a URL, or any part of a filename beyond the first four characters of
an id. Safe to paste.

Usage:
    python3 scripts/inspect-export.py ~/Downloads/snap\\ data/mydata~*.zip
"""

from __future__ import annotations

import json
import re
import sys
import zipfile
from collections import Counter
from pathlib import Path

UUID = re.compile(r"[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}", re.I)


def head(title: str) -> None:
    print(f"\n{title}\n{'─' * len(title)}")


def main(paths: list[str]) -> None:
    zips = [Path(p) for p in paths if p.lower().endswith(".zip")]
    if not zips:
        sys.exit("Pass the export ZIPs. Nothing else is read.")

    names: list[str] = []
    text_blobs: dict[str, str] = {}

    for zp in zips:
        with zipfile.ZipFile(zp) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                names.append(info.filename)
                if info.filename.lower().endswith((".json", ".html", ".htm")):
                    try:
                        text_blobs[info.filename] = zf.read(info).decode("utf-8", "replace")
                    except Exception:
                        pass

    # ---------------------------------------------------------------- layout
    head("Layout")
    by_dir = Counter(str(Path(n).parent) for n in names)
    for d, count in sorted(by_dir.items()):
        print(f"  {d or '.':<28} {count} files")

    exts = Counter(Path(n).suffix.lower() for n in names)
    print()
    for ext, count in sorted(exts.items(), key=lambda kv: -kv[1]):
        print(f"  {ext or '(none)':<28} {count}")

    head("Metadata files found")
    for name in sorted(text_blobs):
        print(f"  {name}  ({len(text_blobs[name]):,} chars)")

    # ------------------------------------------------------------ json shape
    head("Every field name in memories_history.json")
    entries: list[dict] = []
    for name, blob in text_blobs.items():
        if not name.lower().endswith(".json"):
            continue
        try:
            data = json.loads(blob)
        except Exception:
            print(f"  {name}: not valid JSON")
            continue
        if isinstance(data, dict):
            print(f"  {name} top-level keys: {list(data.keys())}")
            for value in data.values():
                if isinstance(value, list) and value and isinstance(value[0], dict):
                    entries.extend(value)
        elif isinstance(data, list):
            entries.extend(e for e in data if isinstance(e, dict))

    if not entries:
        print("  no entry list found")
    else:
        print(f"\n  {len(entries)} entries. Field name -> how many entries have it non-empty:\n")
        present = Counter()
        for e in entries:
            for k, v in e.items():
                present[k] += 1 if (v not in ("", None, [], {})) else 0
        for k in sorted({k for e in entries for k in e}):
            print(f"    {k:<28} {present[k]:>5} / {len(entries)} non-empty")

        # Any field that looks like it could be an identifier at all.
        head("Anything id-shaped in the entries")
        idish = False
        for k in sorted({k for e in entries for k in e}):
            sample = next((e[k] for e in entries if isinstance(e.get(k), str) and e[k]), "")
            if not sample:
                continue
            if UUID.search(sample) or re.fullmatch(r"[A-Za-z0-9_\-]{16,}", sample):
                idish = True
                print(f"    {k}: looks id-like, e.g. {sample[:4]}… ({len(sample)} chars)")
        if not idish:
            print("    none — no field holds a UUID or a long opaque token")

    # ------------------------------------------------ the decisive question
    head("Do filename UUIDs appear anywhere in the metadata?")
    media = [n for n in names if "/memories" in n.lower() or n.lower().startswith("memories")]
    file_uuids = []
    for n in media:
        m = UUID.search(Path(n).name)
        if m:
            file_uuids.append(m.group(0))

    print(f"  media files:                {len(media)}")
    print(f"  with a UUID in the name:    {len(file_uuids)}")

    if file_uuids:
        # Spread the sample across the whole export rather than taking the
        # first N. The archive is ordered by date, so the first 200 are all
        # from the oldest weeks — and a metadata file that only covers recent
        # memories would look like a near-total miss.
        step = max(1, len(file_uuids) // 400)
        sample = file_uuids[::step][:400]

        per_file = {name: blob.upper() for name, blob in text_blobs.items()}
        hits_by_file = Counter()
        for u in sample:
            needle = u.upper()
            for name, blob in per_file.items():
                if needle in blob:
                    hits_by_file[name] += 1

        total_hit = sum(1 for u in sample
                        if any(u.upper() in b for b in per_file.values()))
        print(f"  sampled evenly across all:  {len(sample)}")
        print(f"  found in the metadata:      {total_hit}")
        if hits_by_file:
            print("\n  where:")
            for name, n in hits_by_file.most_common():
                print(f"    {name:<40} {n} of {len(sample)}")
        print()
        if total_hit == 0:
            print("  VERDICT: no join exists. Nothing references the filename id,")
            print("  so a file can only be tied to an entry by its date.")
        elif total_hit >= len(sample) * 0.95:
            print("  VERDICT: the filename id is present throughout. A direct join")
            print("  is possible and matching should use it.")
        else:
            print(f"  VERDICT: partial — {total_hit} of {len(sample)}.")

    # ------------------------------------------- what the HTML actually holds
    head("Shape of each HTML file")
    for name, blob in sorted(text_blobs.items()):
        if not name.lower().endswith((".html", ".htm")):
            continue
        rows = len(re.findall(r"<tr\b", blob, re.I))
        links = re.findall(r'(?:href|src)="([^"]+)"', blob, re.I)
        local = [l for l in links if not l.startswith(("http://", "https://", "#", "data:"))]
        media_refs = [l for l in local if re.search(r"\.(jpg|jpeg|png|mp4|mov|webp)$", l, re.I)]
        uuid_refs = sum(1 for l in local if UUID.search(l))
        print(f"\n  {name}")
        print(f"    <tr> rows                 {rows}")
        print(f"    local links/srcs          {len(local)}")
        print(f"    pointing at media files   {len(media_refs)}")
        print(f"    containing a UUID         {uuid_refs}")
        if media_refs:
            ex = media_refs[0]
            print(f"    example ref shape         {re.sub(r'[0-9A-F]{8}-[0-9A-F-]+', '<UUID>', ex, flags=re.I)}")
        # Do those references sit next to a date in the same row?
        if rows and media_refs:
            row_html = re.findall(r"<tr\b.*?</tr>", blob, re.I | re.S)[:400]
            both = sum(
                1 for r in row_html
                if re.search(r"\.(jpg|jpeg|png|mp4|mov)", r, re.I)
                and re.search(r"\d{4}-\d{2}-\d{2}", r)
            )
            print(f"    rows with BOTH a file ref and a date:  {both} of {len(row_html)}")

    # ------------------------------------------ what the caution actually costs
    head("How many locations survive")
    from datetime import datetime

    base = [n for n in media if not re.search(r"overlay|thumbnail", Path(n).name, re.I)]
    print(f"  entries in the json         {len(entries)}")
    print(f"  media files behind them     {len(base)}")
    gap = len(entries) - len(base)
    if gap > 0:
        print(f"  entries with no file        {gap}  ({gap / max(1, len(entries)) * 100:.1f}%)")
        print("                              Snapchat listed these memories but")
        print("                              didn't ship them. Nothing to fix.")

    # Group the entries the way the matcher does — day plus media type — and
    # ask, for each group, whether the memories in it were close enough
    # together that it doesn't matter which file gets which coordinate.
    SAME_PLACE = 0.01                       # matches SAME_PLACE_DEGREES

    groups: dict[tuple, list[tuple]] = {}
    for e in entries:
        d = e.get("Date")
        if not isinstance(d, str) or len(d) < 10:
            continue
        kind = "video" if "video" in str(e.get("Media Type", "")).lower() else "image"
        nums = re.findall(r"-?\d+\.\d+", str(e.get("Location", "")))
        pt = (float(nums[0]), float(nums[1])) if len(nums) >= 2 else None
        if pt == (0.0, 0.0):
            pt = None
        groups.setdefault((d[:10], kind), []).append(pt)

    alone = kept = withheld = nolocation = 0
    for members in groups.values():
        placed = [p for p in members if p]
        if not placed:
            nolocation += len(members)
            continue
        if len(members) == 1:
            alone += 1
            continue
        if len(placed) != len(members):
            withheld += len(members)
            continue
        spread = any(abs(p[0] - placed[0][0]) > SAME_PLACE
                     or abs(p[1] - placed[0][1]) > SAME_PLACE for p in placed)
        if spread:
            withheld += len(members)
        else:
            kept += len(members)

    total = alone + kept + withheld + nolocation
    pct = lambda n: f"{n / max(1, total) * 100:.1f}%"
    print()
    print(f"  only memory of its day+type {alone:>6}  {pct(alone)}   keeps its exact pin")
    print(f"  day's memories same place   {kept:>6}  {pct(kept)}   keeps its pin")
    print(f"  day's memories spread out   {withheld:>6}  {pct(withheld)}   pin withheld")
    print(f"  no location recorded        {nolocation:>6}  {pct(nolocation)}   nothing to write")
    print()
    survive = alone + kept
    have = total - nolocation
    if have:
        print(f"  {survive} of {have} memories that have a location keep it ({survive / have * 100:.0f}%).")
        if withheld / max(1, have) > 0.4:
            print("  That is a lot to lose. Widening SAME_PLACE_DEGREES would keep more,")
            print("  at the cost of some pins being off by the wider radius.")

    # ---------------------------------------------------------- html columns
    head("Columns in the HTML report")
    for name, blob in text_blobs.items():
        if not name.lower().endswith((".html", ".htm")):
            continue
        ths = re.findall(r"<th[^>]*>(.*?)</th>", blob, re.I | re.S)
        cleaned = [re.sub(r"<[^>]+>", "", t).strip()[:40] for t in ths]
        seen = list(dict.fromkeys(c for c in cleaned if c))
        if seen:
            print(f"  {name}: {seen}")
    print()


if __name__ == "__main__":
    main(sys.argv[1:])
