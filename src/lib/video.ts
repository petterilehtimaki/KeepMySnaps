/**
 * Draws a Snapchat caption back onto the video it belongs to.
 *
 * Photos are easy: composite the overlay PNG and re-save. Video has nowhere to
 * put a picture, so the only way to make the caption part of the file is to
 * decode every frame, draw the overlay on it, and encode it again. That is
 * what this does, in the tab, with WebCodecs — no upload, same as everything
 * else here.
 *
 * The audio track is copied across sample-for-sample rather than re-encoded.
 * It carries no caption, so touching it would cost quality for nothing.
 *
 * Every failure path returns null rather than throwing. A caption that can't
 * be drawn in is written next to the video instead, which is worse than a
 * finished file and much better than a lost one.
 */

import { Muxer, ArrayBufferTarget } from "mp4-muxer";
import type { ISOFile, Matrix, Movie, Sample } from "mp4box";
import { drawCovering } from "./compose";

type Track = {
  id: number;
  codec: string;
  timescale: number;
  samples: Sample[];
  description?: Uint8Array;
};

/** Snapchat's own videos are short; this is a guard against a pathological file. */
const MAX_FRAMES = 3600;

/** mp4box's Endianness.BIG_ENDIAN, without importing the enum at runtime. */
const ENDIAN_BIG = 1;

/** Encoder queue depth. Too deep and a long clip balloons memory. */
const QUEUE_LIMIT = 16;

let mp4boxModule: typeof import("mp4box") | null = null;

async function loadMp4Box() {
  // Loaded on demand: it's only needed by people whose export has captioned
  // videos in it, and it is the largest thing in the bundle.
  mp4boxModule ??= await import("mp4box");
  return mp4boxModule;
}

export function canRewriteVideo(): boolean {
  return (
    typeof VideoDecoder !== "undefined" &&
    typeof VideoEncoder !== "undefined" &&
    typeof OffscreenCanvas !== "undefined"
  );
}

/**
 * Pulls the avcC/hvcC box out of a track so the decoder knows how to read it.
 *
 * mp4box exposes these as parsed boxes rather than bytes, and the decoder
 * wants the bytes, so this writes the box back out and strips its 8-byte
 * header.
 */
function descriptionOf(file: ISOFile, trackId: number): Uint8Array | undefined {
  const trak = file.getTrackById(trackId);
  for (const entry of trak?.mdia?.minf?.stbl?.stsd?.entries ?? []) {
    // These are attached by fourcc at parse time and aren't on the static
    // SampleEntry type, so they have to be reached for by name.
    const holder = entry as unknown as Record<string, { write(s: unknown): void } | undefined>;
    const box = holder.avcC ?? holder.hvcC ?? holder.vpcC ?? holder.av1C;
    if (!box) continue;
    const stream = new mp4boxModule!.DataStream(undefined, 0, ENDIAN_BIG);
    box.write(stream);
    const written = (stream as unknown as { buffer: ArrayBuffer }).buffer;
    // The first eight bytes are the box's own size and fourcc, which the
    // decoder doesn't want.
    return new Uint8Array(written.slice(8));
  }
  return undefined;
}

/** Reads an MP4 into its tracks and their samples. */
async function demux(bytes: Uint8Array): Promise<{
  info: Movie;
  video: Track | null;
  audio: Track | null;
} | null> {
  const { createFile } = await loadMp4Box();
  const file = createFile();

  return new Promise((resolve) => {
    const collected = new Map<number, Sample[]>();
    let info: Movie | null = null;

    file.onError = () => resolve(null);

    file.onReady = (i: Movie) => {
      info = i;
      for (const track of [...i.videoTracks, ...i.audioTracks]) {
        collected.set(track.id, []);
        file.setExtractionOptions(track.id, undefined, { nbSamples: Infinity });
      }
      file.start();
    };

    file.onSamples = (id: number, _user: unknown, samples: Sample[]) => {
      collected.get(id)?.push(...samples);
    };

    // `flush` runs the callbacks above synchronously, so by the time it
    // returns everything has arrived — or onReady never fired and this isn't
    // a file we can read.
    const copy = bytes.slice().buffer;
    file.appendBuffer(mp4boxModule!.MP4BoxBuffer.fromArrayBuffer(copy, 0));
    file.flush();

    // `info` is only ever assigned inside onReady, which the compiler can't
    // see happening, so it narrows the variable to null and everything after
    // to never. The cast restores what's actually true by this line.
    const movie = info as Movie | null;
    if (!movie) return resolve(null);

    const build = (id: number, codec: string, timescale: number): Track => ({
      id,
      codec,
      timescale,
      samples: collected.get(id) ?? [],
      description: descriptionOf(file, id),
    });

    const v = movie.videoTracks[0];
    const a = movie.audioTracks[0];
    resolve({
      info: movie,
      video: v ? build(v.id, v.codec, v.timescale) : null,
      audio: a ? build(a.id, a.codec, a.timescale) : null,
    });
  });
}

