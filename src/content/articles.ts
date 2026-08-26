/**
 * Every explanatory page, as data.
 *
 * One question per page, answered in the first paragraph so it survives being
 * quoted out of context, then the detail, then what to do about it. Where a
 * fact is uncertain — how long a download link lasts, what Snapchat will
 * actually do in September — it is written as uncertain, because the pages
 * that will still be true in October are the ones that didn't guess.
 */

export type Block =
  | { kind: "h"; text: string }
  | { kind: "p"; text: string }
  | { kind: "ul"; items: { lead?: string; text: string }[] }
  | { kind: "qa"; items: { q: string; a: string }[] }
  | {
      kind: "compare";
      a: string;
      b: string;
      rows: { label: string; a: string; b: string }[];
    };

export type Article = {
  slug: string;
  crumb: string;
  eyebrow: string;
  h1: string;
  title: string;
  description: string;
  lead: string;
  blocks: Block[];
  closer: { title: string; text: string; href: string; label: string };
};

const FIX_IT = {
  title: "Putting it back",
  text: "This site reads the JSON Snapchat shipped alongside your media and writes the real dates, coordinates and captions back into the files — in your browser, with no upload and no account. The first 20 files are free, so you can check the result before deciding whether it was worth $5.",
  href: "/how-it-works",
  label: "How it works",
} as const;

