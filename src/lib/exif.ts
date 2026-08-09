/**
 * Writing capture time and GPS back into JPEG EXIF, in the browser.
 *
 * piexifjs works on "binary strings" (one char per byte), so everything here
 * converts to and from that representation rather than touching base64.
 */
import piexif from "piexifjs";

export function bytesToBinaryString(bytes: Uint8Array): string {
  const CHUNK = 0x8000;
  let out = "";
  for (let i = 0; i < bytes.length; i += CHUNK) {
    out += String.fromCharCode(
      ...(bytes.subarray(i, i + CHUNK) as unknown as number[]),
    );
  }
  return out;
}

export function binaryStringToBytes(str: string): Uint8Array {
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) bytes[i] = str.charCodeAt(i) & 0xff;
  return bytes;
}

export function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** EXIF wants `YYYY:MM:DD HH:MM:SS`. We keep everything in UTC. */
export function exifDateString(epochMs: number): string {
  const d = new Date(epochMs);
  return (
    `${d.getUTCFullYear()}:${pad(d.getUTCMonth() + 1)}:${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`
  );
}

type Rational = [number, number];

function degToDms(deg: number): [Rational, Rational, Rational] {
  const abs = Math.abs(deg);
  const d = Math.floor(abs);
  const minFloat = (abs - d) * 60;
  const m = Math.floor(minFloat);
  const s = Math.round((minFloat - m) * 60 * 10000);
  return [
    [d, 1],
    [m, 1],
    [s, 10000],
  ];
}

export type ExifPatch = {
  takenAt: number | null;
  lat: number | null;
  lon: number | null;
  caption: string | null;
};

/**
 * Returns the JPEG with EXIF merged in. Existing tags are preserved; we only
 * overwrite the ones Snapchat stripped. Returns the input untouched if the
 * bytes aren't a JPEG or piexif chokes on them.
 */
export function writeExif(bytes: Uint8Array, patch: ExifPatch): Uint8Array {
  if (!isJpeg(bytes)) return bytes;
  if (patch.takenAt === null && patch.lat === null && !patch.caption) {
    return bytes;
  }

  const binary = bytesToBinaryString(bytes);

  try {
    let exif: Record<string, Record<number, unknown>>;
    try {
      exif = piexif.load(binary) as typeof exif;
    } catch {
      exif = {};
    }

    const zeroth = { ...(exif["0th"] ?? {}) } as Record<number, unknown>;
    const exifIfd = { ...(exif.Exif ?? {}) } as Record<number, unknown>;
    const gps = { ...(exif.GPS ?? {}) } as Record<number, unknown>;

    if (patch.takenAt !== null) {
      const stamp = exifDateString(patch.takenAt);
      // Snapchat only ever records UTC, so that's what goes in. EXIF's
      // OffsetTime tags would say so explicitly, but piexifjs predates them
      // and throws on unknown tags — the GPS timestamp below carries the same
      // information for anything that cares.
      zeroth[piexif.ImageIFD.DateTime] = stamp;
      exifIfd[piexif.ExifIFD.DateTimeOriginal] = stamp;
      exifIfd[piexif.ExifIFD.DateTimeDigitized] = stamp;
    }

    if (patch.lat !== null && patch.lon !== null) {
      gps[piexif.GPSIFD.GPSVersionID] = [2, 3, 0, 0];
      gps[piexif.GPSIFD.GPSLatitudeRef] = patch.lat < 0 ? "S" : "N";
      gps[piexif.GPSIFD.GPSLatitude] = degToDms(patch.lat);
      gps[piexif.GPSIFD.GPSLongitudeRef] = patch.lon < 0 ? "W" : "E";
      gps[piexif.GPSIFD.GPSLongitude] = degToDms(patch.lon);
      if (patch.takenAt !== null) {
        const d = new Date(patch.takenAt);
        gps[piexif.GPSIFD.GPSDateStamp] =
          `${d.getUTCFullYear()}:${pad(d.getUTCMonth() + 1)}:${pad(d.getUTCDate())}`;
        gps[piexif.GPSIFD.GPSTimeStamp] = [
          [d.getUTCHours(), 1],
          [d.getUTCMinutes(), 1],
          [d.getUTCSeconds(), 1],
        ];
      }
    }

    if (patch.caption) {
      // ASCII-only tag; anything exotic gets dropped rather than mangled.
      const ascii = patch.caption.replace(/[^\x20-\x7e]/g, "").slice(0, 240);
      if (ascii) zeroth[piexif.ImageIFD.ImageDescription] = ascii;
    }

    zeroth[piexif.ImageIFD.Software] = "KeepMySnaps";

    const dumped = piexif.dump({
      "0th": zeroth,
      Exif: exifIfd,
      GPS: gps,
      Interop: exif.Interop ?? {},
      "1st": exif["1st"] ?? {},
      thumbnail: null,
    } as never);

    return binaryStringToBytes(piexif.insert(dumped, binary));
  } catch {
    // A corrupt or unusual JPEG is still worth handing back to the user.
    return bytes;
  }
}