/**
 * The clockwise rotation a player is meant to apply, from the track matrix.
 *
 * Snapchat records portrait and stores the frames landscape with a -90 flag,
 * so a 540x960 snap arrives as a 960x540 track. Decoded frames come out
 * unrotated: draw them as-is and the video is on its side, and an overlay
 * authored portrait gets stretched across a landscape frame.
 *
 * The matrix is 16.16 fixed point, so the top-left pair is enough to tell the
 * four right-angle cases apart.
 */
function rotationOf(matrix: Matrix | undefined): 0 | 90 | 180 | 270 {
  if (!matrix || matrix.length < 4) return 0;
  const a = Number(matrix[0]) / 65536;
  const b = Number(matrix[1]) / 65536;
  if (Math.round(a) === 0 && Math.round(b) === 1) return 90;
  if (Math.round(a) === -1 && Math.round(b) === 0) return 180;
  if (Math.round(a) === 0 && Math.round(b) === -1) return 270;
  return 0;
}

/** Frames per second, from the track's own duration rather than guessed. */
function sourceFps(video: Track, track: { duration: number; timescale: number }): number {
  const seconds = track.duration / track.timescale;
  return seconds > 0 ? video.samples.length / seconds : 30;
}

/** Microseconds, which is the only unit WebCodecs speaks. */
const micros = (value: number, timescale: number) =>
  Math.round((value / timescale) * 1_000_000);

/**
 * Returns a new MP4 with the overlay drawn onto every frame, or null if this
 * browser or this file can't be handled.
 */
