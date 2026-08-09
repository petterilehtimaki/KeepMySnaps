import { test } from "node:test";
import assert from "node:assert/strict";
import piexif from "piexifjs";
import {
  binaryStringToBytes,
  bytesToBinaryString,
  exifDateString,
  isJpeg,
  writeExif,
} from "./exif.ts";

/** A 1x1 baseline JPEG with no EXIF, the same shape Snapchat ships. */
const BARE_JPEG = binaryStringToBytes(
  Buffer.from(
    "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a" +
      "HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy" +
      "MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIA" +
      "AhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQA" +
      "AAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3" +
      "ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWm" +
      "p6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEA" +
      "AwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSEx" +
      "BhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElK" +
      "U1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3" +
      "uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD3+iii" +
      "gD//2Q==",
    "base64",
  ).toString("latin1"),
);

function loadExif(bytes: Uint8Array) {
  return piexif.load(bytesToBinaryString(bytes)) as Record<
    string,
    Record<number, unknown>
  >;
}

function dmsToDeg(value: unknown): number {
  const [d, m, s] = value as [number, number][];
  return d[0] / d[1] + m[0] / m[1] / 60 + s[0] / s[1] / 3600;
}

test("formats EXIF timestamps in UTC", () => {
  assert.equal(exifDateString(Date.UTC(2019, 3, 2, 9, 15, 30)), "2019:04:02 09:15:30");
  assert.equal(exifDateString(Date.UTC(2023, 11, 31, 23, 59, 59)), "2023:12:31 23:59:59");
});

test("recognises JPEG bytes", () => {
  assert.equal(isJpeg(BARE_JPEG), true);
  assert.equal(isJpeg(new Uint8Array([0x89, 0x50, 0x4e, 0x47])), false);
});

test("writes capture date and GPS into a bare JPEG", () => {
  const out = writeExif(BARE_JPEG, {
    takenAt: Date.UTC(2019, 3, 2, 9, 15, 30),
    lat: 60.16952,
    lon: 24.93545,
    caption: null,
  });

  assert.equal(isJpeg(out), true);
  const exif = loadExif(out);

  assert.equal(exif.Exif[piexif.ExifIFD.DateTimeOriginal], "2019:04:02 09:15:30");
  assert.equal(exif.Exif[piexif.ExifIFD.DateTimeDigitized], "2019:04:02 09:15:30");
  assert.equal(exif["0th"][piexif.ImageIFD.DateTime], "2019:04:02 09:15:30");

  assert.equal(exif.GPS[piexif.GPSIFD.GPSLatitudeRef], "N");
  assert.equal(exif.GPS[piexif.GPSIFD.GPSLongitudeRef], "E");
  assert.ok(Math.abs(dmsToDeg(exif.GPS[piexif.GPSIFD.GPSLatitude]) - 60.16952) < 0.0002);
  assert.ok(Math.abs(dmsToDeg(exif.GPS[piexif.GPSIFD.GPSLongitude]) - 24.93545) < 0.0002);
});

test("uses S/W refs below the equator and west of Greenwich", () => {
  const out = writeExif(BARE_JPEG, {
    takenAt: null,
    lat: -33.86882,
    lon: -70.66927,
    caption: null,
  });
  const exif = loadExif(out);
  assert.equal(exif.GPS[piexif.GPSIFD.GPSLatitudeRef], "S");
  assert.equal(exif.GPS[piexif.GPSIFD.GPSLongitudeRef], "W");
  // Refs carry the sign, so the rationals themselves stay positive.
  assert.ok(dmsToDeg(exif.GPS[piexif.GPSIFD.GPSLatitude]) > 0);
});

test("leaves the file alone when there is nothing to add", () => {
  const out = writeExif(BARE_JPEG, {
    takenAt: null,
    lat: null,
    lon: null,
    caption: null,
  });
  assert.equal(out, BARE_JPEG);
});

test("does not try to write EXIF into a non-JPEG", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const out = writeExif(png, {
    takenAt: Date.UTC(2020, 0, 1),
    lat: 1,
    lon: 2,
    caption: null,
  });
  assert.equal(out, png);
});

test("survives a round trip through binary-string conversion", () => {
  const bytes = new Uint8Array([0, 1, 127, 128, 255, 66]);
  assert.deepEqual(binaryStringToBytes(bytesToBinaryString(bytes)), bytes);
});
