/**
 * Every question the site answers, in one length. `onHomepage` marks the three
 * that earn a slot on the homepage — the ones that stop someone using this at
 * all. The other three are on /faq, written to the same brevity: if an answer
 * needs more room than this, it belongs on /how-it-works instead.
 */
export type FaqItem = {
  q: string;
  a: string;
  onHomepage?: boolean;
};

export const FAQS: FaqItem[] = [
  {
    q: "Do you see my photos?",
    a: "No. There is no server to see them with. The unzipping, the caption merging, the video re-encoding, the date writing: all of it happens in this browser tab, on your machine. You can turn off your Wi-Fi after the page loads and it'll still work, and the page ships a content security policy that forbids the browser from sending anything anywhere even if we wanted it to.",
    onHomepage: true,
  },
  {
    q: "How do I get the ZIP in the first place?",
    a: "In Snapchat: profile → gear icon → Privacy Controls → My Data. Switch on “Export your Memories” and “Export JSON Files”, choose All Time, submit. The email lands a day or two later. The how it works page walks through every tap.",
    onHomepage: true,
  },
  {
    q: "Why $5?",
    a: "For the tool, and for how it's built. Doing the work in your browser instead of on a server was the harder way to build this, and it's the only version where “your photos never leave your machine” is a fact rather than a promise. Five dollars, once, however many files you have, and the first 20 are free, so you can check the dates landed before you pay.",
    onHomepage: true,
  },
  {
    q: "Will this work on my phone?",
    a: "Yes, it's a website, and the free 20 files are a good way to find out how your phone copes. For a whole library, use a laptop if you have one: it has far more memory, it's faster, and it doesn't pause the tab when the screen locks. If a phone keeps stalling, run smaller batches, but always include the first ZIP, because that's the one with your dates in it. There are guides for iPhone and Android.",
  },
  {
    q: "What about videos?",
    a: "Their captions get drawn back into the video itself, frame by frame, right here in the tab. The capture date goes into the video's own header (an MP4 has no EXIF, but that header is exactly what photo apps read for a video's date), and the text, stickers and geofilters end up baked into the picture the way they were when you posted it.",
  },
  {
    q: "Why do some photos have no location?",
    a: "Because Snapchat's export doesn't say which photo each location belongs to. You get a list of times and coordinates, and separately a pile of files named after a random id that appears nowhere in that list. So when several memories share a day, there is no way to tell them apart. Where a day's memories were all in one place, everyone gets that place. Where they were scattered, the field is left empty instead of filled with a coin flip: a pin in the wrong town looks exactly like a pin in the right one, and you'd never know. The CSV marks each location exact or approximate.",
  },
  {
    q: "Refunds?",
    a: "If the tool can't handle your export and we can't fix it, yes. Get in touch within 14 days with your Stripe receipt and what went wrong, and we'll either get it working or refund the $5. It's also why the first 20 files are free: you can watch it work on your own export before paying anything.",
  },
];

export const HOMEPAGE_FAQS = FAQS.filter((faq) => faq.onHomepage);