export async function burnOverlayIntoVideo(
  videoBytes: Uint8Array,
  overlay: ImageBitmap,
  signal?: AbortSignal,
): Promise<Uint8Array | null> {
  if (!canRewriteVideo()) return null;

  const parsed = await demux(videoBytes).catch(() => null);
  if (!parsed?.video || !parsed.video.samples.length) return null;
  const { video, audio } = parsed;

  const track = parsed.info.videoTracks[0];
  const rotation = rotationOf(track.matrix);
  const upright = rotation === 90 || rotation === 270;

  // Output in the orientation the video is meant to be seen in, so the file
  // needs no rotation flag and the overlay lines up with what was on screen.
  // Encoders reject odd dimensions, and Snapchat has shipped both.
  const even = (n: number) => Math.floor(n / 2) * 2;
  const width = even(upright ? track.track_height : track.track_width);
  const height = even(upright ? track.track_width : track.track_height);
  if (!width || !height || video.samples.length > MAX_FRAMES) return null;

  // Only claim an audio track when the source actually described one; the
  // muxer rejects samples for a track it wasn't told about.
  const audioInfo = audio?.samples.length
    ? parsed.info.audioTracks[0]?.audio
    : undefined;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: "avc", width, height },
    ...(audioInfo
      ? {
          audio: {
            codec: "aac" as const,
            numberOfChannels: audioInfo.channel_count,
            sampleRate: audioInfo.sample_rate,
          },
        }
      : {}),
    fastStart: "in-memory",
    // Snapchat's clips don't start at zero — an edit list or a trimmed
    // recording leaves the first sample several seconds in — and the muxer
    // refuses a track whose first chunk isn't at the origin. This shifts the
    // whole track back instead of rejecting it.
    firstTimestampBehavior: "offset",
  });

  let failed = false;
  // Snapchat clips are constant frame rate, so one duration covers the file.
  const frameDuration = Math.max(
    1,
    Math.round(1_000_000 / Math.max(1, sourceFps(video, track))),
  );

  const encoder = new VideoEncoder({
    output: (chunk, meta) => {
      // The muxer rejects a non-finite duration, and an EncodedVideoChunk's
      // duration is null whenever the frame it came from had none. Passing
      // the raw chunk with a duration of our own keeps that from throwing
      // inside a WebCodecs callback, where it would otherwise be swallowed
      // and only surface later as a missing decoder config.
      try {
        const data = new Uint8Array(chunk.byteLength);
        chunk.copyTo(data);
        muxer.addVideoChunkRaw(
          data,
          chunk.type,
          chunk.timestamp,
          Number.isFinite(chunk.duration) ? chunk.duration! : frameDuration,
          meta,
        );
      } catch {
        failed = true;
      }
    },
    error: () => {
      failed = true;
    },
  });

  // Main profile at level 4 covers 1080p portrait, which is what Snapchat
  // records. Baseline is rejected outright at these dimensions.
  const config: VideoEncoderConfig = {
    codec: "avc1.4d0028",
    width,
    height,
    bitrate: Math.min(8_000_000, Math.max(2_000_000, width * height * 4)),
    framerate: Math.max(1, Math.round(sourceFps(video, track))),
  };
  if (!(await VideoEncoder.isConfigSupported(config)).supported) return null;
  encoder.configure(config);

  const decoder = new VideoDecoder({
    output: (frame) => {
      try {
        // Rotate about the centre so the frame lands upright, then put the
        // overlay on top in that same orientation.
        if (rotation) {
          ctx.save();
          ctx.translate(width / 2, height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(
            frame,
            -track.track_width / 2,
            -track.track_height / 2,
            track.track_width,
            track.track_height,
          );
          ctx.restore();
        } else {
          ctx.drawImage(frame, 0, 0, width, height);
        }
        drawCovering(ctx, overlay, width, height);
        const composited = new VideoFrame(canvas, {
          timestamp: frame.timestamp,
          duration: frame.duration ?? undefined,
        });
        encoder.encode(composited);
        composited.close();
      } catch {
        failed = true;
      } finally {
        frame.close();
      }
    },
    error: () => {
      failed = true;
    },
  });

  decoder.configure({
    codec: video.codec,
    codedWidth: track.track_width,
    codedHeight: track.track_height,
    description: video.description,
  });

  try {
    for (const sample of video.samples) {
      if (signal?.aborted || failed) break;
      decoder.decode(
        new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: micros(sample.cts, sample.timescale),
          duration: micros(sample.duration, sample.timescale),
          data: sample.data!,
        }),
      );
      // Let the encoder drain rather than queueing a whole clip at once.
      while (encoder.encodeQueueSize > QUEUE_LIMIT && !failed) {
        await new Promise((r) => setTimeout(r, 0));
      }
    }

    if (failed || signal?.aborted) return null;

    await decoder.flush();
    await encoder.flush();

    // Audio is copied, not re-encoded: it carries no caption, so re-encoding
    // it would cost quality and time for no change.
    if (audioInfo && audio?.samples.length) {
      for (const sample of audio.samples) {
        if (!sample.data) continue;
        muxer.addAudioChunkRaw(
          sample.data,
          sample.is_sync ? "key" : "delta",
          micros(sample.cts, sample.timescale),
          micros(sample.duration, sample.timescale),
        );
      }
    }

    muxer.finalize();
    const { buffer } = muxer.target as ArrayBufferTarget;
    return buffer ? new Uint8Array(buffer) : null;
  } catch {
    return null;
  } finally {
    for (const c of [decoder, encoder]) {
      try {
        if (c.state !== "closed") c.close();
      } catch {
        /* already torn down */
      }
    }
  }
}
