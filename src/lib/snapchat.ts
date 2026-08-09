/**
 * Parsing and matching for Snapchat's "My Data" export.
 *
 * Snapchat has shipped at least four shapes of this export over the years, so
 * everything here degrades rather than throws: unknown keys are ignored, and a
 * memory that can't be matched to a file is reported instead of dropped.
 */

export type MemoryEntry = {
  /** Capture time in UTC, as milliseconds. */
  takenAt: number | null;
  mediaType: "image" | "video" | "unknown";
  lat: number | null;
  lon: number | null;
  caption: string | null;
  mediaId: string | null;
};

export type MediaGroup = {
  /** Normalised key shared by a base file and its overlay. */
  key: string;
  base: string;
  overlay: string | null;
  /** Date parsed out of the filename, if the export encodes one. */
  filenameDate: string | null;
};

export type Pairing = {
  entry: MemoryEntry | null;
  group: MediaGroup;
};

const IMAGE_EXT = new Set(["jpg", "jpeg", "png", "webp", "heic"]);
const VIDEO_EXT = new Set(["mp4", "mov", "m4v", "webm"]);

export function extensionOf(path: string): string {
  const base = path.split("/").pop() ?? path;
  const dot = base.lastIndexOf(".");
  return dot === -1 ? "" : base.slice(dot + 1).toLowerCase();
}

export function isMediaPath(path: string): boolean {
  const ext = extensionOf(path);
  return IMAGE_EXT.has(ext) || VIDEO_EXT.has(ext);
}

export function isOverlayPath(path: string): boolean {
  return /overlay/i.test(path.split("/").pop() ?? "");
}

export function isThumbnailPath(path: string): boolean {
  return /(thumbnail|thumb|_tn\b)/i.test(path.split("/").pop() ?? "");
}

/** `2023-06-12_B2C3~D4-main.jpg` -> `2023-06-12_b2c3~d4` */
function groupKeyFor(path: string): string {
  const name = (path.split("/").pop() ?? path).toLowerCase();
  const dot = name.lastIndexOf(".");
  const stem = dot === -1 ? name : name.slice(0, dot);
  return stem
    .replace(/[-_](main|media|overlay|overlays)$/i, "")
    .replace(/[-_]overlay[-_]?\d*$/i, "");
}

const DATE_IN_NAME = /(\d{4})[-_](\d{2})[-_](\d{2})/;

function filenameDateFor(path: string): string | null {
  const m = DATE_IN_NAME.exec(path.split("/").pop() ?? "");
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/**
 * Collapses a flat list of ZIP paths into base/overlay pairs.
 */
export function groupMediaFiles(paths: string[]): MediaGroup[] {
  const groups = new Map<string, MediaGroup>();

  for (const path of paths) {
    if (!isMediaPath(path) || isThumbnailPath(path)) continue;

    const key = groupKeyFor(path);
    const existing = groups.get(key);
    const overlay = isOverlayPath(path);

    if (!existing) {
      groups.set(key, {
        key,
        base: overlay ? "" : path,
        overlay: overlay ? path : null,
        filenameDate: filenameDateFor(path),
      });
      continue;
    }

    if (overlay) {
      // Keep the first overlay; exports occasionally ship duplicates.
      existing.overlay ??= path;
    } else if (!existing.base) {
      existing.base = path;
    } else if (path.length < existing.base.length) {
      // Prefer the shorter path — the longer one is usually a variant copy.
      existing.base = path;
    }
    existing.filenameDate ??= filenameDateFor(path);
  }

  // A lone overlay with no base is useless on its own.
  return [...groups.values()]
    .filter((g) => g.base)
    .sort((a, b) => a.base.localeCompare(b.base));
}

/* ---------------------------------------------------------------- entries */

const DATE_KEYS = ["Date", "date", "Capture Date", "Time", "Created"];
const TYPE_KEYS = ["Media Type", "media_type", "Type"];
const LOCATION_KEYS = ["Location", "location", "Location Coordinates"];
const CAPTION_KEYS = ["Caption", "caption", "Text", "Description"];
const ID_KEYS = ["Media ID", "MID", "mid", "Media Id", "id", "Snap ID"];
const LIST_KEYS = ["Saved Media", "Memories", "saved_media", "Saved Media List"];

type Loose = Record<string, unknown>;

function pick(obj: Loose, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return v.trim();
    if (typeof v === "number") return String(v);
  }
  return null;
}

