/**
 * Writing a capture time into an MP4's own headers.
 *
 * A video has no EXIF, but it does carry a creation time in three places —
 * the movie header (mvhd), each track header (tkhd) and each media header
 * (mdhd) — and that is what Apple Photos, iCloud and Google Photos read to put
 * a video on the right day. Snapchat's export fills them in correctly.
 *
 * mp4-muxer overwrites all three with Date.now() when it builds a file, and
 * doesn't expose an option for it. So a captioned video that goes through the
 * re-encode would come out stamped with the moment it was fixed, which is
 * exactly the problem this site exists to solve. This puts the real time back
 * after the muxer is done.
 *
 * It walks the box tree rather than scanning for the four-character codes,
 * because `mvhd` can occur by chance inside compressed frame data, and writing
 * a timestamp into the middle of a frame corrupts the video.
 */

/** Seconds between 1904-01-01 (the MP4 epoch) and 1970-01-01. */
const EPOCH_1904 = 2_082_844_800;

/** Boxes that hold the stamped boxes, and nothing else we need to enter. */
const CONTAINERS = new Set(["moov", "trak", "mdia"]);
const STAMPED = new Set(["mvhd", "tkhd", "mdhd"]);

/**
 * Sets creation and modification time on every movie, track and media header
 * in place. Returns how many headers were written; zero means the bytes were
 * not an MP4 this understands, and nothing was touched.
 */
export function stampMp4CreationTime(bytes: Uint8Array, epochMs: number): number {
  if (!Number.isFinite(epochMs)) return 0;
  const seconds = Math.floor(epochMs / 1000) + EPOCH_1904;
  if (seconds < 0) return 0;

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let stamped = 0;

  const walk = (start: number, end: number) => {
    let pos = start;
    while (pos + 8 <= end) {
      let size = view.getUint32(pos);
      let header = 8;
      if (size === 1) {
        if (pos + 16 > end) return;
        size = Number(view.getBigUint64(pos + 8));
        header = 16;
      } else if (size === 0) {
        size = end - pos;
      }
      // A size that doesn't fit is a file we don't understand. Stop rather
      // than write into bytes whose meaning we've lost track of.
      if (size < header || pos + size > end) return;

      const type = String.fromCharCode(
        bytes[pos + 4],
        bytes[pos + 5],
        bytes[pos + 6],
        bytes[pos + 7],
      );

      if (CONTAINERS.has(type)) {
        walk(pos + header, pos + size);
      } else if (STAMPED.has(type)) {
        // Full box: version (1 byte), flags (3), then creation and
        // modification time — 32-bit in version 0, 64-bit in version 1.
        const body = pos + header;
        const version = bytes[body];
        if (version === 1 && body + 20 <= pos + size) {
          view.setBigUint64(body + 4, BigInt(seconds));
          view.setBigUint64(body + 12, BigInt(seconds));
          stamped++;
        } else if (
          version === 0 &&
          body + 12 <= pos + size &&
          seconds <= 0xffffffff
        ) {
          view.setUint32(body + 4, seconds);
          view.setUint32(body + 8, seconds);
          stamped++;
        }
      }

      pos += size;
    }
  };

  walk(0, bytes.byteLength);
  return stamped;
}
