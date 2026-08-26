/**
 * The waiting phase, which nobody else has written about.
 *
 * Snapchat builds the archive on its own schedule and emails a link when it's
 * done. That gap — a day, sometimes several — is when people go looking for
 * answers, and it's the only part of this where being early matters more than
 * being clever. Everything here is hedged where the facts are hedged: Snapchat
 * documents almost none of it, and the numbers that circulate are other
 * people's experience rather than a published SLA.
 */

export type Stage = {
  when: string;
  what: string;
  detail: string;
};

export const STAGES: Stage[] = [
  {
    when: "Minute one",
    what: "You submit the request",
    detail:
      "Settings → Privacy Controls → My Data. Tick “Export your Memories” and “Export JSON Files”, choose All Time, submit. Your side is done and takes about two minutes.",
  },
  {
    when: "A few hours to a couple of days",
    what: "Snapchat builds the archive",
    detail:
      "Nothing happens that you can see, and there is no progress bar to check. Small accounts often land the same day. A library of several thousand memories usually takes longer, and everything takes longer the closer this gets to the deadline, because everyone is asking at once.",
  },
  {
    when: "The email",
    what: "A download link arrives",
    detail:
      "It comes from Snapchat to the address on your account. Check spam — it is a bulk send with a link in it, which is exactly what spam filters are built to catch.",
  },
  {
    when: "Within a few days of that",
    what: "The link expires",
    detail:
      "Reports of the window range from around 72 hours to seven days, and Snapchat doesn't document it clearly. Treat it as short: download the day the email lands, not the weekend after. Miss it and you start the wait again.",
  },
];

export type Snag = {
  q: string;
  a: string;
};

export const SNAGS: Snag[] = [
  {
    q: "It's been three days and nothing has arrived",
    a: "Check spam first, then check the email address on your Snapchat account is one you still read. If both are fine, request it again — a second request doesn't cancel the first, and whichever arrives first is the one you use.",
  },
  {
    q: "The archive came but there are no photos in it",
    a: "“Export your Memories” wasn't ticked. Without it you get a thorough account history containing no pictures at all. Request again with the box on.",
  },
  {
    q: "There are photos but no JSON folder",
    a: "“Export JSON Files” wasn't ticked. That file is where the real dates and locations live — without it, nothing can put them back, including this site. Worth requesting again for.",
  },
  {
    q: "I got seven ZIP files",
    a: "Normal for a large library. Snapchat splits the archive, and only the first part carries the JSON. Keep all of them together; a tool given one part of a split export sees a pile of media with no dates attached.",
  },
  {
    q: "The download keeps failing partway",
    a: "These are large files on a link with a deadline. A wired connection or a download manager that resumes beats retrying on hotel wifi. Start it on the day it arrives so a failed attempt isn't a lost archive.",
  },
];
