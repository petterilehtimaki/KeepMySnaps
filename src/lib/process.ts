/**
 * The whole pipeline: ZIP in, fixed ZIP out, without a single byte leaving the
 * browser. Everything runs sequentially so a 5GB export doesn't try to hold
 * itself in memory all at once.
 */
import JSZip from "jszip";
import {
  groupMediaFiles,
  matchEntriesToMedia,
  parseMemoriesHistory,
  extensionOf,
  isMediaPath,
  isOverlayPath,
  isThumbnailPath,
  type MemoryEntry,
  type Pairing,
} from "./snapchat";
import { writeExif, isJpeg } from "./exif";

export class NotASnapchatExport extends Error {}

export type Progress = {
  phase: "reading" | "matching" | "fixing" | "packing" | "done";
  done: number;
  total: number;
  label: string;
};

export type Summary = {
  totalMemories: number;
  filesWritten: number;
  datesRestored: number;
  gpsRestored: number;
  overlaysMerged: number;
  videos: number;
  unmatched: number;
  /** Files present in the export beyond the ones written to this ZIP. */
  withheld: number;
};

export type Outcome = {
  blob: Blob;
  summary: Summary;
};

type SourceFile = {
  zip: JSZip;
  path: string;
};

const VIDEO_EXT = new Set(["mp4", "mov", "m4v", "webm"]);

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

/** `2023-06-12_18-04-22.jpg`, deduped when two snaps share a second. */
function outputName(
  entry: MemoryEntry | null,
  ext: string,
  index: number,
  used: Set<string>,
): string {
  let stem: string;
  if (entry?.takenAt !== null && entry?.takenAt !== undefined) {
    const d = new Date(entry.takenAt);
    const p = (n: number) => String(n).padStart(2, "0");
    stem =
      `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}` +
      `_${p(d.getUTCHours())}-${p(d.getUTCMinutes())}-${p(d.getUTCSeconds())}`;
  } else {
    stem = `undated_${String(index + 1).padStart(5, "0")}`;
  }

  let name = `${stem}.${ext}`;
  let n = 2;
  while (used.has(name)) name = `${stem}_${n++}.${ext}`;
  used.add(name);
  return name;
}

async function decode(bytes: Uint8Array, type: string): Promise<ImageBitmap> {
  const blob = new Blob([bytes as BlobPart], { type });
  return createImageBitmap(blob);
}

function mimeFor(ext: string): string {
  switch (ext) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    default:
      return "image/jpeg";
  }
}

/**
 * Flattens the caption/sticker layer onto the photo, which is the only way to
 * keep it — Snapchat ships the overlay as a separate transparent PNG.
 */
async function flatten(
  baseBytes: Uint8Array,
  baseExt: string,
  overlayBytes: Uint8Array | null,
): Promise<Uint8Array> {
  const base = await decode(baseBytes, mimeFor(baseExt));
  const canvas = document.createElement("canvas");
  canvas.width = base.width;
  canvas.height = base.height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    base.close();
    return baseBytes;
  }

  ctx.drawImage(base, 0, 0);
  base.close();

  if (overlayBytes) {
    try {
      const overlay = await decode(overlayBytes, "image/png");
      // Overlays are authored at the snap's aspect ratio, so cover the frame.
      ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);
      overlay.close();
    } catch {
      // An unreadable overlay shouldn't cost the user their photo.
    }
  }

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.92),
  );
  canvas.width = 0;
  canvas.height = 0;

  if (!blob) return baseBytes;
  return new Uint8Array(await blob.arrayBuffer());
}