/** "2023-06-12 18:04:22 UTC" -> epoch ms. Snapchat always writes UTC. */
export function parseSnapDate(value: string | null): number | null {
  if (!value) return null;
  const m = /(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/.exec(value);
  if (m) {
    return Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]);
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/** "Latitude, Longitude: 60.16952, 24.93545" -> [60.16952, 24.93545] */
export function parseLocation(value: string | null): [number, number] | null {
  if (!value) return null;
  const nums = value.match(/-?\d+\.\d+/g);
  if (!nums || nums.length < 2) return null;
  const lat = parseFloat(nums[0]);
  const lon = parseFloat(nums[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  // Snapchat writes 0,0 when it has nothing. Null Island is not a memory.
  if (lat === 0 && lon === 0) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return [lat, lon];
}

export function parseMemoriesHistory(json: unknown): MemoryEntry[] {
  let list: unknown = null;

  if (Array.isArray(json)) {
    list = json;
  } else if (json && typeof json === "object") {
    const obj = json as Loose;
    for (const key of LIST_KEYS) {
      if (Array.isArray(obj[key])) {
        list = obj[key];
        break;
      }
    }
    if (!list) {
      // Last resort: the first array of objects we find.
      for (const value of Object.values(obj)) {
        if (Array.isArray(value) && value.length && typeof value[0] === "object") {
          list = value;
          break;
        }
      }
    }
  }

  if (!Array.isArray(list)) return [];

  return list.map((item): MemoryEntry => {
    const obj = (item ?? {}) as Loose;
    const rawType = (pick(obj, TYPE_KEYS) ?? "").toLowerCase();
    const coords = parseLocation(pick(obj, LOCATION_KEYS));

    return {
      takenAt: parseSnapDate(pick(obj, DATE_KEYS)),
      mediaType: rawType.includes("video")
        ? "video"
        : rawType.includes("image") || rawType.includes("photo")
          ? "image"
          : "unknown",
      lat: coords?.[0] ?? null,
      lon: coords?.[1] ?? null,
      caption: pick(obj, CAPTION_KEYS),
      mediaId: pick(obj, ID_KEYS),
    };
  });
}

/* --------------------------------------------------------------- matching */

function normaliseId(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Pairs JSON entries with the files actually present in the ZIP.
 *
 * Three passes, most trustworthy first: media ID inside the filename, then
 * same-day ordering, then whatever is left in export order. Snapchat lists
 * memories newest-first, so the fallback reverses to match file order.
 */
export function matchEntriesToMedia(
  entries: MemoryEntry[],
  groups: MediaGroup[],
): Pairing[] {
  const pairings = new Map<string, Pairing>(
    groups.map((g) => [g.key, { entry: null, group: g }]),
  );
  const unusedEntries = new Set(entries);

  // Pass 1 — media ID appears in the filename.
  const byNormalisedKey = new Map<string, MediaGroup>();
  for (const g of groups) byNormalisedKey.set(normaliseId(g.key), g);

  for (const entry of entries) {
    if (!entry.mediaId) continue;
    const needle = normaliseId(entry.mediaId);
    if (needle.length < 6) continue;

    let hit: MediaGroup | undefined = byNormalisedKey.get(needle);
    if (!hit) {
      for (const [k, g] of byNormalisedKey) {
        if (k.includes(needle)) {
          hit = g;
          break;
        }
      }
    }
    const slot = hit && pairings.get(hit.key);
    if (slot && !slot.entry) {
      slot.entry = entry;
      unusedEntries.delete(entry);
    }
  }

  // Pass 2 — same calendar day, in order.
  const openByDate = new Map<string, MediaGroup[]>();
  for (const g of groups) {
    if (pairings.get(g.key)?.entry || !g.filenameDate) continue;
    const bucket = openByDate.get(g.filenameDate) ?? [];
    bucket.push(g);
    openByDate.set(g.filenameDate, bucket);
  }

  for (const entry of [...unusedEntries]) {
    if (entry.takenAt === null) continue;
    const day = new Date(entry.takenAt).toISOString().slice(0, 10);
    const bucket = openByDate.get(day);
    const g = bucket?.shift();
    if (!g) continue;
    const slot = pairings.get(g.key);
    if (slot && !slot.entry) {
      slot.entry = entry;
      unusedEntries.delete(entry);
    }
  }

  // Pass 3 — positional fallback over whatever is still open.
  const openGroups = groups.filter((g) => !pairings.get(g.key)?.entry);
  const leftovers = [...unusedEntries].reverse();
  for (let i = 0; i < openGroups.length && i < leftovers.length; i++) {
    const slot = pairings.get(openGroups[i].key);
    if (slot) slot.entry = leftovers[i];
  }

  return groups.map((g) => pairings.get(g.key)!);
}
