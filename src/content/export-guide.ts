/**
 * The Snapchat side of step 01, tap by tap, for /how-it-works.
 *
 * Written against the export flow as it stands now: a three-stage web form at
 * accounts.snapchat.com reached from inside the app. Older guides — and older
 * copy on this site — describe an "Include your Memories" checkbox and a
 * "Submit Request" button. Neither exists any more.
 *
 * `figure` names an illustration in ExportWalkthrough. Steps without one are
 * the ones where a picture would just be a paragraph in a phone-shaped box.
 */
export type GuideStep = {
  n: string;
  title: string;
  body: string[];
  figure?:
    | "chat"
    | "profile"
    | "settings"
    | "toggles"
    | "daterange"
    | "email"
    | "exports";
};

/** The toggles nobody needs for this, listed so you can recognise them. */
export const OPTIONAL_TOGGLES = [
  "User Information",
  "Chat History",
  "Spotlight",
  "Shopping",
  "Support History",
  "Ranking And Location",
  "Other Media",
  "Other",
  "My AI",
  "Export Shared Stories",
  "Export Chat Media",
];

export const GUIDE: GuideStep[] = [
  {
    n: "1",
    title: "Open Snapchat and tap your face, top-left",
    body: [
      "The camera screen is what opens first. Your Bitmoji — or a plain circle, if you've never made one — sits in the top-left corner of every screen in the app. Tap it. That's your profile.",
    ],
    figure: "chat",
  },
  {
    n: "2",
    title: "Tap the gear, top-right",
    body: [
      "Your profile shows your name, your username and a row of buttons. The settings gear is in the opposite corner from the one you just tapped, top-right, next to the Share button.",
    ],
    figure: "profile",
  },
  {
    n: "3",
    title: "Scroll a long way down to Privacy Controls, then tap My Data",
    body: [
      "Settings is long. You'll pass My Account at the top, then Public Profile Settings, then a whole section called Additional Services — none of which is what you want. Keep going until the heading Privacy Controls appears.",
      "My Data is well down that section, below Family Center and Comment Settings and just above Generative AI Settings. Tapping it opens a web page rather than another settings screen, and it may ask you to log in again. That's normal.",
    ],
    figure: "settings",
  },
  {
    n: "4",
    title: "Switch on “Export your Memories” and “Export JSON Files”",
    body: [
      "The page opens on a list headed Select data to include, with everything off and a counter reading 0 / 10 selected. Two of them matter.",
      "“Export your Memories” is the photos and videos themselves. Without it you get a thorough archive of your account containing no pictures whatsoever, which is a long wait for nothing.",
      "“Export JSON Files” is labelled “For data portability purposes”, which does it no favours. It's the file that holds every capture date, every set of coordinates, and the captions and stickers that were drawn on your memories. It's the half of the export this site actually reads. Turn it on.",
      "There's also a blue “Request Only Memories” shortcut on this screen. It's quicker, but it doesn't let you confirm the JSON toggle, so use the two switches instead.",
    ],
    figure: "toggles",
  },
  {
    n: "5",
    title: "Leave the rest alone",
    body: [
      "Everything below those two is optional, off by default, and skipped by most people. They're a different kind of archive — logs and histories rather than photos — and each one you add makes the export bigger and slower to build. Turn them on only if you actually want them for something.",
      "Then tap Next, bottom-right. For reference, the ones you're walking past are:",
    ],
  },
  {
    n: "6",
    title: "Choose All Time, check the email address, Submit",
    body: [
      "The second stage asks about a date range, and this is the step that quietly ruins exports. It offers Yesterday, Last Week, Last Month, Last Year, 2 Year and All Time. Pick All Time. Anything else and the memories from before that window simply aren't in the archive, and nothing on the page will warn you.",
      "Below the calendar it shows the email address on your account. That's where the export gets sent — not to the app, not to your phone. If it's an address you can't open any more, fix that first, because the download link is the only copy you get.",
      "Then Submit. The page moves to a third stage, Export progress, and tells you to wait before requesting anything else.",
    ],
    figure: "daterange",
  },
  {
    n: "7",
    title: "Wait. Usually a day or two",
    body: [
      "Snapchat builds these at its own pace. There's no queue position and no progress percentage worth watching — a big account with years of memories can take a day or two, sometimes longer. Requesting it again doesn't speed it up; it just gets refused until the first one finishes.",
      "Close the app. You'll get an email when it's ready.",
    ],
  },
  {
    n: "8",
    title: "Watch for “Your Snapchat data is ready for download”",
    body: [
      "That's the exact subject line, from Team Snapchat. Check spam if it's been a few days — it's a transactional email from a large sender and it does sometimes land there.",
      "The email contains a link back to the same My Data page you started from.",
    ],
    figure: "email",
  },
  {
    n: "9",
    title: "Open Your exports — don't submit a new request",
    body: [
      "This is where most people go wrong. The link drops you back on the My Data page, and the first thing you see is that same Select data to include list, looking exactly like it did when you started. Filling it in again just queues a second export and gets you nowhere.",
      "What you want is the Your exports box above it. Your finished export is listed there, with a download for each package.",
    ],
    figure: "exports",
  },
  {
    n: "10",
    title: "Download everything, quickly, then bring it here",
    body: [
      "Exports expire in about three days. After that the links are dead and you request the whole thing again from step one.",
      "A large account won't arrive as one file. Snapchat splits big exports into several ZIPs — commonly a few of about 2GB each plus a smaller last one. Download all of them. A missing part means missing memories, and nothing tells you which.",
      "Then drop the ZIP — or all of them together — onto the drop zone on the homepage. Don't unzip them first, and don't rename them.",
    ],
  },
];
