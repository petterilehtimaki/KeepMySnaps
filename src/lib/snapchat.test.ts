import { test } from "node:test";
import assert from "node:assert/strict";
import {
  groupMediaFiles,
  matchEntriesToMedia,
  parseLocation,
  parseMemoriesHistory,
  parseSnapDate,
} from "./snapchat.ts";

test("parses Snapchat's UTC date format", () => {
  assert.equal(
    parseSnapDate("2023-06-12 18:04:22 UTC"),
    Date.UTC(2023, 5, 12, 18, 4, 22),
  );
  assert.equal(parseSnapDate("nonsense"), null);
  assert.equal(parseSnapDate(null), null);
});

test("parses the location string and rejects Null Island", () => {
  assert.deepEqual(
    parseLocation("Latitude, Longitude: 60.16952, 24.93545"),
    [60.16952, 24.93545],
  );
  assert.deepEqual(
    parseLocation("Latitude, Longitude: -33.86882, 151.20930"),
    [-33.86882, 151.2093],
  );
  assert.equal(parseLocation("Latitude, Longitude: 0.0, 0.0"), null);
  assert.equal(parseLocation("Latitude, Longitude: 200.0, 12.0"), null);
  assert.equal(parseLocation(""), null);
});

test("reads the memories list under any of its known key names", () => {
  const canonical = parseMemoriesHistory({
    "Saved Media": [
      {
        Date: "2021-01-02 03:04:05 UTC",
        "Media Type": "Image",
        Location: "Latitude, Longitude: 1.5, 2.5",
      },
    ],
  });
  assert.equal(canonical.length, 1);
  assert.equal(canonical[0].mediaType, "image");
  assert.equal(canonical[0].lat, 1.5);

  // An older export shape, plus a bare array.
  assert.equal(parseMemoriesHistory({ Memories: [{ Date: "x" }] }).length, 1);
  assert.equal(parseMemoriesHistory([{ Date: "x" }]).length, 1);
  assert.equal(parseMemoriesHistory({ nothing: true }).length, 0);
  assert.equal(parseMemoriesHistory(null).length, 0);
});

test("pairs base files with their overlays and drops thumbnails", () => {
  const groups = groupMediaFiles([
    "mydata/memories/2019-04-02_AAAA-main.jpg",
    "mydata/memories/2019-04-02_AAAA-overlay.png",
    "mydata/memories/2019-04-02_AAAA-thumbnail.jpg",
    "mydata/memories/2020-05-06_BBBB-main.mp4",
    "mydata/json/memories_history.json",
    "mydata/memories/orphan-overlay.png",
  ]);

  assert.equal(groups.length, 2);
  assert.equal(groups[0].base, "mydata/memories/2019-04-02_AAAA-main.jpg");
  assert.equal(groups[0].overlay, "mydata/memories/2019-04-02_AAAA-overlay.png");
  assert.equal(groups[0].filenameDate, "2019-04-02");
  assert.equal(groups[1].overlay, null);
});

test("matches on media ID before falling back to dates", () => {
  const entries = parseMemoriesHistory({
    "Saved Media": [
      {
        Date: "2020-05-06 10:00:00 UTC",
        "Media Type": "Video",
        "Media ID": "BBBB2222",
      },
      {
        Date: "2019-04-02 09:15:30 UTC",
        "Media Type": "Image",
        "Media ID": "AAAA1111",
      },
    ],
  });

  const groups = groupMediaFiles([
    "m/2019-04-02_AAAA1111-main.jpg",
    "m/2020-05-06_BBBB2222-main.mp4",
  ]);

  const pairs = matchEntriesToMedia(entries, groups);
  assert.equal(pairs.length, 2);
  assert.equal(pairs[0].entry?.mediaId, "AAAA1111");
  assert.equal(pairs[1].entry?.mediaId, "BBBB2222");
});