export const ARTICLES: Article[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: "is-it-safe",
    crumb: "Is it safe?",
    eyebrow: "Privacy",
    h1: "Is it safe to upload your Snapchat export?",
    title: "Is it safe to upload your Snapchat export? — KeepMySnaps",
    description:
      "Your Memories archive is years of your life in one file. Here's what uploading it to a stranger's server actually means, and why this tool doesn't ask you to.",
    lead: "Honestly: be careful. A Memories export is often years of your life in one file — faces, homes, coordinates, the lot — and most tools that offer to fix it ask you to upload the whole thing to a server you know nothing about. That isn't automatically malicious, but it is a real decision, and it deserves more than a trust badge on a landing page.",
    blocks: [
      { kind: "h", text: "What you're actually handing over" },
      {
        kind: "p",
        text: "A full export is not a folder of photos. It's a dated, located, captioned record of where you were and who you were with, going back as far as your account does. The JSON alone is a movement history with timestamps.",
      },
      {
        kind: "p",
        text: "Uploading that means it exists on somebody else's disk. Even with the best intentions on their side, you've now got a copy in a place you can't see, governed by a policy you didn't read, on infrastructure you can't audit, retained for a period you're taking on faith.",
      },
      { kind: "h", text: "Questions worth asking any of them, including us" },
      {
        kind: "ul",
        items: [
          { lead: "Where does the file go?", text: "If the answer is a server, ask which one, in which country, and under whose law." },
          { lead: "How long is it kept?", text: "\"Deleted after processing\" is a promise about a background job you can't observe. Ask what happens if the job fails." },
          { lead: "Who can reach it?", text: "Every employee with production access is a person who could open your photos. Small teams are not automatically safer — they usually have fewer controls." },
          { lead: "What happens if they're bought, or breached?", text: "Data outlives the company that collected it. A privacy policy is a statement of current intent, not a guarantee about the next owner." },
          { lead: "Can you verify any of it?", text: "This is the one that matters. Almost every answer above is unfalsifiable from outside." },
        ],
      },
      { kind: "h", text: "Our answer, and how to check it" },
      {
        kind: "p",
        text: "Nothing is uploaded here, because there is nowhere to upload it to. No route on this site accepts a file. The unzipping, the caption compositing, the video re-encoding and the date writing all happen in the browser tab, using code that arrived when the page loaded.",
      },
      {
        kind: "p",
        text: "You don't have to believe that. Load the page, turn off your Wi-Fi, and run your export anyway. It works. That's not a demo mode — it's the only mode there is.",
      },
      {
        kind: "p",
        text: "Since August 2026 the browser enforces it too. Every page ships a Content-Security-Policy whose connect-src permits this site and nothing else, so the tab is forbidden from sending data anywhere — including to us, and including if one of the open-source libraries doing the unzipping were tampered with upstream. Open your browser's developer tools, look at the response headers, and you can read the rule yourself.",
      },
      { kind: "h", text: "What that costs you" },
      {
        kind: "p",
        text: "Doing the work locally is slower than a server farm would be, your laptop's fan will notice a large library, and if something goes wrong mid-run there is no copy on our side to recover from — because there's no copy on our side at all. That trade is deliberate. It's the only version where \"your photos are none of our business\" is a fact rather than a promise.",
      },
      { kind: "h", text: "If you'd rather not trust anyone" },
      {
        kind: "p",
        text: "Reasonable. The metadata is sitting in memories_history.json inside your own archive, and a determined person with exiftool and an afternoon can put it back by hand. The matching is the fiddly part — Snapchat's export has no field joining a photo to its entry — but nothing about the format is secret.",
      },
    ],
    closer: FIX_IT,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "fix-snapchat-dates",
    crumb: "Wrong dates",
    eyebrow: "The main problem",
    h1: "Why is every Snapchat photo the same date?",
    title: "Snapchat export has the wrong date on every photo — KeepMySnaps",
    description:
      "Your export arrives stamped with the day it was built, not the day the photo was taken. The real dates are in the ZIP. Here's where, and how to put them back.",
    lead: "Because the export was stamped with the day Snapchat built it, not the day you took the photo. The files come out with no EXIF at all — no DateTimeOriginal, nothing — so every photo app falls back to the file's creation date, which is the moment it landed on your disk. Eight years of memories then pile onto one afternoon.",
    blocks: [
      { kind: "h", text: "The dates aren't gone" },
      {
        kind: "p",
        text: "They're in the archive, just not in the photos. Open the json folder inside your export and you'll find memories_history.json — a list of every memory with its capture time in UTC and, usually, its coordinates. Snapchat ships the metadata next to the media instead of inside it.",
      },
      {
        kind: "p",
        text: "So nothing has been lost. It just needs writing back into the files, where Google Photos, Apple Photos, Immich and everything else actually look.",
      },
      { kind: "h", text: "Why it isn't a one-line fix" },
      {
        kind: "p",
        text: "The list has no field naming the file each entry belongs to. Your photos are called things like 2021-10-07_C45000BA-E542-409E-9A4E-C74223CFE277-main.jpg, and that id appears nowhere in the JSON. So matching has to be worked out rather than looked up.",
      },
      {
        kind: "p",
        text: "The filename carries the date, which is why the day always comes out right. Within a day, when several memories share it, the entries can be told apart by media type — the JSON says Image or Video and the extension agrees — but not much further. That's a real limit, not a shortcut, and it's why locations are handled the way they are.",
      },
      { kind: "h", text: "Doing it yourself" },
      {
        kind: "ul",
        items: [
          { lead: "exiftool", text: "Free, excellent, and will happily write DateTimeOriginal from a value you supply. You'll still have to parse the JSON and decide which entry belongs to which file, which is the hard part." },
          { lead: "Don't just rename the files.", text: "A filename with a date in it doesn't move a photo in your timeline. Photo apps read EXIF; the name is decoration." },
          { lead: "Don't re-save through an editor.", text: "Round-tripping a JPEG through a converter often drops the EXIF you just wrote, and always costs quality." },
        ],
      },
      { kind: "h", text: "What correct looks like afterwards" },
      {
        kind: "p",
        text: "Photos land on the day they happened, in order, spread across every year you used the app. Videos can't hold EXIF — an MP4 has nowhere to put it — so their dates ride on the filename and the file's own timestamp, which is what your filesystem picks up on extract and what most photo apps then read on import.",
      },
    ],
    closer: FIX_IT,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "merge-snapchat-captions",
    crumb: "Missing captions",
    eyebrow: "Captions and filters",
    h1: "Where did the captions on my Snapchat memories go?",
    title: "Snapchat export missing captions, stickers and filters — KeepMySnaps",
    description:
      "The text, stickers and location filters are in your export — as separate transparent PNGs sitting beside each photo. Here's why, and how to put them back on.",
    lead: "They're in your export, just not on your photos. Snapchat composes everything you drew on a snap — the caption, the stickers, the drawings, the geofilter naming the town you were in — into a single transparent PNG, and ships it as its own file. So the photo comes out bare and the words sit in a file named -overlay.png right beside it.",
    blocks: [
      { kind: "h", text: "How to spot it in your own archive" },
      {
        kind: "p",
        text: "Open the memories folder and sort by name. You'll see pairs: something ending -main.jpg or -main.mp4, and immediately after it the same long id ending -overlay.png. Open one of those PNGs on its own and you'll see your caption floating on a checkerboard — transparent everywhere else.",
      },
      {
        kind: "p",
        text: "That pairing is the one part of a Snapchat export that is completely unambiguous. Both files carry the same id, so a caption can always be matched to exactly the right photo — unlike the dates and locations, which have no such link.",
      },
      { kind: "h", text: "Photos are the easy half" },
      {
        kind: "p",
        text: "Compositing a transparent PNG onto a JPEG is a solved problem. The only trap is scale: the overlay is the size of the phone screen, not the photo. A 720x1280 snap routinely ships a 720x1384 overlay, so anything that stretches the overlay to fit the photo exactly squashes your caption by however much the two differ. It has to be scaled to cover and centred instead.",
      },
      { kind: "h", text: "Videos are the hard half" },
      {
        kind: "p",
        text: "An MP4 has nowhere to keep a picture. The only way to make a caption part of a video is to decode every frame, draw the overlay onto it, and encode the whole thing again — which is why most tools quietly drop video captions altogether. In a real export that can be two thirds of all your captions.",
      },
      {
        kind: "p",
        text: "This site does the re-encode, in the browser, using the video encoder built into modern Chrome, Safari and Firefox. The audio track is copied across untouched rather than re-encoded, since it carries no caption. Where a browser has no encoder or a file won't decode, the PNG is saved in a captions folder beside the video rather than thrown away.",
      },
      { kind: "h", text: "There's a rotation trap too" },
      {
        kind: "p",
        text: "Snapchat records portrait but stores the frames landscape with a flag telling players to rotate. Decoded frames come out unrotated, so anything that composites without honouring that flag produces a video on its side with a portrait caption stretched across it. If you're doing this yourself with ffmpeg, check the rotation before you draw anything.",
      },
    ],
    closer: FIX_IT,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "restore-snapchat-location",
    crumb: "Missing locations",
    eyebrow: "Locations",
    h1: "Why do my Snapchat photos have no location?",
    title: "Snapchat export has no GPS or location data — KeepMySnaps",
    description:
      "The coordinates are in your export's JSON, not in the photos. Some can be put back exactly; some genuinely can't, and here's the honest reason why.",
    lead: "Because the export strips GPS out of the files and keeps it in a list instead. Every entry in memories_history.json carries a latitude and longitude, but the photos themselves come out with an empty GPS field, so no map view will ever show them. Most of those coordinates can be put back. Some genuinely can't, and it's worth knowing which.",
    blocks: [
      { kind: "h", text: "What the export actually gives you" },
      {
        kind: "p",
        text: "A list that reads roughly: date, media type, latitude and longitude. And separately, a folder of files named after random ids. Nothing in the list names a file, and nothing in a filename appears in the list.",
      },
      {
        kind: "p",
        text: "So when a day holds one memory, the pairing is obvious and the coordinate is exactly right. When a day holds six, you have six files and six coordinates and no way to know which belongs to which.",
      },
      { kind: "h", text: "Why that matters more than it sounds" },
      {
        kind: "p",
        text: "The tempting move is to assign them in whatever order they happen to be in. It looks perfect — every photo gets a pin — and roughly a third of those pins are on the wrong photo. Worse, a wrong pin is invisible: a photo tagged with a place you genuinely were that day looks exactly like a photo tagged correctly. Nobody ever finds out.",
      },
      { kind: "h", text: "What this site does instead" },
      {
        kind: "ul",
        items: [
          { lead: "Alone on its day:", text: "the memory's own coordinates go straight in. Exact." },
          { lead: "Sharing a day, all in one area:", text: "everything from that day gets the centre of where that day was. Off by a few hundred metres at most, and marked approximate in the CSV." },
          { lead: "Sharing a day, spread across a region:", text: "no coordinate is written at all. There is no honest middle between two cities, and an empty field is at least something you can see." },
        ],
      },
      {
        kind: "p",
        text: "Measured against a real 3,792-memory export, that keeps a location on about 82% of memories with none of them carrying somebody else's coordinates. The index CSV in your output marks every one exact, approximate, or blank, so you can always tell which you're looking at.",
      },
      { kind: "h", text: "If a lot of yours are blank" },
      {
        kind: "p",
        text: "Two likely reasons. Either you took a lot of snaps on busy days spent moving around, which is exactly the case where guessing would be wrong. Or Snapchat recorded no location for them in the first place — location permission off, or airplane mode — in which case there is nothing to restore and no tool can invent it.",
      },
    ],
    closer: FIX_IT,
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "export-link-expired",
    crumb: "Link expired",
    eyebrow: "Download links",
    h1: "My Snapchat export link expired. Now what?",
    title: "Snapchat export download link expired — KeepMySnaps",
    description:
      "The link in Snapchat's email doesn't last. Here's what to do if you missed it, and how to make sure the next one doesn't get away.",
    lead: "Request it again — that's genuinely the whole fix, and nothing is lost by doing so. Snapchat's download links expire, and reports of the window range from around 72 hours to seven days; Snapchat doesn't document it clearly anywhere. A new request builds a fresh archive and sends a fresh link. The only real cost is waiting again, which is why it's worth not missing the second one.",
    blocks: [
      { kind: "h", text: "Making sure the next one sticks" },
      {
        kind: "ul",
        items: [
          { lead: "Download it the day it arrives.", text: "Not the weekend after. Treat the window as three days, not seven, and you'll never find out which it was." },
          { lead: "Download it on a real connection.", text: "These are multi-gigabyte files. Starting a large download on patchy wifi with a deadline attached is how people end up requesting a third one." },
          { lead: "Get every part.", text: "A large library is split across several ZIPs and the email links to all of them. Only the first carries the JSON with your dates in it, so a set missing part one is a folder of undated media." },
          { lead: "Check spam before you assume.", text: "It's a bulk email with a big download link in it, which is precisely what filters are built to catch." },
        ],
      },
      { kind: "h", text: "Don't wait for the deadline to try again" },
      {
        kind: "p",
        text: "Requests slow down as more people make them, and the closer this gets to late September the longer the queue. Re-requesting in early September and re-requesting on the 24th are not the same gamble.",
      },
      { kind: "h", text: "What if the files are already deleted?" },
      {
        kind: "p",
        text: "An expired link doesn't mean your Memories are gone — it only means the archive Snapchat built for you was cleaned up. Everything still in your account can be exported again. What can't be recovered is anything Snapchat has already removed under the storage limit, which is why the request is worth making now rather than after the deadline.",
      },
    ],
    closer: {
      title: "When the new one arrives",
      text: "It'll come with the dates, locations and captions stripped out — that's normal, and it's what this site puts back, in your browser, without uploading anything. The first 20 files are free.",
      href: "/waiting-for-your-export",
      label: "What to expect",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "multiple-zip-files",
    crumb: "Multiple ZIPs",
    eyebrow: "Split exports",
    h1: "Snapchat sent me several ZIP files. Which one do I use?",
    title: "Snapchat export split into multiple ZIP files — KeepMySnaps",
    description:
      "Large exports arrive in parts, and only the first one holds the file with your dates in it. Here's why, and what to do with all of them.",
    lead: "All of them, together. Snapchat splits a large archive into numbered parts — mydata~1786724342212.zip, then -2, -3 and so on — and only the first one contains the json folder with your dates and locations in it. The rest are nothing but media. Feed a tool a single part and you'll get exactly what you'd expect: a pile of files with no metadata to put back.",
    blocks: [
      { kind: "h", text: "How to tell what you've got" },
      {
        kind: "p",
        text: "Open the unnumbered one. It should hold four things: html, index.html, json and memories. The numbered parts hold only memories. If your first part has no json folder, then Export JSON Files wasn't ticked when you made the request, and no amount of combining parts will help — that one needs requesting again.",
      },
      { kind: "h", text: "Don't unzip and merge them by hand" },
      {
        kind: "p",
        text: "It's tempting, and it mostly works, but every part contains a folder called memories, so unzipping them side by side gives you memories, memories 2, memories 3 and so on rather than one merged folder. Merging those manually is where files get missed. Better to hand every ZIP over at once and let something else do the pooling.",
      },
      { kind: "h", text: "Watch the count" },
      {
        kind: "p",
        text: "It's normal for the JSON to list more memories than there are files. In one real export, 3,792 entries came with 3,639 media files behind them — about 4% that Snapchat listed and didn't ship. Those aren't recoverable by any tool; the files simply aren't in the archive. Worth knowing so you don't spend an evening hunting for them.",
      },
    ],
    closer: {
      title: "Give it all of them",
      text: "This site takes every part at once and pools them, so the JSON from part one is applied to the media in parts two through seven. It runs in your browser and nothing is uploaded. The first 20 files are free.",
      href: "/how-it-works",
      label: "How it works",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "on-iphone",
    crumb: "On iPhone",
    eyebrow: "No computer",
    h1: "Can I fix my Snapchat export on my phone?",
    title: "Fix a Snapchat export on iPhone, without a computer — KeepMySnaps",
    description:
      "You don't need a laptop. Here's how to go from Snapchat's email to a fixed camera roll entirely on an iPhone, and where it gets slow.",
    lead: "Yes, entirely on the phone. Every tool that assumes a desktop is making an assumption about you that isn't true for most people — a large share of this audience has a phone and nothing else. The export arrives as an email link, the Files app can hold and unzip a ZIP, and this site runs in mobile Safari like any other page. It's slower than a laptop, and there are two places it can trip you up.",
    blocks: [
      { kind: "h", text: "The whole thing, on iPhone" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "In Snapchat: Settings → Privacy Controls → My Data. Tick Export your Memories and Export JSON Files, choose All Time, submit." },
          { lead: "2.", text: "When the email lands, tap the link. Safari will offer to download it — send it to Files rather than opening it." },
          { lead: "3.", text: "In Files, find the ZIP under Downloads. Don't unzip it." },
          { lead: "4.", text: "Open keepmysnaps.com in Safari, tap the upload area, choose Browse, and pick the ZIP from Files." },
          { lead: "5.", text: "Leave the screen on and the tab in front while it works." },
          { lead: "6.", text: "Save the finished ZIP back to Files, then unzip it there and share the photos into your camera roll." },
        ],
      },
      { kind: "h", text: "The two things that go wrong" },
      {
        kind: "p",
        text: "Locking the screen or switching apps. iOS suspends background tabs aggressively, and a suspended tab stops working through your archive. Keep the phone awake and the tab in front — turning off auto-lock in Settings → Display & Brightness for the duration is the easiest fix.",
      },
      {
        kind: "p",
        text: "Memory. A phone has far less room to work in than a laptop, and a multi-gigabyte archive is a lot to hold. If Safari reloads the page partway through, that's what happened. Feeding it one part of a split export at a time works around it, at the cost of doing it several times.",
      },
      { kind: "h", text: "Storage, before you start" },
      {
        kind: "p",
        text: "You need room for the archive and the fixed copy at the same time — roughly double the export's size, briefly. Check that first, because running out midway is a wasted hour on a phone.",
      },
      { kind: "h", text: "Android" },
      {
        kind: "p",
        text: "Much the same, and generally easier: Chrome on Android has the same browser features this relies on, the Files app handles ZIPs, and background tabs tend to survive a bit better. The same advice about keeping the screen on applies.",
      },
    ],
    closer: {
      title: "Try it with 20 files first",
      text: "The first 20 memories are free, which on a phone is genuinely useful — you find out whether your device can handle the work before committing to the whole library. Nothing is uploaded either way.",
      href: "/is-it-safe",
      label: "Where the files go",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapchat-plus-vs-exporting",
    crumb: "Pay or export",
    eyebrow: "The decision",
    h1: "Pay Snapchat for storage, or export your memories?",
    title: "Snapchat storage plan vs exporting your memories — KeepMySnaps",
    description:
      "$1.99 a month forever, or one export you own. An honest comparison, including the cases where paying Snapchat is the better answer.",
    lead: "It depends on whether you want your memories in Snapchat or on your own disk, and both are legitimate answers. Paying keeps everything exactly where it is, browsable in the app, with nothing to do — for $1.99 a month, forever. Exporting is free, gives you files nobody can bill you for, and costs you an afternoon plus the fact that they stop living in Snapchat.",
    blocks: [
      {
        kind: "compare",
        a: "Pay Snapchat",
        b: "Export",
        rows: [
          { label: "Cost", a: "$1.99/month for 100GB, ongoing. Snapchat+ at $3.99 includes 250GB; Platinum at $15.99 includes 5TB.", b: "Free from Snapchat. This site is $5 once if you want the metadata put back." },
          { label: "Effort", a: "None. Nothing moves.", b: "A day or two of waiting, then an hour of work." },
          { label: "Where they live", a: "In Snapchat, browsable in the app, resurfacing as On This Day.", b: "Wherever you put them. Photos, Drive, an external drive in a drawer." },
          { label: "If you stop paying", a: "You're back over the limit and the clock restarts.", b: "Nothing happens. They're your files." },
          { label: "If Snapchat changes the rules", a: "You find out when they tell you.", b: "Doesn't affect you." },
          { label: "Quality", a: "Originals, untouched.", b: "Originals for photos. Videos are re-encoded if they carry a caption." },
        ],
      },
      { kind: "h", text: "When paying is the right call" },
      {
        kind: "p",
        text: "If what you actually value is the Snapchat experience — memories resurfacing on their own, the app's timeline, sending an old snap to whoever was in it — then export it and you've lost the thing you wanted. A folder of correctly dated JPEGs is not that. $1.99 a month buys exactly what you're after, and no export replaces it.",
      },
      {
        kind: "p",
        text: "It's also the right call if you're over the limit and the deadline is close. Paying takes thirty seconds; an export takes days. If you're reading this in late September, pay first and export afterwards at your own pace.",
      },
      { kind: "h", text: "When exporting is the right call" },
      {
        kind: "p",
        text: "If you want to own them. Twenty-four dollars a year, indefinitely, for storage you don't control adds up — and the risk isn't really the money, it's that the terms are Snapchat's to change. Exported files are yours in a way rented ones aren't.",
      },
      {
        kind: "p",
        text: "There's a middle path nobody mentions: pay for one month, export everything at your leisure while nothing is at risk of deletion, then cancel. About two dollars to remove all the time pressure.",
      },
      { kind: "h", text: "Doing nothing" },
      {
        kind: "p",
        text: "Also a choice, and fine if your Memories fit inside the free 5GB — the cap only bites above the line. If you're over it, the excess is what goes, and Snapchat has said it goes rather than being archived.",
      },
    ],
    closer: {
      title: "If you're exporting",
      text: "The archive arrives with the dates, locations and captions stripped out — that's normal, and it's what this site puts back, in your browser, without uploading anything. The first 20 files are free.",
      href: "/september-2026-deadline",
      label: "How long you've got",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapeasy-alternative",
    crumb: "vs SnapEasy",
    eyebrow: "Comparison",
    h1: "A cheaper alternative to SnapEasy",
    title: "SnapEasy alternative — KeepMySnaps",
    description:
      "SnapEasy is $9.99 rising to $19.99, with no free tier and a Mac-only desktop app. This is $5, runs in any browser including a phone, and the first 20 files are free.",
    lead: "SnapEasy is a real product that does the job, and if you have already paid for it there is no reason to switch. The differences worth knowing: it costs $9.99 at an early-bird price that rises to $19.99, it has no free tier, and its private option is a desktop app that is Mac-only for now. This is $5 once, the first 20 files are free, and it runs in whatever browser you already have — including the one on your phone.",
    blocks: [
      {
        kind: "compare",
        a: "SnapEasy",
        b: "KeepMySnaps",
        rows: [
          { label: "Price", a: "$9.99 one-off, advertised as an early-bird price rising to $19.99, and stated to increase as September approaches.", b: "$5 one-off. It does not go up." },
          { label: "Try before paying", a: "No free tier or trial advertised.", b: "First 20 files free, no account." },
          { label: "Where files are processed", a: "The desktop app runs entirely on your machine. The web version uploads, with uploads stated to be deleted within 48 hours.", b: "In the browser tab. There is no route on the site that accepts a file." },
          { label: "What you install", a: "Desktop app for the private option — Mac available, Windows listed as coming soon.", b: "Nothing. It's a web page." },
          { label: "On a phone", a: "Exports from iPhone and Android are supported as input; the local processing option is desktop.", b: "Runs in mobile Safari and Chrome. No computer needed." },
          { label: "Dates, GPS, captions", a: "All three, including overlays stitched onto the media.", b: "All three, including captions drawn into videos frame by frame." },
        ],
      },
      { kind: "h", text: "Where SnapEasy is genuinely better" },
      {
        kind: "ul",
        items: [
          { lead: "A native app is faster.", text: "A desktop application can use every core on your machine without a browser between it and the file. On a very large library that is a real difference, and it is the honest reason to prefer one." },
          { lead: "It has been around longer.", text: "It went viral on TikTok months before this site existed, which means more people have run more unusual exports through it than through this." },
          { lead: "Unlimited re-runs.", text: "Both are one-off payments with no limit on how often you use them, but SnapEasy says so explicitly and has the track record behind it." },
        ],
      },
      { kind: "h", text: "The difference that isn't about price" },
      {
        kind: "p",
        text: "SnapEasy offers two ways to do this: upload to their servers, or install their desktop app. The app is local and their own description says so. But the web version — the one most people will reach first, because it needs no install — uploads your archive and keeps it for up to 48 hours.",
      },
      {
        kind: "p",
        text: "This site has one mode. Nothing is uploaded because there is nowhere to upload to, and since August 2026 the browser enforces that rather than us promising it: every page ships a Content-Security-Policy whose connect-src permits this site and nothing else. You can read that header in your own developer tools, and you can run the whole thing with your Wi-Fi switched off.",
      },
      {
        kind: "p",
        text: "That is the trade in one line: convenience without an upload, versus choosing between convenience and an upload.",
      },
      { kind: "h", text: "What neither of us can do" },
      {
        kind: "p",
        text: "My Eyes Only memories are not in the export at all — they have to be taken out of the vault in the app before you request your data, or they simply won't be in the archive for anything to fix. SnapEasy documents this clearly and it applies here identically.",
      },
      {
        kind: "p",
        text: "Neither can invent a location Snapchat never recorded, and neither can tell which photo a coordinate belongs to when several memories share a day — Snapchat's export contains no field joining the two. This site leaves those blank rather than guessing; check what any tool does with them before you trust a map view.",
      },
      { kind: "h", text: "Prices checked" },
      {
        kind: "p",
        text: "Everything above was read off SnapEasy's own site in August 2026. Their pricing page says the price rises as the deadline approaches, so check it yourself rather than taking a competitor's word for what a competitor charges.",
      },
    ],
    closer: {
      title: "Twenty files, free, right now",
      text: "You don't have to decide from a comparison table. Drop your export in, get the first 20 memories back with their dates and captions, and see whether the result is what you wanted before anyone asks you for money.",
      href: "/is-it-safe",
      label: "Where the files go",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "fixmyexport-alternative",
    crumb: "vs FixMyExport",
    eyebrow: "Comparison",
    h1: "A browser-based alternative to FixMyExport",
    title: "FixMyExport (ExportSnaps) alternative — KeepMySnaps",
    description:
      "FixMyExport is a good desktop app at $14.99 with a generous free tier. This is $5, needs no install, and works on a phone. An honest comparison of both.",
    lead: "FixMyExport — formerly ExportSnaps — is the closest thing to a direct competitor and it is a good product. It processes everything on your own machine, it is honest about doing so, and its free tier of 200 files is far more generous than the 20 here. The real differences are price and shape: it is a $14.99 desktop app for Mac and Windows, and this is a $5 web page that also runs on a phone.",
    blocks: [
      {
        kind: "compare",
        a: "FixMyExport",
        b: "KeepMySnaps",
        rows: [
          { label: "Price", a: "$14.99 one-off for unlimited processing, one device.", b: "$5 one-off, no device limit." },
          { label: "Free tier", a: "Up to 200 files free — genuinely generous.", b: "First 20 files free." },
          { label: "Where files are processed", a: "Entirely on your device. Nothing uploaded.", b: "Entirely in the browser tab. Nothing uploaded." },
          { label: "What you install", a: "A desktop app: macOS 12+ or Windows 10 1809+.", b: "Nothing." },
          { label: "On a phone", a: "Desktop only.", b: "Works in mobile Safari and Chrome." },
          { label: "Dates, GPS, captions", a: "All three, overlays merged automatically.", b: "All three, including captions drawn into videos." },
        ],
      },
      { kind: "h", text: "When FixMyExport is the better choice" },
      {
        kind: "p",
        text: "Plainly: if your library is under 200 files, use it. It is free at that size and this site is not, and no amount of positioning changes which of those is a better deal for you.",
      },
      {
        kind: "p",
        text: "If you have a very large library and a computer to run it on, a native app has the edge too. It can use the whole machine, it isn't bound by what a browser tab is allowed to hold in memory, and it won't stop working because you switched apps. On a fifty-gigabyte archive that matters.",
      },
      {
        kind: "p",
        text: "We also agree on the thing that matters most: neither of us uploads your photos. This is not a privacy comparison, and anyone framing it as one is selling you something.",
      },
      { kind: "h", text: "When this one is the better choice" },
      {
        kind: "ul",
        items: [
          { lead: "You don't have a computer.", text: "This is the big one. FixMyExport is desktop only, and a large share of the people facing this deadline have a phone and nothing else. This runs in mobile Safari." },
          { lead: "You don't want to install anything.", text: "Some people won't download an executable to handle their entire photo history, and that's a reasonable instinct rather than paranoia." },
          { lead: "You're over 200 files and counting the cost.", text: "$5 against $14.99 for the same job." },
          { lead: "You use more than one machine.", text: "Their Pro licence covers one device. A web page has no such concept." },
        ],
      },
      { kind: "h", text: "One thing to check whichever you pick" },
      {
        kind: "p",
        text: "Ask what the tool does with locations when several memories share a day. Snapchat's export has no field joining a photo to its entry in the JSON, so within a single day the files are genuinely indistinguishable. A tool that gives every photo a pin anyway is guessing, and a pin on the wrong photo looks exactly like a pin on the right one — you will never catch it.",
      },
      {
        kind: "p",
        text: "This site writes the shared centre of a day when the day's memories were in one area, leaves the field empty when they were spread too far for a centre to mean anything, and marks every row exact or approximate in the CSV it hands you. That is not a claim about anyone else's tool; it is a question worth asking of all of them, including this one.",
      },
      { kind: "h", text: "Details checked" },
      {
        kind: "p",
        text: "Read off fixmyexport.com in August 2026, after exportsnaps.com began redirecting there. Prices and platform support change — check theirs directly rather than trusting a competitor's summary of it.",
      },
    ],
    closer: {
      title: "Twenty files, free, right now",
      text: "If you're under 200 files, use theirs — it's free at that size. If you're over it, or you're doing this on a phone, drop your export here and get the first 20 back before anyone asks you for money.",
      href: "/on-iphone",
      label: "Doing it on a phone",
    },
  },
];

export const ARTICLE_BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));
