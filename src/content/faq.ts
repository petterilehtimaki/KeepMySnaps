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
    a: "No. There is no server to see them with. The unzipping, the caption merging, the date writing — all of it happens in this browser tab, on your machine. You can turn off your Wi-Fi after the page loads and it'll still work.",
    onHomepage: true,
  },
  {
    q: "How do I get the ZIP in the first place?",
    a: "In Snapchat: profile → gear icon → Privacy Controls → My Data. Switch on “Export your Memories” and “Export JSON Files”, choose All Time, submit. The email lands a day or two later. The how it works page walks through every tap.",
    onHomepage: true,
  },
  {
    q: "Why $5?",
    a: "For the tool, and for how it's built. Doing the work in your browser instead of on a server was the harder way to build this, and it's the only version where “your photos never leave your machine” is a fact rather than a promise. Five dollars, once, however many files you have — and the first 20 are free, so you can check the dates landed before you pay.",
    onHomepage: true,
  },
  {
    q: "Will this work on my phone?",
    a: "Yes, it's a website. Whether your phone enjoys chewing through a multi-gigabyte ZIP is a different question — a laptop with the tab in the foreground will finish sooner. If it stalls, feed it one ZIP at a time.",
  },
  {
    q: "What about videos?",
    a: "They come out with the right filename and file timestamp. EXIF is a JPEG thing — MP4s have nowhere to put a capture date, so that's as far as it goes without re-encoding your whole library.",
  },
  {
    q: "Refunds?",
    a: "Ask and you'll get one. Chasing five dollars is not a business model.",
  },
];

export const HOMEPAGE_FAQS = FAQS.filter((faq) => faq.onHomepage);
