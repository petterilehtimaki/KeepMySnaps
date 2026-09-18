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
 * The one canonical origin. Every canonical, og:url, JSON-LD id, sitemap entry
 * and the robots.txt Sitemap line is built from this, so it is pinned here
 * rather than read from the environment or the request: a preview deployment,
 * localhost, or a request that arrived on the bare domain must still point
 * crawlers at www. The bare domain and http:// both 308 to this host at Vercel.
 *
 * Crawlers won't resolve a relative og:image and robots.txt has to name the
 * sitemap by absolute URL, which is why this is absolute.
 */
export const SITE_URL = "https://www.keepmysnaps.com";

/**
 * Every indexable route, in the order they should be crawled. `updated` is the
 * YYYY-MM-DD the page's words last changed: bump it with a copy edit, not a
 * deploy, or the sitemap's lastmod stops meaning anything.
 */
export const ROUTES = [
  { path: "/", priority: 1, updated: "2026-09-13" },
  { path: "/how-it-works", priority: 0.9, updated: "2026-09-13" },
  { path: "/september-2026-deadline", priority: 0.9, updated: "2026-09-13" },
  { path: "/waiting-for-your-export", priority: 0.9, updated: "2026-09-13" },
  { path: "/faq", priority: 0.8, updated: "2026-09-13" },
  { path: "/contact", priority: 0.5, updated: "2026-09-13" },
  { path: "/privacy", priority: 0.3, updated: "2026-09-18" },
  { path: "/terms", priority: 0.3, updated: "2026-09-13" },
] as const;

export const absoluteUrl = (path: string) =>
  path === "/" ? SITE_URL : `${SITE_URL}${path}`;