test("falls back to the filename date when there is no media ID", () => {
  const entries = parseMemoriesHistory({
    "Saved Media": [
      { Date: "2019-04-02 09:15:30 UTC", "Media Type": "Image" },
      { Date: "2021-08-08 12:00:00 UTC", "Media Type": "Image" },
    ],
  });

  const groups = groupMediaFiles([
    "m/2021-08-08_ZZZZ-main.jpg",
    "m/2019-04-02_YYYY-main.jpg",
  ]);

  const pairs = matchEntriesToMedia(entries, groups);
  const byBase = Object.fromEntries(
    pairs.map((p) => [p.group.base, p.entry?.takenAt]),
  );
  assert.equal(byBase["m/2019-04-02_YYYY-main.jpg"], Date.UTC(2019, 3, 2, 9, 15, 30));
  assert.equal(byBase["m/2021-08-08_ZZZZ-main.jpg"], Date.UTC(2021, 7, 8, 12, 0, 0));
});

test("never assigns one entry to two files", () => {
  const entries = parseMemoriesHistory({
    "Saved Media": [
      { Date: "2019-04-02 09:15:30 UTC", "Media ID": "AAAA1111" },
    ],
  });
  const groups = groupMediaFiles([
    "m/2019-04-02_AAAA1111-main.jpg",
    "m/2019-04-02_AAAA1111x-main.jpg",
  ]);

  const pairs = matchEntriesToMedia(entries, groups);
  const matched = pairs.filter((p) => p.entry !== null);
  assert.equal(matched.length, 1);
});

test("a photo never takes a video's timestamp on a busy day", () => {
  // Real exports carry no Media ID, so the day is all there is to go on — but
  // the JSON says Image or Video, and so does the extension.
  const entries = parseMemoriesHistory({
    "Saved Media": [
      { Date: "2019-12-25 22:00:00 UTC", "Media Type": "Video" },
      { Date: "2019-12-25 09:00:00 UTC", "Media Type": "Image" },
    ],
  });
  const groups = groupMediaFiles([
    // Alphabetically the jpg comes first, which is how Snapchat sorts the ZIP
    // and the opposite of the order the JSON lists them in.
    "m/2019-12-25_498F6BA1-main.jpg",
    "m/2019-12-25_6B4C3410-main.mp4",
  ]);
  const pairs = matchEntriesToMedia(entries, groups);

  const jpg = pairs.find((p) => p.group.base.endsWith(".jpg"))!;
  const mp4 = pairs.find((p) => p.group.base.endsWith(".mp4"))!;
  assert.equal(jpg.entry?.mediaType, "image");
  assert.equal(mp4.entry?.mediaType, "video");
});

test("withholds a coordinate it can't pin to one photo", () => {
  // Two photos, same day, kilometres apart. Which is which is unknowable, so
  // neither should end up carrying the other's location.
  const entries = parseMemoriesHistory({
    "Saved Media": [
      {
        Date: "2021-10-09 20:00:00 UTC",
        "Media Type": "Image",
        Location: "Latitude, Longitude: 60.16952, 24.93545",
      },
      {
        Date: "2021-10-09 10:00:00 UTC",
        "Media Type": "Image",
        Location: "Latitude, Longitude: 60.45000, 24.10000",
      },
    ],
  });
  const groups = groupMediaFiles([
    "m/2021-10-09_AAAA1111-main.jpg",
    "m/2021-10-09_BBBB2222-main.jpg",
  ]);
  const pairs = matchEntriesToMedia(entries, groups);

  assert.equal(pairs.length, 2);
  assert.ok(pairs.every((p) => p.entry));
  assert.ok(
    pairs.every((p) => p.location === null),
    "kilometres apart has no meaningful centre, so neither gets a pin",
  );
});

test("keeps the coordinate when the day's memories share a place", () => {
  const entries = parseMemoriesHistory({
    "Saved Media": [
      {
        Date: "2021-10-09 20:00:00 UTC",
        "Media Type": "Image",
        Location: "Latitude, Longitude: 60.16952, 24.93545",
      },
      {
        Date: "2021-10-09 10:00:00 UTC",
        "Media Type": "Image",
        Location: "Latitude, Longitude: 60.17100, 24.93800",
      },
    ],
  });
  const groups = groupMediaFiles([
    "m/2021-10-09_AAAA1111-main.jpg",
    "m/2021-10-09_BBBB2222-main.jpg",
  ]);
  const pairs = matchEntriesToMedia(entries, groups);

  assert.ok(
    pairs.every((p) => p.location && !p.location.exact),
    "close enough to share the centre, and flagged as an approximation",
  );
  // The centre of 60.16952 and 60.17100.
  assert.ok(Math.abs(pairs[0].location!.lat - 60.17026) < 0.0001);
});
