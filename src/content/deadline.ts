/**
 * What Snapchat has actually said about Memories over 5GB, with dates.
 *
 * An earlier version of this file described 26 September 2026 as the date
 * deletion could begin. Snapchat's support page contradicts that directly:
 * "No. Snapchat will not automatically delete your Memories because you do not upgrade." What it describes
 * instead is archiving, from January 2027 at the earliest. Everything below is
 * taken from help.snapchat.com, checked on 13 September 2026, and is written
 * so that it stays true if Snapchat's schedule for any one account slips —
 * nothing here promises anyone a specific day.
 */

export type TimelineEntry = {
  when: string;
  what: string;
  detail: string;
};

export const TIMELINE: TimelineEntry[] = [
  {
    when: "26 September 2025",
    what: "The 5GB limit is announced",
    detail:
      "Snapchat caps free Memories storage at 5GB and launches paid storage plans above it. Accounts already over the line are promised 12 months of temporary storage before anything changes.",
  },
  {
    when: "The 12 months after",
    what: "Temporary storage",
    detail:
      "Everything over 5GB stays exactly where it is and fully usable. The end of this window, in late September 2026, is the date most countdowns point at, but it's when the grace period runs out, not when anything happens to your Memories.",
  },
  {
    when: "January 2027, at the earliest",
    what: "Archiving can begin",
    detail:
      "Memories that are more than a year old and aren't part of your oldest 5GB get archived. Snapchat says nothing is archived before January 2027, and that it will warn you in the app before anything changes on your account. So there is no single day everyone's library flips.",
  },
  {
    when: "Once archived",
    what: "Thumbnails, not files",
    detail:
      "Archived Memories stay on Snapchat and still show up in the app, but only as thumbnails. Opening, editing or sharing one needs a paid storage plan. They aren't deleted: asked whether it deletes Memories if you don't upgrade, Snapchat's support page says \"No. Snapchat will not automatically delete your Memories because you do not upgrade.\"",
  },
];

export type Option = {
  name: string;
  cost: string;
  gets: string;
  catch: string;
};

export const OPTIONS: Option[] = [
  {
    name: "Pay Snapchat",
    cost: "$1.99/month or $20/year for 100GB",
    gets: "Everything stays openable exactly where it is, in the app, resurfacing the way it always has. No files to move, no export to wait for.",
    catch:
      "It is rent, not ownership: you pay for as long as you want to see them, and the terms are Snapchat's to change. Snapchat+ includes 250GB and Platinum includes 5TB, so check what you're already paying for before adding a plan.",
  },
  {
    name: "Do nothing",
    cost: "Free",
    gets: "Nothing is deleted. Everything from the last year, and your oldest 5GB, stays fully usable.",
    catch:
      "Everything in between becomes a thumbnail from January 2027: still there, but locked until you pay. For most long-time users, the in-between is most of the library.",
  },
  {
    name: "Export and keep them",
    cost: "Free from Snapchat",
    gets: "The full-quality files are yours, on your machine, in a folder nobody can lock or bill you for.",
    catch:
      "The archive takes days to arrive and lands with the capture dates, GPS and captions stripped out. That last part is the problem this site exists to fix.",
  },
];
