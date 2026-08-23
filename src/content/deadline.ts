/**
 * The deletion timeline, as facts with dates attached.
 *
 * Everything here is written to survive Snapchat moving the date, which they
 * may well do: nothing promises anyone a specific hour their photos vanish,
 * because nothing has been promised. Where sources disagree — the download
 * link window in particular — the range is stated rather than a number picked.
 */

export type TimelineEntry = {
  when: string;
  what: string;
  detail: string;
};

export const TIMELINE: TimelineEntry[] = [
  {
    when: "26 September 2025",
    what: "The 5GB limit arrives",
    detail:
      "Snapchat caps free Memories storage at 5GB and announces paid tiers above it. Nothing is deleted. Accounts already over the line are told their extra Memories will be kept temporarily.",
  },
  {
    when: "The 12 months after",
    what: "The grace period",
    detail:
      "Everything over 5GB stays put, held in what Snapchat describes as temporary storage. This is the window we are in now, and it is the whole reason there is still time.",
  },
  {
    when: "26 September 2026",
    what: "The earliest deletion can begin",
    detail:
      "Twelve months from the rollout. This is the first date on which Snapchat can start removing over-limit Memories — not a moment when everyone's photos disappear at once.",
  },
  {
    when: "After that",
    what: "Rolling, per account",
    detail:
      "Snapchat has not published a schedule. Deletion is expected to work through accounts rather than land on all of them simultaneously, which means your own date could be that week or considerably later. It also means nobody can tell you which.",
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
    cost: "$1.99/month for 100GB",
    gets: "Everything stays exactly where it is. No files to move, no export to wait for.",
    catch:
      "It is rent, not ownership — $24 a year, forever, and your photos stay somewhere you don't control. Snapchat+ at $3.99/month includes 250GB and Platinum at $15.99/month includes 5TB, so check what you're already paying for before adding a plan.",
  },
  {
    name: "Delete down to 5GB",
    cost: "Free",
    gets: "You stay under the cap and nothing gets removed for you.",
    catch:
      "You choose what goes instead of an algorithm choosing for you, which is better, but you are still choosing what goes.",
  },
  {
    name: "Export and keep them",
    cost: "Free from Snapchat",
    gets: "The files are yours, on your machine, in a folder nobody can bill you for.",
    catch:
      "The archive takes days to arrive and lands with the capture dates, GPS and captions stripped out. That last part is the problem this site exists to fix.",
  },
];
