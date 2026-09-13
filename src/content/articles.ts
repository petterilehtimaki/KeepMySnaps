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
  text: "This site reads the JSON Snapchat shipped alongside your media and writes the real dates, coordinates and captions back into the files, in your browser, with no upload and no account. The first 20 files are free, so you can check the result before deciding whether it was worth $5.",
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
    title: "Is it safe to upload your Snapchat export? | KeepMySnaps",
    description:
      "Your Memories archive is years of your life in one file. Here's what uploading it to a stranger's server actually means, and why this tool doesn't ask you to.",
    lead: "Honestly: be careful. A Memories export is often years of your life in one file (faces, homes, coordinates, the lot), and most tools that offer to fix it ask you to upload the whole thing to a server you know nothing about. That isn't automatically malicious, but it is a real decision, and it deserves more than a trust badge on a landing page.",
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
          { lead: "Who can reach it?", text: "Every employee with production access is a person who could open your photos. Small teams are not automatically safer. They usually have fewer controls." },
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
        text: "You don't have to believe that. Load the page, turn off your Wi-Fi, and run your export anyway. It works. That's not a demo mode. It's the only mode there is.",
      },
      {
        kind: "p",
        text: "Since August 2026 the browser enforces it too. Every page ships a Content-Security-Policy whose connect-src permits this site and nothing else, so the tab is forbidden from sending data anywhere, including to us, and including if one of the open-source libraries doing the unzipping were tampered with upstream. Open your browser's developer tools, look at the response headers, and you can read the rule yourself.",
      },
      { kind: "h", text: "What that costs you" },
      {
        kind: "p",
        text: "Doing the work locally is slower than a server farm would be, your laptop's fan will notice a large library, and if something goes wrong mid-run there is no copy on our side to recover from, because there's no copy on our side at all. That trade is deliberate. It's the only version where \"your photos are none of our business\" is a fact rather than a promise.",
      },
      { kind: "h", text: "If you'd rather not trust anyone" },
      {
        kind: "p",
        text: "Reasonable. The metadata is sitting in memories_history.json inside your own archive, and a determined person with exiftool and an afternoon can put it back by hand. The matching is the fiddly part (Snapchat's export has no field joining a photo to its entry), but nothing about the format is secret.",
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
    title: "Snapchat export has the wrong date on every photo | KeepMySnaps",
    description:
      "Your export arrives stamped with the day it was built, not the day the photo was taken. The real dates are in the ZIP. Here's where, and how to put them back.",
    lead: "Because the export was stamped with the day Snapchat built it, not the day you took the photo. The files come out with no EXIF at all (no DateTimeOriginal, nothing), so every photo app falls back to the file's creation date, which is the moment it landed on your disk. Eight years of memories then pile onto one afternoon.",
    blocks: [
      { kind: "h", text: "The dates aren't gone" },
      {
        kind: "p",
        text: "They're in the archive, just not in the photos. Open the json folder inside your export and you'll find memories_history.json: a list of every memory with its capture time in UTC and, usually, its coordinates. Snapchat ships the metadata next to the media instead of inside it.",
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
        text: "The filename carries the date, which is why the day always comes out right. Within a day, when several memories share it, the entries can be told apart by media type (the JSON says Image or Video and the extension agrees), but not much further. That's a real limit, not a shortcut, and it's why locations are handled the way they are.",
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
        text: "Photos land on the day they happened, in order, spread across every year you used the app. Videos have no EXIF, but an MP4 keeps a creation time in its own header, and that is what Apple Photos, iCloud and Google Photos read to place a video. That field gets the real capture time too, along with the filename.",
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
    title: "Snapchat export missing captions, stickers and filters | KeepMySnaps",
    description:
      "The text, stickers and location filters are in your export, as separate transparent PNGs sitting beside each photo. Here's why, and how to put them back on.",
    lead: "They're in your export, just not on your photos. Snapchat composes everything you drew on a snap (the caption, the stickers, the drawings, the geofilter naming the town you were in) into a single transparent PNG, and ships it as its own file. So the photo comes out bare and the words sit in a file named -overlay.png right beside it.",
    blocks: [
      { kind: "h", text: "How to spot it in your own archive" },
      {
        kind: "p",
        text: "Open the memories folder and sort by name. You'll see pairs: something ending -main.jpg or -main.mp4, and immediately after it the same long id ending -overlay.png. Open one of those PNGs on its own and you'll see your caption floating on a checkerboard, transparent everywhere else.",
      },
      {
        kind: "p",
        text: "That pairing is the one part of a Snapchat export that is completely unambiguous. Both files carry the same id, so a caption can always be matched to exactly the right photo, unlike the dates and locations, which have no such link.",
      },
      { kind: "h", text: "Photos are the easy half" },
      {
        kind: "p",
        text: "Compositing a transparent PNG onto a JPEG is a solved problem. The only trap is scale: the overlay is the size of the phone screen, not the photo. A 720x1280 snap routinely ships a 720x1384 overlay, so anything that stretches the overlay to fit the photo exactly squashes your caption by however much the two differ. It has to be scaled to cover and centred instead.",
      },
      { kind: "h", text: "Videos are the hard half" },
      {
        kind: "p",
        text: "An MP4 has nowhere to keep a picture. The only way to make a caption part of a video is to decode every frame, draw the overlay onto it, and encode the whole thing again. That's why most tools quietly drop video captions altogether. In a real export that can be two thirds of all your captions.",
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
    title: "Snapchat export has no GPS or location data | KeepMySnaps",
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
        text: "The tempting move is to assign them in whatever order they happen to be in. It looks perfect (every photo gets a pin), and roughly a third of those pins are on the wrong photo. Worse, a wrong pin is invisible: a photo tagged with a place you genuinely were that day looks exactly like a photo tagged correctly. Nobody ever finds out.",
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
        text: "Two likely reasons. Either you took a lot of snaps on busy days spent moving around, which is exactly the case where guessing would be wrong. Or Snapchat recorded no location for them in the first place (location permission off, or airplane mode), in which case there is nothing to restore and no tool can invent it.",
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
    title: "Snapchat export download link expired | KeepMySnaps",
    description:
      "The link in Snapchat's email doesn't last. Here's what to do if you missed it, and how to make sure the next one doesn't get away.",
    lead: "Request it again. That's genuinely the whole fix, and nothing is lost by doing so. Snapchat's download links expire, and reports of the window range from around 72 hours to seven days; Snapchat doesn't document it clearly anywhere. A new request builds a fresh archive and sends a fresh link. The only real cost is waiting again, which is why it's worth not missing the second one.",
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
      { kind: "h", text: "Don't wait to try again" },
      {
        kind: "p",
        text: "Requests slow down when a lot of people make them at once, and plenty of people currently believe there's a deadline in late September. Re-requesting in a quiet week and re-requesting in a panic are not the same gamble.",
      },
      { kind: "h", text: "Are my Memories gone?" },
      {
        kind: "p",
        text: "No. An expired link only means the archive Snapchat built for you was cleaned up; your Memories are still in your account and can be exported again. Snapchat has said it won't delete Memories over the storage limit. From January 2027 it archives them instead, as thumbnails that need a paid plan to open, so a fresh export gets you the full-quality files either way.",
      },
    ],
    closer: {
      title: "When the new one arrives",
      text: "It'll come with the dates, locations and captions stripped out. That's normal, and it's what this site puts back, in your browser, without uploading anything. The first 20 files are free.",
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
    title: "Snapchat export split into multiple ZIP files | KeepMySnaps",
    description:
      "Large exports arrive in parts, and only the first one holds the file with your dates in it. Here's why, and what to do with all of them.",
    lead: "All of them, together. Snapchat splits a large archive into numbered parts (mydata~1786724342212.zip, then -2, -3 and so on), and only the first one contains the json folder with your dates and locations in it. The rest are nothing but media. Feed a tool a single part and you'll get exactly what you'd expect: a pile of files with no metadata to put back.",
    blocks: [
      { kind: "h", text: "How to tell what you've got" },
      {
        kind: "p",
        text: "Open the unnumbered one. It should hold four things: html, index.html, json and memories. The numbered parts hold only memories. If your first part has no json folder, then Export JSON Files wasn't ticked when you made the request, and no amount of combining parts will help. That one needs requesting again.",
      },
      { kind: "h", text: "Don't unzip and merge them by hand" },
      {
        kind: "p",
        text: "It's tempting, and it mostly works, but every part contains a folder called memories, so unzipping them side by side gives you memories, memories 2, memories 3 and so on rather than one merged folder. Merging those manually is where files get missed. Better to hand every ZIP over at once and let something else do the pooling.",
      },
      { kind: "h", text: "Watch the count" },
      {
        kind: "p",
        text: "It's normal for the JSON to list more memories than there are files. In one real export, 3,792 entries came with 3,639 media files behind them: about 4% that Snapchat listed and didn't ship. Those aren't recoverable by any tool; the files simply aren't in the archive. Worth knowing so you don't spend an evening hunting for them.",
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
    title: "Fix a Snapchat export on iPhone, without a computer | KeepMySnaps",
    description:
      "You don't need a laptop. Here's how to go from Snapchat's email to a fixed camera roll entirely on an iPhone, and where it gets slow.",
    lead: "Yes, entirely on the phone. Plenty of people doing this have a phone and nothing else, and that works: the export arrives as an email link, the Files app can hold and unzip a ZIP, and this site runs in mobile Safari like any other page. If you do have a laptop, though, use it for anything bigger than a small library. It's faster, it has far more memory, and it doesn't stop working when the screen locks.",
    blocks: [
      { kind: "h", text: "The whole thing, on iPhone" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "In Snapchat: Settings → Privacy Controls → My Data. Tick Export your Memories and Export JSON Files, choose All Time, submit." },
          { lead: "2.", text: "When the email lands, tap the link. Safari will offer to download it. Send it to Files rather than opening it." },
          { lead: "3.", text: "In Files, find the ZIP under Downloads. Don't unzip it." },
          { lead: "4.", text: "Open keepmysnaps.com in Safari, tap the upload area, choose Browse, and pick the ZIP from Files." },
          { lead: "5.", text: "Leave the screen on and the tab in front while it works." },
          { lead: "6.", text: "Save the finished ZIP back to Files, then unzip it there and share the photos into your camera roll." },
        ],
      },
      { kind: "h", text: "Honestly, a laptop is better" },
      {
        kind: "p",
        text: "A phone can do this, but a laptop does it better. A big export is several gigabytes the browser has to hold in memory while it works, and a laptop has several times the room a phone does. It also finishes sooner, doesn't suspend the tab when the screen turns off, and makes the last step easy, because the fixed folder is right there to drag into your photo library. Use the phone to try the free 20 files, or if a phone is genuinely all you have.",
      },
      { kind: "h", text: "The two things that go wrong" },
      {
        kind: "p",
        text: "Locking the screen or switching apps. iOS suspends background tabs aggressively, and a suspended tab stops working through your archive. Keep the phone awake and the tab in front. Turning off auto-lock in Settings → Display & Brightness for the duration is the easiest fix.",
      },
      {
        kind: "p",
        text: "Memory. A phone has far less room to work in than a laptop, and a multi-gigabyte archive is a lot to hold. If Safari reloads the page partway through, that's what happened. Smaller batches work around it, but every batch needs part one of a split export, because only part one holds the JSON with your dates in it: run part one with part two, then part one with part three, and skip the repeats of part one's own memories.",
      },
      { kind: "h", text: "Storage, before you start" },
      {
        kind: "p",
        text: "You need room for the archive and the fixed copy at the same time, roughly double the export's size, briefly. Check that first, because running out midway is a wasted hour on a phone.",
      },
      { kind: "h", text: "Android" },
      {
        kind: "p",
        text: "Much the same, with a different Files app. It has its own guide at /on-android.",
      },
    ],
    closer: {
      title: "Try it with 20 files first",
      text: "The first 20 memories are free, which on a phone is genuinely useful: you find out whether your device can handle the work before committing to the whole library. Nothing is uploaded either way.",
      href: "/is-it-safe",
      label: "Where the files go",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "on-android",
    crumb: "On Android",
    eyebrow: "No computer",
    h1: "Can I fix my Snapchat export on Android?",
    title: "Fix a Snapchat export on Android, without a computer | KeepMySnaps",
    description:
      "Yes. It's basically the iPhone guide with a different Files app, but here it is anyway: from Snapchat's email to a fixed library on an Android phone, and why a laptop is still better.",
    lead: "Yes, entirely on the phone. And to be honest, it isn't that different from doing it on an iPhone: same email, same site, a different Files app. But Android deserves its own page, so here you go. One recommendation before you start: if you have a laptop, use that instead for anything bigger than a small library.",
    blocks: [
      { kind: "h", text: "The whole thing, on Android" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "In Snapchat: Settings → Privacy Controls → My Data. Tick Export your Memories and Export JSON Files, choose All Time, submit." },
          { lead: "2.", text: "When the email lands, open the link in Chrome and download every part. They go to your Downloads folder. Don't unzip them." },
          { lead: "3.", text: "Open keepmysnaps.com in Chrome, tap Choose file, and pick the ZIP from Downloads. If Snapchat sent several, select all of them." },
          { lead: "4.", text: "Keep the screen on and Chrome in front while it works." },
          { lead: "5.", text: "When it's done, keepmysnaps.zip lands in Downloads. Open it in your Files app and extract it." },
          { lead: "6.", text: "To get them into Google Photos, turn on backup for that folder in Google Photos' backup settings." },
        ],
      },
      { kind: "h", text: "Honestly, a laptop is better" },
      {
        kind: "p",
        text: "Android handles this fine, but a laptop handles it better. A big export is several gigabytes the browser has to hold in memory while it works, and a laptop has far more room than a phone. It finishes sooner and doesn't pause the tab when the screen switches off. The phone is great for trying the free 20 files, or if it's all you have. If you do have a Windows PC, there's a guide for that too.",
      },
      { kind: "h", text: "The two things that go wrong" },
      {
        kind: "p",
        text: "The screen turning off, or switching apps. Android can pause a tab that isn't on screen, and a paused tab stops working through your archive. Make the screen timeout longer in Settings → Display for the duration, and resist checking Snapchat while it runs.",
      },
      {
        kind: "p",
        text: "Memory. If Chrome reloads the page partway through, the phone ran out of room. Close other apps and try again. If it keeps happening, run smaller batches, but every batch needs part one of a split export, because only part one holds the JSON with your dates in it: run part one with part two, then part one with part three, and skip the repeats of part one's own memories.",
      },
      { kind: "h", text: "Storage, before you start" },
      {
        kind: "p",
        text: "You need room for the archive and the fixed copy at the same time, so roughly double the export's size for a while. Check that first, because running out halfway is a wasted hour.",
      },
      { kind: "h", text: "Captions on videos" },
      {
        kind: "p",
        text: "Captioned videos are re-encoded with the video encoder built into the browser, which Chrome has on most Android phones. If yours can't encode a particular video, the caption isn't lost. It's saved as a PNG in a captions folder beside the videos.",
      },
    ],
    closer: {
      title: "Try it with 20 files first",
      text: "The first 20 memories are free, which on a phone is the useful part: you find out whether yours can handle the work before committing to the whole library. Nothing is uploaded either way.",
      href: "/snapchat-memories-to-google-photos",
      label: "Then Google Photos",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapchat-plus-vs-exporting",
    crumb: "Pay or export",
    eyebrow: "The decision",
    h1: "Pay Snapchat for storage, or export your memories?",
    title: "Snapchat storage plan vs exporting your memories | KeepMySnaps",
    description:
      "$1.99 a month forever, or one export you own. An honest comparison, including the cases where paying Snapchat is the better answer.",
    lead: "It depends on whether you want your memories in Snapchat or on your own disk, and both are legitimate answers. Paying keeps everything exactly where it is, browsable in the app, with nothing to do, for $1.99 a month, forever. Exporting is free, gives you files nobody can bill you for, and costs you an afternoon plus the fact that they stop living in Snapchat.",
    blocks: [
      {
        kind: "compare",
        a: "Pay Snapchat",
        b: "Export",
        rows: [
          { label: "Cost", a: "$1.99/month or $20/year for 100GB, ongoing. Snapchat+ includes 250GB; Platinum includes 5TB.", b: "Free from Snapchat. This site is $5 once if you want the metadata put back." },
          { label: "Effort", a: "None. Nothing moves.", b: "A day or two of waiting, then an hour of work." },
          { label: "Where they live", a: "In Snapchat, browsable in the app, resurfacing as On This Day.", b: "Wherever you put them. Photos, Drive, an external drive in a drawer." },
          { label: "If you stop paying", a: "Memories over 5GB that are more than a year old get archived from January 2027: still there, but thumbnails until you pay again.", b: "Nothing happens. They're your files." },
          { label: "If Snapchat changes the rules", a: "You find out when they tell you.", b: "Doesn't affect you." },
          { label: "Quality", a: "Originals, untouched.", b: "Originals for photos. Videos are re-encoded if they carry a caption." },
        ],
      },
      { kind: "h", text: "When paying is the right call" },
      {
        kind: "p",
        text: "If what you actually value is the Snapchat experience (memories resurfacing on their own, the app's timeline, sending an old snap to whoever was in it), then export it and you've lost the thing you wanted. A folder of correctly dated JPEGs is not that. $1.99 a month buys exactly what you're after, and no export replaces it.",
      },
      {
        kind: "p",
        text: "It's also the easy call if you're short on time. Paying takes thirty seconds; an export takes days. Nothing is deleted either way, so paying for a month and exporting at your own pace costs about two dollars.",
      },
      { kind: "h", text: "When exporting is the right call" },
      {
        kind: "p",
        text: "If you want to own them. Twenty-four dollars a year, indefinitely, for storage you don't control adds up, and the risk isn't really the money, it's that the terms are Snapchat's to change. Exported files are yours in a way rented ones aren't.",
      },
      {
        kind: "p",
        text: "There's a middle path nobody mentions: pay for one month, export everything while it's all still openable, then cancel. About two dollars to remove the time pressure entirely.",
      },
      { kind: "h", text: "Doing nothing" },
      {
        kind: "p",
        text: "Also a choice, and fine if your Memories fit inside the free 5GB. The cap only bites above the line. If you're over it, nothing is deleted: from January 2027, Memories more than a year old that fall outside your oldest 5GB are archived, which means they stay in the app as thumbnails you'd have to pay to open, edit or share. Export them before then and the full files are yours regardless.",
      },
    ],
    closer: {
      title: "If you're exporting",
      text: "The archive arrives with the dates, locations and captions stripped out. That's normal, and it's what this site puts back, in your browser, without uploading anything. The first 20 files are free.",
      href: "/september-2026-deadline",
      label: "What's actually changing",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapeasy-alternative",
    crumb: "vs SnapEasy",
    eyebrow: "Comparison",
    h1: "A cheaper alternative to SnapEasy",
    title: "SnapEasy alternative | KeepMySnaps",
    description:
      "SnapEasy is $9.99 rising to $19.99, with no free tier and a Mac-only desktop app. This is $5, runs in any browser including a phone, and the first 20 files are free.",
    lead: "SnapEasy is a real product that does the job, and if you have already paid for it there is no reason to switch. The differences worth knowing: it costs $9.99 at an early-bird price that rises to $19.99, it has no free tier, and its private option is a desktop app that is Mac-only for now. This is $5 once, the first 20 files are free, and it runs in whatever browser you already have, including the one on your phone.",
    blocks: [
      {
        kind: "compare",
        a: "SnapEasy",
        b: "KeepMySnaps",
        rows: [
          { label: "Price", a: "$9.99 one-off, advertised as an early-bird price rising to $19.99, and stated to increase as September approaches.", b: "$5 one-off. It does not go up." },
          { label: "Try before paying", a: "No free tier or trial advertised.", b: "First 20 files free, no account." },
          { label: "Where files are processed", a: "The desktop app runs entirely on your machine. The web version uploads, with uploads stated to be deleted within 48 hours.", b: "In the browser tab. There is no route on the site that accepts a file." },
          { label: "What you install", a: "Desktop app for the private option: Mac available, Windows listed as coming soon.", b: "Nothing. It's a web page." },
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
        text: "SnapEasy offers two ways to do this: upload to their servers, or install their desktop app. The app is local and their own description says so. But the web version (the one most people will reach first, because it needs no install) uploads your archive and keeps it for up to 48 hours.",
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
        text: "My Eyes Only memories are not in the export at all. They have to be taken out of the vault in the app before you request your data, or they simply won't be in the archive for anything to fix. SnapEasy documents this clearly and it applies here identically.",
      },
      {
        kind: "p",
        text: "Neither can invent a location Snapchat never recorded, and neither can tell which photo a coordinate belongs to when several memories share a day, because Snapchat's export contains no field joining the two. This site leaves those blank rather than guessing; check what any tool does with them before you trust a map view.",
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
    title: "FixMyExport (ExportSnaps) alternative | KeepMySnaps",
    description:
      "FixMyExport is a good desktop app at $14.99 with a generous free tier. This is $5, needs no install, and works on a phone. An honest comparison of both.",
    lead: "FixMyExport (formerly ExportSnaps) is the closest thing to a direct competitor and it is a good product. It processes everything on your own machine, it is honest about doing so, and its free tier of 200 files is far more generous than the 20 here. The real differences are price and shape: it is a $14.99 desktop app for Mac and Windows, and this is a $5 web page that also runs on a phone.",
    blocks: [
      {
        kind: "compare",
        a: "FixMyExport",
        b: "KeepMySnaps",
        rows: [
          { label: "Price", a: "$14.99 one-off for unlimited processing, one device.", b: "$5 one-off, no device limit." },
          { label: "Free tier", a: "Up to 200 files free, which is genuinely generous.", b: "First 20 files free." },
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
          { lead: "You don't have a computer.", text: "This is the big one. FixMyExport is desktop only, and a large share of the people doing this have a phone and nothing else. This runs in mobile Safari." },
          { lead: "You don't want to install anything.", text: "Some people won't download an executable to handle their entire photo history, and that's a reasonable instinct rather than paranoia." },
          { lead: "You're over 200 files and counting the cost.", text: "$5 against $14.99 for the same job." },
          { lead: "You use more than one machine.", text: "Their Pro licence covers one device. A web page has no such concept." },
        ],
      },
      { kind: "h", text: "One thing to check whichever you pick" },
      {
        kind: "p",
        text: "Ask what the tool does with locations when several memories share a day. Snapchat's export has no field joining a photo to its entry in the JSON, so within a single day the files are genuinely indistinguishable. A tool that gives every photo a pin anyway is guessing, and a pin on the wrong photo looks exactly like a pin on the right one. You will never catch it.",
      },
      {
        kind: "p",
        text: "This site writes the shared centre of a day when the day's memories were in one area, leaves the field empty when they were spread too far for a centre to mean anything, and marks every row exact or approximate in the CSV it hands you. That is not a claim about anyone else's tool; it is a question worth asking of all of them, including this one.",
      },
      { kind: "h", text: "Details checked" },
      {
        kind: "p",
        text: "Read off fixmyexport.com in August 2026, after exportsnaps.com began redirecting there. Prices and platform support change, so check theirs directly rather than trusting a competitor's summary of it.",
      },
    ],
    closer: {
      title: "Twenty files, free, right now",
      text: "If you're under 200 files, use theirs. It's free at that size. If you're over it, or you're doing this on a phone, drop your export here and get the first 20 back before anyone asks you for money.",
      href: "/on-iphone",
      label: "Doing it on a phone",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "stop-paying-snapchat-storage",
    crumb: "Stop paying Snapchat",
    eyebrow: "Cancelling a storage plan",
    h1: "How to stop paying Snapchat for Memories storage without losing anything",
    title: "Cancel Snapchat Memories storage without losing your memories | KeepMySnaps",
    description:
      "Export first, then cancel. What happens to Memories over 5GB when you stop paying, what Snapchat says it won't do, and the order that loses nothing.",
    lead: "Export first, then cancel, in that order. Cancelling a storage plan while you're over 5GB doesn't delete anything, but from January 2027 Snapchat archives Memories that are more than a year old and aren't part of your oldest 5GB: they stay in the app as thumbnails that need a paid plan to open. Take a full export while every one of them is still openable, and cancelling costs you nothing but the thumbnails.",
    blocks: [
      { kind: "h", text: "The order that loses nothing" },
      {
        kind: "ul",
        items: [
          { lead: "1. Request the export while the plan is still active.", text: "Settings → Privacy Controls → My Data. Tick Export your Memories and Export JSON Files, and choose All Time. The JSON is where the dates and locations live; without it nothing can put them back." },
          { lead: "2. Download every part the day the email lands.", text: "A large library arrives as several ZIPs, only the first one carries the JSON, and the links expire within days." },
          { lead: "3. Put the dates, captions and locations back.", text: "The export strips all three. Copy the raw files into a photo library and every memory lands on the day you downloaded it." },
          { lead: "4. Move them somewhere you trust.", text: "iCloud Photos, Google Photos, an external drive. The guides below cover the first two." },
          { lead: "5. Check them, then cancel.", text: "Scroll by year, open a few videos, make sure the count looks right. Only then cancel the plan." },
        ],
      },
      { kind: "h", text: "Where the cancel button is" },
      {
        kind: "p",
        text: "Snapchat's support page says a Memories-only storage plan is managed from your Memories settings in the app. If your storage comes with Snapchat+ or Platinum, it's a subscription like any other. Cancel it wherever you started it: the App Store, Google Play, or Snapchat's website.",
      },
      { kind: "h", text: "What happens after you cancel" },
      {
        kind: "ul",
        items: [
          { lead: "Under 5GB:", text: "nothing changes." },
          { lead: "Over 5GB:", text: "nothing is deleted. Snapchat's support page answers that question with a flat no." },
          { lead: "From January 2027:", text: "Memories more than a year old that aren't in your oldest 5GB get archived. You still see them, as thumbnails, but opening, editing or sharing one needs a paid plan again." },
          { lead: "Before it happens to you:", text: "Snapchat says it will give notice in the app first, so there's no single day everyone's library changes." },
        ],
      },
      { kind: "h", text: "Is the plan worth keeping?" },
      {
        kind: "p",
        text: "$1.99 a month or $20 a year for 100GB is small, and it's forever. If you open old Memories constantly, send throwbacks to friends, or live in On This Day, keep it. An export doesn't do any of that. If you mostly want them kept safe and rarely look, one export is cheaper than every year after it.",
      },
      { kind: "h", text: "Don't delete anything from Snapchat yet" },
      {
        kind: "p",
        text: "There's no reason to. Cancelling doesn't require clearing your Memories, and until you've opened the exported copy and checked it, the copy in the app is the only one you know is complete.",
      },
    ],
    closer: {
      title: "Do the export part properly",
      text: "This puts the dates, captions and locations back into your export in your browser, with nothing uploaded. The first 20 files are free, so you can check the result before cancelling anything.",
      href: "/snapchat-memories-to-icloud",
      label: "Moving them to iCloud",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapchat-memories-to-icloud",
    crumb: "To iCloud Photos",
    eyebrow: "Moving them",
    h1: "How to move Snapchat memories to iCloud Photos with the right dates",
    title: "Move Snapchat memories to iCloud Photos with correct dates | KeepMySnaps",
    description:
      "Import Snapchat's export straight into iCloud and everything lands on today's date. Here's why, and the order that puts every photo and video on the day it happened.",
    lead: "Export from Snapchat, fix the dates, then import into Photos, in that order. Import the raw export and every memory lands on the day you downloaded it, because Snapchat's files arrive with no EXIF date. Photos reads the date from inside each file (EXIF for photos, the QuickTime creation date for videos), so that's where the real capture time has to be before anything goes in.",
    blocks: [
      { kind: "h", text: "On a Mac" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "Request your export with Export your Memories and Export JSON Files ticked, and download every part." },
          { lead: "2.", text: "Drop all the ZIPs onto this site at once and download the finished one." },
          { lead: "3.", text: "Double-click it to unzip." },
          { lead: "4.", text: "In Photos, File → Import, and choose the folder." },
          { lead: "5.", text: "With iCloud Photos switched on, they sync to every device from there." },
        ],
      },
      { kind: "h", text: "On an iPhone, with no computer" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "Send Snapchat's download to the Files app rather than opening it." },
          { lead: "2.", text: "Open this site in Safari and choose the ZIP from Files. Keep the screen on until it finishes." },
          { lead: "3.", text: "Save the finished ZIP to Files, then tap it and Files unzips it into a folder." },
          { lead: "4.", text: "Open the folder, tap Select, select everything, then Share and save them to Photos." },
        ],
      },
      { kind: "h", text: "What Photos uses for the date" },
      {
        kind: "p",
        text: "For a photo, the EXIF DateTimeOriginal field. For a video, the creation date stored inside the movie file, and only if that's missing does it fall back to the file's own date. Snapchat's photos have no EXIF at all and its videos' internal dates aren't always right, so both are written on the way out. The date in the photo's EXIF and the date in the video's header come from the same entry in Snapchat's own list.",
      },
      { kind: "h", text: "Some will have no location, and that's deliberate" },
      {
        kind: "p",
        text: "Snapchat's export doesn't say which photo each coordinate belongs to, so when several memories share a day and were taken in different places, the location is left empty rather than guessed. A wrong pin on the map looks exactly like a right one. The index CSV in the ZIP marks every location exact, approximate or blank.",
      },
      { kind: "h", text: "Check before you delete anything" },
      {
        kind: "p",
        text: "Once they're in, scroll the Library by year, open a few videos, and look at the count. Snapchat's export sometimes lists more memories than it actually ships (in one real export about 4% had no file), so compare against what you expected before clearing anything anywhere.",
      },
    ],
    closer: {
      title: "Fix them before they go in",
      text: "Dates, captions and locations back into every file, in your browser, with nothing uploaded. The first 20 files are free.",
      href: "/snapchat-memories-to-google-photos",
      label: "Or Google Photos",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapchat-memories-to-google-photos",
    crumb: "To Google Photos",
    eyebrow: "Moving them",
    h1: "How to move Snapchat memories to Google Photos with the right dates",
    title: "Move Snapchat memories to Google Photos with correct dates | KeepMySnaps",
    description:
      "Upload Snapchat's raw export and Google Photos files it all under the day you uploaded it. Fix the dates first, then upload, and check the videos.",
    lead: "Fix the dates first, then upload. Google Photos files a photo under the date stored inside it, and Snapchat's export ships photos with none, so an unfixed upload puts years of memories on the day you uploaded them. Once the capture date is written into each file, they sort into the years they came from.",
    blocks: [
      { kind: "h", text: "From a computer" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "Export from Snapchat with Export JSON Files ticked, download every part, and run them all through this site together." },
          { lead: "2.", text: "Unzip the result." },
          { lead: "3.", text: "Open photos.google.com and drag the folder into the window, or use Upload." },
        ],
      },
      { kind: "h", text: "From a phone" },
      {
        kind: "p",
        text: "The Google Photos app backs up whatever is in your phone's photo library. So fix the export in your browser, save the finished files into your photo library, and let backup pick them up. On Android you can also point backup at the folder you unzipped them into.",
      },
      { kind: "h", text: "Videos are the part to check" },
      {
        kind: "p",
        text: "Google documents how it dates photos more clearly than videos. The fixed videos carry the capture time in the movie's own header (the field photo apps generally read) and in the filename, so they should land on the right day. But since Google doesn't spell out its fallback, open a handful of videos after uploading and check before deleting anything.",
      },
      { kind: "h", text: "Storage" },
      {
        kind: "p",
        text: "A free Google account's 15GB is shared between Gmail, Drive and Photos. Anyone who was over Snapchat's 5GB limit has a decent chance of running out here too, so check your space before starting an upload that stops halfway.",
      },
      { kind: "h", text: "Locations" },
      {
        kind: "p",
        text: "Some memories will have no location, on purpose. Snapchat's export doesn't say which photo a coordinate belongs to, so where a day's memories were scattered the field is left empty instead of guessed. The CSV in the ZIP shows which are exact, approximate or blank.",
      },
    ],
    closer: {
      title: "Fix them before they go up",
      text: "Dates, captions and locations back into every file, in your browser, with nothing uploaded. The first 20 files are free.",
      href: "/stop-paying-snapchat-storage",
      label: "Cancelling Snapchat's plan",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "on-windows",
    crumb: "On Windows",
    eyebrow: "Windows PC",
    h1: "How to fix a Snapchat export on a Windows PC",
    title: "Fix a Snapchat Memories export on Windows | KeepMySnaps",
    description:
      "Nothing to install. Use Chrome or Edge, hand over every ZIP without unzipping, keep the tab awake, and check the dates in File Explorer afterwards.",
    lead: "Open the site in Chrome or Edge, give it every ZIP at once without unzipping any of them, and keep the tab in front until it finishes. There's nothing to install. Everything this needs is already in the browser. The two things that catch people out on a PC are unzipping Snapchat's archive first, and the browser or Windows putting the tab to sleep halfway through.",
    blocks: [
      { kind: "h", text: "Step by step" },
      {
        kind: "ul",
        items: [
          { lead: "1.", text: "In Snapchat: Settings → Privacy Controls → My Data. Tick Export your Memories and Export JSON Files, choose All Time, submit." },
          { lead: "2.", text: "When the email arrives, download every part into your Downloads folder. Leave them as ZIPs." },
          { lead: "3.", text: "Open keepmysnaps.com in Chrome or Edge, click Choose file, and select every ZIP at once: click the first, then Shift-click the last. Dragging them all onto the page works too." },
          { lead: "4.", text: "Leave the tab in front and the PC awake while it works." },
          { lead: "5.", text: "Save keepmysnaps.zip when it's done, right-click it and choose Extract All. You get a KeepMySnaps folder." },
        ],
      },
      { kind: "h", text: "Why Chrome or Edge" },
      {
        kind: "p",
        text: "Photos only need dates and coordinates written into them, which any modern browser manages. Captioned videos are the demanding part: the caption has to be drawn onto every frame and the video encoded again, using the video encoder built into the browser, and Chrome and Edge both have one on Windows. When a video can't be re-encoded, its caption isn't thrown away. It's saved as a PNG in a captions folder beside the videos. If you used another browser and got a captions folder, a second run in Chrome or Edge is worth it.",
      },
      { kind: "h", text: "Don't unzip Snapchat's ZIPs first" },
      {
        kind: "p",
        text: "Extract All on Snapchat's download gives you undated files and a json folder, and there's nothing useful to do with them in that state. Every part also contains its own memories folder, so unzipping a split export leaves you merging folders by hand, which is where files go missing. Hand the ZIPs over exactly as they arrived; they're pooled automatically, and the JSON in part one is applied to the media in every other part.",
      },
      { kind: "h", text: "Keep the tab awake" },
      {
        kind: "p",
        text: "A large library takes a while, and a tab that stops running stops working through your archive. Edge's sleeping tabs and Chrome's Memory Saver can both put a background tab to sleep, and a PC that goes to sleep takes the tab with it. Leave the tab in front, keep a laptop plugged in, and set Windows not to sleep in its power settings until it's done.",
      },
      { kind: "h", text: "If the tab crashes on a big export" },
      {
        kind: "p",
        text: "The archive is opened in the browser's memory, so a very large export on a PC without much RAM can crash the tab. Close other tabs and try again. If it still fails, run it in smaller batches, but every batch has to include part one, because only part one holds the JSON with your dates in it. Run part one with part two, then part one with part three, and so on. Part one's own memories come out again each time with the same names, so choose Skip when Windows asks about replacing files as you merge the folders.",
      },
      { kind: "h", text: "Checking the dates in File Explorer" },
      {
        kind: "p",
        text: "Open the KeepMySnaps folder, switch to Details view, right-click a column heading, choose More, and tick Date taken and Media created. Photos show their capture date under Date taken, and videos show theirs under Media created, the same fields photo apps read when you import them. If those columns look right here, they'll look right in iCloud, Google Photos or Immich.",
      },
    ],
    closer: {
      title: "Try it with 20 files first",
      text: "The first 20 memories are free, so you can check their dates in File Explorer before deciding whether the rest are worth $5. Nothing is uploaded either way.",
      href: "/snapchat-memories-to-google-photos",
      label: "Then Google Photos",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapchat-memories-to-immich",
    crumb: "To Immich",
    eyebrow: "Moving them",
    h1: "How to move Snapchat memories to Immich with the right dates",
    title: "Move Snapchat memories to Immich with correct dates | KeepMySnaps",
    description:
      "Import Snapchat's raw export into Immich and it all lands on the day you downloaded it. Here's what Immich reads, and how to upload a fixed library with the CLI.",
    lead: "Fix the dates before Immich sees the files. When a file carries no date of its own, Immich falls back to the earlier of the file's created and modified times, which for a Snapchat export is the day you downloaded it. Once the capture time is written inside each file, as EXIF in photos and in the MP4 header in videos, Immich reads it and every memory goes back to the year it came from.",
    blocks: [
      { kind: "h", text: "What Immich reads" },
      {
        kind: "p",
        text: "Immich runs every upload through exiftool and takes the first date it finds from a fixed list of tags. DateTimeOriginal is near the top of that list, which covers photos. CreateDate and MediaCreateDate come after it, and those are the MP4 header fields a video's capture time lives in. Only when none of them is there does it fall back to the file's own timestamps. That order is from Immich's source code, not a guess about its behaviour.",
      },
      { kind: "h", text: "Uploading a whole library with the CLI" },
      {
        kind: "p",
        text: "For thousands of files, Immich's command-line tool is more dependable than dragging a folder into a browser tab. It needs Node.js, and an API key you create under API Keys in your Immich account settings.",
      },
      {
        kind: "ul",
        items: [
          { lead: "1. Install it:", text: "npm i -g @immich/cli" },
          { lead: "2. Log in:", text: "immich login https://your-immich-server/api YOUR_API_KEY" },
          { lead: "3. Try it without uploading:", text: "immich upload --dry-run --recursive KeepMySnaps" },
          { lead: "4. Then for real:", text: "immich upload --album-name \"Snapchat\" --ignore \"**/captions/**\" --recursive KeepMySnaps" },
        ],
      },
      {
        kind: "p",
        text: "--album-name puts everything into one album as well as the timeline. --ignore leaves out the captions folder, which only exists if some video captions couldn't be drawn into their videos; those PNGs would otherwise show up in your timeline as transparent images. Avoid --album on its own here, since it names albums after folders and you'd get one called captions.",
      },
      { kind: "h", text: "From the web or the phone app" },
      {
        kind: "p",
        text: "Dragging the unzipped folder into Immich's web page works the same way for a smaller library, because the dates are inside the files rather than in how they were uploaded. On a phone, save the fixed files into your photo library and let the Immich app's backup pick them up.",
      },
      { kind: "h", text: "Locations" },
      {
        kind: "p",
        text: "Photos carry their GPS coordinates in EXIF, and Immich turns those into place names and pins on its map. Videos from this tool carry their date but no location. And where a day's memories were taken far apart, no coordinate is written at all rather than a guessed one. The CSV in the ZIP marks every memory exact, approximate or blank.",
      },
      { kind: "h", text: "If the times look a few hours out" },
      {
        kind: "p",
        text: "Snapchat records every capture time in UTC, and that's what gets written. The order of your memories is always right, but the clock time on one can be off from your local time by your time-zone difference, and a snap taken close to midnight can land on the day either side.",
      },
    ],
    closer: {
      title: "Fix them before Immich sees them",
      text: "Dates, captions and locations back into every file, in your browser, with nothing uploaded. The first 20 files are free, so you can upload a test batch and check the timeline before doing the rest.",
      href: "/snapchat-memories-to-synology-photos",
      label: "Or Synology Photos",
    },
  },

  /* ------------------------------------------------------------------ */
  {
    slug: "snapchat-memories-to-synology-photos",
    crumb: "To Synology Photos",
    eyebrow: "Moving them",
    h1: "How to move Snapchat memories to Synology Photos with the right dates",
    title: "Move Snapchat memories to Synology Photos with correct dates | KeepMySnaps",
    description:
      "Synology Photos dates a photo from its EXIF and falls back to the modified time when there's none. Fix the export first, copy it onto the NAS, and check the videos.",
    lead: "Fix the dates first, then copy the folder onto the NAS. Synology's own documentation says that when a file has no capture date, Synology Photos uses its most recent modification time, so a raw Snapchat export lands on the day you copied it over. With the date written into each photo's EXIF, Photos files it under the day it was taken. Videos are less predictable, and they're the part worth checking.",
    blocks: [
      { kind: "h", text: "Getting them onto the NAS" },
      {
        kind: "ul",
        items: [
          { lead: "Copy the folder in.", text: "Best for a whole library. Unzip the result on your computer, then copy the KeepMySnaps folder into /home/Photos for your Personal Space, or /photo for Shared Space, using File Station or a mapped network drive. Synology Photos indexes it from there." },
          { lead: "Or upload through Synology Photos.", text: "Synology says drag-and-drop takes at most 5,000 files per upload, and uploading a whole folder only works in Chrome and Edge. Uploads made in Timeline View are sorted into folders by date taken, which is exactly what goes wrong with an unfixed export." },
          { lead: "Or from a phone.", text: "Save the fixed files into your photo library and let the Synology Photos app back them up." },
        ],
      },
      { kind: "h", text: "What Synology Photos reads" },
      {
        kind: "p",
        text: "For photos, the EXIF date taken. When you edit Date taken in Synology Photos, it writes the change to the DateTime and DateTimeOriginal tags, which are the same ones this site fills in. When a file has no capture date at all, Synology says it uses the file's most recent modification time instead.",
      },
      { kind: "h", text: "Check the videos" },
      {
        kind: "p",
        text: "Synology doesn't document which field it reads a video's date from. The fixed videos carry their capture time in the MP4 header, which is where other photo apps look for it, but Synology's forums have threads about videos landing on their upload date despite correct metadata. So once indexing finishes, open a handful of videos and look at their dates.",
      },
      {
        kind: "p",
        text: "If some are wrong, select them and edit the date and time as a batch. Synology notes that this edit isn't written back into a video file, so keep the CSV from the ZIP. It lists every memory's real capture time, and that's the record to go back to if you ever move the library.",
      },
      { kind: "h", text: "Locations" },
      {
        kind: "p",
        text: "Photos keep their GPS coordinates, and Synology Photos turns them into place names. It can't read a location from a video at all, whichever tool wrote it. And where a day's memories were too far apart, no coordinate is written in the first place rather than a guessed one.",
      },
      { kind: "h", text: "Leave the captions folder out" },
      {
        kind: "p",
        text: "If some video captions couldn't be drawn into their videos, they're saved as transparent PNGs in a captions subfolder. Synology Photos would index those as photos, so move that folder somewhere outside /home/Photos and /photo before copying the rest in.",
      },
    ],
    closer: {
      title: "Fix them before they go on the NAS",
      text: "Dates, captions and locations back into every file, in your browser, with nothing uploaded. The first 20 files are free, so you can copy a small batch over and see how your NAS dates it before doing the rest.",
      href: "/snapchat-memories-to-immich",
      label: "Or Immich",
    },
  },
];

export const ARTICLE_BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));