function csvCell(value: string | number | null): string {
  if (value === null || value === "") return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function processExport(
  files: File[],
  options: {
    limit: number | null;
    onProgress?: (p: Progress) => void;
    signal?: AbortSignal;
  },
): Promise<Outcome> {
  const { limit, onProgress, signal } = options;
  const report = (p: Progress) => onProgress?.(p);

  report({ phase: "reading", done: 0, total: files.length, label: "Opening the ZIP" });

  const zips: JSZip[] = [];
  const mediaFiles: SourceFile[] = [];
  const entries: MemoryEntry[] = [];

  for (const [i, file] of files.entries()) {
    throwIfAborted(signal);
    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      throw new NotASnapchatExport(`${file.name} isn't a ZIP we can open.`);
    }
    zips.push(zip);

    for (const path of Object.keys(zip.files)) {
      const obj = zip.files[path];
      if (obj.dir) continue;

      if (/memories_history\.json$/i.test(path)) {
        const text = await obj.async("text");
        try {
          entries.push(...parseMemoriesHistory(JSON.parse(text)));
        } catch {
          // Malformed JSON: fall through to the "no memories" error below.
        }
      } else if (isMediaPath(path) && !isThumbnailPath(path)) {
        mediaFiles.push({ zip, path });
      }
    }

    report({
      phase: "reading",
      done: i + 1,
      total: files.length,
      label: `Read ${file.name}`,
    });
  }

  if (!entries.length) {
    throw new NotASnapchatExport(
      "No memories_history.json in there. That's not a Snapchat export ZIP.",
    );
  }
  if (!mediaFiles.length) {
    throw new NotASnapchatExport(
      "That export has the list of your memories but none of the actual files. Snapchat sometimes emails the JSON first and the media later — check for a second download link.",
    );
  }

  report({
    phase: "matching",
    done: 0,
    total: 0,
    label: "Matching memories to files",
  });

  const zipForPath = new Map<string, JSZip>();
  for (const m of mediaFiles) zipForPath.set(m.path, m.zip);

  const groups = groupMediaFiles(mediaFiles.map((m) => m.path));
  const pairings: Pairing[] = matchEntriesToMedia(entries, groups);

  // Oldest first, so the free batch is a predictable slice rather than a
  // random one.
  pairings.sort((a, b) => (a.entry?.takenAt ?? 0) - (b.entry?.takenAt ?? 0));

  const selected = limit === null ? pairings : pairings.slice(0, limit);

  const out = new JSZip();
  const folder = out.folder("KeepMySnaps")!;
  const used = new Set<string>();
  const csv: string[] = [
    "filename,taken_at_utc,latitude,longitude,location_precision,source_file",
  ];

  const summary: Summary = {
    totalMemories: entries.length,
    filesWritten: 0,
    datesRestored: 0,
    gpsRestored: 0,
    overlaysMerged: 0,
    videos: 0,
    unmatched: pairings.filter((p) => !p.entry).length,
    withheld: Math.max(0, pairings.length - selected.length),
  };

  for (const [i, pairing] of selected.entries()) {
    throwIfAborted(signal);
    const { entry, group } = pairing;

    report({
      phase: "fixing",
      done: i,
      total: selected.length,
      label: `Restoring ${i + 1} of ${selected.length}`,
    });

    const baseZip = zipForPath.get(group.base);
    const baseObj = baseZip?.file(group.base);
    if (!baseObj) continue;

    const ext = extensionOf(group.base);
    const isVideo = VIDEO_EXT.has(ext);
    let bytes = new Uint8Array(await baseObj.async("arraybuffer")) as Uint8Array;
    let outExt = ext;

    if (!isVideo) {
      const overlayObj = group.overlay
        ? (zipForPath.get(group.overlay)?.file(group.overlay) ?? null)
        : null;
      const overlayBytes = overlayObj
        ? (new Uint8Array(await overlayObj.async("arraybuffer")) as Uint8Array)
        : null;

      // Flatten when there's an overlay, or when the base isn't a JPEG and so
      // can't carry EXIF as-is.
      if (overlayBytes || !isJpeg(bytes)) {
        try {
          bytes = await flatten(bytes, ext, overlayBytes);
          outExt = "jpg";
          if (overlayBytes) summary.overlaysMerged++;
        } catch {
          // Keep the original bytes if the browser can't decode it.
        }
      }

      if (entry) {
        // Snapchat's JSON has no id to join on, so within a day the files
        // are interchangeable. `location` is what the matcher could stand
        // behind: this memory's own coordinates, or the centre of the ones it
        // couldn't be told apart from, or nothing.
        bytes = writeExif(bytes, {
          takenAt: entry.takenAt,
          lat: pairing.location?.lat ?? null,
          lon: pairing.location?.lon ?? null,
          caption: entry.caption,
        });
      }
    } else {
      summary.videos++;
    }

    const name = outputName(entry, outExt, i, used);
    folder.file(name, bytes, {
      // Video EXIF isn't a thing, so the file's own timestamp carries the date.
      date: entry?.takenAt != null ? new Date(entry.takenAt) : undefined,
      compression: "STORE",
      binary: true,
    });

    if (entry?.takenAt != null) summary.datesRestored++;
    if (pairing.location) summary.gpsRestored++;
    summary.filesWritten++;

    csv.push(
      [
        csvCell(name),
        csvCell(entry?.takenAt != null ? new Date(entry.takenAt).toISOString() : null),
        // The CSV mirrors what actually went into the files, so a blank here
        // means "Snapchat couldn't tell us", not "we forgot". The precision
        // column says whether the pin is this memory's own.
        csvCell(pairing.location?.lat ?? null),
        csvCell(pairing.location?.lon ?? null),
        pairing.location ? (pairing.location.exact ? "exact" : "approximate") : "",
        csvCell(group.base),
      ].join(","),
    );
  }

  folder.file("keepmysnaps-index.csv", csv.join("\n"));
  folder.file(
    "README.txt",
    [
      "Your memories, with their real dates and locations put back.",
      "",
      `Files in here: ${summary.filesWritten}`,
      `Dates restored: ${summary.datesRestored}`,
      `Locations restored: ${summary.gpsRestored}`,
      "",
      "Snapchat's export doesn't say which photo goes with which entry in its",
      "list, so when several memories share a day we can't always tell them",
      "apart. Those get the centre of where that day's memories were, marked",
      "\"approximate\" in the CSV. Where the day was spread too far for a centre",
      "to mean anything, the location is left out rather than guessed at.",
      `Captions flattened onto photos: ${summary.overlaysMerged}`,
      `Videos (renamed and timestamped — video files can't hold EXIF): ${summary.videos}`,
      "",
      "Photos carry EXIF DateTimeOriginal and GPS, so Google Photos, Apple",
      "Photos, Immich and everything else will file them under the day they",
      "actually happened.",
      "",
      "keepmysnaps-index.csv has the same data as plain text, in case you want",
      "to do something else with it.",
      "",
      "Not affiliated with Snapchat or Snap Inc.",
    ].join("\n"),
  );

  report({
    phase: "packing",
    done: selected.length,
    total: selected.length,
    label: "Packing your ZIP",
  });

  const blob = await out.generateAsync(
    { type: "blob", compression: "STORE" },
    (meta) => {
      report({
        phase: "packing",
        done: Math.round(meta.percent),
        total: 100,
        label: "Packing your ZIP",
      });
    },
  );

  report({ phase: "done", done: 100, total: 100, label: "Done" });

  // Keep the loaded archives from pinning memory once we're finished.
  zips.length = 0;

  return { blob, summary };
}

/** Cheap pre-flight so we can be rude about the wrong file straight away. */
export function looksLikeZip(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith(".zip") ||
    file.type === "application/zip" ||
    file.type === "application/x-zip-compressed"
  );
}

export { isOverlayPath };
