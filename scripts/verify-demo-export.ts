/**
 * Runs a real ZIP through the real matching pipeline and prints what came out.
 *
 * `npm test` builds its inputs in memory and never opens an archive, so this
 * is the only thing that checks the three passes in `matchEntriesToMedia`
 * against a file on disk. Point it at the demo export, or at your own — the
 * script only reads names and JSON, and prints counts rather than contents.
 *
 *   python3 scripts/make-demo-export.py
 *   node --experimental-strip-types scripts/verify-demo-export.ts ~/Desktop/keepmysnaps-demo-export.zip
 *
 * Exits non-zero if anything went unmatched that shouldn't have, so it is
 * usable as a smoke test before a release.
 */

import { readFileSync } from "node:fs";
import JSZip from "jszip";
import {
  groupMediaFiles,
  matchEntriesToMedia,
  parseMemoriesHistory,
} from "../src/lib/snapchat.ts";

const zipPath = process.argv[2];
if (!zipPath) {
  console.error("usage: verify-demo-export.ts <export.zip>");
  process.exit(2);
}

const zip = await JSZip.loadAsync(readFileSync(zipPath));
const paths = Object.keys(zip.files).filter((p) => !zip.files[p].dir);

const jsonPath = paths.find((p) => /memories_history\.json$/i.test(p));
if (!jsonPath) {
  console.error("No memories_history.json in this archive.");
  console.error("Snapchat only includes it when 'Export JSON Files' is ticked.");
  process.exit(1);
}

const entries = parseMemoriesHistory(
  JSON.parse(await zip.files[jsonPath].async("string")),
);
const groups = groupMediaFiles(paths);
const pairs = matchEntriesToMedia(entries, groups);

const matched = pairs.filter((p) => p.entry);
const dated = matched.filter((p) => p.entry!.takenAt !== null);
const located = matched.filter((p) => p.entry!.lat !== null);
const captioned = matched.filter((p) => p.entry!.caption);
const years = [
  ...new Set(dated.map((p) => new Date(p.entry!.takenAt!).getUTCFullYear())),
].sort();

const row = (label: string, value: string | number) =>
  console.log(`  ${label.padEnd(18)}${value}`);

console.log(`\n${zipPath}\n`);
row("files", paths.length);
row("json entries", entries.length);
row("media groups", `${groups.length}  (thumbnails and lone overlays dropped)`);
row("with overlay", groups.filter((g) => g.overlay).length);
row("matched", `${matched.length} / ${groups.length}`);
row("  with a date", dated.length);
row("  with GPS", located.length);
row("  with a caption", captioned.length);
row("years covered", years.length ? `${years[0]}–${years.at(-1)} (${years.length})` : "none");
row("files unmatched", pairs.length - matched.length);
row("entries unused", entries.length - matched.length);

// Every file the demo generator writes has a JSON entry except the deliberate
// orphan, so anything beyond that means the matcher regressed.
const unmatched = pairs.length - matched.length;
if (unmatched > 1) {
  console.error(`\n  ${unmatched} files went unmatched. Expected at most 1.\n`);
  process.exit(1);
}
console.log("\n  Matching looks right.\n");
