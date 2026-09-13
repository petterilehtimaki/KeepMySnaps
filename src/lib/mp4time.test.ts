import { test } from "node:test";
import assert from "node:assert/strict";
import { stampMp4CreationTime } from "./mp4time.ts";

const EPOCH_1904 = 2_082_844_800;
const TAKEN = Date.UTC(2018, 0, 23, 7, 56, 27);
const TAKEN_SECONDS = Math.floor(TAKEN / 1000) + EPOCH_1904;
/** What mp4-muxer would have written: "now", in the MP4 epoch. */
const MUXER_NOW = 3_999_999_999;

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

function box(type: string, body: Uint8Array): Uint8Array {
  const out = new Uint8Array(8 + body.length);
  new DataView(out.buffer).setUint32(0, out.length);
  out.set(new TextEncoder().encode(type), 4);
  out.set(body, 8);
  return out;
}

function header(version: 0 | 1): Uint8Array {
  const body = new Uint8Array(100);
  body[0] = version;
  const v = new DataView(body.buffer);
  if (version === 0) {
    v.setUint32(4, MUXER_NOW);
    v.setUint32(8, MUXER_NOW);
  } else {
    v.setBigUint64(4, BigInt(MUXER_NOW));
    v.setBigUint64(12, BigInt(MUXER_NOW));
  }
  return body;
}

function timesAt(file: Uint8Array, type: string): [number, number] {
  const needle = new TextEncoder().encode(type);
  for (let i = 0; i + 4 <= file.length; i++) {
    if (needle.every((b, j) => file[i + j] === b)) {
      const body = i + 4;
      const v = new DataView(file.buffer, file.byteOffset);
      return file[body] === 1
        ? [Number(v.getBigUint64(body + 4)), Number(v.getBigUint64(body + 12))]
        : [v.getUint32(body + 4), v.getUint32(body + 8)];
    }
  }
  throw new Error(`no ${type} box`);
}

/** ftyp, then moov → mvhd + trak → tkhd + mdia → mdhd, then an mdat. */
function sampleFile(mdatPayload: Uint8Array) {
  return concat(
    box("ftyp", new Uint8Array(12)),
    box(
      "moov",
      concat(
        box("mvhd", header(0)),
        box("trak", concat(box("tkhd", header(0)), box("mdia", box("mdhd", header(1))))),
      ),
    ),
    box("mdat", mdatPayload),
  );
}

test("puts the real capture time into every movie, track and media header", () => {
  const file = sampleFile(new Uint8Array(64));
  assert.equal(stampMp4CreationTime(file, TAKEN), 3);
  for (const type of ["mvhd", "tkhd", "mdhd"]) {
    assert.deepEqual(timesAt(file, type), [TAKEN_SECONDS, TAKEN_SECONDS], type);
  }
});

test("leaves frame data alone even when it happens to contain 'mvhd'", () => {
  // A coincidental fourcc inside compressed video is exactly what a byte scan
  // would stamp over — and writing into a frame corrupts the video.
  const payload = concat(
    new TextEncoder().encode("xxxxmvhd"),
    new Uint8Array([0, 0, 0, 0, 0xde, 0xad, 0xbe, 0xef, 0xca, 0xfe]),
  );
  const file = sampleFile(payload);
  const mdatStart = file.length - payload.length;
  const before = file.slice(mdatStart);

  stampMp4CreationTime(file, TAKEN);

  assert.deepEqual(file.slice(mdatStart), before);
});

test("touches nothing in a file it can't make sense of", () => {
  const junk = new Uint8Array(40).fill(7);
  const copy = junk.slice();
  assert.equal(stampMp4CreationTime(junk, TAKEN), 0);
  assert.deepEqual(junk, copy);

  // A box claiming to be longer than the file.
  const lying = sampleFile(new Uint8Array(8));
  new DataView(lying.buffer).setUint32(20, 0xffffff);
  assert.doesNotThrow(() => stampMp4CreationTime(lying, TAKEN));
});

test("ignores a timestamp that isn't one", () => {
  const file = sampleFile(new Uint8Array(8));
  assert.equal(stampMp4CreationTime(file, Number.NaN), 0);
  assert.deepEqual(timesAt(file, "mvhd"), [MUXER_NOW, MUXER_NOW]);
});
