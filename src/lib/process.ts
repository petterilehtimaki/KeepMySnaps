/**
 * The whole pipeline: ZIP in, fixed ZIP out, without a single byte leaving the
 * browser. Everything runs sequentially so a 5GB export doesn't try to hold
 * itself in memory all at once.
 */
import {
  BlobReader,
  BlobWriter,
  TextReader,
  TextWriter,
  Uint8ArrayReader,
  Uint8ArrayWriter,
  ZipReader,
  ZipWriter,
  configure,
} from "@zip.js/zip.js";
import {
  freeSelection,
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
import { burnOverlayIntoVideo, canRewriteVideo } from "./video";
import { drawCovering } from "./compose";
import { stampMp4CreationTime } from "./mp4time";

// Inflate in workers so a 2GB part doesn't freeze the tab it is being read in.
configure({ useWebWorkers: true });

/** An error whose message is written for the person reading it. */
export class UserFacingError extends Error {}

export class NotASnapchatExport extends UserFacingError {}

/** This browser can't do an export this size, whatever the machine can. */
export class BrowserTooSmall extends UserFacingError {}

/** The machine can, but the browser isn't allowed enough room. */
export class NotEnoughRoom extends UserFacingError {}

/**
 * How much a browser stuck working in memory can take before it dies.
 *
 * Nothing magic about the number: a tab gets a couple of gigabytes, the
 * archive has to fit alongside the photos being read, and Safari falls over
 * well before the theoretical limit. Under this, working in memory is fine
 * and always has been.
 */
const MEMORY_ONLY_LIMIT = 1_500_000_000;

const gb = (bytes: number) =>
  bytes >= 1_000_000_000
    ? `${(bytes / 1_000_000_000).toFixed(1)} GB`
    : `${Math.round(bytes / 1_000_000)} MB`;

/** The finished archive, parked in the browser's own storage while it's built. */
const OUTPUT_FILENAME = "keepmysnaps-output.zip";

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
  /** Video captions drawn into the video itself. */
  videoCaptionsBurned: number;
  /**
   * Video captions saved beside their video instead of drawn in.
   *
   * The fallback for browsers without WebCodecs and for files the encoder
   * won't take. Worse than a finished video, far better than a deleted
   * caption.
   */
  videoCaptionsKept: number;
  unmatched: number;
  /** Files present in the export beyond the ones written to this ZIP. */
  withheld: number;
  /**
   * ZIPs the browser couldn't read, by name.
   *
   * A file that fails to open is usually the browser, not the archive: a drop
   * whose handle went stale, a file still syncing from iCloud, a flaky read.
   * One bad part used to fail the whole run, which is the wrong trade when
   * six of the seven opened fine and the JSON is in one of those.
   */
  unreadable: string[];
};

export type Outcome = {
  blob: Blob;
  summary: Summary;
};

type SourceFile = {
  /** Reads this one entry off disk, when and only when it is needed. */
  read: () => Promise<Uint8Array>;
  path: string;
};

const VIDEO_EXT = new Set(["mp4", "mov", "m4v", "webm"]);

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

