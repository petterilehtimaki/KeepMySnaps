/**
 * Runs real ZIPs through the real matching pipeline and scores the result.
 *
 * Counting how many files came out with *a* date proves nothing — the
 * positional fallback will hand every file some date. What matters is how many
 * got the *right* one, and the only way to know that is to generate the export
 * yourself and keep the answers. `make-demo-export.py` writes a `.truth.json`
 * next to the archives for exactly this.
 *
 * Pass every part, the way a person would drop them all on the page at once:
 *
 *   python3 scripts/make-demo-export.py
 *   node --experimental-strip-types scripts/verify-demo-export.ts ~/Desktop/mydata~*.zip
 *
 * Without a truth file it degrades to counting, and says so.
 */

import { existsSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import JSZip from "jszip";
import {
  groupMediaFiles,
  matchEntriesToMedia,
  parseMemoriesHistory,
} from "../src/lib/snapchat.ts";

const zipPaths = process.argv.slice(2).filter((a) => a.endsWith(".zip"));
if (!zipPaths.length) {
  console.error("usage: verify-demo-export.ts <export.zip> [more.zip ...]");
  process.exit(2);
}

// Mirror what the app does: read every ZIP, pool the paths, find the JSON
// wherever it happens to live. Snapchat only puts it in the first part.
const paths: string[] = [];
let historyJson: unknown = null;

for (const zipPath of zipPaths) {
  const zip = await JSZip.loadAsync(readFileSync(zipPath));
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir) continue;
    paths.push(path);
    if (/memories_history\.json$/i.test(path)) {
      historyJson = JSON.parse(await entry.async("string"));
    }
  }
}

if (!historyJson) {
  console.error("\nNo memories_history.json in any of those ZIPs.");
  console.error("Snapchat puts it in the first part only, and only when");
  console.error("'Export JSON Files' was ticked. Pass every part.\n");
  process.exit(1);
}

const entries = parseMemoriesHistory(historyJson);
const groups = groupMediaFiles(paths);
const pairs = matchEntriesToMedia(entries, groups);
const matched = pairs.filter((p) => p.entry);

const row = (label: string, value: string | number) =>
  console.log(`  ${label.padEnd(22)}${value}`);

console.log(`\n${zipPaths.length} ZIP${zipPaths.length === 1 ? "" : "s"}, ${paths.length} files\n`);
row("json entries", entries.length);
row("  with an id", entries.filter((e) => e.mediaId).length);
row("media groups", groups.length);
row("with overlay", groups.filter((g) => g.overlay).length);
row("got some date", matched.filter((p) => p.entry!.takenAt !== null).length);

// ---------------------------------------------------------------- scoring
const truthPath = [...new Set(zipPaths.map(dirname))]
  .flatMap((dir) => [join(dir, "mydata~1786724342212.truth.json")])
  .find(existsSync);

if (!truthPath) {
  console.log("\n  No truth file alongside these ZIPs, so the numbers above are");
  console.log("  counts, not accuracy. Generate an export with");
  console.log("  make-demo-export.py to score the matcher properly.\n");
  process.exit(0);
}

type Truth = { date: string; lat: number | null; lon: number | null };
const truth: Record<string, Truth> = JSON.parse(readFileSync(truthPath, "utf8"));

let exactTime = 0;
let rightDay = 0;
let wrongDay = 0;
let rightPlace = 0;
let wrongPlace = 0;
let heldBack = 0;
let scored = 0;

for (const pair of pairs) {
  const answer = truth[basename(pair.group.base)];
  if (!answer || !pair.entry) continue;
  scored++;

  const got = pair.entry.takenAt;
  const want = Date.parse(answer.date);
  if (got === want) exactTime++;
  else if (got !== null && new Date(got).toISOString().slice(0, 10) === answer.date.slice(0, 10)) rightDay++;
  else wrongDay++;

  if (answer.lat === null) continue;
  // Score what the file ends up carrying, not what the JSON said. A pairing
  // that isn't location-certain writes no coordinate at all, and that counts
  // as held back rather than wrong — an empty GPS field is honest.
  if (!pair.location) {
    heldBack++;
    continue;
  }
  // An approximate pin counts as correct while it stays inside the ceiling
  // the matcher promised; past that it is simply wrong.
  const off = Math.max(
    Math.abs(pair.location.lat - answer.lat),
    Math.abs(pair.location.lon - answer.lon!),
  );
  if (off <= 0.05) rightPlace++;
  else wrongPlace++;
}

const pct = (n: number) => `${((n / Math.max(1, scored)) * 100).toFixed(0)}%`;

console.log(`\n  scored against ground truth (${scored} files)\n`);
row("exact timestamp", `${exactTime}  ${pct(exactTime)}`);
row("right day, wrong time", `${rightDay}  ${pct(rightDay)}`);
row("wrong day", `${wrongDay}  ${pct(wrongDay)}`);
row("GPS within 5.5km", rightPlace);
row("GPS held back", `${heldBack}  (couldn't tell which photo)`);
row("GPS further off", wrongPlace);

const dayAccurate = exactTime + rightDay;
console.log();
console.log(`  ${dayAccurate} of ${scored} land on the right calendar day.`);
if (wrongDay === 0 && wrongPlace === 0) {
  console.log("  No file carries another memory's coordinates.");
  if (heldBack) {
    console.log(`  ${heldBack} were left without a location rather than guessed at.`);
  }
  console.log();
} else {
  if (wrongPlace) console.log(`  ${wrongPlace} carry another memory's coordinates.`);
  if (wrongDay) console.log(`  ${wrongDay} landed on the wrong day.`);
  console.log();
  process.exit(1);
}
