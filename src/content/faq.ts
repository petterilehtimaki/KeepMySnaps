/**
 * Every question, in two lengths. `a` is the condensed answer; `long` is the
 * fuller one on /faq. `onHomepage` marks the three that earn a slot on the
 * homepage — the ones that stop someone using this at all.
 */
export type FaqItem = {
  q: string;
  a: string;
  long?: string;
  onHomepage?: boolean;
};

export const FAQS: FaqItem[] = [
  {
    q: "Do you see my photos?",
    a: "No. There is no server to see them with. The unzipping, the caption merging, the date writing — all of it happens in this browser tab, on your machine. You can turn off your Wi-Fi after the page loads and it'll still work.",
    long: "No, and not in the careful legal sense of no — there is genuinely no server for your photos to go to. The unzipping, the caption merging and the date writing all happen in this browser tab, on your own machine, using code that was already downloaded when the page loaded. Nothing is uploaded, nothing is logged, and there is no account to attach anything to. If you'd like to confirm that rather than take our word for it: load the page, disconnect from the internet, and run your export through anyway. It works. That is also why we can't recover anything for you if something goes wrong — we never had it.",
    onHomepage: true,
  },
  {
    q: "How do I get the ZIP in the first place?",
    a: "In Snapchat: Settings → My Data → Submit Request, and make sure “Include your Memories” is ticked. They email you a download link when they get round to it. That part is entirely out of our hands.",
    long: "In Snapchat: profile → Settings → My Data → Submit Request. The important part is ticking “Include your Memories”, because without it Snapchat sends a thorough archive of everything about your account except the photos. The export goes to the email address on the account and arrives anywhere between twenty minutes and several days later, entirely at Snapchat's pace. Download it reasonably promptly — the link expires after about a week. Large accounts get split across several ZIPs, and you want all of them. There is a step-by-step version of this, with a diagram, on the how it works page.",
    onHomepage: true,
  },
  {
    q: "Why $5?",
    a: "Because it costs us nothing to run and Snapchat wants a monthly subscription to keep photos you already took. Five dollars, once. The first 20 files are free so you can confirm it does what we said before any of that.",
    long: "Because it costs almost nothing to run — there's no server doing the work, your browser is — and because charging monthly for access to photos you already took is the thing we're reacting to. Five dollars, once, for as many files as you have. The first 20 are free and fully processed, so you can open them, check the dates landed correctly, and decide from evidence rather than from this paragraph.",
    onHomepage: true,
  },
  {
    q: "Will this work on my phone?",
    a: "Yes. It's a website. Websites work on phones — that's most of what they're for. Whether your phone enjoys chewing through a 5GB ZIP is a separate question, and a laptop will be happier about it.",
    long: "Yes. It's a website. Websites work on phones — that's most of what they're for. Whether your phone enjoys chewing through a 5GB archive is a different question, and the honest answer is that it might not. All the work happens in the browser, which means it runs on your device's memory and your device's processor, and phones have less of both. For a small export it's fine. For a large one, a laptop with the tab in the foreground will finish sooner and is less likely to give up partway.",
  },
  {
    q: "It says that's not a Snapchat export ZIP.",
    a: "That's not a Snapchat export ZIP. We checked twice. The one you want came from Snapchat's My Data email and is usually called something like mydata~1234567890.zip. Don't unzip it first — drop it in exactly as it arrived.",
    long: "That's not a Snapchat export ZIP. We checked twice. The file you want arrived in the email from Snapchat's My Data request and is usually named something like mydata~1234567890.zip. A few things commonly go wrong here: the archive was unzipped first and a folder was dropped in instead of the file; a different ZIP entirely was picked out of the downloads folder; or the export was requested without “Include your Memories” ticked, in which case the archive is real but contains no photos and no memories_history.json for us to read. That last one is the most annoying, because it looks correct right up until it isn't.",
  },
  {
    q: "Why are the dates wrong to begin with?",
    a: "Snapchat's export writes every file fresh on the day it builds your archive, so your entire adolescence arrives stamped with last Tuesday. The real dates are sitting in a JSON file next to the photos. We put them back where they belong.",
    long: "Because Snapchat generates every file fresh at the moment it builds your archive, so each one carries the date it was written rather than the date it was taken. Your entire adolescence turns up stamped with last Tuesday, in one undifferentiated block, which is why importing it anywhere produces a timeline that is technically accurate and completely useless. The real capture times were never lost — they're sitting in a file called memories_history.json right next to the photos, along with the coordinates. Nothing is being reconstructed or guessed here. It's a matter of moving data from a file nothing reads into the field everything reads.",
  },
  {
    q: "What happens to the captions and stickers?",
    a: "Snapchat ships those as separate transparent PNGs, which is why your photos look bare. We flatten each overlay back onto its photo, so what you get out looks like what you posted.",
    long: "Snapchat exports them as separate transparent PNG files sitting alongside the photos, which is why everything in your export looks oddly bare. Each overlay is drawn back onto its photo and the result is re-encoded as a JPEG at high quality, so what comes out looks like what you actually posted — caption, stickers, drawing and all. This is the one step that isn't lossless: flattening means re-encoding, and re-encoding a JPEG costs a little quality. The alternative was handing you a folder of bare photos and a folder of disembodied captions, which is what you already have.",
  },
  {
    q: "What about videos?",
    a: "They come through with the correct filename and file timestamp. EXIF is a JPEG thing — MP4s don't have anywhere to put a date, so a well-named file and a correct modified time is as good as it gets without re-encoding your entire library.",
    long: "They come through with the correct filename and the correct file timestamp, and that's it, because that's all MP4 will accept. EXIF is a JPEG format — video files have no equivalent field for a capture date, so there is nowhere to write one. What we can do is name each video by its capture time and set the archive entry's timestamp, which your operating system applies when you extract it. Most photo libraries read that and file the video correctly. The ones that don't would need the video re-encoded with metadata baked in, which would mean degrading every video you own to fix a sorting problem, and we're not doing that to you.",
  },
  {
    q: "My export is enormous. Is that a problem?",
    a: "Browsers get uncomfortable somewhere past a few gigabytes in one go. If it stalls, feed it one ZIP at a time — Snapchat usually splits large exports anyway — and use a desktop browser with the tab in the foreground.",
    long: "Possibly, and the limit is your browser's rather than ours. Everything is processed in the tab, so the ceiling is however much memory the browser is willing to hand a single page — somewhere past a few gigabytes it starts to get uncomfortable. Three things help. Use a desktop browser rather than a phone. Keep the tab in the foreground, since background tabs get throttled and the work slows to nothing. And if Snapchat split your export across several ZIPs, run them one at a time rather than all at once — you'll get several output archives instead of one, which is a smaller inconvenience than a tab that gives up at 80%.",
  },
  {
    q: "Refunds?",
    a: "Ask and you'll get one. Chasing five dollars is not a business model.",
    long: "Ask and you'll get one. Chasing five dollars is not a business model, and arguing with someone about whether their photos came out right is a worse one.",
  },
];

export const HOMEPAGE_FAQS = FAQS.filter((faq) => faq.onHomepage);