/** `2023-06-12_18-04-22` — the capture time, or a counter when there isn't one. */
function stemFor(entry: MemoryEntry | null, index: number): string {
  if (entry?.takenAt === null || entry?.takenAt === undefined) {
    return `undated_${String(index + 1).padStart(5, "0")}`;
  }
  const d = new Date(entry.takenAt);
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}` +
    `_${p(d.getUTCHours())}-${p(d.getUTCMinutes())}-${p(d.getUTCSeconds())}`
  );
}

/** `2023-06-12_18-04-22.jpg`, deduped when two snaps share a second. */
function outputName(
  entry: MemoryEntry | null,
  ext: string,
  index: number,
  used: Set<string>,
): string {
  const stem = stemFor(entry, index);
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
      drawCovering(ctx, overlay, canvas.width, canvas.height);
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

/**
 * One CSV cell, quoted where the format needs it and defused where a
 * spreadsheet does.
 *
 * The filename and source columns come from names inside the ZIP, and Excel,
 * Numbers and Sheets all treat a cell opening with `=`, `+`, `-` or `@` as a
 * formula to run. Quoting alone doesn't stop that — they strip the quotes
 * first — so a leading apostrophe goes in front. Anyone who opens the index
 * expecting a list of dates should get a list of dates.
 */
function csvCell(value: string | number | null): string {
  if (value === null || value === "") return "";
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
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

  const inputBytes = files.reduce((total, f) => total + f.size, 0);
  await preflight(inputBytes);

  report({ phase: "reading", done: 0, total: files.length, label: "Opening the ZIP" });

  // Read the archives without loading them.
  //
  // A real library is several 2GB parts, and pulling each one into memory to
  // look inside it is what makes a big export impossible rather than slow. A
  // ZIP's index lives at its end, so this reads that index and nothing else,
  // then pulls each photo off disk at the moment it is needed. Peak memory is
  // one photo, whether the export is 20MB or 200GB.
  const readers: ZipReader<unknown>[] = [];
  const unreadable: string[] = [];
  const mediaFiles: SourceFile[] = [];
  const entries: MemoryEntry[] = [];

  for (const [i, file] of files.entries()) {
    throwIfAborted(signal);
    const reader = new ZipReader(new BlobReader(file));
    let zipEntries;
    try {
      zipEntries = await reader.getEntries();
    } catch {
      unreadable.push(file.name);
      await reader.close().catch(() => {});
      continue;
    }
    readers.push(reader);

    for (const entry of zipEntries) {
      if (entry.directory) continue;
      const path = entry.filename;

      if (/memories_history\.json$/i.test(path)) {
        try {
          const text = await entry.getData!(new TextWriter());
          entries.push(...parseMemoriesHistory(JSON.parse(text)));
        } catch {
          // Malformed JSON, or a part that read badly: fall through to the
          // "no memories" error below.
        }
      } else if (isMediaPath(path) && !isThumbnailPath(path)) {
        mediaFiles.push({
          path,
          read: () => entry.getData!(new Uint8ArrayWriter()),
        });
      }
    }

    report({
      phase: "reading",
      done: i + 1,
      total: files.length,
      label: `Read ${file.name}`,
    });
  }

  if (!readers.length) {
    throw new NotASnapchatExport(
      unreadable.length === 1
        ? `${unreadable[0]} wouldn't open. If it's on iCloud Drive, wait for it to finish downloading, then try again.`
        : "None of those would open. If they're on iCloud Drive, wait for them to finish downloading, then try again.",
    );
  }

  if (!entries.length) {
    throw new NotASnapchatExport(
      unreadable.length
        ? `No memories_history.json in the parts that opened, and ${unreadable.join(", ")} wouldn't open. That list only lives in one part, so try those again.`
        : "No memories_history.json in there. That's not a Snapchat export ZIP.",
    );
  }
  if (!mediaFiles.length) {
    throw new NotASnapchatExport(
      "That export has the list of your memories but none of the actual files. Snapchat sometimes emails the JSON first and the media later, so check for a second download link.",
    );
  }

  report({
    phase: "matching",
    done: 0,
    total: 0,
    label: "Matching memories to files",
  });

  const readForPath = new Map<string, () => Promise<Uint8Array>>();
  for (const m of mediaFiles) readForPath.set(m.path, m.read);

  const groups = groupMediaFiles(mediaFiles.map((m) => m.path));
  const pairings: Pairing[] = matchEntriesToMedia(entries, groups);

  // Oldest first, so the free batch is a predictable slice rather than a
  // random one.
  pairings.sort((a, b) => (a.entry?.takenAt ?? 0) - (b.entry?.takenAt ?? 0));

  const selected =
    limit === null ? pairings : freeSelection(entries, pairings, limit);

  // The archive is written as the work happens, not assembled at the end.
  //
  // JSZip can read zip64 but not write it, so anything past 4GB or 65,535
  // files came out malformed: exactly the libraries this tool exists for. This
  // writer does zip64, and streams into the browser's own storage so nothing
  // is held in memory. `level: 0` is store, since photos and video are already
  // compressed and deflating them again costs minutes to save nothing.
  const sink = await openOutputSink();
  // zip64 only where it is needed. Past 4GB or 65,535 files a plain ZIP cannot
  // describe itself and comes out malformed, which is the case this tool has
  // to survive; below that, a plain ZIP is what every unarchiver on earth
  // opens without thinking about it.
  const out = new ZipWriter(sink.writable, {
    zip64: inputBytes > 3_000_000_000 || mediaFiles.length > 60_000,
    level: 0,
  });
  const folder = {
    file: (
      name: string,
      data: Uint8Array | string,
      opts?: { date?: Date },
    ) =>
      out.add(
        `KeepMySnaps/${name}`,
        typeof data === "string"
          ? new TextReader(data)
          : new Uint8ArrayReader(data),
        { lastModDate: opts?.date },
      ),
  };
  const used = new Set<string>();
  const usedCaptions = new Set<string>();
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
    videoCaptionsBurned: 0,
    videoCaptionsKept: 0,
    unmatched: pairings.filter((p) => !p.entry).length,
    withheld: Math.max(0, pairings.length - selected.length),
    unreadable,
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

    const readBase = readForPath.get(group.base);
    if (!readBase) continue;

    const ext = extensionOf(group.base);
    const isVideo = VIDEO_EXT.has(ext);
    let bytes = await readBase();
    let outExt = ext;

    if (!isVideo) {
      const readOverlay = group.overlay ? readForPath.get(group.overlay) : null;
      const overlayBytes = readOverlay ? await readOverlay() : null;

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

      // A video has no EXIF, but its headers carry a creation time, and that
      // is what Photos, iCloud and Google Photos read. Snapchat usually fills
      // it in correctly; writing the entry's time anyway means every file on
      // the way out agrees with the index, rather than trusting two sources.
      if (entry?.takenAt != null) stampMp4CreationTime(bytes, entry.takenAt);

      // Two thirds of the captions in a real export belong to videos, and a
      // video has nowhere to keep a picture — so the only way to make the
      // caption part of the file is to decode it, draw the overlay on every
      // frame and encode it again. If that can't be done, the PNG goes in a
      // folder of its own rather than being dropped.
      const readOverlay = group.overlay ? readForPath.get(group.overlay) : null;

      if (readOverlay) {
        const overlayBytes = await readOverlay();

        let burned: Uint8Array | null = null;
        if (canRewriteVideo()) {
          report({
            phase: "fixing",
            done: i,
            total: selected.length,
            label: `Drawing caption into video ${summary.videos}`,
          });
          let bitmap: ImageBitmap | null = null;
          try {
            bitmap = await decode(overlayBytes, "image/png");
            burned = await burnOverlayIntoVideo(bytes, bitmap, signal, entry?.takenAt ?? null);
          } catch {
            burned = null;
          } finally {
            bitmap?.close();
          }
        }

        if (burned) {
          bytes = burned;
          outExt = "mp4";
          summary.videoCaptionsBurned++;
        } else {
          await folder.file(
            `captions/${outputName(entry, "png", i, usedCaptions).replace(
              /\.png$/,
              "-caption.png",
            )}`,
            overlayBytes,
            { date: entry?.takenAt != null ? new Date(entry.takenAt) : undefined },
          );
          summary.videoCaptionsKept++;
        }
      }
    }

    const name = outputName(entry, outExt, i, used);
    // Video EXIF isn't a thing, so the file's own timestamp carries the date.
    await folder.file(name, bytes, {
      date: entry?.takenAt != null ? new Date(entry.takenAt) : undefined,
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

  await folder.file("keepmysnaps-index.csv", csv.join("\n"));
  await folder.file(
    "README.txt",
    [
      "Your memories, with their real dates and locations put back.",
      "",
      `Files in here: ${summary.filesWritten}`,
      `Dates restored: ${summary.datesRestored}`,
      `Locations restored: ${summary.gpsRestored}`,
      `Captions flattened onto photos: ${summary.overlaysMerged}`,
      ...(summary.videoCaptionsBurned
        ? [`Captions drawn into videos: ${summary.videoCaptionsBurned}`]
        : []),
      ...(summary.videoCaptionsKept
        ? [`Captions saved beside videos: ${summary.videoCaptionsKept}`]
        : []),
      `Videos (capture time written into the file): ${summary.videos}`,
      "",
      "About the locations",
      "",
      "Snapchat's export doesn't say which photo goes with which entry in its",
      "list, so when several memories share a day we can't always tell them",
      "apart. Those get the centre of where that day's memories were, marked",
      "\"approximate\" in the CSV. Where the day was spread too far for a centre",
      "to mean anything, the location is left out rather than guessed at: a",
      "pin in the wrong place looks exactly like a pin in the right one.",
      "",
      ...(summary.videoCaptionsKept
        ? [
            "About the captions folder",
            "",
            "Snapchat ships a video's caption as a separate transparent PNG.",
            "Most are drawn back into the video itself. These ones couldn't be",
            "(either this browser has no video encoder, or the file wasn't one",
            "it would take), so they're in the captions/ folder, named to match",
            "their video, rather than lost.",
            "",
          ]
        : []),
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

  await out.close();
  const blob = await sink.finish();

  report({ phase: "done", done: 100, total: 100, label: "Done" });

  // Close the readers. They only ever held each ZIP's index, but a closed
  // reader is one the browser can stop tracking.
  await Promise.all(readers.map((r) => r.close().catch(() => {})));

  return { blob, summary };
}


/**
 * Answers before any work starts: can this browser finish this export?
 *
 * Both answers used to be found out the slow way. A browser that can only
 * work in memory showed a progress bar for ten minutes and then died, which
 * reads as a broken product rather than the wrong browser. And a machine
 * without room failed at the very end, after all the work.
 */
async function preflight(inputBytes: number): Promise<void> {
  const root = await opfsRoot();
  let streams = false;
  if (root) {
    try {
      // Clearing last run's archive and proving the browser can stream are the
      // same act: opening the file for writing truncates it.
      const handle = await root.getFileHandle(OUTPUT_FILENAME, { create: true });
      const writable = await handle.createWritable();
      await writable.close();
      streams = true;
    } catch {
      streams = false;
    }
  }

  if (!streams) {
    if (inputBytes > MEMORY_ONLY_LIMIT) {
      throw new BrowserTooSmall(
        `That's ${gb(inputBytes)} of export, and this browser can only work in memory, so it would run out partway through. Chrome or Edge can do it. Nothing is uploaded there either: the work still happens on your machine.`,
      );
    }
    return;
  }

  // The finished archive is about the size of what went in, since photos and
  // video don't compress.
  const needed = Math.round(inputBytes * 1.05);
  const { quota = 0, usage = 0 } = (await navigator.storage?.estimate?.()) ?? {};
  const room = Math.max(0, quota - usage);
  if (quota && room < needed) {
    throw new NotEnoughRoom(
      `This needs about ${gb(needed)} of room to write the fixed copy, and this browser is only allowed ${gb(room)}. Free up disk space and try again. You'll also want about ${gb(needed)} spare wherever your downloads land.`,
    );
  }
}

async function opfsRoot(): Promise<FileSystemDirectoryHandle | null> {
  try {
    return (await navigator.storage?.getDirectory?.()) ?? null;
  } catch {
    return null;
  }
}

/**
 * Throws away the archive left in the browser's own storage.
 *
 * A finished export sits there until something deletes it, and so does half a
 * one after a stopped run. Both are invisible in Finder and both are the size
 * of somebody's photo library, so every run starts by clearing the last one
 * and the page clears it again when you're done with it.
 */
export async function clearStoredOutput(): Promise<void> {
  const root = await opfsRoot();
  await root?.removeEntry(OUTPUT_FILENAME).catch(() => {});
}

/**
 * Where the finished ZIP is written while it is being made.
 *
 * Assembling the archive in memory and handing it over at the end is what made
 * a real library impossible: a 13GB export finished its work and then died
 * building a blob no tab can hold. So the bytes go into a file in the
 * browser's own storage as they are produced, and what comes back at the end
 * is backed by disk. Browsers without that storage fall back to memory, which
 * is the small-export case anyway.
 */
async function openOutputSink(): Promise<{
  writable: WritableStream<Uint8Array>;
  finish: () => Promise<Blob>;
}> {
  const opfs = await navigator.storage?.getDirectory?.().catch(() => null);
  if (opfs) {
    try {
      const handle = await opfs.getFileHandle(OUTPUT_FILENAME, { create: true });
      const writable = await handle.createWritable();
      return {
        writable: writable as unknown as WritableStream<Uint8Array>,
        finish: async () => handle.getFile(),
      };
    } catch {
      // No quota, or a browser that only claims to support this.
    }
  }

  const blobWriter = new BlobWriter("application/zip");
  return {
    writable: blobWriter.writable as unknown as WritableStream<Uint8Array>,
    finish: () => blobWriter.getData(),
  };
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
