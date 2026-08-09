/**
 * The three steps, in two lengths. `short` is what the homepage section shows;
 * `long` is the expanded version on /how-it-works. Both come from here so they
 * can't drift apart.
 */
export type Step = {
  n: string;
  title: string;
  short: string;
  long: string[];
};

export const STEPS: Step[] = [
  {
    n: "01",
    title: "Ask Snapchat for your data",
    short:
      "In the app: Settings → My Data → Submit Request. Tick “Include your Memories”. They email you a download link, eventually. This part is on them.",
    long: [
      "Open Snapchat, tap your profile, then the gear icon for Settings. Scroll down to “My Data” and sign in again when it asks, which it will.",
      "Tick “Include your Memories”. This is the one that matters. Leave it unticked and Snapchat sends you a tidy archive of JSON files describing your account and not one single photo. Plenty of people have made that trip twice.",
      "Leave the date range alone unless you specifically want a slice of it. The default covers everything.",
      "The export goes to the email address on the account, not to your phone. It arrives somewhere between twenty minutes and several days later — Snapchat builds these at their own pace and there is no queue position to check.",
      "When the email turns up, download it promptly. The link expires after about a week and then you get to request the whole thing again. If your account is large, Snapchat splits the export across several ZIP files. You want all of them.",
    ],
  },
  {
    n: "02",
    title: "Drop the ZIP in below",
    short:
      "Don't unzip it. Drop it here exactly as it arrived. It's read in the browser tab you're already looking at — nothing is sent anywhere.",
    long: [
      "Don't unzip it first. The dates and coordinates live in a JSON file that has to be read alongside the photos, and pulling the archive apart by hand is the quickest way to separate them.",
      "If Snapchat split your export into several ZIPs, drop all of them in together. They get treated as one export.",
      "There is no upload step. The archive is opened, rewritten and repacked inside this browser tab, on your own machine. No account, no server, nothing sent anywhere — you can disconnect from the internet once the page has loaded and it will still work.",
      "Big exports are happier on a desktop browser with the tab in the foreground. Browsers get uncomfortable somewhere past a few gigabytes at once, so if it stalls, feed it one ZIP at a time.",
      "The progress bar is doing real work, not pretending. Closing the tab stops it, because the tab is where the work is happening.",
    ],
  },
  {
    n: "03",
    title: "Get your memories back, dated",
    short:
      "Captions flattened onto the photos, real capture dates and GPS written into each file, all of it repacked into one ZIP you can put wherever you like.",
    long: [
      "Every photo gets its real capture time written into EXIF — DateTimeOriginal, DateTimeDigitized and DateTime — plus GPS coordinates where Snapchat recorded them. That's the metadata Google Photos, Apple Photos, Immich and everything else read to decide where a picture belongs in your timeline.",
      "Captions and stickers ship as separate transparent PNGs, which is why exported photos look bare. Each overlay is composited back onto its photo and re-encoded, so what comes out looks like what you posted.",
      "Videos pass through untouched. MP4 has nowhere to put EXIF, so their dates ride on the filename and the archive's own timestamp, which is what your filesystem picks up when you extract it.",
      "Files come out named by capture time — 2019-04-02_09-15-30.jpg — in UTC, because UTC is the only thing Snapchat records. Alongside them you get keepmysnaps-index.csv listing every date and coordinate as plain text, in case you'd rather do something else with it.",
      "The result is one ordinary ZIP. Put it in Drive, Dropbox, your camera roll, or an external drive in a drawer. It is not our business where it goes, which is rather the point.",
    ],
  },
];
