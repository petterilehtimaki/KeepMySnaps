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
        haystack = "\n".join(text_blobs.values()).upper()
        sample = file_uuids[: min(200, len(file_uuids))]
        hits = sum(1 for u in sample if u.upper() in haystack)
        print(f"  checked against metadata:   {len(sample)}")
        print(f"  found in the metadata:      {hits}")
        print()
        if hits == 0:
            print("  VERDICT: no join exists. Nothing in the JSON or HTML references")
            print("  the id in the filename, so a file can only be tied to an entry")
            print("  by its date.")
        elif hits == len(sample):
            print("  VERDICT: every file's id is present in the metadata. A direct")
            print("  join is possible and matching should use it.")
        else:
            print(f"  VERDICT: partial — {hits} of {len(sample)}. Worth using where present.")

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
