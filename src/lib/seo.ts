/**
 * The share card and the site's own address, in one place.
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

/**
 * Crawlers won't resolve a relative og:image, and robots.txt has to name the
 * sitemap by absolute URL, so this has to be resolvable outside a request.
 * Vercel injects VERCEL_PROJECT_PRODUCTION_URL on every deployment; set
 * NEXT_PUBLIC_SITE_URL to override it with a custom domain.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:4000");

/** Every indexable route, in the order they should be crawled. */
export const ROUTES = [
  { path: "/", priority: 1 },
  { path: "/how-it-works", priority: 0.9 },
  { path: "/september-2026-deadline", priority: 0.9 },
  { path: "/waiting-for-your-export", priority: 0.9 },
  { path: "/faq", priority: 0.8 },
  { path: "/contact", priority: 0.5 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
] as const;

export const absoluteUrl = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;
