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
      "In the app: Settings → Privacy Controls → My Data. Switch on “Export your Memories” and “Export JSON Files”. They email you a download link, eventually. This part is on them.",
    long: [
      "This is the longest step and the one nobody can hurry, because Snapchat builds the archive at its own pace and emails it when it's done. Your side of it takes about two minutes.",
      "Every tap is below. Snapchat has rearranged this flow more than once, so these are drawn from the version that's live now rather than copied from an older guide — if what's on your screen doesn't match, look for the wording rather than the position.",
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
    ],
  },
  {
    n: "03",
    title: "Get your memories back, dated",
    short:
      "Captions drawn back onto photos and into videos, real capture dates and locations written into each file, all of it repacked into one ZIP you can put wherever you like.",
    long: [
      "Every photo gets its real capture time written into EXIF — DateTimeOriginal, DateTimeDigitized and DateTime — which is the metadata Google Photos, Apple Photos, Immich and everything else read to decide where a picture belongs in your timeline. Coordinates go in too, where Snapchat's export makes it possible to tell which memory they belong to; where it doesn't, the field is left empty rather than filled with a guess. There is more on that below.",
      "Captions, stickers, drawings and location filters all ship as one transparent PNG per memory, which is why exported photos look bare. That layer is composited back on at its own proportions — the overlay is the phone's screen, not the photo, so stretching it to fit would squash the text — and the result re-encoded. What comes out looks like what you posted.",
      "Videos get the same treatment, the hard way. There is nowhere in an MP4 to put a picture, so the overlay has to become part of the frames: the video is decoded, the caption drawn onto every frame, and the whole thing encoded again — on your machine, with the audio copied across untouched. Dates ride on the filename and the archive's own timestamp instead of EXIF, which is what your filesystem picks up when you extract it.",
      "If your browser has no video encoder, nothing is thrown away: those captions land in a captions folder named to match their video. The summary at the end says which happened, and how many of each.",
      "Files come out named by capture time — 2019-04-02_09-15-30.jpg — in UTC, because UTC is the only thing Snapchat records. Alongside them you get keepmysnaps-index.csv listing every date and coordinate as plain text, in case you'd rather do something else with it.",
      "The result is one ordinary ZIP. Put it in Drive, Dropbox, your camera roll, or an external drive in a drawer. It is not our business where it goes, which is rather the point.",
    ],
  },
];
