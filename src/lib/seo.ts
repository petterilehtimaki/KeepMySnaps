/**
 * The share card, in one place.
 *
 * Next.js replaces `openGraph` and `twitter` wholesale rather than merging
 * them, so any route that sets either one has to restate the image and the
 * card type. Keeping the descriptor here means a rename can't silently strip
 * the preview image off a subpage.
 */
export const OG_IMAGE = {
  url: "/og-image.png",
  width: 1200,
  height: 630,
  alt: "KeepMySnaps",
} as const;

export const TWITTER_CARD = "summary_large_image" as const;
